// const multer=require('multer');
// const sharp=require('sharp');
// const path=require('path');

// const multerStorage=multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,path.join(__dirname,"../public/images"));
//     },
//     filename:function(req,file,cb){
//         const uniqueSuffix=Date.now()+"-"+Math.round(Math.random()*1e9);
//         cb(null,file.fieldname + "-"+uniqueSuffix+".jpeg");
//     }
// })


// const multerFilter=(req,file,cb)=>{
//     if(file.mimetype.startsWith("image")){
//         cb(null,true);
//     }
//     else{
//         cb({
//             message:"Unsupported file format",
//         },
//         false
//         );
//     }
// };

// const uploadPhoto=multer({
//     storage:multerStorage,
//     fileFilter:multerFilter,
//     limits:{fileSize:2000000},

// });
// // const uploadPhoto=multer({
// //     storage:multerStorage,
// //     fileFilter:multerFilter,
// //     limits:{ fileSize:2000000},
// // });

// const productImgResize=async(req,res,next)=>{
//     if(!req.files)return next();
//     await Promise.all(
//         req.files.map( async (file)=>{
//             await sharp(file.path)
//               .resize(300,300)
//               .toFormat("jpeg")
//               .jpeg({quality:90})
//               .toFile(`public/images/products/${file.filename}`)
//         })
//     )
//     next();
// }

// const blogImgResize=async(req,res,next)=>{
//     if(!req.files)return next();
//     await Promise.all(
//         req.files.map( async (file)=>{
//             await sharp(file.path)
//               .resize(300,300)
//               .toFormat("jpeg")
//               .jpeg({quality:90})
//               .toFile(`public/images/blogs/${file.filename}`)
//         })
//     )
//     next();
// }
// module.exports={uploadPhoto,productImgResize,blogImgResize};


const multer = require('multer');
const Jimp = require('jimp');
const path = require('node:path');
const fs=require('fs');

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            {
                message: 'Unsupported file format',
            },
            false
        );
    }
};

const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { filedSize: 2000000 },
});

const resizeImage = async (file, outputPath) => {
    const image = await Jimp.read(file.path);

    // Resize the image to 300x300 pixels
    await image.resize(300, 300);

    // Convert to JPEG with quality 90
    await image.quality(90);

    // Save the resized image
    await image.writeAsync(outputPath);
};

const productImgResize = async (req, res, next) => {
    if (!req.files) return next();

    await Promise.all(
        req.files.map(async (file) => {
            const outputPath = `public/images/products/${file.filename}`;
            await resizeImage(file, outputPath);
            fs.unlinkSync(`public/images/products/${file.filename}`)
        }),
         
    );

    next();
};

const blogImgResize = async (req, res, next) => {
    if (!req.files) return next();

    await Promise.all(
        req.files.map(async (file) => {
            const outputPath = `public/images/blogs/${file.filename}`;
            await resizeImage(file, outputPath);
            fs.unlinkSync(`public/images/blogs/${file.filename}`)
        }),
        
    );

    next();
};

module.exports = { uploadPhoto, productImgResize, blogImgResize };
