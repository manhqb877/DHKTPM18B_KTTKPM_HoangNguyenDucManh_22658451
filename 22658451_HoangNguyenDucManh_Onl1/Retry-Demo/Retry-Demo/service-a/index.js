const express = require("express");
const axios = require("axios");

const app = express();

async function callServiceBWithRetry(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔁 Retry lần ${attempt}`);
      const response = await axios.get(
        "http://localhost:4000/unstable",
        { timeout: 2000 } // timeout 2s
      );
      return response.data;
    } catch (err) {
      console.log(`⚠️ Lỗi lần ${attempt}`);
      if (attempt === retries) {
        throw err;
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

app.get("/test", async (req, res) => {
  try {
    const data = await callServiceBWithRetry(3, 1000);
    res.json({
      status: "SUCCESS",
      data
    });
  } catch (err) {
    res.status(503).json({
      status: "FAIL",
      message: "Service B tạm thời không khả dụng"
    });
  }
});

app.listen(3000, () => {
  console.log("Service A running at http://localhost:3000");
});
