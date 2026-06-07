import jwt from "jsonwebtoken";

const authenticate=async(req,res,next)=>{
    const token = req.cookies.token;
    
    if(!token) return res.status(401).json({ message: "No token, access denied!" });

    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if (err) return res.status(401).json({ message: "Invalid token!" });

        req.user=user;

        next();
    });
}
export default authenticate;