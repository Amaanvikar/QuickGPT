import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/client.js'

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [chats, setChats] = useState([])
    const [selectedChats, setSelectedChats] = useState(null)
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    )

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setUser(null)
            return
        }
        try {
            const { data } = await api.get('/api/user/data')
            if (data.success && data.user) {
                setUser(data.user)
            } else {
                setUser(null)
                localStorage.removeItem('token')
            }
        } catch {
            setUser(null)
            localStorage.removeItem('token')
        }
    }, [])

    const fetchUserChats = useCallback(async () => {
        try {
            const { data } = await api.get('/api/chat')
            if (data.success && Array.isArray(data.chats)) {
                setChats(data.chats)
                setSelectedChats((prev) => {
                    if (
                        prev &&
                        data.chats.some((c) => String(c._id) === String(prev._id))
                    ) {
                        return prev
                    }
                    return data.chats[0] || null
                })
            }
        } catch {
            setChats([])
            setSelectedChats(null)
        }
    }, [])

    const createNewChat = useCallback(async () => {
        try {
            const { data } = await api.post('/api/chat/create', {})
            if (data.success && data.chat) {
                const newChat = data.chat
                setChats((prev) => [
                    newChat,
                    ...prev.filter((c) => String(c._id) !== String(newChat._id)),
                ])
                setSelectedChats(newChat)
                navigate('/')
                return newChat
            }
            toast.error(data.message || 'Could not create chat')
        } catch (e) {
            const msg =
                e.response?.data?.message ||
                e.message ||
                'Could not create chat'
            toast.error(msg)
        }
        return null
    }, [navigate])

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (user) {
            fetchUserChats()
        } else {
            setChats([])
            setSelectedChats(null)
        }
    }, [user, fetchUserChats])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const value = {
        navigate,
        user,
        setUser,
        fetchUser,
        fetchUserChats,
        createNewChat,
        chats,
        setChats,
        selectedChats,
        setSelectedChats,
        theme,
        setTheme,
    }

    return (
        <AppContext.Provider value={value}>{children}</AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)
