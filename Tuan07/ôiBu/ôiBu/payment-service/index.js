require('dotenv').config();
const express = require('express');
const { connectRabbitMQ, publishEvent, consumeEvent } = require('./rabbitmq');

const app = express();

async function startService() {
    await connectRabbitMQ();

    // Lắng nghe yêu cầu thanh toán
    consumeEvent('movie_exchange', 'BOOKING_CREATED', 'payment_queue', async (bookingData) => {
        console.log("⏳ Đang xử lý thanh toán cho:", bookingData.bookingId);
        
        // Giả lập xử lý thanh toán (70% thành công, 30% thất bại)
        const isSuccess = Math.random() > 0.3; 
        
        setTimeout(async () => {
            if (isSuccess) {
                await publishEvent('movie_exchange', 'PAYMENT_COMPLETED', { ...bookingData, status: 'PAID' });
            } else {
                await publishEvent('movie_exchange', 'BOOKING_FAILED', { ...bookingData, status: 'FAILED' });
            }
        }, 2000); // Giả lập tốn 2s để thanh toán
    });

    // Lắng nghe kết quả để thực hiện Notification
    consumeEvent('movie_exchange', 'PAYMENT_COMPLETED', 'notification_queue_success', (data) => {
        console.log(`\n🎉 [NOTIFICATION]: User ${data.userId} đã đặt đơn ${data.bookingId} THÀNH CÔNG!\n`);
    });

    consumeEvent('movie_exchange', 'BOOKING_FAILED', 'notification_queue_fail', (data) => {
        console.log(`\n❌ [NOTIFICATION]: Đơn ${data.bookingId} của User ${data.userId} thất bại do lỗi thanh toán.\n`);
    });
}

const PORT = process.env.PORT || 8084;
app.listen(PORT, () => {
    startService();
    console.log(`Payment & Notification Service running on port ${PORT}`);
});