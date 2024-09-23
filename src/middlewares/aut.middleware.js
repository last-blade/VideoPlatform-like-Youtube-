import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (request, response, next) => {
    try {
        const token = request.cookie?.accessToken || request.header("Authorization")?.replace("Bearer", "");
        
        if(!token){
            throw new apiError(401, "Unauthorized request.")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!user){
            throw new apiError(401, "Invalid access token.")
        }
            
        request.user = user;
        next();
    } 
    
    catch (error) {
        throw new apiError(401, error?.message || "Invalid access token.")
    }

}); 