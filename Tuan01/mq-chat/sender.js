const amqp = require('amqplib');
const readline = require('readline');

const QUEUE = process.argv[2]; // queue người nhận

if (!QUEUE) {
  console.log('❌ Usage: node sender.js <queue_name>');
  process.exit(1);
}

async function sendMessage() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  await channel.assertQueue(QUEUE);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`✉️ Chat tới queue: ${QUEUE}`);

  rl.on('line', (msg) => {
    channel.sendToQueue(QUEUE, Buffer.from(msg));
    console.log(`✅ Sent: ${msg}`);
  });
}

sendMessage();
