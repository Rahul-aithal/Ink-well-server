import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const ConnnectDb=async()=>{
try {
    const connectionIstance = await mongoose.connect(`${process.env.DB_URL}${DB_NAME}?retryWrites=true&w=majority`);
    console.log("Mongo DB connected at host || DB Host:: ",connectionIstance.connection.host);
    
} catch (error) {
    console.log("MongoDB connection",error);
    
    process.exit(1)
}
}

export default ConnnectDb

