const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require('slugify')
const mongoose = require("mongoose")
const {validateMongoID} = require('../utilities/validateMongoDb');

const createProduct = asyncHandler(async(req,res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct)
    } catch (error) {
        throw new Error(error)
    }
});

const getSingleProduct = asyncHandler(
    async (req,res) => {
        const {id} = req.params;
        try {
            const findProduct = await Product.findById(id);
            res.json(findProduct);
        } catch (error) {
            throw new Error(error);
        }
    }
)

const updateProduct = asyncHandler(
    async (req,res) => {
        const id = req.params.id;
        try {
            validateMongoID(id);
            const convertedId =new  mongoose.Types.ObjectId(id)
            if (req.body.title) {
                req.body.slug = slugify(req.body.title)
            }
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: convertedId }, 
                req.body,
                { new: true }
              );
              if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
              }
            res.json(updatedProduct);
        } catch(error) {
            throw new Error(error)
        }
    }
);
const deleteProduct = asyncHandler(
    async (req,res) => {
        const id = req.params.id;
        try {
            validateMongoID(id);
            const convertedId =new  mongoose.Types.ObjectId(id)
            const deleteProduct = await Product.findOneAndDelete(convertedId);
              if (!deleteProduct) {
                return res.status(404).json({ message: 'Product not found' });
              }
              res.json(deleteProduct);
        } catch(error) {
            throw new Error(error)
        }
    }
);
const getAllProduct = asyncHandler(
    async (req,res) => {
        try {
            // Filtering
            const queryObj = { ...req.query };
            const excludeFields = ["page", "sort", "limit", "fields"];
            excludeFields.forEach((el) => delete queryObj[el]);
            let queryStr = JSON.stringify(queryObj);
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        
            let query = Product.find(JSON.parse(queryStr));
        
            // Sorting
        
            if (req.query.sort) {
              const sortBy = req.query.sort.split(",").join(" ");
              query = query.sort(sortBy);
            } else {
              query = query.sort("-createdAt");
            }
        
            // limiting the fields
        
            if (req.query.fields) {
              const fields = req.query.fields.split(",").join(" ");
              query = query.select(fields);
            } else {
              query = query.select("-__v");
            }
        
            // pagination
        
            const page = req.query.page;
            const limit = req.query.limit;
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
            if (req.query.page) {
              const productCount = await Product.countDocuments();
              if (skip >= productCount) throw new Error("This Page does not exists");
            }
            const product = await query;
            res.json(product);
          } catch (error) {
            throw new Error(error);
          }
    }
)
module.exports = {
    createProduct,
    getSingleProduct,
    getAllProduct,
    updateProduct,
    deleteProduct
}