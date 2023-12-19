import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res,next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (err) {
    next(err);
  }
};


export const signin = async (req, res,next) => {
  const {email,password}=req.body;
  try {
    const validUser=await User.findOne({email});
    if(!validUser){
      return next(errorHandler(404,'User not found!'));
    }
    const validPassword=bcryptjs.compareSync(password,validUser.password);
      if(!validPassword){
        return next(errorHandler(401,'Invalid Credentials'));
      }
      const token=jwt.sign({id:validUser._id},'abcdefgh');
      const {password:pass,...rest}=validUser._doc;
        res.cookie("access_token",token,{
          httpOnly:true,
          // maxAge:24*60*60*1000,
        }).status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const google=async (req,res,next)=>{
  try {
    //first check if user exists or else signup the user
    const user=await User.findOne({email:req.body.email});
    if(user)
    {
      const token=jwt.sign({id:user._id},'abcdefgh');
      const {password:pass,...rest}=user._doc;
        res.cookie("access_token",token,{
          httpOnly:true,
          // maxAge:24*60*60*1000,
        }).status(200).json(rest);
    }
    else{
    const generatedPassword=Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8);
    const hashedPassword=bcryptjs.hashSync(generatedPassword,10);
    const newUser=new User({
      // username is a combination of name and random numbers and not separated by blanks
      username:req.body.name.split(" ").join("").toLowerCase()+Math.random().toString(36).slice(-4),
      email:req.body.email,
      password:hashedPassword,
      avatar:req.body.photo,
    })
    await newUser.save();
    const token=jwt.sign({id:user._id},'abcdefgh');
      const {password:pass,...rest}=newUser._doc;
        res.cookie("access_token",token,{
          httpOnly:true,
          // maxAge:24*60*60*1000,
        }).status(200).json(rest);
      }
  } catch (error) {
    next(error);
  }
}

export const signOut=async(req,res,next)=>{
  try{
    res.clearCookie("access_token");
    res.status(200).json("User has been signed out");
  }
  catch(error){
    next(error);
  }
}