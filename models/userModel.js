import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';



const loginRecordSchema = new mongoose.Schema({
    deviceName: String, 
    loginTime: {
        type: Date,
        default: Date.now,
    },
    place: String, 
    ipAddress: String 
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [50, 'Name must be less than 50 characters long'],
        },
        surname: {
            type: String,
            required: [true, 'Surname is required'],
            minlength: [2, 'Surname must be at least 2 characters long'],
            maxlength: [50, 'Surname must be less than 50 characters long'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
        },
        phoneNo: {
            type: Number,
            required: [true, 'Phone number is required'],
            validate: {
                validator: function(v) {
                    return /\d{10}/.test(v); 
                },
                message: props => `${props.value} is not a valid phone number!`
            },
        },
        role: {
            type: String,
            enum: ['User', 'Admin'], 
            default: 'User',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'], 
            default: 'Active',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        loginRecords: [loginRecordSchema],
    },
    {
        timestamps: true,
    }
);


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};


userSchema.methods.generateAuthToken = function () {
    const payload = {
        id: this._id,
        role: this.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};


userSchema.methods.generateEmailVerificationToken = function () {
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    this.emailVerificationToken = crypto.createHash('sha256').update(otp).digest('hex');
    this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; 

    
    return otp;
};


userSchema.methods.generatePasswordResetToken = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    return otp;
};

const Users = mongoose.model('Users', userSchema);

export { Users };
