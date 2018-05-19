'use strict';

const io = require('../index');

const metaController = require('../controllers/meta.controller');
const actionController = require('../controllers/action.controller');
const {validatePayload}  = require('./validator');

exports.socketHandler = (io) => {
  io.on('connection', (client) => {
    console.log(`connected to client ${client.id}`);
    client.emit('message', {
      type: 'notification',
      text: 'Connected to Hitler\'s servers.'
    });

    client.on('data', ({type, payload}) => {
      const error = validatePayload(type, payload);
      if (error) return client.emit('message', {type: 'exception', text: error});

      if (type === 'createGame') {
        client.join(client.id);
        payload.clientId = client.id;
      }
      else if (type === 'joinGame') client.join(payload.gameId);
      else if (type === 'leaveGame') client.leave(payload.gameId);

      if (metaController[type]) metaController[type](payload);
      else if (actionController[type]) actionController[type](payload);

      const acknowledgeCount = payload.game.acknowledgeCounts[payload.countName];
      const playerCount = payload.game.playerList.length;
      if (type !== 'acknowledge' || acknowledgeCount >= playerCount)
      io.in(payload.game.id).emit('data', {type: 'game', payload: payload.game});
    });

    client.on('disconnect', () => {
      console.log(`client ${client.id} disconnected`);
      client.emit('message', {
        type: 'notification',
        text: 'Disconnected from Hitler\'s servers.'
      });
    });

    client.on('error', (err) => {
      console.log('received error from client: ', client.id);
      console.log(err);
    });
  });
}