import mongoose from "mongoose";
import { getBucket } from "./connect2mongo.ts";
import { pipeline } from "node:stream";
import fs from "fs";

export async function mongoUploader(URI: string, file: Express.Multer.File) {
  const bucket = await getBucket(URI, "videos");
  const resObj: any = {};

  const readStream = fs.createReadStream(file.path);
  const uploadStream = bucket.openUploadStream(file.filename, {
    contentType: file.mimetype,
  });

  // readStream.pipe(uploadStream);
  // readStream.on("error", () => {
  //   console.log("Error in reading the file");
  // });

  // uploadStream.on("error", () => {
  //   console.log("Error in uploading the file");
  // });
  // uploadStream.on("finish", () => {
  //   console.log("File uploaded successfully");
  //   uploadStream.destroy();
  //   readStream.destroy();
  // });

  // resObj.id = uploadStream.id;
  // resObj.filename = file.filename;
  // resObj.contentType = file.mimetype;

  // return resObj;

  return new Promise<any>((resolve, reject) => {
    pipeline(readStream, uploadStream, (err) => {
      if (err) {
        console.log("Error in uploading the file");
        reject(err);
      } else {
        console.log("File uploaded successfully");
        uploadStream.destroy();
        readStream.destroy();
        resObj.id = uploadStream.id;
        resObj.filename = file.filename;
        resObj.contentType = file.mimetype;
        resolve(resObj);
      }
    });
  });
}
