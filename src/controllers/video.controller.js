import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filters={}
    if(query){
        filters.title={$regex:query,$options:"i"}
    }
    if(userId && mongoose.isValidObjectId(userId)){
        filters.owner=userId;
    }
    const sortOptions={[sortBy]:sortType==="asc" ? 1 : -1}
    const videos=await Video.find(filters)
    .sort(sortOptions)
    .skip((page-1)*limit)
    .limit(Number(limit))
    const total =await Video.countDocuments(filters)
    return res.status(200).json(new ApiResponse(200, { videos, total, page: Number(page), limit: Number(limit) }, "Videos retrieved successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || ! description){
        throw new ApiError(400,"All fields are required")
    }
    const videoLocalPath=req.files?.videoFile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required")
    }
    const videoData=await uploadOnCloudinary(videoLocalPath)
    if(!videoData){
        throw new ApiError(500,"Video file is required")
    }
    const thumbnailData=await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailData){
        throw new ApiError(500,"Thumbnail is required")
    }

    const video=await Video.create({
        videoFile: videoData.url,
        thumbnail: thumbnailData.url,
        title,
        description,
        duration:videoData.duration,
        isPublished: true,
        owner: req.user?._id,
    })
    if(!video){
        throw new ApiError(500,"Something went wrong while uploading the video")

    }
    const videoDetails=await Video.findById(video._id)
    if(!videoDetails){
        throw new ApiError(500,"Something went wrong while uploading the video")
    }
    return res
        .status(201)
        .json(new ApiResponse(200,videoDetails,"Video uploaded sucessfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const videoDetails=await Video.findById(videoId);
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }
    if(!videoDetails){
        throw new ApiError(404,"The video does not exist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,videoDetails,"Video found sucessfully"));
})
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    const oldVideo = await Video.findById(videoId);
    if (!oldVideo) {
        throw new ApiError(404, "Video not found");
    }

    const oldThumbnail = oldVideo.thumbnail;
    const thumbnailLocalPath = req.file?.path || null;
    console.log("Thumbnail Path:", oldThumbnail);

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is missing from the request");
    }

    // Upload new thumbnail to Cloudinary
    const thumbnailData = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnailData) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    // Delete old thumbnail from Cloudinary
    if (oldThumbnail) {
        try {
            await deleteFromCloudinary(oldThumbnail);
        } catch (error) {
            console.error("Error deleting old thumbnail from Cloudinary:", error);
        }
    }

    // Update video details
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnailData.url,
                title,
                description,
            },
        },
        { new: true }
    )

    if (!video) {
        throw new ApiError(500, "Failed to update video details");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video=await Video.findById(videoId);
  if(!video){
    throw new ApiError(404, "could not find the video ")
  }  
  const oldVideoUrl=video.videoFile
  const oldThumbnailUrl=video.thumbnail
  if(oldVideoUrl){
   try{
deleteFromCloudinary(oldVideoUrl)
   }catch(error){
    console.error("Error deleting old video from Cloudinary:", error);

   }
  }
  if(oldThumbnailUrl){
    try{
        deleteFromCloudinary(oldThumbnailUrl)
           }catch(error){
            console.error("Error deleting old thumbnail from Cloudinary:", error);
        
           }
  }
  await Video.deleteOne({ _id: videoId });
  return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video=await Video.findById(videoId);
  if(!video){
    throw new ApiError(404, "could not find the video ")
  }  
  video.isPublished=!video.isPublished
  await video.save()
  return res
  .status(200)
  .json(new ApiResponse(200, video, "Publish status toggled successfully"));
   
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}