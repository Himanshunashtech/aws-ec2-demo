// middlewares/emailMiddleware.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Middleware to send an email
const sendEmailMiddleware = (options) => async (req, res,) => {
    try {
        // Set email options from middleware options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email, // or any other field in req.body or req.params
            subject: options.subject,
            text: options.text,
            html: options.html, // Optional: if you want to send HTML content
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        // Pass the error to Express error handler
        console.log("Email not sent", error.message)
    }
};



export default sendEmailMiddleware;
