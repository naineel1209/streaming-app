import { Router } from "express";
import { getBucket } from "../mongoUploader/connect2mongo.ts";
import mongoose, { isObjectIdOrHexString } from "mongoose";
const router = Router();

//Path: /video

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;

  if (isObjectIdOrHexString(id) && process.env.MONGO_URI) {
    const bucket = await getBucket(process.env.MONGO_URI, "videos");
    const data = await bucket
      .find({ _id: new mongoose.Types.ObjectId(id) })
      .toArray();

    return res.render("watch_video", {
      file: data[0],
    });
  } else {
    return res.status(500).send("URI not found");
  }
});

export default router;
