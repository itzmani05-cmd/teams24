const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { clientUrl } = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

// In production (e.g. Docker) the API also serves the built React app from dist/.
const clientDist = path.join(__dirname, "../../dist");
if (fs.existsSync(path.join(clientDist, "index.html"))) {
  app.use(express.static(clientDist, { index: false, maxAge: "1d" }));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
