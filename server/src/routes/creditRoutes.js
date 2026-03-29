import express from 'express'
import { getPlans, purchasePlan } from '../controllers/credits.controller.js'
import { protect } from '../middleware/auth.js'

const creditRouter = express.Router()

creditRouter.get('/plans', protect, getPlans)
creditRouter.post('/purchase', protect, purchasePlan)

export default creditRouter;