const express = require('express')
const {
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

} = require('../controller/userController');
const {authMiddleWare,adminCheck} = require('../middlewares/authMiddlewares');
const {validateMongoID} = require('../utilities/validateMongoDb')
const router = express.Router();

router.post('/register',createUser);
router.post('/forgot-password-token',forgotPassword)
router.put('/forgot-password/:token',resetPasswrod)
router.put ('/password',authMiddleWare,updatePassword)
router.post('/login',loginUserCtrl);
router.get('/logout',logout);
router.get("/refresh",handleRefreshToken);
router.get('/all_user',getAllUser);
router.get('/:id',authMiddleWare,adminCheck,getUser);
router.delete('/:id',deleteUser);
router.put('/:id',updateUser);

module.exports = router;