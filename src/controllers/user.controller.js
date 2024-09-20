import { asyncHandler } from "../utils/asyncHandler.js";

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
    response.status(201).json({
        message: "OK",
    })
});

export {registerUser}