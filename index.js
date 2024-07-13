"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const app = express();



const renderVideoForStream = (req, res, next) => {
    try {
        const filePath = path.resolve(__dirname, "video.mp4");

        fs.stat(filePath, (err, stats) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
                return;
            }

            const range = req.headers.range;
            if (!range) {
                res.writeHead(416, { "Content-Type": "text/plain" });
                res.end("Range Not Satisfiable");
                return;
            }

            const positions = range.replace(/bytes=/, "").split("-");
            const start = parseInt(positions[0], 10);
            const total = stats.size;
            const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            const chunksize = end - start + 1;

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${total}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4",
            });

            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);

            stream.on('error', (err) => {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            });

        });
    } catch {
        return res.status(500).send("Internal Server Error");
    }
};

const renderAudioForStream = (req, res, next) => {
    try {
        const filePath = path.resolve(__dirname, "audio.mp3");

        fs.stat(filePath, (err, stats) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
                return;
            }

            const range = req.headers.range;
            if (!range) {
                res.writeHead(416, { "Content-Type": "text/plain" });
                res.end("Range Not Satisfiable");
                return;
            }

            const positions = range.replace(/bytes=/, "").split("-");
            const start = parseInt(positions[0], 10);
            const total = stats.size;
            const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            const chunksize = end - start + 1;

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${total}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "audio/mpeg",
            });

            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);

            stream.on("error", (err) => {
                console.error("Stream Error:", err); // Log error
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
            });
        });
    } catch (error) {
        console.error("Server Error:", error); // Log error
        return res.status(500).send("Internal Server Error");
    }
};



app.use("/audio", renderAudioForStream);
app.use('/video', renderVideoForStream);


const credentials = {
    key: fs.readFileSync("ssl/private.key"),
    cert: fs.readFileSync("ssl/bundle.crt"),
    dhparam: fs.readFileSync("ssl/dh-strong.pem"),
    requestCert: true,
    rejectUnauthorized: false,
};

const server = https.createServer(credentials, app);

server.listen(3000, () => {
    console.log("Server running at https://localhost:3000/");
});
