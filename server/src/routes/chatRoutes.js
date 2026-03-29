import express from 'express'
import {
    addMessage,
    createChat,
    deleteChat,
    getChat,
    listChats,
    updateChat,
} from '../controllers/chat.controller.js'
import { sendAiMessage } from '../controllers/message.controller.js'
import { protect } from '../middleware/auth.js'

const chatRouter = express.Router()

chatRouter.get('/', protect, listChats)
chatRouter.post('/', protect, createChat)
chatRouter.post('/create', protect, createChat)
chatRouter.get('/:id', protect, getChat)
chatRouter.post('/:id/ai', protect, sendAiMessage)
chatRouter.patch('/:id', protect, updateChat)
chatRouter.delete('/:id', protect, deleteChat)
chatRouter.post('/:id/messages', protect, addMessage)

export default chatRouter
