import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    
    console.log(
      `\n MongoDB conneced !! DB HOST:${connectionInstance.connect.host}`
    );
    console.log("Congratulation connected bro!!!");
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
