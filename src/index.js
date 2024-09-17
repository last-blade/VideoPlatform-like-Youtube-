import dotenv from "dotenv";
import connectDB from "./db/database.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at http://localhost:${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MongoDB coonection failed !!!:- ", error.message);
});






















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