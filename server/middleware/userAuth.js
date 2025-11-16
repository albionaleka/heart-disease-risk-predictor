import jwt from 'jsonwebtoken';
import 'dotenv/config';

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Authentication required. Please login." 
        });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode.id) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid authentication token." 
            });
        }

        req.userId = decode.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Session expired. Please login again." 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token. Please login again." 
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: "Authentication error. Please try again." 
        });
    }
}

export default userAuth;