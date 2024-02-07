import { NextFunction, Router, Request, Response } from "express";
import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import multer from "multer";
import fs from "node:fs";
import { mongoUploader } from "../mongoUploader/mongoUploader.ts";
import { config } from "dotenv";
config();

//PATH: /upload

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp/");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(".");
    const ext = name.pop();
    name.push(Date.now().toString().slice(-5));
    if (ext) {
      name.push(".");
      name.push(ext);
    }
    cb(null, name.join(""));
  },
});
const uploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(new Error("Only videos are allowed"));
    }
  },
});

const fileTransformer = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  if (file) {
    const fileParts = file.originalname.split(".")
    const ext = fileParts.pop();
    const name = fileParts.join(".");
    const newExt = "webm";
    const newName = name + "_converted." + newExt;
    const newPath = "./temp/" + newName;

    ffmpeg(file.path).videoCodec('libvpx') //libvpx-vp9 could be used too
      .videoBitrate(1000, true) //Outputting a constrained 1Mbit VP8 video stream
      .outputOptions(
        '-minrate', '1000',
        '-maxrate', '1000',
        '-threads', '10', //Use number of real cores available on the computer - 1
        '-flags', '+global_header', //WebM won't love if you if you don't give it some headers
        '-psnr') //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
      .on('progress', function (progress) {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', function (err, stdout, stderr) {
        console.log(stdout);
        console.log('Processing finished.');
        var regex = /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/
        var psnr = stdout.match(regex);
        console.log('This WebM transcode scored a PSNR of: ');
        console.log(psnr[4] + 'dB');
        next();
      })
      .save(newPath);

    req.file = {
      ...file,
      filename: newName,
      path: newPath,
      originalname: newName,
      mimetype: "video/" + newExt,
    }
  } else {
    return res.status(400).send("No file found");
  }
};

const router = Router({ mergeParams: true });

router
  .route("/")
  .get((req, res) => {
    return res.sendFile("upload.html", { root: "./public" });
  })
  .post(uploader.single("data1"), fileTransformer, async (req, res) => {
    const file = req.file;
    console.log(file)
    if (file) {
      if (process.env.MONGO_URI) {
        const resObj = await mongoUploader(process.env.MONGO_URI, file);
        // await fs.promises.unlink(file.path);

        return res.render("upload_success", {
          file: resObj,
        });
      } else {
        return res.status(500).send("URI not found");
      }
    } else {
      return res.status(400).send("No file found");
    }
  });
export default router;
