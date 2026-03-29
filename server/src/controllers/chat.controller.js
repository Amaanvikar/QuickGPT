import chat from '../models/chats.model.js'

export const listChats = async (req, res) => {
    try {
        const chats = await chat
            .find({ user: req.user._id })
            .sort({ updatedAt: -1 })
            .select('-messages')
        return res.json({ success: true, chats })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const getChat = async (req, res) => {
    try {
        const doc = await chat.findOne({
            _id: req.params.id,
            user: req.user._id,
        })
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }
        return res.json({ success: true, chat: doc })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const createChat = async (req, res) => {
    try {
        const { title, messages } = req.body
        const payload = { user: req.user._id }
        if (title) payload.title = title
        if (Array.isArray(messages) && messages.length) {
            payload.messages = messages
        }
        const doc = await chat.create(payload)
        return res.json({ success: true, chat: doc })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const addMessage = async (req, res) => {
    try {
        const { role, content } = req.body
        if (!role || content === undefined || String(content).trim() === '') {
            return res.json({
                success: false,
                message: 'role and content are required',
            })
        }
        const doc = await chat.findOne({
            _id: req.params.id,
            user: req.user._id,
        })
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }
        doc.messages.push({ role, content })
        await doc.save()
        return res.json({ success: true, chat: doc })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const updateChat = async (req, res) => {
    try {
        const { title } = req.body
        if (title === undefined || String(title).trim() === '') {
            return res.json({ success: false, message: 'title is required' })
        }
        const doc = await chat.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title: String(title).trim() },
            { new: true }
        )
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }
        return res.json({ success: true, chat: doc })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const deleteChat = async (req, res) => {
    try {
        const doc = await chat.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        })
        if (!doc) {
            return res.json({ success: false, message: 'Chat not found' })
        }
        return res.json({ success: true, message: 'Chat deleted' })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
