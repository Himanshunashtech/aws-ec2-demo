import { Router } from 'express';
import {
    convertPdfToWord,
    deleteUserById,
    forgetPasswordOtp,
    getAllUsers,
    getUserProfile,
    loginUser,
    logoutFromAllDevices,
    logoutUser,
    RegisterUser,
    sendOtp,
    updatePassword,
    updateUser,
    validateForgetPassOtp,
    validateOtp
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/UserAuth.js';
import upload from '../middlewares/multer.js';

const dockerRoute = Router();


dockerRoute.post('/addUser', RegisterUser);

dockerRoute.get('/getUsers', getAllUsers);

dockerRoute.get('/getUserProfile', authMiddleware, getUserProfile);

dockerRoute.patch('/updateUser/:id', updateUser);

dockerRoute.post('/logIn', loginUser);

dockerRoute.post('/logout', logoutUser);

dockerRoute.post('/logoutAll', authMiddleware, logoutFromAllDevices);

dockerRoute.delete('/deleteUser/:id', deleteUserById);

dockerRoute.post('/convertfile', upload.single('file'), convertPdfToWord);

dockerRoute.post("/update",authMiddleware,updatePassword)

dockerRoute.post("/forgetpassword",forgetPasswordOtp)

dockerRoute.post("/verifyaforgetpass",validateForgetPassOtp)

dockerRoute.post("resetPass", updatePassword)

dockerRoute.post('/sendOtp', sendOtp);

dockerRoute.post("/resendOtp", sendOtp);

dockerRoute.post("/verifyEmail",validateOtp)






export default dockerRoute;
