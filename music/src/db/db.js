import mongoose from "mongoose";
import config from "../config/config.js"
async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI)
    console.log("MongoDB Connected")
  } catch (error) {
    console.log("Mongo db connection error: ", error)
  }
}

export default connectDB