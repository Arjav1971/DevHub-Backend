const mongoose = require("mongoose")

const dbConnect=()=>{
    try{
        // const conn = mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true });
        const conn = mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@devhub.pyuqovm.mongodb.net/?retryWrites=true&w=majority&appName=Devhub`,);
        console.log("Database Connected Successfully")
    }
    catch(error){
        console.log("Database error")
        throw new Error(error);
    }
};
module.exports=dbConnect;