const {gameProps} = require('../mocks/game');
const {initiator, users} = require('../mocks/users');
const {gameList} = require('../../models/gameList.model');
const metaController = require('../../controllers/meta.controller');

metaController.createGame({clientId: gameProps.id, user: initiator});

const game = gameList.get(gameProps.id);
users.forEach(user => metaController.joinGame({game, user}));