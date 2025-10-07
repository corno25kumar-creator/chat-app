import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
             protocol: 'amqp',
             hostname: process.env.RABBITMQ_HOSTNAME,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
        });

        const channel = await connection.createChannel();
        const queue = 'send-otp';
        
        await channel.assertQueue(queue, { durable: true });
        console.log('✅ mail service consumer started for queue:, listing for otp mails', queue);

        channel.consume(queue, async (msg) => {

            try {
                  if (msg) {
                const { to, subject, text } = JSON.parse(msg.content.toString());       
                
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT),
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to,
                    subject,
                    text: text,
                });
                 console.log(`otp mail sent to ${to} successfully`);
            }
            } catch (error) {
                console.error('fail to send otp:', error);
            }
           
        });   
      
    } catch (error) {
        console.error('Error in consumer:', error);
    }
};