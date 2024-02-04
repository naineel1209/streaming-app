import { Router } from "express";
import { getBucket } from "../mongoUploader/connect2mongo.ts";
import { config } from "dotenv";
import { pipeline } from "node:stream";
import mongoose from "mongoose";
config();

const router = Router();

//PATH: /stream

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("No id found");
  } else if (!process.env.MONGO_URI) {
  } else {
    const bucket = await getBucket(process.env.MONGO_URI, "videos");

    const data = await bucket
      .find({ _id: new mongoose.Types.ObjectId(id) })
      .toArray();
    const file = data[0];

    if (!file) {
      return res.status(404).send("File not found");
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(400).send("No range found");
    }

    const fileSize = file.length;
    const start = parseInt(range.replace(/bytes=/, "").split("-")[0], 10);
    const end = Math.min(start + 100000, fileSize - 1);

    if (start > end) {
      return res.status(416).send("Requested range not satisfiable");
    }

    const contentLength = end - start + 1;
    const ext = file.filename.split(".").pop();

    const headers = {
      "Content-Range": "bytes " + start + "-" + end + "/" + file.length,
      "Content-Length": contentLength,
      "Accept-Ranges": "bytes",
      "Content-Type": `video/mp4`,
    };

    console.log(headers);

    console.log(
      "start ",
      start,
      " end ",
      end,
      " fileSize ",
      fileSize,
      " ext ",
      ext
    );

    if (start >= fileSize) {
      res.status(416).send("Requested range not satisfiable");
      return;
    }

    res.writeHead(206, headers);
    const readStream = bucket.openDownloadStreamByName(file.filename, {
      start,
    });
    readStream.pipe(res);
  }
});

export default router;
