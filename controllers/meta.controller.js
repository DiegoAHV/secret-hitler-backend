'use strict';

const {Game} = require('../models/game.model');
const {gameList} = require('../models/gameList.model');
const {Player} = require('../models/player.model');

exports.createGame = (payload) => {
  const {clientId, user} = payload;
  const game = new Game(clientId, user);
  gameList.add(game);
  payload.game = game;
}

exports.joinGame = ({game, user}) => {
  const player = new Player(user);
  game.addPlayer(player);
  console.log('game joined');
}

exports.startGame = ({game}) => {
  game.setRoles();
  game.assignPlayersFactions();
  game.drawThreePolicies();
  game.setMessage('showRoles');
}

exports.leaveGame = ({game, user}) => {
  game.removePlayer(user);
}