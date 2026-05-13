require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Load thư viện MongoDB
const { connectRabbitMQ, publishEvent } = require('./rabbitmq');

const app = express();
app.use(express.json());
app.use(cors());

// 1. KẾT NỐI MONGODB TỪ BIẾN MÔI TRƯỜNG (.env)
mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/user_db?authSource=admin')
  .then(() => console.log('✅ Đã kết nối Database MongoDB (user_db)'))
  .catch(err => console.error('❌ Lỗi kết nối Database:', err));

// 2. TẠO BẢNG (SCHEMA) CHO USER
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Tên không được trùng
  email: { type: String, required: true },
  password: { type: String, required: true } // Lưu cả password
});
const User = mongoose.model('User', userSchema);

// --- API ĐĂNG KÝ ---
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Kiểm tra xem tên đăng nhập đã có người dùng chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!" });
        }

        // Lưu vào Database thật
        const newUser = new User({ username, email, password });
        const savedUser = await newUser.save();
        
        // Publish Event (Gửi kèm id thật do MongoDB tạo ra: _id)
        await publishEvent('movie_exchange', 'USER_REGISTERED', {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email
        });
        
        res.status(201).json({ 
            message: "Đăng ký thành công!", 
            user: { id: savedUser._id, username: savedUser.username } 
        });
    } catch (error) {
        console.error("Lỗi Đăng ký:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi đăng ký!" });
    }
});

// --- API ĐĂNG NHẬP ---
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Tìm User trong Database xem có khớp tên và mật khẩu không
        const user = await User.findOne({ username, password });
        
        if (user) {
            console.log(`👤 Đã đăng nhập thành công: ${username}`);
            res.status(200).json({ 
                message: "Đăng nhập thành công!", 
                user: { id: user._id, username: user.username } 
            });
        } else {
            console.log(`❌ Đăng nhập thất bại: ${username}`);
            res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });
        }
    } catch (error) {
        console.error("Lỗi Đăng nhập:", error);
res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập!" });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, async () => {
    await connectRabbitMQ();
    console.log(`User Service đang chạy tại port ${PORT}`);
});