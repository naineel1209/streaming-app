import fs from "node:fs";
import express from "express";
import ffmpeg from "fluent-ffmpeg";

//stream the video to the client
const app = express();

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/video", (req, res) => {
  const path = "./assets/assests_31.mp4";
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    res.status(400).send("Requires Range header");
  } else {
    const start = parseInt(range.replace(/bytes=/, "").split("-")[0], 10);
    const CHUNK_SIZE = 1e6; //1MB
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    console.log("start", start, "end", end);

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    if (start >= fileSize) {
      console.log("Requested range not satisfiable");
      res.status(416).send("Requested range not satisfiable");
      return;
    }

    // const file = fs.createReadStream(path, {start, end});
    let drain = 0,
      pause = 0;

    res.writeHead(206, headers);
    const file = fs.createReadStream(path, {start, end});

    file.pipe(res);

    // file.on("data", (data) => {
    //   if(res.write(data) === false){
    //     pause++;
    //     file.pause();
    //   }
    // });

    // res.on("drain", () => {
    //   drain++;
    //   file.resume();
    // });
  }
  
  // if(range){
  //   const parts = range.replace(/bytes=/, "").split("-");

  //   const start = parseInt(parts[0], 10); //get the start of the video
  //   const CHUNK_SIZE = 1e6 //1MB
  //   const end = Math.min(start + CHUNK_SIZE, fileSize-1); //get the end of the video
  //   const contentLength = end - start + 1;

  //   const head = {
  //     "Content-Range": `bytes ${start}-${end}/${fileSize}`,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": contentLength,
  //     "Content-Type": "video/mp4"
  //   };

  //   let drain = 0, pause = 0;

  //   res.writeHead(206, head);
  //   const file = fs.createReadStream(path, {start, end});
  //   file.pipe(res);

  //   file.on("end", () => {
  //     console.log("end");
  //     res.status(200).end();
  //   })
  // } else {
  //   console.log("streaming the video");
  //   const head = {
  //     "Content-Length": fileSize,
  //     "Content-Type": "video/mp4"
  //   };

  //   let drain = 0, pause = 0;

  //   res.writeHead(200, head);
  //   const file = fs.createReadStream(path);
  //   file.pipe(res);

  //   // file.on("data", (data) => {
  //   //   if(res.write(data) === false){
  //   //     pause++;
  //   //     file.pause();
  //   //   }
  //   // });

  //   // res.on("drain", () => {
  //   //   drain++;
  //   //   file.resume();
  //   // });

  //   // file.on("end", () => {
  //   //   console.log("drain", drain, "pause", pause);
  //   //   console.log("end");
  //   //   res.end();
  //   // });

  // }
});

app.get("/range", (req, res) => {
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : 1000 - 1;

    console.log("range", range);
    res.send("start " + start + " end " + end);
  } else {
    res.send("no range of request found ");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
