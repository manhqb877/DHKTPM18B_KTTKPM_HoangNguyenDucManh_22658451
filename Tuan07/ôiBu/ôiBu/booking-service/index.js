require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectRabbitMQ, publishEvent } = require('./rabbitmq');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/bookings', async (req, res) => {
    const { userId, movieId, seats } = req.body;
    
    // Tạo booking với trạng thái PENDING
    const booking = { 
        bookingId: `BK${Date.now()}`, 
        userId, movieId, seats, 
        status: 'PENDING' 
    };
    
    // Bắn event cho Payment Service xử lý
    await publishEvent('movie_exchange', 'BOOKING_CREATED', booking);
    
    res.status(201).json({ message: "Booking đang được xử lý!", booking });
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, async () => {
    await connectRabbitMQ();
    console.log(`Booking Service running on port ${PORT}`);
});