import express, { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
config();
import fs from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { createServer } from "node:http";
import uploadRoutes from "./routes/upload.routes.ts";
import videoRoutes from "./routes/video.routes.ts";
import streamRoutes from "./routes/stream.routes.ts";
import morgan from "morgan";
import { getBucket } from "./mongoUploader/connect2mongo.ts";

const app = express();
const server = createServer(app);

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");
// app.use((req, res, next) => {
//   const range = req.headers.range;

//   if (range) {
//     console.log("range ", range);
//     next();
//   } else {
//     next();
//   }
// });

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
})

app.get("/home-page", async (req, res) => {
  console.log(req.baseUrl);
  if (!process.env.MONGO_URI) {
    return res.status(500).send("URI not found");
  }

  const bucket = await getBucket(process.env.MONGO_URI, "videos");
  const data = await bucket.find({}).toArray();

  return res.render("homepage", {
    videos: data,
  });
});

app.use("/upload", uploadRoutes);
app.use("/video", videoRoutes);
app.use("/stream", streamRoutes);

app.use("*", (req, res) => {
  res.status(404).send("Page not found");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

server.listen(process.env.PORT ?? 3000, () => {
  console.log("Server started on port " + (process.env.PORT ?? 3000));
});
