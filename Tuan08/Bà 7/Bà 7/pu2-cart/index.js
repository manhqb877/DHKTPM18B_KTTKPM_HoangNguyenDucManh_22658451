require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

app.post('/cart/add', async (req, res) => {
    const { userId, productId } = req.body;
    
    console.log(`\n📥 [COMMAND - PU2]: User ${userId} thêm ${productId} vào giỏ.`);
    
    const stock = await redis.get(`stock:${productId}`);
    if (parseInt(stock) <= 0) {
        console.log(`❌ [FAILED]: SP ${productId} đã hết hàng, từ chối thêm vào giỏ.`);
        return res.status(400).json({ message: "Hết hàng rồi!" });
    }
    
    // Ghi vào RAM
    await redis.hincrby(`cart:${userId}`, productId, 1);
    console.log(`✅ [DATA GRID]: Đã lưu giỏ hàng vào Redis Hash. Zero Latency.`);
    res.json({ message: "Đã thêm vào giỏ hàng" });
});

app.get('/cart/:userId', async (req, res) => {
    const cart = await redis.hgetall(`cart:${req.params.userId}`);
    res.json(cart);
});

app.listen(process.env.PORT, () => console.log(`🛒 PU2 (Cart) chạy port ${process.env.PORT}`));