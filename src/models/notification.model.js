import mongoose, { Schema } from "mongoose";

const notificationLogsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Create the Mongoose model
const Notification = mongoose.model("Notification", notificationLogsSchema);

export default Notification;
