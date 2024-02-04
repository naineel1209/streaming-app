import express from "express";
import { createServer } from "node:http";
import uploadRoutes from "./routes/upload.routes.ts";
const app = express();
const server = createServer(app);
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile("index.html");
});
app.use("/upload", uploadRoutes);
server.listen(process.env.PORT, () => {
    console.log("Server started on port " + (process.env.PORT ?? 3000));
});
