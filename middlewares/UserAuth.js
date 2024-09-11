import jwt from 'jsonwebtoken';
import getmac from 'getmac'
import { ClientError } from '../utils/apiError.js';
import { Users } from '../models/userModel.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        console.log(token)

        if (!token) {
            throw new ClientError('Authentication token is missing', 401);
        }

        

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
        const user = await Users.findById(decoded.id);

        if (!user) {
            throw new ClientError('User not found', 404);
        }

        
        req.user = user;

        next(); 
    } catch (error) {
        next(error);
    }
};




export { authMiddleware };
