const jwt=require('jsonwebtoken');const User=require('../models/User');const asyncHandler=require('../middleware/asyncHandler');
const cookieOptions=()=>({httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:process.env.COOKIE_SAME_SITE||'lax',maxAge:24*60*60*1000,path:'/'});
const issue=(user,res)=>{const token=jwt.sign({},process.env.JWT_SECRET,{subject:String(user._id),expiresIn:process.env.JWT_EXPIRES_IN||'1d'});res.cookie('token',token,cookieOptions())};
exports.register=asyncHandler(async(req,res)=>{const {name,email,password}=req.body;const normalized=email.toLowerCase().trim();if(await User.exists({email:normalized}))return res.status(409).json({success:false,message:'Email is already registered'});const user=await User.create({name,email:normalized,password});res.status(201).json({success:true,message:'Account created successfully',data:{user:user.toSafeJSON()}})});
exports.login=asyncHandler(async(req,res)=>{const email=String(req.body.email||'').toLowerCase().trim();const user=await User.findOne({email}).select('+password');if(!user||!(await user.comparePassword(req.body.password||'')))return res.status(401).json({success:false,message:'Invalid email or password'});issue(user,res);res.json({success:true,message:'Login successful',data:{user:user.toSafeJSON()}})});
exports.me=asyncHandler(async(req,res)=>res.json({success:true,data:{id:String(req.user._id),_id:String(req.user._id),name:req.user.name,email:req.user.email}}));
exports.logout=(req,res)=>{res.clearCookie('token',{...cookieOptions(),maxAge:undefined});res.json({success:true,message:'Logged out'})};

exports.updateMe=asyncHandler(async(req,res)=>{
 const name=String(req.body.name||'').trim();
 const email=String(req.body.email||'').trim().toLowerCase();
 if(name)req.user.name=name;
 if(email)req.user.email=email;
 await req.user.save();
 res.json({success:true,message:'Profile updated successfully',data:{user:req.user.toSafeJSON()}});
});
