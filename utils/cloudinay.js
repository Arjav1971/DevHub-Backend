const cloudinary=require('cloudinary');
// import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({
    api_key:process.env.API_KEY,
    cloud_name:process.env.CLOUD_NAME,
    api_secret:process.env.SECRET_KEY,

});

// const cloudinaryUploadImg = async (fileToUploads) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(fileToUploads, (error, result) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve({
//                     url: result.secure_url,
//                     resource_type: "auto",
//                 });
//             }
//         });
//     });
// };
const cloudinaryUploadImg = async (fileToUploads) => {
    try {
        const result = await cloudinary.uploader.upload(fileToUploads, {
            resource_type: "auto",  // Adjust based on your requirements
        });

        return {
            url: result.secure_url,
            asset_id:result.asset_id,
            public_id:result.public_id,
            resource_type: "auto",
        };
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        throw error;  // Re-throw the error to be caught by the calling function
    }
};

const cloudinaryDeleteImg = async (fileToDelete) => {
    try {
        const result = await cloudinary.uploader.destroy(fileToDelete, {
            resource_type: "auto",  // Adjust based on your requirements
        });

        return {
            url: result.secure_url,
            asset_id:result.asset_id,
            public_id:result.public_id,
            resource_type: "auto",
        };
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        throw error;  // Re-throw the error to be caught by the calling function
    }
};


module.exports={cloudinaryUploadImg,cloudinaryDeleteImg}