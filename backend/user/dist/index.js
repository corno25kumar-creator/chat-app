import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from './routes/user.js';
dotenv.config();
if (!process.env.REDIS_URL) {
    throw new Error("❌ REDIS_URL is missing in environment variables");
}
connectDb();
export const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient
    .connect()
    .then(() => console.log("✅ Connected to Redis"))
    .catch((err) => console.error("❌ Redis connection error:", err));
const app = express();
app.use("api/v1", userRoutes);
const port = process.env.PORT || 5000;
app.use(express.json());
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map