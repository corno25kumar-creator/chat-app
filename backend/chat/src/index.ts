import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import chatRoutes from './routes/chat.js';

dotenv.config();
connectDb();

const app = express();

app.use('/api/v1', chatRoutes);
app.use(express.json());

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});