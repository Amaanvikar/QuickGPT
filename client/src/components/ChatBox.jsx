import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client.js'
import { useAppContext } from '../context/AppContext'
import Message from './Message'
import { assets } from '../assets/assets'

function messagesWithImageFlags(msgs) {
  return (msgs || []).map((m) => {
    if (m.role !== 'assistant' || typeof m.content !== 'string') return m
    const u = m.content.trim()
    const looksLikeImageUrl =
      /^https?:\/\//i.test(u) &&
      (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u) ||
        /ik\.imagekit\.io/i.test(u))
    if (looksLikeImageUrl) {
      return { ...m, isImage: true }
    }
    return m
  })
}

const ChatBox = () => {
  const containerRef = useRef(null)

  const { selectedChats, setSelectedChats, setChats, setUser, theme } =
    useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [Prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const trimmed = Prompt.trim()
    if (!trimmed) return
    const chatId = selectedChats?._id
    if (!chatId) {
      toast.error('Select or create a chat first')
      return
    }

    const applyUpdatedChat = (chat, credits) => {
      if (!chat) return
      setMessages(messagesWithImageFlags(chat.messages))
      setSelectedChats(chat)
      setChats((prev) =>
        prev.map((c) =>
          String(c._id) === String(chat._id)
            ? { ...c, title: chat.title, updatedAt: chat.updatedAt }
            : c
        )
      )
      if (typeof credits === 'number') {
        setUser((u) => (u ? { ...u, credits } : u))
      }
      setPrompt('')
    }

    setLoading(true)
    try {
      if (mode === 'text') {
        const { data } = await api.post('/api/message/text', {
          chatId,
          prompt: trimmed,
        })
        if (data.success && data.chat) {
          applyUpdatedChat(data.chat, data.credits)
        } else {
          toast.error(data.message || 'Could not send message')
        }
      } else {
        const { data } = await api.post('/api/message/image', {
          chatId,
          prompt: trimmed,
          isPushed: isPublished,
        })
        if (data.success) {
          const { data: chatData } = await api.get(`/api/chat/${chatId}`)
          if (chatData.success && chatData.chat) {
            applyUpdatedChat(chatData.chat, data.credits)
          } else {
            toast.error(chatData.message || 'Could not load updated chat')
          }
        } else {
          toast.error(data.message || 'Could not generate image')
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Request failed — is the server running?'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedChats) {
      setMessages(messagesWithImageFlags(selectedChats.messages))
    } else {
      setMessages([])
    }
  }, [selectedChats])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30
max-md:mt-14 2x1:pr-40'>

      {/* Chat messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt="" className='w-full max-w-56 sm:max-w-68' />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400
dark:text-white'>Ask me anything.</p>
          </div>
        )}
        {messages.map((message, index) => <Message key={index} message={message} />)}

        {/* Three dots animations */}
        {
          loading && <div className='loader flex item-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        }
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer' checked={isPublished}
            onChange={(e) => { setIsPublished(e.target.checked) }}
          />
        </label>
      )}

      {/* Prompt form */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e) => setMode(e.target.value)} value={mode} className="text-sm pl-3 pr-2 outline-none">
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
        </select>
        <input onChange={(e) => setPrompt(e.target.value)} value={Prompt}
          type="text"
          placeholder={mode === 'image' ? 'Describe the image to generate' : 'Enter your prompt'}
          className="flex-1 w-full text-sm outlined-none" required />
        <button disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8
cursor-pointer' alt="" />
        </button>
      </form>

    </div>
  )
}

export default ChatBox