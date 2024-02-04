import { Router } from "express";
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

const router = Router({ mergeParams: true });

router
  .route("/")
  .get((req, res) => {
    return res.sendFile("upload.html", { root: "./public" });
  })
  .post(uploader.single("data1"), async (req, res) => {
    const file = req.file;

    if (file) {
      if (process.env.MONGO_URI) {
        const resObj = await mongoUploader(process.env.MONGO_URI, file);
        await fs.promises.unlink(file.path);

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
