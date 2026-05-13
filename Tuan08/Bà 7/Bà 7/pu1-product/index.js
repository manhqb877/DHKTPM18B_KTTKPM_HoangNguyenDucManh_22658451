require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const amqp = require('amqplib'); // <-- BỔ SUNG THƯ VIỆN RABBITMQ

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

// 1. KẾT NỐI MONGODB VÀ TẠO SCHEMA
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB (product_db)'))
    .catch(err => console.error('❌ Lỗi kết nối DB:', err));

const productSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: String,
    price: Number,
    image: String,
    initialStock: Number
});
const Product = mongoose.model('Product', productSchema);

// ==============================================================
// THIẾT LẬP RABBITMQ VÀ WORKER (YÊU CẦU 5 CỦA THẦY)
// ==============================================================
let channel;
async function connectMQ() {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://127.0.0.1');
        channel = await conn.createChannel();
        await channel.assertQueue('READ_DB_QUEUE'); 
        console.log('🐇 Đã kết nối RabbitMQ - Hàng đợi READ_DB_QUEUE sẵn sàng (Chờ Cache Miss)');

        // WORKER: Lắng nghe ai đó báo "Thiếu data trên Redis", nó sẽ xuống DB lấy lên
        channel.consume('READ_DB_QUEUE', async (msg) => {
            if (msg !== null) {
                const { productId } = JSON.parse(msg.content.toString());
                console.log(`\n🚨 [MQ WORKER - CACHE MISS]: Nhận lệnh! Đang fetch SP ${productId} từ MongoDB...`);
                
                try {
                    const productDB = await Product.findOne({ productId });
                    if (productDB) {
                        // Đắp ngược lên lại Redis để mấy người sau vô không bị thiếu nữa
                        await redis.set(`product:${productId}`, JSON.stringify({
                            id: productDB.productId, name: productDB.name, price: productDB.price, image: productDB.image
                        }));
                        console.log(`✅ [MQ WORKER]: Đã vá lỗi Cache Miss! Đẩy SP ${productId} lên Redis thành công!`);
                    } else {
                        console.log(`❌ [MQ WORKER]: Trong MongoDB cũng không tồn tại sản phẩm ${productId}!`);
                    }
                    channel.ack(msg); // Xóa message
                } catch (err) {
                    console.error("❌ Lỗi Worker:", err);
                }
            }
        });
    } catch (error) {
        console.error("❌ Lỗi kết nối RabbitMQ ở PU1:", error);
    }
}
connectMQ();


// 2. DATA READER: HÚT DATA TỪ DB BƠM LÊN RAM (Khởi chạy 1 lần)
async function loadDataFromDBToRAM() {
    console.log("⏳ [DATA READER]: Bắt đầu kiểm tra MongoDB...");
    
    const count = await Product.countDocuments();
    if (count === 0) {
        console.log("⚠️ MongoDB trống! Đang tạo dữ liệu mồi vào DB...");
        await Product.insertMany([
            { productId: 'p1', name: 'Macbook Pro M3', price: 35000000, image: '💻', initialStock: 5 },
            { productId: 'p2', name: 'iPhone 15 Pro Max', price: 29000000, image: '📱', initialStock: 10 },
            { productId: 'p3', name: 'Chuột Logitech G Pro', price: 2500000, image: '🖱️', initialStock: 50 }
        ]);
    }

    const productsDB = await Product.find();
    const idList = [];

    console.log("🌊 [DATA READER]: Đang bơm dữ liệu lên Data Grid (Redis)...");
    for (let p of productsDB) {
        await redis.set(`product:${p.productId}`, JSON.stringify({
            id: p.productId, name: p.name, price: p.price, image: p.image
        }));
        await redis.set(`stock:${p.productId}`, p.initialStock);
        idList.push(p.productId);
    }
    
    await redis.set('product_list', JSON.stringify(idList));
    console.log("==================================================");
    console.log("✅ [READY]: Bơm xong! Chuyển sang Flash Sale Mode (100% RAM)!");
    console.log("==================================================");
}

// 3. API ĐỌC TỪ RAM (Bỏ qua DB hoàn toàn khi user gọi)
app.get('/products', async (req, res) => {
    console.log(`\n🔍 [QUERY - PU1]: Đọc danh sách từ RAM...`);
    const ids = JSON.parse(await redis.get('product_list') || "[]");
    const products = await Promise.all(ids.map(async id => {
        const p = JSON.parse(await redis.get(`product:${id}`));
        const stock = await redis.get(`stock:${id}`);
        return { ...p, stock: parseInt(stock) || 0 };
    }));
    res.json(products);
});

// ==============================================================
// XỬ LÝ CACHE MISS TẠI CHI TIẾT SẢN PHẨM
// ==============================================================
app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const product = await redis.get(`product:${productId}`);
    const stock = await redis.get(`stock:${productId}`);

    if (!product) {
        // TRƯỜNG HỢP: ĐỌC REDIS KHÔNG CÓ -> PHẢI DÙNG MQ
        console.log(`\n⚠️ [CACHE MISS]: KHÔNG THẤY SP ${productId} TRÊN RAM! Bắn tin nhắn qua MQ nhờ lấy giùm...`);
        if (channel) {
            channel.sendToQueue('READ_DB_QUEUE', Buffer.from(JSON.stringify({ productId })));
        }

        // Đọc tạm DB để trả về cho người dùng này trước, không bắt họ chờ Worker MQ
        const dbFallback = await Product.findOne({ productId });
        if (!dbFallback) return res.status(404).json({ message: "Không thấy SP trên cả RAM lẫn DB" });
        
        return res.json({ 
            id: dbFallback.productId, 
            name: dbFallback.name, 
            price: dbFallback.price, 
            image: dbFallback.image,
            stock: parseInt(stock) || 0 
        });
    }

    // Nếu Redis có bình thường thì trả về luôn (Zero latency)
    res.json({ ...JSON.parse(product), stock: parseInt(stock) || 0 });
});

app.listen(process.env.PORT, () => {
    loadDataFromDBToRAM();
    console.log(`📦 PU1 (Product) chạy port ${process.env.PORT}`);
});