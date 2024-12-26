import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId=req.user?._id
    //TODO: toggle like on video
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"This is no valid video id")
    }
    const existingLike=await Like.findOne({video:videoId,likedBy:userId})
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id})
        return res.status(200).json(new ApiResponse(200,null,"Video unliked successfully"))

    }
    const newLike=await Like.create({video:videoId,likedBy:userId})
    return res.status(200).json(new ApiResponse(200,null,"Video Liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId=req.user?._id
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"This is no valid comment id")
    }
    const existingLike=await Like.findOne({comment:commentId,likedBy:userId})
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id})
        return res.status(200).json(new ApiResponse(200,null,"Video unliked successfully"))

    }
    const newLike=await Like.create({comment:commentId,likedBy:userId})
    return res.status(200).json(new ApiResponse(200,null,"Comment Liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId=req.user?._id
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"This is no valid tweet id")
    }
    const existingLike=await Like.findOne({tweet:tweetId,likedBy:userId})
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id})
        return res.status(200).json(new ApiResponse(200,null,"Video unliked successfully"))

    }
    const newLike=await Like.create({tweet:tweetId,likedBy:userId})
    return res.status(200).json(new ApiResponse(200,null,"Tweet Liked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId=req.user?._id
    if(!userId){
        throw new ApiError(400,"The userId does not exist")
    }
    const likedVideo=await Like.find({likedBy:userId,video:{$exists:true}})
    .populate("video","title description thumbnail")
    .select("video createdA")
    return res.status(200).json(new ApiResponse(200,likedVideo,"Successfully fetched like"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}