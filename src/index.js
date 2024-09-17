import dotenv from "dotenv";
import connectDB from "./db/database.js";

dotenv.config({
    path: "./env"
});

connectDB();






















/*
import express from "express";
const app = express();
;(async ()=>{
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)  
      app.on("error", () => {
        console.log("Error:- ", error);
        throw error
      });

      app.listen(process.env.PORT, () => {
        console.log(`App is serving on http://localhost${process.env.PORT}`);
      });
    } 
    
    catch (error) {
        console.log("Error in connecting to DB:- ", error.message);    
        throw error
    }
})()

*/