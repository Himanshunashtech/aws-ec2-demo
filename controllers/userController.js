// import logger from '../utils/logger.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import { ClientError } from "../utils/apiError.js";

import crypto from 'crypto';

import sendEmailMiddleware from '../middlewares/nodeMailer.js'; // Adjust path as needed

import path from 'path';

import fs from 'fs';
import fetch from 'node-fetch'; // Ensure to install node-fetch if using it

import { Users } from "../models/userModel.js";

const RegisterUser = asyncHandler(async (req, res, next) => {
    const { name, surname, email, password, phoneNo } = req.body;

    // logger.info(`RegisterUser: Attempting to register user with email ${email}`);

    if (!name || !surname || !email || !password || !phoneNo) {
        // logger.error('RegisterUser: All fields are required');
        throw new ClientError('All fields are required');
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
        // logger.error('RegisterUser: User with this email already exists');
        throw new ClientError('User with this email already exists');
    }

    const user = await Users.create({ name, surname, email, password, phoneNo });

    // logger.info(`RegisterUser: User registered successfully with email ${email}`);
    return res.status(201).json(APIResponse.success('User registered successfully', { user }));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    // logger.info(`getAllUsers: Fetching users with pagination: page ${page}, limit ${limit}`);

    const users = await Users.find().skip(skip).limit(limit);

    if (!users || users.length === 0) {
        // logger.warn('getAllUsers: No users found');
        throw new ClientError('No users found');
    }

    const totalUsers = await Users.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    // logger.info('getAllUsers: Users retrieved successfully');
    return res.status(200).json(APIResponse.success('Users retrieved successfully', {
        users,
        pagination: {
            totalUsers,
            totalPages,
            currentPage: page,
            usersPerPage: limit
        }
    }));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const deviceName = req.headers['user-agent'];
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // logger.info(`loginUser: Attempting login for email ${email}`);

    if (!email || !password) {
        // logger.error('loginUser: Email and password are required');
        throw new ClientError('Email and password are required');
    }

    const user = await Users.findOne({ email });

    if (!user) {
        // logger.error('loginUser: User not found');
        throw new ClientError('User not found');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        // logger.error('loginUser: Invalid password');
        throw new ClientError('Invalid password');
    }

    async function getLocationFromIP(ipAddress) {
        try {
            const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
            const data = await response.json();
            return data.city || 'Unknown location';
        } catch (error) {
            // logger.error('loginUser: Error fetching location from IP');
            return 'Unknown location';
        }
    }

    const token = user.generateAuthToken();
    const place = await getLocationFromIP(ipAddress);

    user.loginRecords.push({
        deviceName,
        loginTime: new Date(),
        place,
        ipAddress,
    });

    await user.save();

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 3600000
    });

    // logger.info(`loginUser: Login successful for email ${email}`);
    return res.status(200).json(APIResponse.success('Login successful'));
});

const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    // logger.info('logoutUser: User logged out successfully');
    return res.status(200).json(APIResponse.success('Logout successful'));
});

const logoutFromAllDevices = asyncHandler(async (req, res) => {
    const user = await Users.findById(req.user.id);
    if (!user) {
        // logger.error('logoutFromAllDevices: User not found');
        return res.status(404).json(APIResponse.error('User not found'));
    }

    user.loginRecords = [];
    await user.save();

    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/'
    });

    // logger.info('logoutFromAllDevices: Logged out from all devices successfully');
    return res.status(200).json(APIResponse.success('Logged out from all devices successfully'));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = req.user;

    // logger.info(`getUserProfile: Retrieving profile for user ID ${user._id}`);

    return res.status(200).json(APIResponse.success('User profile retrieved', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    }));
});

const deleteUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // logger.info(`deleteUserById: Attempting to delete user with ID ${id}`);

    const user = await Users.findByIdAndDelete(id);

    if (!user) {
        // logger.error(`deleteUserById: User with ID ${id} not found`);
        throw new ClientError('User not found');
    }

    // logger.info(`deleteUserById: User with ID ${id} deleted successfully`);
    return res.status(200).json(APIResponse.success('User deleted successfully'));
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // logger.info(`updateUser: Attempting to update user with ID ${id}`);

    const user = await Users.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!user) {
        // logger.error(`updateUser: User with ID ${id} not found`);
        throw new ClientError('User not found');
    }

    // logger.info(`updateUser: User with ID ${id} updated successfully`);
    return res.status(200).json(APIResponse.success('User updated successfully', { user }));
});

