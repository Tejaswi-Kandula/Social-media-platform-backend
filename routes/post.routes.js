import mongoose from "mongoose";
import Post from "../models/post.model.js";
import { Router } from "express";
import {cloudinary,upload} from "../controllers/CloudinaryConfig.js";
import authenticate from "../middleware/Auth.js";
const router = Router();

router.post('/image',authenticate,upload.single("media"),async(req,res)=>{
    const {title}=req.body;
    const image=req.file

    if (!image) res.json({message:"did not upload a file"})
    
    try{
        cloudinary.uploader.upload_stream(
        {resource_type:"auto",folder:"post"},
        async(err,result)=>{
            if (err) return res.json({Error:err.message})
            const details = {author:req.user.id,title,content:result.secure_url,contentType:"image"};
            const post = await Post.create(details);
            await post.save()

            res.json({message:'Post Added',details});
            console.log("Post Added")

        }).end(image.buffer)
    }catch(err){
        res.json({message:`${err.message}`});
    }
})
router.post('/text',authenticate,async(req,res)=>{
    const {title,content}=req.body;
    try{
        const details = {author:req.user.id,title,content,contentType:"text"};
        const post = await Post.create(details);
        await post.save();
        res.json({message:'Post Added',details});
    } catch (err) {
        res.json({message:`${err.message}`});
    }
})
router.get('/',authenticate,async(req,res)=>{
    try{
        const posts=await Post.find().populate('author','username email avatar').populate('likes','username').populate('comments.user','username avatar').sort({createdAt:-1});
        return res.status(200).json({posts});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

router.post('/like/:postId',authenticate,async(req,res)=>{
    const postId=req.params.postId;
    const userId=req.user.id;
    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'});
        }
        if(!post.likes.includes(userId)){
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({message:'Post liked successfully',likeCount:post.likes.length});
        }
        if(post.likes.includes(userId)){
            post.likes.pull(userId);
            await post.save();
            return res.status(200).json({message:'Post unliked successfully',likeCount:post.likes.length});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

router.delete('/:postId',authenticate,async(req,res)=>{
    const postId=req.params.postId;
    const userId=req.user.id;
    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'});
        }
        if(post.author.toString()!==userId){
            return res.status(403).json({message:'Unauthorized to delete this post'});
        }
        await post.remove();
        return res.status(200).json({message:'Post deleted successfully'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

router.post('/comment/:postId',authenticate,async(req,res)=>{
    const postId=req.params.postId;
    const userId=req.user.id;
    const {comment}=req.body;
    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'});
        }
        post.comments.unshift({user:userId,text:comment});
        const newComment=post.comments[0];
        await post.save();
        return res.status(200).json({message:'Comment added successfully', comment: newComment});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

router.delete('/comment/:postId/:commentId',authenticate,async(req,res)=>{
    const postId=req.params.postId;
    const commentId=req.params.commentId;
    const userId=req.user.id;
    try{
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:'Post not found'});
        }
        const comment=post.comments.id(commentId);
        if(!comment){
            return res.status(404).json({message:'Comment not found'});
        }
        if(comment.user.toString()!==userId){
            return res.status(403).json({message:'Unauthorized to delete this comment'});
        }
        comment.remove();
        await post.save();
        return res.status(200).json({message:'Comment deleted successfully'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message:'Server error'});
    }
});

export default router;