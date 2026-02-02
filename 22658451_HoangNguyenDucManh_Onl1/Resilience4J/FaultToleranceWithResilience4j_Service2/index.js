const express = require('express');
const app = express();
const PORT = 3000;

// API chính để Spring Boot gọi sang
app.get('/api/data', (req, res) => {
    
    // 1. Dùng để test Retry & Circuit Breaker:
    // Giả lập tỉ lệ lỗi 50%
    const shouldFail = Math.random() > 0.5;
    
    if (shouldFail) {
        console.log("--> Giả lập lỗi 500: Server B đang gặp sự cố...");
        return res.status(500).send("Internal Server Error từ Node.js");
    }

    // 2. Dùng để test Bulkhead (Xử lý chậm):
    // Giả lập việc xử lý tốn thời gian (2 giây) để làm đầy các thread bên Spring Boot
    // setTimeout(() => {
    //     console.log("--> Trả về dữ liệu thành công sau 2 giây.");
    //     res.send("Dữ liệu từ Node.js Service (phản hồi chậm)");
    // }, 2000);

    // Phản hồi thành công thông thường
    console.log("--> Request thành công!");
    res.send("Xin chào! Đây là dữ liệu từ Node.js Service.");
});

app.listen(PORT, () => {
    console.log(`Node.js Service đang chạy tại: http://localhost:${PORT}`);
    console.log("Sẵn sàng để test Fault Tolerance...");
});