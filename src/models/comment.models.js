import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    comment:{
        type:String,
        required:[true,"Comments are requried"]
    },
    commentedStory:{
        type:Schema.Types.ObjectId,
        ref:"Stroy",
        required:[true,"Story id is requried for comments"]
    },
    commenter:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Commenter's id is requried for comments"]
    }
})


export const Comment=mongoose.model("Comment",commentSchema)