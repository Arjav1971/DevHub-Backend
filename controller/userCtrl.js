// 
const { generateToken } = require("../config/jwbToken");
const User=require("../models/userModel")
const Product=require("../models/productModel")
const Cart=require("../models/cartModel")
const Coupon=require("../models/couponModel")
const Order=require("../models/orderModel")
const uniqid=require('uniqid');
const asyncHandler=require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshtoken");
const jwt=require("jsonwebtoken");
const sendEmail=require("../controller/emailCtrl");
const crypto=require('crypto');
const { default: mongoose } = require("mongoose");
const createUser=asyncHandler(async (req,res)=>{
  const email=req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // Create new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } 
  else{
    // user already existing
    throw new Error("User Already Exists");

  }
  // try {
  //     const email=req.body.email;
  //     const findUser = await User.findOne({ email: email });
  
  //     if (!findUser) {
  //       // Create new user
  //       const newUser = await User.create(req.body);
  //       res.json(newUser);
  //     } 
  //     else{
  //       // user already existing
  //       throw new Error("User Already Exists");
  //       // res.json({
  //       //   msg:"User already Exists",
  //       //   success:false,
  //       // });
  //     }
  // }
  // catch (error) {
  //     // Handle errors
      
  //     console.error(error);
  //     res.status(500).json({
  //       msg: "Internal Server Error",
  //       success: false,
  //     });
  //   }
});


const loginUserCtrl=asyncHandler(async (req,res) =>{
  const {email,password}=req.body;
  // check if user exists
  const findUser=await User.findOne({email});
  if(findUser && (await findUser.isPasswordMatched(password))){
    const refreshToken=await generateRefreshToken(findUser?._id);
    const updateuser=await User.findByIdAndUpdate(findUser.id,{
      refreshToken:refreshToken,
    },{
      new:true
    });
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      maxAge:72*60*60*1000,  //72 hours 3days
    })
    res.json({
      _id:findUser?._id,
      firstname:findUser?.firstname,
      lastname:findUser?.lastname,
      email:findUser?.email,
      mobile:findUser?.mobile,
      token:generateToken(findUser?._id)

    });
  }
  else{
    throw new Error("Inavalid Cridentials")
  }

});



// login an Admin

const loginAdmin=asyncHandler(async (req,res) =>{
  const {email,password}=req.body;
  // check if user exists
  const findAdmin=await User.findOne({email});
  if(findAdmin.role!=='admin')throw new Error("Not Authorised");
  if(findAdmin && (await findAdmin.isPasswordMatched(password))){
    const refreshToken=await generateRefreshToken(findAdmin?._id);
    const updateuser=await User.findByIdAndUpdate(findAdmin.id,{
      refreshToken:refreshToken,
    },{
      new:true
    });
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      maxAge:72*60*60*1000,
    })
    res.json({
      _id:findAdmin?._id,
      firstname:findAdmin?.firstname,
      lastname:findAdmin?.lastname,
      email:findAdmin?.email,
      mobile:findAdmin?.mobile,
      token:generateToken(findAdmin?._id)

    });
  }
  else{
    throw new Error("Inavalid Cridentials")
  }

});

// handle refresh token

const handleRefreshToken=asyncHandler(async (req,res) =>{
  const cookie=req.cookies;
  console.log(cookie);
  if(!cookie?.refreshToken)throw new Error("No Refresh Token in Cookies");
  const refreshToken=cookie.refreshToken;
  console.log(refreshToken);
  const user=await User.findOne({refreshToken});
  if(!user)throw new Error("No Refresh token in db or not matched")
  jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded)=>{
if(err || user.id!==decoded.id){
  throw new Error("There is something wrong with refresh token")
}
const accessToken=generateToken(user?._id);
res.json({accessToken});
})

});



// logout function 
const logout=asyncHandler(async(req,res)=>{
  const cookie=req.cookies;
  if(!cookie?.refreshToken)throw new Error("No Refresh Token in Cookies");
  const refreshToken=cookie.refreshToken;
  const user=await User.findOne({refreshToken});
  if(!user){
    res.clearCookie("refreshToken",{
      httpOnly:true,
      secure:true,
    });
    return res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate({refreshToken:refreshToken},
   {refreshToken: "" });
  res.clearCookie("refreshToken",{
    httpOnly:true,
    secure:true,
  });
  res.sendStatus(204);   //forbidden
})


//update a user
const updatedUser=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  validateMongoDbId(_id);
  console.log(req.user)
  try{
    const updatedUser=await User.findByIdAndUpdate(_id,{
      firstname:req?.body?.firstname,
      lastname:req?.body?.lastname,
      email:req?.body?.email,
      mobile:req?.body?.mobile,
    },
    {
      new:true,
    }
  );
  res.json(updatedUser);
  }
  catch(error){
    throw new Error(error);
  }
})

