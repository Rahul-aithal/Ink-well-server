import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const storySchema = new Schema(
    {
        owners: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: [true, "Description is requierd"],
        },
        avatar: {
            type: String,
        },
        story:{
            type: String,
            required: true,
        },
        isEditable: {
            type: Boolean,
            required: true,
            default: false,
        },
        genre:{
            type:String,
            required:true,
            trim: true
        }
    },
    {
        timestamps: true,
    }
);

storySchema.plugin(mongooseAggregatePaginate)
export const Story = mongoose.model("Story", storySchema);
