const amqp = require('amqplib/callback_api');

const CONN_URL =
  'amqp://szfhfngd:a5kKGzXCpV8bAdDIb3dGflSSWbxus4I0@cougar.rmq.cloudamqp.com/szfhfngd';
amqp.connect(CONN_URL, function (err, conn) {
  conn.createChannel(function (err, ch) {
    ch.consume(
      'multiplication',
      async function (msg) {
        const publishToQueue = async (queueName, data) => {
          if (ch) {
            ch.sendToQueue(queueName, new Buffer(data));
          }
        };

        console.log('.....');
        await publishToQueue('sum', msg.content.toString());
        console.log('published sum');
      },
      {
        noAck: true,
      }
    );
  });
});

// localChannel.consume(
//   'product',
//   function (msg) {
//     console.log('.....');
//     console.log('Message:', msg.content.toString());

//     ws.send(msg.content.toString());
//   },
//   {
//     noAck: true,
//   }
// );

// localChannel.consume(
//   'difference',
//   function (msg) {
//     console.log('.....');
//     console.log('Message:', msg.content.toString());

//     ws.send(msg.content.toString());
//   },
//   {
//     noAck: true,
//   }
// );

// localChannel.consume(
//   'quotient',
//   function (msg) {
//     console.log('.....');
//     console.log('Message:', msg.content.toString());

//     ws.send(msg.content.toString());
//   },
//   {
//     noAck: true,
//   }
// );
