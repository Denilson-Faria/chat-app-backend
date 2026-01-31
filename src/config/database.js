import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

export default async function connectDatabase() {
  const uri = process.env.MONGO_URI; 


  if (!uri) {
    throw new Error("MONGO_URI não encontrada no .env");
  }

  try {
    await mongoose.connect(uri);
  } catch (err) {
    process.exit(1); 
  }
}
