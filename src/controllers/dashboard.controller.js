import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "The user ID is not valid");
    }

    try {
        // Total number of videos uploaded by the user
        const totalVideos = await Video.countDocuments({ owner: userId });

        // Total views of all videos uploaded by the user
        const totalViews = await Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(userId) } }, // Fixed here
            { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]);

        // Total subscribers to the channel
        const totalSubscribers = await Subscription.countDocuments({ channel: userId });

        // Total likes on the user's videos
        const videoIds = await Video.find({ owner: userId }).select("_id");
        const totalLikes = videoIds.length
            ? await Like.countDocuments({ video: { $in: videoIds.map(v => v._id) } })
            : 0;

        // Prepare response data
        const stats = {
            totalVideos,
            totalViews: totalViews[0]?.totalViews || 0, // Handle case when no views exist
            totalSubscribers,
            totalLikes,
        };

        res.status(200).json(new ApiResponse(200, stats, "Channel stats retrieved successfully"));
    } catch (error) {
        console.error("Error fetching channel stats:", error);
        throw new ApiError(500, "Internal server error");
    }
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id; // Authenticated user's ID
    if (!userId) {
        throw new ApiError(400, "The user ID is not valid");
    }

    try {
        // Fetch all videos owned by the user
        const videos = await Video.find({ owner: userId }).select(
            "title description thumbnail views duration isPublished createdAt"
        );

        res.status(200).json(
            new ApiResponse(200, videos, "Channel videos retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching channel videos:", error.message);
        throw new ApiError(500, "Internal server error");
    }
});


export {
    getChannelStats, 
    getChannelVideos
    }