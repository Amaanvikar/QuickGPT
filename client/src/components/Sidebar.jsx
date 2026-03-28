import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

  const { chats, setSelectedChats, theme, setTheme, user, navigate } = useAppContext()
  const [search, setSearch] = useState('')
  const searchTerm = search.toLowerCase().trim()
  const filteredChats = chats.filter((chat) => {
    const firstMessage = chat?.messages?.[0]?.content?.toLowerCase() || ''
    const chatLabel = (chat?.name || chat?.title || '').toLowerCase()
    return (firstMessage || chatLabel).includes(searchTerm)
  })

  return (
    <div className={`bg-white flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${!isMenuOpen && 'max-md:-translate-x-full'}`}>

      {/* Logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt=''
        className='w-full max-w-48'
      />

      {/* New chat Button */}
      <button className='flex justify-center items-center w-full py-2 mt-10
        text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md
cursor-pointer'>
        <span className='mr-2 text-xl'>
          +
        </span>
        New Chat
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
            <div onClick={() => { navigate('/'); setSelectedChats(chat); setIsMenuOpen(false) }}
              key={chat._id || chat.id} className='p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group'>
              <div>
                <p className='truncate w-full'>
                  {chat?.messages?.length > 0 ? chat.messages[0].content?.slice(0, 32) : (chat?.name || chat?.title || 'Untitled chat')}
                </p>
                <p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>
                  {chat?.updatedAt ? moment(chat.updatedAt).fromNow() : 'Just now'}
                </p>
              </div>

              <img src={assets.bin_icon} className='hidden group-hover:block w-4 cursor-pointer invert dark:invert-0' alt="Delete Chat" />
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