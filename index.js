const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");

let server = https.createServer(
  {
    key: fs.readFileSync("cert/key.pem"),
    cert: fs.readFileSync("cert/cert.pem")
  },
  app
);

const port = 443;

app.use(express.static(__dirname + "/public"));

server.listen(port, () => console.log(`Server is running on port ${port}`));
