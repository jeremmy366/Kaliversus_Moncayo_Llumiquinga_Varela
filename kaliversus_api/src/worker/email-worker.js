// email-worker.js
// Microservicio/worker para consumir la cola 'email_notifications' de RabbitMQ y enviar emails

require('dotenv').config({ path: '../../.env' });
const amqp = require('amqplib');

const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@159.223.105.72:5672/';
const QUEUE = process.env.RABBITMQ_EMAIL_QUEUE || 'email_notifications';


// Mostrar valores de entorno Resend para debug
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***' : '(vacío)');
console.log('RESEND_FROM:', process.env.RESEND_FROM);


// Función para enviar email usando Resend
async function sendWithResend({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'no-reply@kaliversus.com';
  if (!apiKey) throw new Error('Falta RESEND_API_KEY en el .env');
  const response = await axios.post('https://api.resend.com/emails', {
    from,
    to,
    subject,
    text,
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

async function main() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  console.log(' [*] Esperando mensajes en %s. Para salir presiona CTRL+C', QUEUE);

  channel.consume(QUEUE, async (msg) => {
    if (msg !== null) {
      try {
        const content = JSON.parse(msg.content.toString());
        console.log(' [x] Recibido:', content);
        // Enviar email con Resend
        const data = content.data || content; // por compatibilidad
        await sendWithResend({
          to: data.to,
          subject: data.subject,
          text: data.body,
        });
        console.log(' [✓] Email enviado a', data.to);
        channel.ack(msg); // Confirmar SIEMPRE si todo va bien
      } catch (err) {
        console.error(' [!] Error procesando mensaje:', err);
        channel.nack(msg, false, false); // Descarta el mensaje si falla (no reintenta)
      }
    }
  });
}

main().catch(err => {
  console.error(' [!] Error en el worker:', err);
  process.exit(1);
});
