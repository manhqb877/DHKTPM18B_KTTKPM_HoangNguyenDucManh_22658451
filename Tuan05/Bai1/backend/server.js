const express = require("express");
const app = express();

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

app.listen(3001, () => {
  console.log("Server running");
});