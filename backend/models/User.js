const mongoose=require('mongoose');const bcrypt=require('bcryptjs');
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true,minlength:2,maxlength:80},email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},password:{type:String,required:true,select:false,minlength:8}},{timestamps:true});
userSchema.pre('save',async function(){if(!this.isModified('password'))return;this.password=await bcrypt.hash(this.password,12)});
userSchema.methods.comparePassword=function(value){return bcrypt.compare(value,this.password)};
userSchema.methods.toSafeJSON=function(){return {_id:this._id,id:this._id,name:this.name,email:this.email,createdAt:this.createdAt}};
module.exports=mongoose.model('User',userSchema);
