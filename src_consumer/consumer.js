require('dotenv').config();

const amqp = require('amqplib');
const CollaborationService = require('../src_api/services/postgres/CollaborationService');
const PlaylistService = require('../src_api/services/postgres/PlaylistService');
const Listener = require('./listener');
const MailSender = require('./MailSender');

const init = async () => {
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(collaborationService);
  const mailSender = new MailSender();
  const listener = new Listener(playlistService, mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:songs', {
    durable: true,
  });

  channel.consume('export:songs', listener.listen, { noAck: true });
};

init();
