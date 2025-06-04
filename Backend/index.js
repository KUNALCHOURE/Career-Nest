import express from "express";
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import ApiError from "./utils/Apierror.js";



const app=express();

dotenv.config();

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

app.listen(3030,()=>{
    console.log("server is listening ")
})