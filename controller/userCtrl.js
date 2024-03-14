const { generateToken } = require('../config/jwToken');
const User = require('../models/userModel')

const asyncHandler = require('express-async-handler')

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

module.exports = {
    createUser,
    loginUserCtrl,
    getAllUser,
    getUser,
    deleteUser,
    updateUser
}