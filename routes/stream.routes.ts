import { Router } from "express";
import { getBucket } from "../mongoUploader/connect2mongo.ts";
import { config } from "dotenv";
import { pipeline } from "node:stream";
import mongoose, { Cursor } from "mongoose";
import RangeParser from "range-parser";
config();

const router = Router();

//PATH: /stream

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("No id found");
  } else if (!process.env.MONGO_URI) {
    return res.status(500).send("URI not found");
  } else {
    const bucket = await getBucket(process.env.MONGO_URI, "videos");

    const [data] = await bucket.find({ filename: id }).toArray();

    const range = req.headers.range || "bytes=0-";

    const { filename, length, chunkSize } = data;
    const ext = filename.split(".").pop();
    const fileSize = length;
    const start = Number(range.replace(/\D/g, ""));


    const CHUNK_SIZE = 1024 * 1024; // 1MB
    // const CHUNK_SIZE = chunkSize; // 1MB
    let end;
    let readStream: mongoose.mongo.GridFSBucketReadStream;

    //start + chunksize is greater than the file size then end is the file size
    if (start + CHUNK_SIZE >= fileSize) {
      end = fileSize - 1;
    }
    //start + chunksize is less than the file size then end is start + chunksize
    else {
      end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    }

    const contentLength = (end - start) + 1;


    const headers = {
      "Content-Range": `bytes ${start}-${end}/${length}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": `video/${ext}`,
    };

    console.log(headers);
    console.log("start ", start, " end ", end, " fileSize ", fileSize, " ext ", ext);

    res.writeHead(206, headers);
    readStream = bucket.openDownloadStreamByName(filename, {
      start,
      end
    });
    pipeline(readStream, res, (err) => {
      if (err) {
        console.log(err);
      }

      readStream.destroy();
    });
  }

});

export default router;
