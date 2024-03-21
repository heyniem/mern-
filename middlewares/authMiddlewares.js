const User = require("../models/userModel")
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler")

const authMiddleWare = asyncHandler(
    async (req,res,next) => {
        let token;
        if (req?.headers?.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
            try {
                if (token) {
                    const decoded = jwt.verify(token,process.env.JWT_SECRET);
                    const user = await User.findById(decoded?.id)
                    console.log(decoded)
                    req.user = user;
                    next();
                }
            } catch {
                throw new Error ("Not authorized token expired, please login again")
            }
        } else {
            throw new Error("There is no token attached to to header")
        }
    }
)

const adminCheck = asyncHandler(
    async (req,res,next) => {
        const {email} = req.user;
        const admin = await User.findOne ({email});
        if (admin.role !== "admin") {
            throw new Error("you are not admin")
        } else {
            console.log("Welcome, you are now login as admin")
            next();
        }
    }
)
module.exports = {authMiddleWare,adminCheck}