import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"The video Id is not valid")
    }
    const comments=await Comment.find({video:videoId})
                                    .skip((page-1)*limit)
                                    .limit(Number(limit))
                                    .sort({createdAt:-1})

    const total = await Comment.countDocuments({video:videoId})
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                total,
                page:Number(page),
                limit:Number(limit)
            },
            "Comments retrived successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}=req.body
    const {videoId}=req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    if(!content){
        throw new ApiError(400,"Comment is required")
    }
    const comment=await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    })

    if(!comment){
        throw new ApiError(500,"something went wrong while uploading the comments")
    }
    const commentContent=await Comment.findById(comment._id)
    if(!commentContent){
        throw new ApiError(500,"Comment is not uploaded")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, commentContent,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    const {commentContent}=req.body
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"This comment id is not valid")
    }
    if(!commentContent){
        return new ApiError(400,"Comment content is required")
    }
    // if(tweet.owner.toString()!== req.user._id.toString()){
    //     throw new ApiError(403,"You are unauthoriaed to delete this tweet")
    //    }
    
    const comment=await Comment.findByIdAndUpdate(
       {
        _id:commentId,
        owner:req.user._id
       },
       {
        $set:{
            content:commentContent
        }
       },
       {new:true}
    )
    if(!comment){
        throw new ApiError(404,"Could't find the comment")
    }
    
    if(!comment){
        throw new ApiError(400,"Coulde not ")
    }
    return res
    .status(201)
    .json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"The commentId is not valid")
    }

   const result= await Comment.deleteOne(
    {
        _id:commentId,
        owner:req.user._id
    }
)
    if (result.deletedCount === 0) {
        throw new ApiError(404, "Comment not found or already deleted");
    }

    return res.status(200)
    .json(new ApiError,null,"Comment deleted successfully")
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }