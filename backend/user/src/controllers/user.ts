import TryCatch from "../config/TryCatch.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { redisClient } from "../index.js";
import { User } from "../modal/userModal.js";
import { generateToken } from "../config/genrateToken.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

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
export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId?._id;
    const user = await User.findById(userId).select("-__v -createdAt -updatedAt");
    res.json({
        user,
    });
})


export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.userId?._id);

    if (!user) {
        res.status(404).json({ message: "pelase login" });
        return
    }
    user.name = req.body.name || user.name;
    await user.save()
    const token = generateToken(user)
    res.json({
        message: "updated",
        user, 
        token
});

})


export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
    const users = await User.find()
    res.json({
        users,
    });
})

export const getAUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.params.id)
    res.json({
        user
    })

})