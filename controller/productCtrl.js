const Product=require("../models/productModel");
const User=require("../models/userModel");
const asyncHandler=require("express-async-handler");
const slugify=require('slugify');
const validateMongoDbId = require("../utils/validateMongodbid");
const {cloudinaryUploadImg,cloudinaryDeleteImg} = require("../utils/cloudinay");
const fs=require('fs');

const createProduct=asyncHandler(async(req,res)=>{
    try{
        if(req.body.title){
            req.body.slug=slugify(req.body.title);
        }
        const newProduct=await Product.create(req.body);
        res.json(newProduct);
    }
    catch(error){
        throw new Error(error);
    }

});
// const updateProduct=asyncHandler(async(req,res)=>{
//     const id=req.params;
//     try{
//         if(req.body.title){
//             req.body.slug=slugify(req.body.title);
//         }
//         const updateProduct=await Product.findOneAndUpdate({id},req.body,{
//             new:true,
//         });
//         res.json(updateProduct);
//     }catch(error){
//         throw new Error(error);
//     }
// });

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updatedProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
        });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        
        const deleteProduct = await Product.findOneAndDelete({ _id: id }, req.body, {
            new: true,
        });
        if (!deleteProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});

const getaProduct=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    try{
        const findProduct=await Product.findById(id).populate("color");
        res.json(findProduct);

    }
    catch(error){
        throw new Error(error)
    }
})

const getAllProduct=asyncHandler(async(req,res)=>{
    // console.log(req.query);
    // localhost:3000/api/product?brand=Hp&color=Red
    try{
        // Filtering
        // localhost:3000/api/product?price[gte]=600&price[lte]=45000
        const queryObj={...req.query};
        const excludeFields=["page","sort","limit","fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>`$${match}`);
        let query=Product.find(JSON.parse(queryStr));
        
        // Sorting
        // localhost:3000/api/product?sort=category,brand
        if(req.query.sort){
            const sortBy=req.query.sort.split(",").join(" ");
            query=query.sort(sortBy);
        }
        else{
            query=query.sort("-createdAt")
        }

        // Limiting the fields
        // localhost:3000/api/product?fields=title,price,category
        if(req.query.fields){
            const fields=req.query.fields.split(",").join(" ");
            query=query.select(fields);
        }
        else{
            query.select('-__v')
        }


        // pagenation
        const page=req.query.page;
        const limit=req.query.limit;
        const skip=(page-1)*limit;
        query=query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount=await Product.countDocuments()
            if(skip>=productCount)throw new Error("This page dos not exists")
        }
        console.log(page,limit,skip);



        const product=await query;
        res.json(product)
       
        // const getallProducts=await Product.find(req.query);
        // or
        // const getallProducts=await Product.find({
        //     brand:req.query.brand,
        //     category:req.query.category,
        // });
        // or
        // const getallProducts=await Product.where("category").equals(
        //         req.query.category
        // );

        // res.json(getallProducts);
    }
    catch(error){
        throw new Error(error);
    }
})

const addToWishlist=asyncHandler(async(req,res)=>{
    const {_id}=req.user;
    const {prodId}=req.body;
    try{
        const user=await User.findById(_id);
        const alreadyadded=user.wishlist.find((id)=>id.toString()==prodId);
        if(alreadyadded){
            let user=await User.findOneAndUpdate(_id,{
                $pull:{ wishlist:prodId},
            },{
                new:true,
            });
            res.json(user);
        }
        else{
            let user=await User.findOneAndUpdate(_id,{
                $push:{ wishlist:prodId},
            },{
                new:true,
            });
            res.json(user);
        }
    }
    catch(error){
        throw new Error(error);
    }

})

const rating=asyncHandler(async(req,res)=>{
    const {_id}=req.user;
    const {star,prodId,comment}=req.body;
    try{
        const product=await Product.findById(prodId);
        let alreadyRated=product.ratings.find(
            (userId)=>userId.postedby.toString()===_id.toString()
        );
        if(alreadyRated){
            const updateRating=await Product.updateOne(
                {
                    ratings:{$elemMatch:alreadyRated},
                },
                {
                    $set:{"ratings.$.star":star,"ratings.$.comment":comment},
                },
                {
                    new:true,
                }
            );
            // res.json(updateRating);

        }
        else{
            const ratedProduct=await Product.findByIdAndUpdate(prodId,{
                $push:{
                    ratings:{
                        star:star,
                        comment:comment,
                        postedby:_id,

                    }
                }
            },
            {
                new:true,
            });
            // res.json(ratedProduct);
            
        }
        const getallratings=await Product.findById(prodId);
        let totalRating=getallratings.ratings.length;
        let ratingsum=getallratings.ratings
            .map((item)=>item.star)
            .reduce((prev,curr)=>prev+curr,0);
        let actualRating=Math.round(ratingsum/totalRating);
        let finalproduct=await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating:actualRating,
            },
            {new:true}
        );
        res.json(finalproduct)


    }
    catch(error){
        throw new Error(error);
    }
    

});

// const uploadImages = asyncHandler(async (req, res) => {
//     try {
//         if (!req.files || !Array.isArray(req.files)) {
//             return res.status(400).json({ message: 'No files uploaded' });
//         }

//         const uploader = (path) => cloudinaryUploadImg(path, 'images');
//         const urls = [];
//         const files = req.files;

//         for (const file of files) {
//             const { path } = file;
//             const newpath = await uploader(path);
//             urls.push(newpath);
//             fs.unlinkSync(path);
//         }

//         console.log('Uploaded URLs:', urls);
//         const images = urls.map((file) => {
//             return file;
//         });
//         res.json(images);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// });

// const deleteImages = asyncHandler(async (req, res) => {
//     const {id}=req.params;
//     try {


//         const deleted = await cloudinaryDeleteImg(id, 'images');
//         res.json({message:"Deleted"})
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// });

module.exports={createProduct,getaProduct,getAllProduct,updateProduct,deleteProduct,addToWishlist,rating};