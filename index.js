const amqp = require('amqplib/callback_api');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const CONN_URL =
  'amqp://szfhfngd:a5kKGzXCpV8bAdDIb3dGflSSWbxus4I0@cougar.rmq.cloudamqp.com/szfhfngd';

let localChannel = null;
amqp.connect(CONN_URL, function (err, conn) {
  conn.createChannel(function (err, channel) {
    localChannel = channel;
  });
});

const publishToQueue = async (queueName, data) => {
  if (localChannel) {
    localChannel.sendToQueue(queueName, new Buffer(data));
  }
};

process.on('exit', (code) => {
  if (localChannel) {
    localChannel.close();
  }
  console.log(`Closing rabbitmq channel`);
});

app.post('/message', async (req, res, next) => {
  const { queueName, payload } = req.body;
  console.log({ queueName, payload });

  try {
    await publishToQueue(queueName, payload);

    res.json({ message: 'sent' });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.listen(3000, () => {
  console.log('app running at port 3000');
});