// save user Address
const saveAddress=asyncHandler(async(req,res,next)=>{
  const {_id}=req.user;
  validateMongoDbId(_id);
  // console.log(req.user)
  try{
    const updatedUser=await User.findByIdAndUpdate(_id,{
      address:req?.body?.address,
      
    },
    {
      new:true,
    }
  );
  res.json(updatedUser);
  }
  catch(error){
    throw new Error(error);
  }
})

// Get all users

const getallUser=asyncHandler(async(req,res)=>{
  try{
    const getUsers= await User.find();
    res.json(getUsers);
  }
  catch(error){
    throw new Error(error);
  }
});


// Get a user
const getaUser=asyncHandler(async(req,res)=>{

  const {id}=req.params;
  validateMongoDbId(id);
  try{
    const getaUser=await User.findById(id);
    res.json({
      getaUser,
    })
  }
  catch(error){
    throw new Error(error);
  }
});

// delete a user

const deleteaUser=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  validateMongoDbId(id);
  try{
    const deleteaUser=await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    })
  }
  catch(error){
    throw new Error(error);
  }
});

// Block user

const blockUser=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  validateMongoDbId(id);
  try{
    const block=await User.findByIdAndUpdate(id,
      {
      isBlocked:true,
      },
      {
        new:true,
      }
      );
      res.json({
        message:"User Blocked"
      });
  }catch(error){
    throw new Error(error);
  }
});
const unblockUser=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  validateMongoDbId(id);
  try{
    const unblock=await User.findByIdAndUpdate(id,
      {
      isBlocked:false,
      },
      {
        new:true,
      }
      );
      res.json({
        message:"User UnBlocked"
      });
  }catch(error){
    throw new Error(error);
  }
});

const updatePassword=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  const {password}=req.body;
  validateMongoDbId(_id);
  const user=await User.findById(_id);
  if(password){
    user.password=password;
    const updatedPassword=await user.save();
    res.json(updatedPassword);
  }
  else{
    res.json(user);
  }
})





const forgotPasswordToken=asyncHandler(async(req,res)=>{
  const {email}=req.body;
  const user=await User.findOne({email});
  if(!user)throw new Error("User not found with this email");
  try{
    const token=await user.createPasswordResetToken();
    await user.save();
    const resetURL=`Hi,Please follow this link to rest Your Password. This link is valid till 10 minutes from now.<a href='http://localhost:3001/reset-password/${token}'>Click Here</a>`;
    const data={
      to:email,
      subject:"Forgot Password Link",
      htm:resetURL,
    };
    sendEmail(data); 
    res.json(token);

  }
  catch(error){
    throw new Error(error);
  }
})

const resetPassword=asyncHandler(async(req,res)=>{
  const {password}=req.body;
  const {token}=req.params;
  const hashedToken=crypto.createHash('sha256').update(token).digest("hex");
  const user=await User.findOne({
    passwordResetToken:hashedToken,
    passwordResetExpires:{$gt:Date.now()},
  });
  if(!user)throw new Error("Token Expired, Please try again later");
  user.password=password;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;
  await user.save();
  res.json(user);
});

const getWishlist=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  try{
    const findUser=await User.findById(_id).populate("wishlist");
    res.json(findUser);
  }catch(error){
    throw new Error(error);
  }

})

const userCart=asyncHandler(async(req,res)=>{
  const {productId,color,quantity,price}=req.body;
  const {_id}=req.user;
  validateMongoDbId(_id);
  try{
   
    let newCart=await new Cart({
      userId:_id,
      productId,
      color,
      price,
      quantity
    }).save();


    res.json(newCart);
  }
  catch(error){
    throw new Error(error)
  }
  

})


const getUserCart=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  validateMongoDbId(_id);
  try{
    const cart=await Cart.find ({userId:_id}).populate(
      "productId"
    ).populate("color");
    res.json(cart);

  }
  catch(error){
    throw new Error(error);
  }

})

const removeProductFromCart=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  const{cartItemId}=req.params;
  validateMongoDbId(_id);
  try{
    const deleteProductFromCart=await Cart.deleteOne({userId:_id,_id:cartItemId});
    // const cart=await Cart.findOneAndDelete({orederby:user._id});
    res.json(deleteProductFromCart);

  }
  catch(error){
    throw new Error(error);
  }
});


const updateProductQuantityFromCart=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  const{cartItemId,newQuantity}=req.params;
  validateMongoDbId(_id);
  try{
    const cartItem=await Cart.findOne({userId:_id,_id:cartItemId});
    // const cart=await Cart.findOneAndDelete({orederby:user._id});
    cartItem.quantity=newQuantity
    cartItem.save()
    res.json(cartItem);

  }
  catch(error){
    throw new Error(error);
  }
});

