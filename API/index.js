process.env.NODE_CONFIG_DIR = "../config";

const config = require("config");
const express = require("express");
// const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
const port = config.get("api_endpoints.port");

console.log(`Start API Running on port:${port}`);

router.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.use(config.get("api_endpoints.sub_directory"), router);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
