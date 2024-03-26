const express = require("express");
const router = express.Router();
const {createProduct,
    getSingleProduct,
    getAllProduct,
    updateProduct,
    deleteProduct
} = require("../controller/productController")
const {
    adminCheck,
    authMiddleWare
} = require('../middlewares/authMiddlewares');
router.post('/', authMiddleWare,adminCheck,createProduct);

router.get('/:id',getSingleProduct);
router.put('/:id',authMiddleWare,adminCheck,updateProduct)
router.delete('/:id',authMiddleWare,adminCheck,deleteProduct)
router.get('/',getAllProduct);




module.exports = router;