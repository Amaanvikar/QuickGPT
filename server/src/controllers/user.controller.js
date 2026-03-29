import user from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await user.findOne({ email })

        if (userExists) {
            return res.json({ success: false, message: "User already exists" })
        }
        const newUser = await user.create({ name, email, password })

        const token = jwt.sign({
            id: newUser._id,
            role: newUser.role,
        }, process.env.JWT_SECRET)
        res.json({ success: true, token })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const foundUser = await user.findOne({ email })
        if (foundUser) {
            const isMatch = await bcrypt.compare(password, foundUser.password)
            if (isMatch) {
                const token = jwt.sign({
                    id: foundUser._id,
                    role: foundUser.role,
                }, process.env.JWT_SECRET);
                return res.json({ success: true, token })
            }
        }
        return res.json({ success: false, message: "Invalid email or password" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}



export const getUser = async (req, res) => {
    try {
        const userData = req.user.toObject
            ? req.user.toObject()
            : { ...req.user }
        delete userData.password
        return res.json({ success: true, user: userData })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


export const getPublisedImages = async (req, res) => {
    try {
        const publishedImages = await chat.aggregate([
            { $unwind: '$messages' },
            {
                $match: {
                    'messages.isImage': true,
                    'messages.isPublished': true,
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: '$messages.content',
                    userName: '$user.name',
                }
            },
        ])

      
         res.json({ success: false, images: publishedImagesMessages.reverse()})
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}