import Stripe from 'stripe'
import transactionModel from '../models/transaction.js'
import User from '../models/user.model.js'

export const stripeWebhook = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers['stripe-signature']

    let event
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return res
            .status(400)
            .send(`Webhook signature verification failed: ${err.message}`)
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const transactionId = session.metadata?.transactionId
            const appId = session.metadata?.appId

            if (appId !== 'quickgpt' || !transactionId) {
                return res.status(200).json({ received: true })
            }

            const transaction = await transactionModel.findOne({
                _id: transactionId,
                isPaid: false,
            })

            if (!transaction) {
                return res.status(200).json({ received: true })
            }

            await User.updateOne(
                { _id: transaction.userID },
                { $inc: { credits: transaction.credits } }
            )
            transaction.isPaid = true
            await transaction.save()
        }
    } catch (err) {
        console.error('Stripe webhook handler error:', err)
        return res.status(500).send(`Webhook handler error: ${err.message}`)
    }

    return res.status(200).json({ received: true })
}
