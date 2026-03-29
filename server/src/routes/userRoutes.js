import express from 'express'
import { getPublisedImages, getUser, loginUser, registerUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUser)
userRouter.get('/published-images', protect, getPublisedImages)
export default userRouter;