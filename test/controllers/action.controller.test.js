const should = require('chai').should();

const server = require('../../index');

const actionController = require('../../controllers/action.controller');
const metaController = require('../../controllers/meta.controller');
const {gameList} = require('../../models/gameList.model');
const {initiator, users} = require('../mocks/users');
const {gameProps} = require('../mocks/game');

const {capitalize} = require('../../utils');

const payloads = {
  createGame: {
    clientId: gameProps.id,
    user: initiator,
  },
  generate: (name) => ({
    game,
    message: 'acknowledge' + capitalize(name),
    countName: name,
  }),
}

metaController.createGame(payloads.createGame);

const game = gameList.get(gameProps.id);
const players = [initiator, ...users];

users.forEach(user => metaController.joinGame({game, user}));

metaController.startGame({game});

const allPlayersVote = (vote) => {
  players.forEach(player => {
    actionController.voteOnChancellor({game, playerId: player.id, vote});
  });
};

describe('Action controllers', () => {

  after(() => {
    server.close();
  });

  it('should set game message correctly when acknowledging roles, fascists and president complete', () => {
    players.forEach(() => actionController.acknowledge(payloads.generate('playerRole')));
    game.message.should.equal('showFascists');

    players.forEach(() => actionController.acknowledge(payloads.generate('fascists')));
    game.message.should.equal('showPresident');

    players.forEach(() => actionController.acknowledge(payloads.generate('president')));
    game.message.should.equal('suggestChancellor');
  });

  it('should set suggestedChancellor and game message to "voteOnChancellor" when president suggests one', () => {
    const suggestedChancellorId = game.playerList[2].president ? players[0].id : players[2].id;
    actionController.suggestChancellor({game, playerId: suggestedChancellorId});
    game.suggestedChancellor.should.equal(suggestedChancellorId);
    game.message.should.equal('voteChancellor');
  });

  it('should set currentChancellor to new chancellor and game message to acknowledgeChancellor if vote is successful', () => {
    allPlayersVote('ja');
    game.currentChancellor.should.equal(game.suggestedChancellor);
    game.message.should.equal('acknowledgeChancellor');
  });

  it('should get next player as president and set game message to showPresident if vote is not successful', () => {
    const presidentIndex = game.playerList.findIndex(player => {
      return player.user.id === game.currentPresident;
    });
    allPlayersVote('nein');
    const newPresidentIndex = game.playerList.findIndex(player => {
      return player.user.id === game.currentPresident;
    });
    if (presidentIndex === game.playerList.length - 1) {
      newPresidentIndex.should.equal(0);
    } else {
      newPresidentIndex.should.equal(presidentIndex + 1);
    }
    game.message.should.equal('showPresident');
  });

  it('should set game message to "showPresidentPolicyCard" when acknowledging Chancellor is done', () => {
    players.forEach(() => actionController.acknowledge(payloads.generate('chancellor')));
    game.message.should.equal('showPresidentPolicyCards');
  });

  it('should change game.eligiblePolicies from 3 to 2 cards and set game message to "showChancellorPolicyCards when president picks rejected policy', () => {
    const pickPoliciesPayload = {
      game,
      playerId: game.currentPresident,
      rejectedPolicy: 1
    }
    actionController.pickPolicies(payloads.pickPolicies);
    game.eligiblePolicies.length.should.equal(2);
    game.message.should.equal('showChancellorPolicyCards');
  });

  it('should set game message to "showPlayersChosenPolicy" when chancellor picks rejected policy', () => {
    const pickPoliciesPayload = {
      game,
      playerId: game.currentChancellor,
      rejectedPolicy: 0
    }
    actionController.pickPolicies(payloads.pickPolicies);
    game.message.should.equal('showPlayersChosenPolicy');
  });

  it('should should ask president to execute player when all players have acknowledged chosen policy and 4 or 5 fascist policies have been enacted', () => {
    game.numberOfFascistPolicies = 4;
    players.forEach(() => actionController.acknowledge(payloads.generate('chosenPolicy')));
    game.message.should.equal('askPresidentToExecutePlayer');
  });
});
