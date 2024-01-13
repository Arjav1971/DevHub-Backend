const Blog=require("../models/blogModel");
const User=require("../models/userModel");
const asyncHandler=require("express-async-handler");
const validateMongoDbId=require("../utils/validateMongodbid");
const cloudinaryUploadImg=require("../utils/cloudinay");
const fs=require('fs');
const createBlog=asyncHandler(async(req,res)=>{
    try{
        const newBlog=await Blog.create(req.body);
        res.json(newBlog);
    }
    catch(error){
        throw new Error(error);
    }
});

const updateBlog=asyncHandler(async(req,res)=>{
    const { id }=req.params;
    validateMongoDbId(id);
    try{
        const updateBlog=await Blog.findByIdAndUpdate(id,req.body,{
            new:true,
        });
        res.json(updateBlog);
    }
    catch(error){
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getBlog = await Blog.findById(id).populate("likes");
        if (!getBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Increment the number of views
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            { $inc: { numViews: 1 } },
            { new: true }
        );

        // Send a single JSON response with both blog data and updated views
        res.json({ getBlog});
    } catch (error) {
        // Handle errors
        throw new Error(error);
    }
});

const getAllBlogs=asyncHandler(async(req,res)=>{
    try{
        const getBlogs=await Blog.find();
        res.json(getBlogs);
    }
    catch(error){
        throw new Error(error);
    }
});

const deleteBlog=asyncHandler(async(req,res)=>{
    const { id }=req.params;
    validateMongoDbId(id); 
    try{
        const deletedBlog=await Blog.findByIdAndDelete(id,req.body,{
            new:true,
        });
        res.json(deletedBlog);
    }
    catch(error){
        throw new Error(error);
    }
});

const likeBlog=asyncHandler(async(req,res)=>{
    const {blogId}=req.body;
    validateMongoDbId(blogId);
    // Find the blog which you want to be liked
    const blog=await Blog.findById(blogId);
    // Find the login user
    const loginUserId=req?.user?._id;
    // Find if the user has liked the blog
    const isLiked=blog?.isLiked;
    // Find the user if has disliked the blog
    const alreadyDisliked=blog?.dislikes?.find(
        (userId)=>userId?.toString() === loginUserId?.toString()
    );
    if(alreadyDisliked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{dislikes:loginUserId},
                isDisliked:false,
            },
            {new:true}
        );
        res.json(blog);
    }
    if(isLiked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes:loginUserId},
                isLiked:false,
            },
            {new:true}
        );
        res.json(blog);
    } 
    else{
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{likes:loginUserId},
                isLiked:true,
            },
            {new:true}
        );
        res.json(blog);
    }


});

const disliketheBlog=asyncHandler(async(req,res)=>{
    const {blogId}=req.body;
    validateMongoDbId(blogId);
    // Find the blog which you want to be liked
    const blog=await Blog.findById(blogId);
    // Find the login user
    const loginUserId=req?.user?._id;
    // Find if the user has liked the blog
    const isDisLiked=blog?.isDisliked;
    // Find the user if has disliked the blog
    const alreadyLiked=blog?.likes?.find(
        (userId)=>userId?.toString() === loginUserId?.toString()
    );
    if(alreadyLiked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes:loginUserId},
                isDisliked:false,
            },
            {new:true}
        );
        res.json(blog);
    }
    if(isDisLiked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{dislikes:loginUserId},
                isDisliked:false,
            },
            {new:true}
        );
        res.json(blog);
    } 
    else{
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{dislikes:loginUserId},
                isDisliked:true,
            },
            {new:true}
        );
        res.json(blog);
    }


})

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];

        for (const file of req.files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }

        console.log("Uploaded URLs:", urls);

        const findBlog = await Blog.findByIdAndUpdate(
            id,
            {
                $push: { images: { $each: urls } },
            },
            {
                new: true,
            }
        );

        if (!findBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        console.log("Updated Blog:", findBlog);

        res.json(findBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
module.exports={createBlog,updateBlog,getBlog,getAllBlogs,deleteBlog,likeBlog,disliketheBlog,uploadImages};