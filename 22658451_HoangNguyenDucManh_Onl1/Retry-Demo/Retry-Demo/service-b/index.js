const express = require("express");
const app = express();

let count = 0;

app.get("/unstable", (req, res) => {
  count++;

  if (count <= 2) {
    console.log("❌ Service B: Forced fail");
    return res.status(500).json({ message: "Service B error" });
  }

  console.log("✅ Service B: Success");
  res.json({ message: "Service B success after retry" });
});

app.listen(4000, () => {
  console.log("Service B running at http://localhost:4000");
});
