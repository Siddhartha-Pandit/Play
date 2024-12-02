import connectDB from "./db/index.js";
import dotenv from "dotenv";
import express from "express"

dotenv.config({
  path: "./env",
});
const app=express()

// dotenv.config();
connectDB()
.then(()=>{

  app.on("error",(error)=>{
  
    console.log("The after database connection ",error)
    throw error
  })
  const PORT=process.env.PORT || 3000
  app.listen(PORT,()=>{
    console.log("The app is running on port ",PORT)
  })

})
.catch((error)=>{
console.log("Error after connection database ",error)
throw error
})
/*
const app=express()
; (async () => { 
    try{
       await  mongoose.connect(`${process.env.MONGODB_URI/DB_NAME}`)
       app.on("error",(error)=>{
        console.log("Error the database no able to talk to our bakcend")
        throw error
       })

       app.listen(process.env.PORT,()=>{
        console.log(`App is litening on port ${process.env.PORT}`)
       })
    }catch(error){
        console.log("Error while connecting database: ",error)
        throw error
    }
})()

*/
