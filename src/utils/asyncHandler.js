// 1. promises wala tareeka

const asyncHandler = (requestHandler) => {
    (request, response, next) => {
        Promise.resolve(requestHandler(request, response, next)).catch((error) => next(error))
    }
}




/* 2. try catch wala tareeka
const asyncHandler = (func) => async (request, response, next) => {
    try {
        await func(request, response, next)
    } 
    
    catch (error) {
        response.status(error.code || 500).json({
            message: error.message,
            success: false,
        })    
    }
}
*/

export { asyncHandler }