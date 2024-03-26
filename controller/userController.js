const { generateToken } = require('../config/jwToken');
const User = require('../models/userModel')
const {vaidateMongoDb, validateMongoID} = require("../utilities/validateMongoDb")
const {generateRefreshToken} = require('../config/jwRefreshToken');
const asyncHandler = require('express-async-handler')
const jwt = require("jsonwebtoken");
const { sendEmail } = require('./emailController');
const crypto = require("crypto")
const createUser = asyncHandler(
    async (req, res) => {
        const email = req.body.email;
        const findUser = await User.findOne({ email: email });
    
        if (!findUser) {
            try {
                // Create new user 
                const newUser = await User.create(req.body);
                res.json(newUser);
            } catch (error) {
                console.error('Error creating user:', error);
                res.status(500).json({
                    msg: 'Error creating user',
                    success: false
                });
            }
        } else {
            throw new Error('User already exist')
        }
    });

const loginUserCtrl = asyncHandler (async (req,res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne ({email});
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id,{
            refreshToken: refreshToken
        },{new:true});
        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        })
    } else {
        throw new Error("Invalid credential")
    }
});

const handleRefreshToken = asyncHandler(
    async (req,res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) throw new Error("No refresh token in cookie");
        const refreshToken = cookie.refreshToken;
        console.log(refreshToken)
        const user = await User.findOne ({refreshToken});
        if (!user) throw new Error ("No refresh token present in db or not matched");
        jwt.verify(refreshToken,process.env.JWT_SECRET, (err,decoded) => {
            if (err || user.id !== decoded.id ) {
                throw new Error ("there is something wrong with the token");
            } else {
                const accessToken = generateToken(user?._id);
                res.json({accessToken})
            }
        })
})

const logout = asyncHandler(
    async (req,res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) {
            throw new Error ("No refresh Token in cookies");
        }
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({
            refreshToken
        })
        if (!user) {
            res.clearCookie("refreshToken",{
                httpOnly: true,
                secure: true
            });
            return res.sendStatus(204);
        }
        await User.findOneAndUpdate({ refreshToken },
            {
                refreshToken: "",
            }
        );
        res.clearCookie("refreshToken",{
            httpOnly: true,
            secure: true
        });
        return res.sendStatus(204);
    }
)

const getAllUser = asyncHandler(
    async (req,res) => {
        try {
            const getUsers = await User.find();
            res.json(getUsers);
        } 
        catch (error) {
            throw new Error (error)
        }
    }
)

const getUser = asyncHandler (
    async (req,res) => {
        const {id} = req.params;
        vaidateMongoDb(id)
        try {
            const getaUser = await User.findById(id);
            res.json({
                getaUser,
            })
        }
        catch (error) {
            throw new Error(error); 
        }
    }
)

const deleteUser = asyncHandler (
    async (req,res) => {
        const {id} = req.params;
        vaidateMongoDb(id)
        try {
            const deleteUser = await User.findByIdAndDelete(id);
            res.json({
                deleteUser,
            })
        }
        catch (error) {
            throw new Error(error); 
        }
    }
)

const updateUser = asyncHandler (
    async (req,res) => {
        console.log(req.user)
        const {id} = req.params;
        
        try {
            const updateUser = await User.findByIdAndUpdate(
                id,
                {
                    firstname: req?.body?.firstname,
                    lastname: req?.body?.lastname,
                    email: req?.body?.email,
                    mobile: req?.body?.mobile,
                }, 
                {
                    new: true,
                }
            );
            res.json(updateUser)
        }
        catch (error) {
            throw new Error(error)
        }
    }
)

const updatePassword = asyncHandler(
    async (req,res) => {
    const {_id } = req.user;
    const {password} = req.body;
    validateMongoID(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword)
    } else {
        res.json(user);
    }
})
const forgotPassword = asyncHandler(
    async(req,res) => {
        const {email} = req.body
        const user = await User.findOne ({email});
        if (!user) throw new Error ("User not found with this email")
        try {
            const token = await user.createPasswordResetToken()
            await user.save();
            const resetURL = `HI, please follow this link to reset password <a href='http://localhost:4000/api/user/reset-password/${token}'>Click here</>`
            const data = {
                to: email,
                text: "Hey User",
                subject: "Forgot password Link",
                htm: resetURL
            };
            sendEmail(data)
            res.json(token)
        } catch (error) {
            throw new Error(error)
        }
    }
)

const resetPasswrod = asyncHandler(
    async (req,res) => {
        const {password} = req.body
        const {token} = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
        const user = await User.findOne({
            passwordResetExprires: hashedToken,
            passwordResetExprires:{$gt: Date.now()}
        });
        if (!user ) throw new Error ("Token expired, Please try again later")
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExprires = undefined;
        await user.save();
        res.json(user)
})
module.exports = {
    createUser,
    loginUserCtrl,
    getAllUser,
    getUser,
    deleteUser,
    updateUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPassword,
    resetPasswrod
}