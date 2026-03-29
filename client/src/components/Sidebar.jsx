import React, { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client.js'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

  const {
    chats,
    setChats,
    selectedChats,
    setSelectedChats,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
  } = useAppContext()
  const [search, setSearch] = useState('')
  const [creatingChat, setCreatingChat] = useState(false)
  const searchTerm = search.toLowerCase().trim()
  const filteredChats = chats.filter((chat) => {
    const firstMessage = chat?.messages?.[0]?.content?.toLowerCase() || ''
    const chatLabel = (chat?.name || chat?.title || '').toLowerCase()
    return (firstMessage || chatLabel).includes(searchTerm)
  })

  const deleteChat = async (e, chat) => {
    e.stopPropagation()
    e.preventDefault()
    if (!window.confirm('Delete this conversation?')) return

    const chatId = String(chat._id)
    try {
      const { data } = await api.delete(`/api/chat/${chat._id}`)
      if (!data.success) {
        toast.error(data.message || 'Could not delete chat')
        return
      }
      toast.success('Chat deleted')

      const wasSelected =
        selectedChats && String(selectedChats._id) === chatId
      const nextList = chats.filter((c) => String(c._id) !== chatId)
      setChats(nextList)

      if (wasSelected) {
        if (nextList.length === 0) {
          setSelectedChats(null)
        } else {
          try {
            const { data: full } = await api.get(
              `/api/chat/${nextList[0]._id}`
            )
            if (full.success && full.chat) {
              setSelectedChats(full.chat)
            } else {
              setSelectedChats(null)
            }
          } catch {
            setSelectedChats(null)
          }
        }
      }
    } catch {
      toast.error('Could not delete chat')
    }
  }

  const openChatFromSidebar = async (chat) => {
    navigate('/')
    setIsMenuOpen(false)
    try {
      const { data } = await api.get(`/api/chat/${chat._id}`)
      if (data.success && data.chat) {
        setSelectedChats(data.chat)
        setChats((prev) =>
          prev.map((c) =>
            String(c._id) === String(data.chat._id)
              ? {
                  ...c,
                  title: data.chat.title,
                  updatedAt: data.chat.updatedAt,
                }
              : c
          )
        )
      } else {
        toast.error(data.message || 'Could not load chat')
      }
    } catch {
      toast.error('Could not load chat')
    }
  }

  return (
    <div className={`bg-white flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${!isMenuOpen && 'max-md:-translate-x-full'}`}>

      {/* Logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt=''
        className='w-full max-w-48'
      />

      {/* New chat Button */}
      <button
        type='button'
        disabled={creatingChat}
        onClick={async () => {
          setCreatingChat(true)
          try {
            await createNewChat()
            setIsMenuOpen(false)
          } finally {
            setCreatingChat(false)
          }
        }}
        className='flex justify-center items-center w-full py-2 mt-10
        text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md
        cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
      >
        <span className='mr-2 text-xl'>
          +
        </span>
        {creatingChat ? 'Creating…' : 'New Chat'}
      </button>

      <div className='flex items-center gap-2 p-3 mt-4 border border-gray-400
dark:border-white/20 rounded-md'>
        <img src={assets.search_icon} className='w-4 not-dark: invert' alt="" />
        <input onChange={(e) => setSearch(e.target.value)} value={search} type="text"
          placeholder='Search conversations' className='text-xs
placeholder: text-gray-400 outline-none'/>
      </div>

      {/* Recent Chats */}

      <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3'>
        {filteredChats.length === 0 && (
          <p className='text-xs text-gray-400 text-center mt-4'>No chats found</p>
        )}
        {filteredChats
          .map((chat) => (
            <div
              key={chat._id || chat.id}
              className='p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md flex justify-between items-center gap-2 group'
            >
              <div
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openChatFromSidebar(chat)
                  }
                }}
                onClick={() => openChatFromSidebar(chat)}
                className='flex-1 min-w-0 cursor-pointer text-left'
              >
                <p className='truncate w-full'>
                  {/* List API omits messages (-messages); use title. New-chat object may include messages[]. */}
                  {chat?.messages?.length > 0
                    ? String(chat.messages[0].content || '').slice(0, 32)
                    : (chat?.name || chat?.title || 'Untitled chat')}
                </p>
                <p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>
                  {chat?.updatedAt ? moment(chat.updatedAt).fromNow() : 'Just now'}
                </p>
              </div>

              <button
                type='button'
                aria-label='Delete chat'
                onClick={(e) => deleteChat(e, chat)}
                className='hidden group-hover:flex p-0 border-0 bg-transparent cursor-pointer shrink-0'
              >
                <img src={assets.bin_icon} className='w-4 pointer-events-none invert dark:invert-0' alt='' />
              </button>
            </div>
          ))
        }
      </div>


      {/* Community Images*/}
      <div onClick={() => { navigate('/community'); setIsMenuOpen(false) }} className='flex items-center gap-2
p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer
hover:scale-103 transition-all'>
        <img src={assets.gallery_icon} className='w-4.5 not-dark: invert' alt="" />
        <div className='flex flex-col text-sm'>
          <p>Community Images</p>
        </div>
      </div>

      {/* Credit purchased options*/}
      <div onClick={() => { navigate('/credits'); setIsMenuOpen(false) }} className='flex items-center gap-2
p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer
hover:scale-103 transition-all'>
        <img src={assets.diamond_icon} className='w-4.5 dark: invert' alt="" />
        <div className='flex flex-col text-sm'>
          <p>Credits: {user?.credits}</p>
          <p className='text-xs text-gray-400'>Purchased credits to use quickgpt</p>
        </div>
      </div>

      {/* Dark mode toggle*/}
      <div className='flex items-center justify-between gap-2
p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md'>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className='w-4 not-dark:invert' alt="" />
          <p>Dark Mode</p>
        </div>
        <label className='relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center'>
          <input
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            type='checkbox'
            className='peer sr-only'
            checked={theme === 'dark'}
          />
          <span className='absolute inset-0 rounded-full bg-slate-300 transition-colors duration-200 ring-1 ring-inset ring-slate-400/50 peer-checked:bg-purple-600 peer-checked:ring-purple-500/40 dark:bg-slate-600 dark:ring-slate-500/40' />
          <span className='pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5' />
        </label>
      </div>

      {/* User account*/}
      <div className='flex items-center gap-3 p-3 mt-4 border border-gray-300
dark:border-white/15 rounded-md cursor-pointer group'>
        <img src={assets.user_icon} className='w-7 rounded-full' alt="" />
        <p className='flex-1 text-sm dark: text-primary truncate'>{user ? user.name
          : 'Login your account'}</p>
        {user && <img src={assets.logout_icon} className='h-5 cursor-pointer hidden
not-dark:invert group-hover:block'/>}
      </div>

      <img onClick={() => setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5
cursor-pointer md:hidden not-dark: invert' alt="" />

    </div >
  )
}

export default Sidebar