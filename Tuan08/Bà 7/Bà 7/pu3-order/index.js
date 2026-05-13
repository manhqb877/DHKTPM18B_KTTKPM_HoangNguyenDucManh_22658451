require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const amqp = require('amqplib'); // Bổ sung thư viện RabbitMQ

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

// 1. KẾT NỐI MONGODB VÀ TẠO SCHEMA ORDER
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB (order_db)'))
    .catch(err => console.error('❌ Lỗi kết nối DB:', err));

const orderSchema = new mongoose.Schema({
    userId: String,
    items: [{ productId: String, quantity: Number }],
    status: { type: String, default: 'SUCCESS' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ==============================================================
// THIẾT LẬP RABBITMQ (YÊU CẦU 4 CỦA THẦY)
// ==============================================================
let channel;
async function connectMQ() {
    try {
        // Kết nối tới RabbitMQ Server
        const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://127.0.0.1');
        channel = await conn.createChannel();
        
        // Tạo một hàng đợi (Queue) tên là WRITE_DB_QUEUE
        await channel.assertQueue('WRITE_DB_QUEUE'); 
        console.log('🐇 Đã kết nối RabbitMQ - Hàng đợi WRITE_DB_QUEUE sẵn sàng nhận lệnh!');

        // LÀM LUÔN NHIỆM VỤ CỦA WORKER (CONSUMER): Lắng nghe hàng đợi
        channel.consume('WRITE_DB_QUEUE', async (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                console.log(`\n📥 [MQ WORKER]: Bắt được 1 Message từ Queue! Đang ghi ngầm DB cho user: ${orderData.userId}...`);
                
                try {
                    // Thực hiện ghi xuống MongoDB
                    const newOrder = new Order(orderData);
                    await newOrder.save();
                    console.log(`✅ [DATA PUMP]: Đã lưu vĩnh viễn đơn hàng ${newOrder._id} vào DB thành công!`);
                    
                    // Báo cáo lại cho RabbitMQ là "Tui làm xong rồi, xóa tin nhắn này đi"
                    channel.ack(msg);
                } catch (err) {
                    console.error("❌ [LỖI GHI DB]:", err);
                    // Nếu lỗi, không ack() để message còn nguyên, lát thử lại
                }
            }
        });
    } catch (error) {
        console.error("❌ Lỗi kết nối RabbitMQ:", error);
    }
}
connectMQ();

// 2. API XỬ LÝ ĐẶT HÀNG (PUBLISHER)
app.post('/checkout', async (req, res) => {
    const { userId } = req.body;
    console.log(`\n🚀 [CHECKOUT]: Bắt đầu xử lý đơn của ${userId}`);
    
    // Đọc giỏ hàng từ RAM
    const cart = await redis.hgetall(`cart:${userId}`);
    if (Object.keys(cart).length === 0) return res.status(400).json({ message: "Giỏ hàng rỗng!" });

    let successItems = [];
    let failedItems = [];
    let orderItemsToSave = [];

    // Trừ kho qua PU4
    for (const [productId, quantity] of Object.entries(cart)) {
        try {
            const qty = parseInt(quantity);
            const invRes = await axios.post(`${process.env.INVENTORY_URL}/stock/decrease`, { productId, quantity: qty });

            if (invRes.data.success) {
                successItems.push(productId);
                orderItemsToSave.push({ productId, quantity: qty });
            } else {
                failedItems.push(productId);
            }
        } catch (err) {
            failedItems.push(productId);
        }
    }

    // Xóa giỏ hàng RAM
    await redis.del(`cart:${userId}`);

    // ==============================================================
    // ⚡ TRẢ KẾT QUẢ CHO USER NGAY LẬP TỨC (KHÔNG CHỜ DATABASE)
    // ==============================================================
    if (failedItems.length > 0) {
        console.log(`⚠️ Bán được vài món, rớt món: ${failedItems}`);
        res.json({ message: `⚠️ Đặt được vài món. Có món bị giật mất: ${failedItems.join(',')}` });
    } else {
        console.log(`🎉 CHỐT ĐƠN RAM THÀNH CÔNG! Đã báo về Frontend.`);
        res.json({ message: "🎉 CHÚC MỪNG! Săn Flash Sale Thành Công 100%!" });
    }

    // ==============================================================
    // 📤 ĐẨY MESSAGE VÀO RABBITMQ ĐỂ GHI DB SAU (THAY THẾ SETTIMEOUT)
    // ==============================================================
    if (orderItemsToSave.length > 0 && channel) {
        const payload = {
            userId: userId,
            items: orderItemsToSave,
            status: 'FLASH_SALE_PAID'
        };
        
        // Ném dữ liệu vào Message Queue
        channel.sendToQueue('WRITE_DB_QUEUE', Buffer.from(JSON.stringify(payload)));
        console.log(`📤 [SBA]: Đã ném 1 Message đặt hàng vào RabbitMQ. PU3 chính thức rảnh tay!`);
    }
});

app.listen(process.env.PORT, () => console.log(`📝 PU3 (Order) chạy port ${process.env.PORT}`));