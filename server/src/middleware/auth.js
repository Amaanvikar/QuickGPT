import jwt from 'jsonwebtoken'
import user from '../models/user.model.js'

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    try {
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" })
        }

        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const foundUser = await user.findById(decoded.id);

        if (!foundUser) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        req.user = foundUser;

        next(); // ✅ safe now

    } catch (e) {
        return res.status(401).json({ success: false, message: e.message })
    }
}