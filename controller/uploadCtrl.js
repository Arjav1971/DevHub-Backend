const asyncHandler=require("express-async-handler");
const {cloudinaryUploadImg,cloudinaryDeleteImg} = require("../utils/cloudinay");
const fs=require('fs');
const uploadImages = asyncHandler(async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;

        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }

        console.log('Uploaded URLs:', urls);
        const images = urls.map((file) => {
            return file;
        });
        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

const deleteImages = asyncHandler(async (req, res) => {
    const {id}=req.params;
    try {


        const deleted = await cloudinaryDeleteImg(id, 'images');
        res.json({message:"Deleted"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports={uploadImages,deleteImages}