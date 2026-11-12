require('dotenv').config();
const express=require('express');const cors=require('cors');const helmet=require('helmet');const rateLimit=require('express-rate-limit');const cookieParser=require('cookie-parser');
const connectDB=require('./config/db');const authRoutes=require('./routes/authRoutes');const blogRoutes=require('./routes/blogRoutes');const {notFound,errorHandler}=require('./middleware/errorHandler');
const app=express();
app.disable('x-powered-by');app.use(helmet());app.use(cors({origin:process.env.FRONTEND_URL||'http://127.0.0.1:5500',credentials:true}));
app.use(cookieParser());app.use(express.json({limit:'20kb'}));app.use(express.urlencoded({extended:false,limit:'20kb'}));
app.use('/api',rateLimit({windowMs:15*60*1000,max:200,standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',(req,res)=>{const mongoose=require('mongoose');res.status(200).json({success:true,message:'BlogVerse API is running',database:mongoose.connection.readyState===1?'connected':'disconnected'});});
app.use('/api/auth',authRoutes);app.use('/api/blogs',blogRoutes);app.use(notFound);app.use(errorHandler);
const PORT=process.env.PORT||5000;
if(require.main===module){connectDB().then(()=>app.listen(PORT,()=>console.log('BlogVerse API listening on '+PORT))).catch(err=>{console.error('Startup failed:',err.message);process.exit(1)})}
module.exports=app;
