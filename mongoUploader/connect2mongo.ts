import mongoose from "mongoose";

export async function getBucket(URI: string, bucketName: string) {
  await mongoose.connect(URI);

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName
  });
}
