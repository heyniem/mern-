const express = require('express')
const {
    createUser,
    loginUserCtrl,
    getAllUser,
    getUser,
    deleteUser,
    updateUser
} = require('../controller/userCtrl');
const {authMiddleWare} = require('../middlewares/authMiddlewares');
const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUserCtrl);
router.get('/all_user',getAllUser);
router.get('/:id',authMiddleWare,getUser)
router.delete('/:id',deleteUser)
router.put('/:id',updateUser)
module.exports = router;