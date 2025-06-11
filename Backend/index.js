dotenv.config();
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ApiError from "./utils/Apierror.js";
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.routes.js'
import cors from 'cors'
import jobRoutes from './routes/jobs.route.js'
import resumeRoutes from './routes/resume.route.js';

const app=express();
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"})) 
app.use(express.static("public"))
app.use(cookieParser());
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true,
 
}))


const connectDB=async()=>{
    const res=mongoose.connect(process.env.MONGODB_URL)
  
    if(!res){
        throw new ApiError(500,"Failed to connect to mongodb");
    }
    else{
        console.log("connected to mongodb")
    }
}

connectDB();

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/jobs",jobRoutes);
app.use("/api/v1/resume",resumeRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    data: null,
  });
});


app.listen(3030,()=>{
    console.log("server is listening ")
})