import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"Name and description is required")
    }
    const newPlaylist=new Playlist({
        name,
        description,
        owner:req.user?._id
    })
    await newPlaylist.save()
    const checkPlaylist=await Playlist.findById(newPlaylist._id)
    return res
    .status(201)
    .json(new ApiResponse(200, checkPlaylist,"Playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "The user ID is not valid.");
    }

    const playlists = await Playlist.find({ owner: userId });

    return res.status(200).json(
        new ApiResponse(200, playlists, "User's playlists retrieved successfully")
    );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "The playlist ID is not valid.");
    }
    const playlists = await Playlist.findById(playlistId);

    return res.status(200).json(
        new ApiResponse(200, playlists, "User's playlists retrieved successfully")
    );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"the playlistid or the video id is not valid")
    }
    const playlist = await Playlist.findOne({_id:playlistId,owner:req.user_id})
    if(!playlist){
        throw new ApiError(404,"The playlist is not found")
    }
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"The file in playlist already exist")
    }
    playlist.videos.push(videoId)
    await playlist.save()
    const updatedPlaylist=await Playlist.findById(playlistId)
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video is added in playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"the playlistid or the video id is not valid")
    }
    const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user._id });

    if(!playlist){
        throw new ApiError(404,"The playlist is not found")
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"The file in playlist doesnot exist")
    }
    playlist.videos=playlist.videos.filter((video)=>video.toString()!==videoId)
    await playlist.save()
    const updatedPlaylist=await Playlist.findById(playlistId)
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video is added in playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"This is not valid playlist")
    }
    const result = await Playlist.findOneAndDelete({ _id: playlistId, owner: req.user._id });
    if (!result) {
        throw new ApiError(404, "Playlist not found or you are not authorized to delete it");
    }
    return res.status(200).json(new ApiResponse(200,null,"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"The playlistId is not valid")
    }
    if(!name || !description){
        throw new ApiError(400,"Name and description is required")
    }
    const palylist= await Playlist.findById(playlistId)
    if(!palylist){
        throw new ApiError(404,"Playlist not found")
    }
    const updatedPlaylist=await Playlist.findOneAndUpdate(
        {_id:playlistId,
            owner:req.user_id
        },
        {
        $set:{
            name,
            description
        }
    },
    {new:true}
    )

    return res.status(200).json(new ApiResponse( 200,updatedPlaylist,"Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}