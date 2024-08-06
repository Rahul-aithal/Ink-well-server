import dotenv from "dotenv"
import ConnnectDb from "./db/index.js";


dotenv.config({
    path:'./.env'
})

ConnnectDb()