const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
    },
    description:{
        type:String,
        required:true,

    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        // type:mongoose.Schema.Types.ObjectId,
        type:String,
        ref:"Category",
    },
    brand:{
        type:String,
        // enum:["Apple","Samsung","Lenovo"],
        required:true,

    },
    quantity:{
        type:Number,
        required:true,
        // select:false, // if set to false then the user wont be able to see it in output
    },
    sold:{
        type:Number,
        default:0,
    },
    images:[
        {
            public_id:String,
            url:String,
        }
    ],
    color:[{type:mongoose.Schema.Types.ObjectId,ref:"Color"}],
    tags:{
        type:String,
    },
    ratings:[{
        star:Number,
        comment:String,
        postedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    }],
    totalrating:{
        type:String,
        default:0,
    }

},{
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);