import TryCatch from "../config/tryCatch.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { redisClient } from "../index.js";
import { User } from "../modal/userModal.js";
import { generateToken } from "../config/genrateToken.js";

export const logiUser = TryCatch(async (req, res) => {
   const {email} = req.body

   const ratelimitKey = `otp:ratelimit: ${email}`
   const rateLimit = await redisClient.get(ratelimitKey)

   if(rateLimit){
    res.status(429).json({
        message: "too many request. please wait before requesting new otp"
    })
    return;
   }
   const otp = Math.floor(100000 + Math.random()*900000).toString()

   const otpKey = `otp: ${email}`
   await redisClient.set(otpKey, otp, {EX: 300})
    await redisClient.set(ratelimitKey, "true", {EX: 60})

    const message = {
        to: email,
        subject: "validation otp",
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
    };

    await publishToQueue("send-otp", message)

    res.status(200).json({
        message: "otp sent to your email"
    });
});

export const verifyUser = TryCatch(async (req, res) => {
    const {email, otp:enterdOtp} = req.body 

    if (!email || !enterdOtp) {
        res.status(400).json({
            message: "email and otp required"
        });
        return
    }
    const otpKey = `otp: ${email}`
    const storedOtp = await redisClient.get(otpKey)
    if (!storedOtp || storedOtp !== enterdOtp) {
        res.status(400).json({
            message: `invalid or expired OTP`
        })
        return
    }
    await redisClient.del(otpKey)

    let user = await User.findOne({email})

    if(!user){
        const name = email.slice(0,8)
        user = await User.create({name, email})
    }
    const token = generateToken(user)
    res.json({
        message: "user verified",
        user,
        token,
    })
})