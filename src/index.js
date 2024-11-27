import connectDB from "./db/index.js";
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})
// dotenv.config(); 
connectDB()
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