const createOrder=asyncHandler(async(req,res)=>{
  const {shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,paymentInfo}=req.body;
  const {_id}=req.user;
  try{
    const order=await Order.create({
      shippingInfo,orderItems,totalPrice,totalPriceAfterDiscount,paymentInfo,user:_id
    })
    res.json({
      order,
      success:true
    })
  }
  catch(error){
    throw new Error(error);
  }
});

const getMyOrders=asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  try{
    const orders=await Order.find({user:_id}).populate("user").populate("orderItems.product").populate("orderItems.color")
    res.json({
      orders
    })
  }
  catch(error){
    throw new Error(error)
  }
})
// const emptyCart=asyncHandler(async(req,res)=>{
//   const {_id}=req.user;
//   validateMongoDbId(_id);
//   try{
//     const user=await User.findOne({_id});
//     const cart=await Cart.findOneAndDelete({orederby:user._id});
//     res.json(cart);

//   }
//   catch(error){
//     throw new Error(error);
//   }
// });

// const applyCoupon=asyncHandler(async(req,res)=>{
//   const {coupon}=req.body;
//   const {_id}=req.user;
//   validateMongoDbId(_id);
//   const validCoupon=await Coupon.findOne({name:coupon});
//   // console.log(validCoupon);
//   if(validCoupon===null){
//     throw new Error("Invalid Coupon");
//   }
//   const user=await User.findOne({_id});
//   let {products,cartTotal}=await Cart.findOne({orderby:user._id}).populate(
//     "products.product"
//   );
//   let totalAfterDiscount=(cartTotal-(cartTotal*validCoupon.discount)/100).toFixed(2);
//   await Cart.findOneAndUpdate(
//     {orederby:user._id},
//     {totalAfterDiscount},
//     {new:true}
//   );
//   res.json(totalAfterDiscount);
// });

// const createOrder=asyncHandler(async(req,res)=>{
//   const {COD,couponApplied}=req.body;
//   const {_id}=req.user;
//   validateMongoDbId(_id);
//   try{
//     if(!COD) throw new Error("Create cash order failed");
//     const user=await User.findById(_id);
//     let userCart=await Cart.findOne({orderby:user._id});
//     let finalAmount=0;
//     if(couponApplied && userCart.totalAfterDiscount){
//       finalAmount=userCart.totalAfterDiscount ;
//     }
//     else{
//       finalAmount=userCart.cartTotal;
//     }
//     let  newOrder=await new Order({
//       products:userCart.products,
//       paymentIntent:{
//         id:uniqid(),
//         method:"COD",
//         amount:finalAmount,
//         status:"Cash on Delivery",
//         created:Date.now(),
//         currency:"usd",
//       },
//       orderby:user._id,
//       orderStatus:"Cash on Delivery",
//     }).save();
//     let update=userCart.products.map((item)=>{
//       return {
//         updateOne:{
//           filter:{_id:item.product._id},
//           update:{$inc:{quantity:-item.count,sold:+item.count}}
//         },
//       }
//     });
//     const updated=await Product.bulkWrite(update,{});
//     res.json({message:"success"});

//   }  
//   catch(error){
//     throw new Error(error);
//   }
  

// });

// const getOrders=asyncHandler(async(req,res)=>{
//   const {_id}=req.user;
//   validateMongoDbId(_id);
//   try{
//     const userorders=await Order.findOne({orderby:_id}).populate('products.product').populate("orderby").exec();
//     res.json(userorders);
//   }
//   catch(error){
//     throw new Error(error);
//   }
// })

// const getAllOrders=asyncHandler(async(req,res)=>{

//   try{
//     const alluserorders=await Order.find().populate('products.product').populate("orderby").exec();
//     res.json(alluserorders);
//   }
//   catch(error){
//     throw new Error(error);
//   }
// })

// const updateOrderStatus=asyncHandler(async(req,res)=>{
//   const {status}=req.body;
//   const {id}=req.params;
//   validateMongoDbId(id);
//   try{
//     const updateOrderStatus=await Order.findByIdAndUpdate(id,
//       {
//         orderStatus:status,
//         paymentIntent:{
//           status:status,
//         }
//       },
//       {new:true}
//     );
//     res.json(updateOrderStatus);
//   }
//   catch(error){
//     throw new Error(error);
//   }

// })
module.exports = {createUser,loginUserCtrl,getallUser,getaUser,deleteaUser,updatedUser,blockUser,unblockUser,handleRefreshToken,logout,updatePassword,forgotPasswordToken,resetPassword,loginAdmin,getWishlist,saveAddress,userCart,getUserCart,createOrder,removeProductFromCart,updateProductQuantityFromCart,getMyOrders};


// 8:4