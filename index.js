const amqp = require('amqplib/callback_api');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session')

const app = express();

const sessionParser = session({
  saveUninitialized: false,
  secret: 'aaa',
  resave: false
});

app.use(cors());
app.use(bodyParser.json());
app.use(sessionParser);

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

app.post('/solve', async (req, res, next) => {
  const {
    payload
  } = req.body;
  console.log({
    payload,
  });

  try {
    const queueResponse = await publishToQueue('question', payload);

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
  ws.send('')

  localChannel.consume(
    'answer',
    function (msg) {
      console.log('.....');
      console.log('Message:', msg.content.toString());

      ws.send(msg.content.toString());
    }
  );
})

server.listen(process.env.PORT || 8080, () => {
  console.log('app running at port 8080');
});