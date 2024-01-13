const mongoose = require("mongoose")

const dbConnect=()=>{
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Database Connected Successfully")
    }
    catch(error){
        console.log("Database error")
        throw new Error(error);
    }
};
module.exports=dbConnect;