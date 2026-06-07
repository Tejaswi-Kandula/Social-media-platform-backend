import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import cookieParser from 'cookie-parser';

dns.setServers(['8.8.8.8','1.1.1.1']);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FE_URL,
    credentials: true
}));
app.use('/api/user',userRouter);
app.use('/api/post',postRouter);

app.get('/test',(req,res)=>{
  res.send('Hello World!');
});
console.log(MONGO_URI);
mongoose.connect(MONGO_URI).then(()=>{
    console.log('Connected to MongoDB');
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err)=>console.error('Error connecting to MongoDB:', err));