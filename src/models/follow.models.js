import mongoose, { Schema } from "mongoose";

const followSchema = new Schema({
    follower: {
        type: Schema.Types.ObjectId,
        ref: "User",
        //One who follows
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        //one to whom "Follower" is following
    },
});

export const Follow = mongoose.model("Follow", followSchema);
