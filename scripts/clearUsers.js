
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.js";

const clearUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.deleteMany({});
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}


deleteAllUsers();