const convertPdfToWord = asyncHandler(async (req, res) => {
   
    if (!req.file) {
        // logger.error('convertPdfToWord: No file provided');
        throw new ClientError('File not found');
    }

    if (req.file.mimetype !== 'application/pdf') {
        // logger.error('convertPdfToWord: Invalid file type');
        throw new ClientError('upload a file');
    }


    const pdfPath = path.join( 'public', req.file.filename);
    
    
    


        

        res.download(pdfPath, (err) => {
            if (err) {
                // logger.error('convertPdfToWord: Error downloading the file');
                
                throw new ClientError('Error downloading the file');
            }



            fs.unlinkSync(pdfPath);
            
        });
    
});
  

const sendOtp = asyncHandler(async(req,res)=>{
    
    const { email } = req.body;

    if (!email) {
        throw new ClientError('Email is required');
    }


    const user = await Users.findOne({ email });

    if (!user) {
        throw new ClientError('Email not registered');
    }

    
    const otp = await user.generateEmailVerificationToken();
    await user.save(); // Save the OTP and expiration time to the database

    // Use email middleware to send the OTP
    req.body.emailOptions = {
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. This code is valid for 10 minutes.`,
    };

    // Call the middleware to send the email
    await sendEmailMiddleware(req.body.emailOptions)(req, res);

    return res.status(200).json(APIResponse.success('otp sent successfully'));
});


const validateOtp = asyncHandler(async (req, res) => {

    const { otp,email } = req.body;

    if (!otp) {
        throw new ClientError('Email and otp are required');
    }

    
    const user = await Users.findOne({ email });

    if (!user) {
        throw new ClientError('you are not a registered user');
    }

    // Check if the OTP is valid and not expired
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.emailVerificationToken !== hashedOtp || Date.now() > user.emailVerificationExpires) {
        throw new ClientError('invalid or experied otp')
    }

    // OTP is valid
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    req.body.emailOptions = {
        subject: 'Email varification successfull',
        text: `thankyou for successfully registered with us`,
    };

    await sendEmailMiddleware(req.body.emailOptions)(req, res);


    return res.status(200).json(APIResponse.success('email varified  successfully'));
});
 

const updatePassword = asyncHandler(async(req,res)=>{

    const id = req.user._id;

    

    const {oldPassword,newPassword}= req.body

    if(!oldPassword&&!newPassword){
        throw new ClientError('Enter all the fields');

    }

    const user = await Users.findByIdAndUpdate(id,{password:newPassword},{new:true})

     await user.save()
    
     return res.status(200).json(APIResponse.success('password updated   successfully'));





    


})

const forgetPasswordOtp = asyncHandler(async(req,res)=>{
    const { email } = req.body;

    if (!email) {
        throw new ClientError('Email is required');
    }


    const user = await Users.findOne({ email });

    if (!user) {
        throw new ClientError('Email not registered');
    }
     
    const otp = await user.generatePasswordResetToken();
    await user.save(); // Save the OTP and expiration time to the database

    // Use email middleware to send the OTP
    req.body.emailOptions = {
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. This code is valid for 10 minutes.`,
    };

    // Call the middleware to send the email
    await sendEmailMiddleware(req.body.emailOptions)(req, res);

    return res.status(200).json(APIResponse.success('otp sent successfully'));
})

const validateForgetPassOtp = asyncHandler(async (req, res) => {

    const { otp,email } = req.body;

    if (!otp) {
        throw new ClientError('Email and otp are required');
    }

    
    const user = await Users.findOne({ email });

    if (!user) {
        throw new ClientError('you are not a registered user');
    }

    // Check if the OTP is valid and not expired
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.resetPasswordToken !== hashedOtp || Date.now() > user.resetPasswordExpires) {
        throw new ClientError('invalid or experied otp')
    }

    

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.body.emailOptions = {
        subject: 'Otp verified succesfully',
        text: `done`,
    };

    await sendEmailMiddleware(req.body.emailOptions)(req, res);


    return res.status(200).json(APIResponse.success('otp varified  successfully'));
});











export {
    RegisterUser,
    getAllUsers,
    loginUser,
    logoutUser,
    getUserProfile,
    deleteUserById,
    updateUser,
    logoutFromAllDevices,
    convertPdfToWord,
    sendOtp,
    validateOtp,
    updatePassword,
    forgetPasswordOtp,
    validateForgetPassOtp
};
