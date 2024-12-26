import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(!content){
        throw new ApiError(400,"Content of tweet is required")
    }
    const addTweet=new Tweet({
        content,
        owner:req.user?._id
    })
    await addTweet.save()
    const checkTweet=await Tweet.findById(addTweet._id)
    return res.status(201)
    .json(new ApiResponse(200,checkTweet,"New tweet is added"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400,"The userId is not valid")
    }
    const tweets= await Tweet.find({owner:userId})
    if(!tweets){
        throw new ApiError(404,"Tweet is not found for the users")
    }
    console.log(tweets)
    return res.status(200).json(new ApiResponse(200,tweets,"User tweets is fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params
    const {content}=req.body
    if(!tweetId){
        throw new ApiError(400,"This tweet is invalid")
    }
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "The tweet does not exist");
    }

    // Check if the logged-in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    const tweets= await Tweet.findOneAndUpdate(
        tweetId,{
        $set:{
            content
    }
}
    ,{new:true}
)



return res.status(201)
.json(new ApiResponse(200,tweets,"Tweet updated success fully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
   const tweet=await Tweet.findById(tweetId)
   if(!tweetId){
    throw new ApiError(404,"The tweet does not exist")
   }
   if(tweet.owner.toString()!== req.user._id.toString()){
    throw new ApiError(403,"You are unauthorized to delete this tweet")
   }
   await Tweet.deleteOne({_id:tweetId})
   return res.status(200).json(new ApiResponse(200,null,"Tweet deleted successfully"))
   
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}