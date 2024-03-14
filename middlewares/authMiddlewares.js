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
module.exports = {authMiddleWare}