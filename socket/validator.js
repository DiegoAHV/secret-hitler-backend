const {gameList} = require('../models/gameList.model');

const validateUser = (user) => {
  if (!user.id) return 'A user must have an id.';
  if (!user.name) return 'A user must have a name.';
}

exports.validatePayload = (type, payload) => {
  if (!type) return 'A payload must come with a type.';
  const {gameId, playerId, user} = payload;
  if (gameId) {
    const game = gameList.get(gameId);
    if (!game) return `No game found with id ${gameId}.`;
    if (playerId && !game.getPlayer(playerId)) {
      return `Invalid player id ${playerId} for game with id ${gameId}.`;
    }
    payload.game = game;
  }
  if (user) return validateUser(user);
}