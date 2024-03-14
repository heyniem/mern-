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
    console.log (email,password);
});


module.exports = {
    createUser,
    loginUserCtrl
}