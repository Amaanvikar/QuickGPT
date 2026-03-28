import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatBox from './components/ChatBox'
import { Route, Routes, useLocation } from 'react-router-dom'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import Login from './pages/Login'
import { useAppContext } from './context/AppContext'

function App() {

  const { user } = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  if (pathname === '/loading') return <Loading />


  return (
    <>
      {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark: invert z-10' onClick={() => setIsMenuOpen(true)} />}

      {user ? (
        <div className='bg-slate-50 text-slate-900 dark:bg-gradient-to-b dark:from-[#242124] dark:to-[#000000] dark:text-white'>
          <div className='flex h-screen'>
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main className='flex-1'>
              <Routes>
                <Route path='/' element={<ChatBox />} />
                <Route path='/credits' element={<Credits />} />
                <Route path='/community' element={<Community />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div>
          <Login />
        </div>
      )}

    </>
  )
}

export default App