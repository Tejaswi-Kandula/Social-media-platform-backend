import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        default:'https://assets.ccbp.in/frontend/react-js/male-avatar-img.png'
    }
});

const User = mongoose.model('User', userSchema);
export default User;