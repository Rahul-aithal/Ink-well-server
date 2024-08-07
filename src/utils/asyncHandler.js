const asyncHandler =(fn)=> async (req,res,next)=>{
    try {
        await fn(re)
    } catch (error) {
        res.status(err.code).json({
            message:err.message, 
            success:false
        })
    }
}