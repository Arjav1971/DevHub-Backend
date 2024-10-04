const Razorpay=require("razorpay")

const instance=new Razorpay({
    key_id:"rzp_test_BcjUMgUEAV6tpq",key_secret:"HulJ1DuDgCWGt0iswgxR1Z55"
})

const checkout=async(req,res)=>{
    const {amount}=req.body
    const option={
        amount:amount*100,
        currency:"INR"
    }
    const order=await instance.orders.create(option)
    res.json({
        success:true,
        order
    })
}


const paymentVerification = async (req, res) => {
    const { razorpayPaymentId } = req.body;

    try {
        // Fetch the payment details from Razorpay to verify
        const payment = await instance.payments.fetch(razorpayPaymentId);

        if (payment.status === 'captured') {
            // Payment is successful, send a success response
            res.json({
                success: true,
                payment
            });
        } else {
            // Payment failed or is pending
            res.status(400).json({
                success: false,
                message: "Payment verification failed",
                payment
            });
        }
    } catch (error) {
        // Handle error
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// const paymentVerification=async(req,res)=>{
//     const {razorpayOrderId,razorpayPaymentId}=req.body
//     res.json({
//         razorpayOrderId,razorpayPaymentId
//     })
// }

module.exports={
    checkout,paymentVerification
}