import dotenv from "dotenv"
import ConnnectDb from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path:'./.env'
})

ConnnectDb()
.then(
    ()=>{
        app.listen(process.env.PORT ||8000,()=>{
            console.log(`Your port is running at http://localhost:${process.env.PORT}`);
            
        })
    }
    
)
.catch((err)=>{
    console.log("Mongo db Connection failed !!!",err);

})