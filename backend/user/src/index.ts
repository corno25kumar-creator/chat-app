import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import { createClient } from 'redis'; 
import userRouter from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';

dotenv.config();

const app= express();   
app.use(express.json());
const port = process.env.PORT || 5000;
app.use("/api/v1", userRouter)



export const redisClient = createClient({
    url: process.env.REDIS_URL ?? ''
 })

redisClient
 .connect()
 .then(() => console.log('Connected to Redis'))
 .catch((err) => console.error('Redis connection error:', err));



async function startServer() {
    try{
        await connectDb();
        await connectRabbitMQ();
        app.listen(port, ()=>{
            console.log(`Server is running on port ${port}`);
        })
}
catch(error){
    console.error('server is running error', error);
    process.exit(1);

} }

startServer();