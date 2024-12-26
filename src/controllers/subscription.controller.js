import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user?._id;
    
    // TODO: toggle subscription
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channnel Id")
    }
   
    console.log(subscriberId)
    if(!subscriberId){
        throw new ApiError(403,"subscriber id is required")
    }
    const existingSubscription=await Subscription.findOne({
        subscriber:subscriberId,
        channel:channelId
    })
if(existingSubscription){
    await Subscription.deleteOne({_id:existingSubscription})
    return res.status(200).json(new ApiResponse(200,null,"Unsubscribed success"))
}
const newSubscription=await Subscription.create({
    subscriber:subscriberId,
    channel:channelId
})
if(!newSubscription){
    throw new ApiError(500,"Something went occure while subscribing")
}
const subscription=await Subscription.findById(newSubscription._id)

return res.status(200).json(new ApiResponse(201,subscription,"Subscribed"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid channnel Id")
    }
    try {
        // Query to find subscribers
        const subscribedChannel = await Subscription.find({ subscriber: subscriberId })
            // .populate("subscriber", "username", "email", "avatar") // Ensure these fields exist in User schema
            // .select("subscriber createdAt");

        // Response with data
        return res.status(200).json(
            new ApiResponse(200, subscribedChannel, "Subscribers retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching subscribers:", error.message);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate subscriberId
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    try {
        // Query to find all channels the subscriber has subscribed to
        const subscribedChannels = await Subscription.find({ channel: channelId })
            .populate("channel", "username email avatar") // Populate channel details
            .select("channel createdAt"); // Select only the channel and timestamp

        // If no subscriptions are found
        if (!subscribedChannels.length) {
            return res
                .status(404)
                .json(new ApiError(404, "No subscribed channels found for this user"));
        }

        // Response with data
        return res.status(200).json(
            new ApiResponse(200, subscribedChannels, "Subscribed channels retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching subscribed channels:", error.message);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}