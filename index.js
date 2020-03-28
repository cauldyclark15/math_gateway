const amqp = require('amqplib/callback_api');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');

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
    return localChannel.sendToQueue(queueName, new Buffer(data));
  }

  return null;
};

process.on('exit', (code) => {
  if (localChannel) {
    localChannel.close();
  }
  console.log(`Closing rabbitmq channel`);
});

app.post('/multiply', async (req, res, next) => {
  const {
    payload
  } = req.body;
  console.log({
    payload,
  });

  try {
    await publishToQueue('multiplication', payload);

    res.json({
      message: queueResponse ? 'sent' : 'failed',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/divide', async (req, res, next) => {
  const {
    payload
  } = req.body;
  console.log({
    payload,
  });

  try {
    const queueResponse = await publishToQueue('division', payload);

    res.json({
      message: queueResponse ? 'sent' : 'failed',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/add', async (req, res, next) => {
  const {
    payload
  } = req.body;
  console.log({
    payload,
  });

  try {
    await publishToQueue('addition', payload);

    res.json({
      message: queueResponse ? 'sent' : 'failed',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/subtract', async (req, res, next) => {
  const {
    queueName,
    payload
  } = req.body;
  console.log({
    queueName,
    payload,
  });

  try {
    await publishToQueue('subtraction', payload);

    res.json({
      message: queueResponse ? 'sent' : 'failed',
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
  clientTracking: false,
  noServer: true
});

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...');

  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws, request);
    console.log('Sessioned parsed!');
  });
});

wss.on('connection', function (ws, request) {
  ws.send('hello fcc tarlac')

  localChannel.consume(
    'sum',
    function (msg) {
      console.log('.....');
      console.log('Message:', msg.content.toString());

      ws.send(JSON.stringify({
        sum: msg.content.toString()
      }));
    }, {
      noAck: true,
    }
  );

  localChannel.consume(
    'quotient',
    function (msg) {
      console.log('.....');
      console.log('Message:', msg.content.toString());

      ws.send(JSON.stringify({
        quotient: msg.content.toString()
      }));
    }, {
      noAck: true,
    }
  );

  localChannel.consume(
    'difference',
    function (msg) {
      console.log('.....');
      console.log('Message:', msg.content.toString());

      ws.send(JSON.stringify({
        quotient: msg.content.toString()
      }));
    }, {
      noAck: true,
    }
  );

  localChannel.consume(
    'product',
    function (msg) {
      console.log('.....');
      console.log('Message:', msg.content.toString());

      ws.send(JSON.stringify({
        quotient: msg.content.toString()
      }));
    }, {
      noAck: true,
    }
  );
})

server.listen(process.env.PORT || 8080, () => {
  console.log('app running at port 8080');
});