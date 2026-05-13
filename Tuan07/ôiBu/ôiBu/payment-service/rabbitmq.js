// rabbitmq.js
const amqplib = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
    try {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        console.log("✅ Đã kết nối RabbitMQ");
    } catch (error) {
        console.error("❌ Lỗi kết nối RabbitMQ", error);
    }
}

async function publishEvent(exchange, routingKey, data) {
    if (!channel) await connectRabbitMQ();
    await channel.assertExchange(exchange, 'direct', { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
    console.log(`📤 [Published] ${routingKey}:`, data);
}

async function consumeEvent(exchange, routingKey, queueName, callback) {
    if (!channel) await connectRabbitMQ();
    await channel.assertExchange(exchange, 'direct', { durable: true });
    
    const q = await channel.assertQueue(queueName, { exclusive: false });
    await channel.bindQueue(q.queue, exchange, routingKey);
    
    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            console.log(`📥 [Consumed] ${routingKey}:`, data);
            callback(data);
            channel.ack(msg);
        }
    });
}

module.exports = { connectRabbitMQ, publishEvent, consumeEvent };