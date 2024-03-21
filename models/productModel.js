const mongoose = require('mongoose'); 

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase: true
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    quantity: {
        type: Number,
        required: true,
    },
    images: {
        type: Array,
    },
    color: {
        type: String,
        enum: ["Black","Brown","Red"], 
    },
    ratings: [{
        star: Number,
        postedby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    }],
    brand: {
        type: String,
        enum: ["Apple","Samsung","Lenovo"],
    },
    sole: {
        type: Number,
        default: 0,
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);