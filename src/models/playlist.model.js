import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose,{Schema, SchemaTypeOptions} from "mongoose";
const playListSchema=new Schema({
name:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
videos:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    
],
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playListSchema)