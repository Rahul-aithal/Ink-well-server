import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    likedStory: {
        type: Schema.Types.ObjectId,
        ref: "Story",
        required: [true, "Story id is requried for comments"],
    },
    likedUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Commenter's id is requried for comments"],
    },
});

export const Like = mongoose.model("Like", likeSchema);
