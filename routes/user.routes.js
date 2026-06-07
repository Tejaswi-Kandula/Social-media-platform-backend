import {Router} from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import authenticate from "../middleware/Auth.js";
import dotenv from 'dotenv';

dotenv.config();

const router=Router();

router.get('/test',async(req,res)=>{
    res.send('User route is working!');
});

router.post('/register',async(req,res)=>{
    const {username,email,password}=req.body;
    try{
        const usernameCheck=await User.findOne({username});
        const emailCheck=await User.findOne({email});
        if(usernameCheck){
            return res.status(400).json({message:'Username already taken'});
        }
        if(emailCheck){
            return res.status(400).json({message:'Email already registered'});
        }
        const hashedPassword=bcrypt.hashSync(password,10);
        const newUser=new User({username,email,password:hashedPassword});
        await newUser.save();
        return res.status(201).json({message:'User registered successfully'});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

router.post('/login',async(req,res)=>{
    const {usernameOrEmail,password}=req.body;
    console.log(usernameOrEmail,password);
    try{
        const user=await User.findOne({
            $or: [{username: usernameOrEmail}, {email: usernameOrEmail}]
        });
        if(!user){
            return res.status(400).json({message:'Invalid credentials'});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid credentials'});
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 3600000 // 1 hour
        });

        return res.status(200).json({message:'Logged in successfully'});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

router.post('/logout',async(req,res)=>{
    res.clearCookie('token');
    return res.status(200).json({message:'Logged out successfully'});
});

router.get('/profile',authenticate,async(req,res)=>{
    const token=req.cookies.token;
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        return res.status(200).json({message:'User details retrieved successfully', userDetails: {id: user._id, username: user.username, email: user.email,avatar: user.avatar}});
    }catch(err){
        return res.status(500).json({message:'Server error'});
    }
});

export default router;