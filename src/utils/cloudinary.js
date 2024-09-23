import { v2 as cloudinary } from "cloudinary";

import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
      if(!localFilePath){
        console.log("Couldn't find the file-path!!");
        return null;
      }

      else{
        //uploading the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
        console.log(response);
        console.log("File upload succesfully!!");
        fs.unlinkSync(localFilePath);
        return response;
      }
    } 
    
    catch (error) {
      //removing the locally saved temporary file as upload operation got failed, i.e., agar kisi wajah se humari file cloudinary par upload nahin huyi hai, toh fir hum apne local server se bhi uss file ko dete kar rahe hain jisee ki agar hum dobara se upload karenge file toh fir uski ek or copy ban jaayegi humare local server par, i.e. jab bhi hum cloudinary par file upload karenge toh fir usse pehle hum apne local server par temporarily save kar lete hain uss file ko and fir uss file ko cloudinary par bhej dete hain
      return null;
    }
    fs.unlinkSync(localFilePath);
}

export { uploadOnCloudinary }




