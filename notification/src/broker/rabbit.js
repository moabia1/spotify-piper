import amqp from "amqplib";
import config from "../config/config.js";


let channel, connection;

export async function connect() {
  connection = await amqp.connect(config.RABBITMQ_URI);
  channel = await connection.createChannel();

  console.log("Connected to RabbitMQ");
}

export async function publishToQueue(queueName, data) {

  await channel.assertQueue(queueName, { durable: true });
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

  console.log("Message send to queue", queueName)
}

export async function subscribeToQueue(queueName,callback) {
  await channel.assertQueue(queueName, { durable: true })
  
  channel.consume(queueName, async (msg) => {
    await callback(JSON.parse(msg.content.toString()))
    await channel.ack(msg)
  })
}