import Chat from '../models/chats.model.js'
import User from '../models/user.model.js'
import openai from '../../configs/openai.js'
import imagekit from '../../configs/imagekit.js'
import axios from 'axios'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

function describeAiSdkError(err) {
    const status =
        err?.status ??
        err?.response?.status ??
        (typeof err?.code === 'number' ? err.code : undefined)
    if (status === 429) {
        return 'AI rate limit reached (429). Wait a minute and retry. If this persists, check Gemini quota and billing in Google AI Studio (the server uses the Gemini OpenAI-compatible API).'
    }
    if (status === 401 || status === 403) {
        return 'AI API key was rejected. Set OPENAI_API_KEY to a valid Google AI Studio / Gemini API key for this endpoint.'
    }
    if (status === 503 || status === 502) {
        return 'AI service is temporarily unavailable. Try again shortly.'
    }
    const raw = err?.message || ''
    if (raw.includes('429') && raw.includes('no body')) {
        return 'AI rate limit reached (429). Wait and retry, or reduce request frequency.'
    }
    return raw || 'AI request failed'
}

export const sendAiMessage = async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return res.json({
                success: false,
                message: 'OPENAI_API_KEY is not configured',
            })
        }

        const raw = req.body?.message ?? req.body?.content
        const trimmed = typeof raw === 'string' ? raw.trim() : ''
        if (!trimmed) {
            return res.json({
                success: false,
                message: 'message or content is required',
            })
        }

        const doc = await Chat.findOne({
            _id: req.params.id,
            user: req.user._id,
        })
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }

        const shouldSetTitleFromFirstMessage =
            doc.title === 'New chat' && doc.messages.length === 0

        doc.messages.push({ role: 'user', content: trimmed })

        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
        const apiMessages = doc.messages.map((m) => ({
            role: m.role,
            content: m.content,
        }))

        const aiRes = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages: apiMessages }),
        })

        const data = await aiRes.json().catch(() => ({}))
        if (!aiRes.ok) {
            doc.messages.pop()
            const message =
                aiRes.status === 429
                    ? describeAiSdkError({ status: 429 })
                    : data.error?.message ||
                      `AI request failed (${aiRes.status})`
            return res.json({ success: false, message })
        }

        const reply = data.choices?.[0]?.message?.content?.trim() || ''
        if (!reply) {
            doc.messages.pop()
            return res.json({ success: false, message: 'Empty AI response' })
        }

        doc.messages.push({ role: 'assistant', content: reply })

        if (shouldSetTitleFromFirstMessage) {
            doc.title =
                trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed
        }

        await doc.save()

        return res.json({ success: true, chat: doc, reply })
    } catch (error) {
        return res.json({
            success: false,
            message: describeAiSdkError(error),
        })
    }
}

const defaultChatModel =
    process.env.CHAT_MODEL || 'gemini-2.0-flash'

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You don't have enough credits",
            })
        }

        const { chatId, prompt } = req.body
        const trimmed = typeof prompt === 'string' ? prompt.trim() : ''
        if (!chatId || !trimmed) {
            return res.json({
                success: false,
                message: 'chatId and prompt are required',
            })
        }

        const doc = await Chat.findOne({
            _id: chatId,
            user: userId,
        })
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }

        const shouldSetTitleFromFirstMessage =
            doc.title === 'New chat' && doc.messages.length === 0

        doc.messages.push({ role: 'user', content: trimmed })

        const apiMessages = doc.messages.map((m) => ({
            role: m.role,
            content: m.content,
        }))

        let completion
        try {
            completion = await openai.chat.completions.create({
                model: defaultChatModel,
                messages: apiMessages,
            })
        } catch (e) {
            doc.messages.pop()
            return res.json({
                success: false,
                message: describeAiSdkError(e),
            })
        }

        const replyText =
            completion.choices?.[0]?.message?.content?.trim() || ''
        if (!replyText) {
            doc.messages.pop()
            return res.json({ success: false, message: 'Empty AI response' })
        }

        doc.messages.push({ role: 'assistant', content: replyText })

        if (shouldSetTitleFromFirstMessage) {
            doc.title =
                trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed
        }

        await doc.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })

        const updatedUser = await User.findById(userId).select('credits')

        return res.json({
            success: true,
            chat: doc,
            reply: replyText,
            credits: updatedUser?.credits,
        })
    } catch (error) {
        return res.json({
            success: false,
            message: describeAiSdkError(error),
        })
    }
}

export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        if (req.user.credits < 2) {
            return res.json({
                success: false,
                message: "You don't have enough credits",
            })
        }

        const { prompt, chatId, isPushed } = req.body
        const trimmed = typeof prompt === 'string' ? prompt.trim() : ''
        if (!chatId || !trimmed) {
            return res.json({
                success: false,
                message: 'chatId and prompt are required',
            })
        }

        const doc = await Chat.findOne({ _id: chatId, user: userId })
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }

        doc.messages.push({ role: 'user', content: trimmed })

        const rawEndpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '')
            .trim()
            .replace(/^['"]|['"]$/g, '')
        if (!rawEndpoint || !/^https?:\/\//i.test(rawEndpoint)) {
            doc.messages.pop()
            return res.json({
                success: false,
                message:
                    'IMAGEKIT_URL_ENDPOINT is missing or invalid in server .env (must be a full URL like https://ik.imagekit.io/your_id)',
            })
        }
        const baseEndpoint = rawEndpoint.replace(/\/$/, '')

        const endcodedPrompt = encodeURIComponent(trimmed)
        const generatedImageUrl = `${baseEndpoint}/ik-genimg-prompt-${endcodedPrompt}/quickgpt/-${Date.now()}.png?tr=w-800,h-800`

        let imageResponse
        try {
            imageResponse = await axios.get(generatedImageUrl, {
                responseType: 'arraybuffer',
            })
        } catch (fetchErr) {
            doc.messages.pop()
            if (fetchErr.code === 'ERR_INVALID_URL' || fetchErr.message === 'Invalid URL') {
                return res.json({
                    success: false,
                    message:
                        'Invalid image generation URL — check IMAGEKIT_URL_ENDPOINT in .env (no broken quotes; must be https://ik.imagekit.io/…)',
                })
            }
            throw fetchErr
        }

        const imageBuffer = `data:image/png;base64,${Buffer.from(imageResponse.data).toString('base64')}`

        const uploadImageResponse = await imagekit.upload({
            file: imageBuffer,
            fileName: `quickgpt-${Date.now()}.png`,
            folder: `/quickgpt/${userId}/${chatId}`,
        })

        const reply = {
            role: 'assistant',
            content: uploadImageResponse.url,
            isPushed,
        }

        doc.messages.push({
            role: 'assistant',
            content: uploadImageResponse.url,
        })

        await doc.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } })

        const updatedUser = await User.findById(userId).select('credits')

        return res.json({
            success: true,
            reply,
            credits: updatedUser?.credits,
        })
    } catch (error) {
        const status = error?.response?.status
        if (status === 429) {
            return res.json({
                success: false,
                message: describeAiSdkError({ status: 429 }),
            })
        }
        return res.json({
            success: false,
            message: error.message || 'Image request failed',
        })
    }
}
