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
            type: Strings,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is requierd"],
        },
        avatar: {
            type: String,
        },
        isEditable: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

storySchema.plugin(mongooseAggregatePaginate)
export const Story = mongoose.model("Story", storySchema);
