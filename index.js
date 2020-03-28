const amqp = require('amqplib/callback_api');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const app = express();

app.use(cors());
app.use(bodyParser.json());

const CONN_URL =
  'amqp://szfhfngd:a5kKGzXCpV8bAdDIb3dGflSSWbxus4I0@cougar.rmq.cloudamqp.com/szfhfngd';

let localChannel = null;

wss.on('connection', function connection(ws) {
  ws.send('test1');

  amqp.connect(CONN_URL, function (err, conn) {
    conn.createChannel(function (err, channel) {
      localChannel = channel;

      localChannel.consume(
        'sum',
        function (msg) {
          console.log('.....');
          console.log('Message:', msg.content.toString());

          ws.send(msg.content.toString());
        },
        {
          noAck: true,
        }
      );
    });
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

app.post('/multiply', async (req, res, next) => {
  const { payload } = req.body;
  console.log({
    payload,
  });

  try {
    await publishToQueue('multiplication', payload);

    res.json({
      message: 'sent',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/divide', async (req, res, next) => {
  const { payload } = req.body;
  console.log({
    payload,
  });

  try {
    await publishToQueue('division', payload);

    res.json({
      message: 'sent',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/add', async (req, res, next) => {
  const { payload } = req.body;
  console.log({
    payload,
  });

  try {
    await publishToQueue('addition', payload);

    res.json({
      message: 'sent',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/subtract', async (req, res, next) => {
  const { queueName, payload } = req.body;
  console.log({
    queueName,
    payload,
  });

  try {
    await publishToQueue('subtraction', payload);

    res.json({
      message: 'sent',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.listen(3000, () => {
  console.log('app running at port 3000');
});
