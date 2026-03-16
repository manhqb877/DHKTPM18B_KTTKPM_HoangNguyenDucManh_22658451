const express = require("express");
const cors = require("cors");

const { loadPlugins, getPlugins } = require("./pluginLoader");

const app = express();

app.use(cors());
app.use(express.json());

let posts = [];

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.post("/posts", (req, res) => {
  const post = req.body;
  posts.push(post);
  res.json(post);
});

loadPlugins(app);

app.get("/plugins", (req, res) => {
  res.json(getPlugins());
});

app.listen(3001, () => {
  console.log("CMS running on port 3001");
});