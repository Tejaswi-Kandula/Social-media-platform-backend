import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        index:true
    },
    content:{
        type:String,
        required:true
    },
    contentType:{
        type:String,
        enum:['text','image'],
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    comments:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        text:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
});

const Post = mongoose.model('Post', postSchema);
export default Post;