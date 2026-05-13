require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

app.post('/stock/decrease', async (req, res) => {
    const { productId, quantity } = req.body;
    
    console.log(`\n⚙️ [ATOMIC OP - PU4]: Đang gọi lệnh DECRBY để trừ ${quantity} món ${productId} trên RAM...`);
    
    // Trừ kho ngay lập tức trên RAM
    const remain = await redis.decrby(`stock:${productId}`, quantity);
    
    if (remain < 0) {
        console.log(`⚠️ [WARNING]: Số lượng âm (${remain}). Phát hiện cháy hàng!`);
        console.log(`🔄 [ROLLBACK]: Đang cộng trả lại ${quantity} món vào Data Grid...`);
        await redis.incrby(`stock:${productId}`, quantity); 
        return res.json({ success: false });
    }
    
    console.log(`✅ [SUCCESS]: Giảm kho thành công. Kho SP ${productId} hiện còn: ${remain}`);
    res.json({ success: true, remain });
});
app.get('/stock/:productId', async (req, res) => {
    const stock = await redis.get(`stock:${req.params.productId}`);
    res.json({ productId: req.params.productId, stock: parseInt(stock) || 0 });
});

app.listen(process.env.PORT, () => console.log(`⚡ PU4 (Inventory) chạy port ${process.env.PORT}`));