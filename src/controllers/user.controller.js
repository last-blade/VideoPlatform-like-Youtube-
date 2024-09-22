import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken}
    } 
    
    catch (error) {
        throw new apiError(500, "Something went wrong while generating refresh and access token.")    
    }
}

/*
Without asyncHandler, you would need to wrap every async function in try/catch blocks, which can get repetitive and clutter your code.
--> Without asyncHandler, you would need to add repetitive try/catch blocks inside each route handler. 
    Here's how a route handler without asyncHandler looks: 
const registerUser = async (request, response, next) => {
    try {
        // your logic here
        response.status(200).json({ message: "Okay" });
    } 
    catch (error) {
        next(error); // or response.status(500).send({ message: error.message });
    }
};

*/

const registerUser = asyncHandler( async (request, response) => {
    const {username, email, fullname, password} = request.body;
    console.log("email:- ", email);
    // check kar rahe hain ki saare fields bhare huye ho user dwara like email, password, etc. yeh sab bahara hona chahiye
    /*if(fullname === ""){
        throw new apiError(400, "Fullname is required.");        // 'apiError' naam se file banayi hai utils ke folder mein 
                                                                or usmein jaake dekhoge toh humne constructor banaya hai 
                                                                or constructor mein statuscode and message naam kaa field 
                                                                hai, isliye maine status code(i.e. 400) and message(i.e. Fullname is required) 
                                                                paas kiya hai ismein.
                                                            
    lekin aise toh hum ko har filed ke liye if-condition lagani paegi i.e. password, fullname, 
    email, username, etc. toh ise code lamba ho jaayega, toh iski jagah par hum if condition mein 'some' naam kaa method use karenge
    see below:-                                                        
    }*/ 

    if([fullname, password, username, email].some((anyfield)=> anyfield?.trim() === "")){
        throw new apiError(400, "All fields are required.")
    };

    /*const existedUser = User.findOne({email});    database mein user ko find kar rahe hain uski email id ke through, lekin hum doosre
                                                    tareeke se karenge check*/
                                                    
    const existedUser = await User.findOne({
        $or: [{email}, {username}], // '$or'-> The $or operator is used to specify that either one of the conditions should match.
    });
    
    if(existedUser){
        throw new apiError(409, "User with email or username already exist.")
    }

    const avatarLocalPath = request.files?.avatar[0]?.path;
    // const coverImageLocalPath = request.files?.coverImage[0].path;
    console.log("avatarLocalPath:- ", avatarLocalPath);

    let coverImageLocalPath;
    if (request.files && Array.isArray(request.files.coverImage) && request.files.coverImage.length > 0) {
        coverImageLocalPath = request.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new apiError(400, "Avatar file is required.");   
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new apiError(500, "Server error while registering the user.");
    }

    return response.status(201).json(
        new apiResponse(201, createdUser, "User registered successfully.")
    )

});

const loginUser = asyncHandler(async (request, response) => {
    /*
    user se data lenge form ke through
    all fields are required, check karenge
    fir user existence dekhenge
    if user exist-> password check
    if password correct->refreshtoken generate karenge and access token generate karenge and cokkie mein save kar denge
    if password correct-> show error
    if user not exist-> return error
    */

    const {email, password} = request.body;

    if(!email){
        throw new apiError(400, "Email is required.")
    }

    const user = await User.findOne({
        $or: [{email}]
    })

    if(!user){
        throw new apiError(404, "User not found.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new apiError(404, "Email or password is incorrect.")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true, // by default jo hai server par cookies ko edit karne ke permission hoti hai, lekin httpOnly and secure ko true karne se ab cookies ko edit nahin kar sakta koi bhi, ab bas server hi modify kar sakta hai cookies ko
        secure: true
    }

    return response
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User Logged In successfully.")
    )
});

const logoutUser = asyncHandler(async (request, response) => {
    await User.findByIdAndUpdate(request.user._id, {$set: {refreshToken: undefined}, new: true}); // databse mein se refresh token ko hata diya or undefined kar diya

    const options = {
        httpOnly: true, // by default jo hai server par cookies ko edit karne ke permission hoti hai, lekin httpOnly and secure ko true karne se ab cookies ko edit nahin kar sakta koi bhi, ab bas server hi modify kar sakta hai cookies ko
        secure: true
    }

    return response
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully."))

});

export {registerUser, loginUser, logoutUser}