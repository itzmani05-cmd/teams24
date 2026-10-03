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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
