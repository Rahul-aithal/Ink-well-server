import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGN,
    credentials:true,

}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser());

//Routes

import userRouter from './routes/user.routes.js'


//Routes declartion
app.use('/api',userRouter);



export {app}