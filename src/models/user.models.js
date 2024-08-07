import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is requierd"],
        },
        avatar: {
            type: String,
        },
        storyHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Story",
            },
        ],
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken =  function () {
    try {
        const token =  jwt.sign({
            _id: this._id,
            email:this.email
        }, process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
        return token
    }
    catch (error) {
        console.log(error);
        throw new Error(error, "in generateAccessToken")
    }
}

userSchema.methods.generateRefreshToken =  function () {
    try {
        const token =  jwt.sign({
            _id: this._id,
        }, process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
        return token
    }
    catch (error) {
        console.log(error);
        throw new Error(error, "in refreshAccessToken")
    }
}
export const User = mongoose.model("User", userSchema);
