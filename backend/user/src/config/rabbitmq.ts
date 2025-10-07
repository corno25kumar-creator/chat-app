import ampqlib from 'amqplib';

let channel: ampqlib.Channel;

export const connectRabbitMQ = async () => {
try {
    const connection = await ampqlib.connect({

        protocol: 'amqp',
        hostname: process.env.RABBITMQ_HOSTNAME,
        port:5672,
        username: process.env.RABBITMQ_USERNAME,
        password: process.env.RABBITMQ_PASSWORD
    });

    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ 👌");
} catch (error) {
    console.error('RabbitMQ connection error:', error);
}

}
 export const publishToQueue = async (queueName: string, data: any) => {
    if(!channel){
        throw new Error('RabbitMQ channel is not established');
       
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
}
