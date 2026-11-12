const mongoose=require('mongoose');
const blogSchema=new mongoose.Schema({title:{type:String,required:true,trim:true,minlength:3,maxlength:160},content:{type:String,required:true,trim:true,minlength:30,maxlength:50000},category:{type:String,trim:true,maxlength:60,default:'General'},tags:{type:[String],default:[],validate:v=>v.length<=5},status:{type:String,enum:['published','draft'],default:'published'},author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
blogSchema.index({createdAt:-1});module.exports=mongoose.model('Blog',blogSchema);
