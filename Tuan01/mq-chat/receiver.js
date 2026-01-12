const amqp = require('amqplib');

const QUEUE = process.argv[2]; // queue của mình

if (!QUEUE) {
  console.log('❌ Usage: node receiver.js <queue_name>');
  process.exit(1);
}

async function receiveMessage() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  await channel.assertQueue(QUEUE);

  console.log(`📥 Đang lắng nghe queue: ${QUEUE}`);

  channel.consume(QUEUE, (msg) => {
    if (msg !== null) {
      console.log(`💬 Message: ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

receiveMessage();
