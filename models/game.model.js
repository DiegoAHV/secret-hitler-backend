const Player = require('./player.model').Player;

const getInitialGameState = () => {
  return {
    numberOfLiberals: 0,
    numberOfFascists: 0,
    numberOfLiberalPolicies: 0,
    numberOfFascistPolicies: 0,
    acknowledgeCounts: {
      playerRole: 0,
      fascists: 0,
      president: 0,
      chancellor: 0,
      chosenPolicy: 0,
      vetoPower: 0,
    },
    turnCount: 0,
    hitler: undefined,
    currentPresident: undefined,
    currentChancellor: undefined,
    suggestedChancellor: null,
    chancellorVoteCount: 0,
    eligiblePolicies: [undefined, undefined, undefined],
    electionFailCount: 0,
    vetoPowerUnlocked: false,
    gameOver: false,
    winningFaction: undefined,
    askPresidentToExecutePlayer: false,
    executedPlayers: [],
  }
}

exports.Game = class Game {
  constructor(clientId, user) {
    if (!clientId || !user) {
      console.log(`Invalid call of Game constructor: received ${clientId} as clientId and ${user} as user`);
      return null;
    }
    this.id = clientId;
    this.initiator = user;
    this.playerList = [new Player(user)];
    this.message = 'waitingForPlayers';
    Object.assign(this, getInitialGameState());
  }

  setMessage(message) {
    this.message = message;
  }

  addPlayer(player) {
    this.playerList.push(player);
  }

  // only works in the waiting room before the game starts
  removePlayer(user) {
    // TODO: handle the case where player leaves game in session
    const index = this.playerList.findIndex(player => player.user.id === user.id);
    this.playerList.splice(index, 1);
  }

  setRoles() {
    const numberOfPlayers = this.playerList.length;
    //sets number of fascists (excluding hitler)
    this.numberOfFascists = (numberOfPlayers > 8 ? 4 : numberOfPlayers > 6 ? 3 : 2);
    this.numberOfLiberals = numberOfPlayers - this.numberOfFascists;
    //choose president
    const presidentIndex = Math.floor(numberOfPlayers * Math.random());
    let player = this.playerList[presidentIndex];
    player.makePresident();
    this.currentPresident = player.user.id;
    //choose hitler
    const hitlerIndex = Math.floor(numberOfPlayers * Math.random());
    player = this.playerList[hitlerIndex];
    player.makeHitler();
    player.makeFascist();
  }

  assignPlayersFactions() {
    let numberOfFascists = this.numberOfFascists;
    let numberOfLiberals = this.numberOfLiberals;
    this.playerList.forEach(player => {
      if (player.isHitler()) return;
      if (Math.random() * (numberOfFascists - 1) > Math.random() * numberOfLiberals) {
        player.makeFascist();
        --numberOfFascists;
      } else {
        player.makeLiberal();
        --numberOfLiberals;
      }
    })
  }

  setSuggestedChancellor(playerId) {
    this.suggestedChancellor = playerId;
  }

  voteComplete() {
    return this.chancellorVoteCount === this.playerList.length;
  }

  resetVotes() {
    this.chancellorVoteCount = 0;
    this.playerList.forEach(player => player.chancellorVote = null);
  }

  incrementChancellorVoteCount() {
    ++this.chancellorVoteCount;
  }

  getPlayer(playerId) {
    return this.playerList.find(player => player.user.id === playerId);
  }

  drawThreePolicies() {
    this.eligiblePolicies = [...Array(3)].map(policy => {
      return Math.random() < 2/3 ? 'fascist' : 'liberal';
    });
  }

  resetChancellor() {
    this.currentChancellor = null;
  }

  evaluateElection() {
    const jaVotes = this.playerList.filter(player => player.chancellorVote === 'ja');
    if (jaVotes.length/this.chancellorVoteCount > 0.5) {
      this.currentChancellor = this.suggestedChancellor;
      this.suggestedChancellor = null;
      return true;
    } else {
      ++this.electionFailCount;
      return false;
      // TODO: if electionFailCount reaches 4 serve the next policy immediately
    }
  }

  setNextPresident() {
    const presidentIndex = this.playerList.findIndex(player => {
      return player.user.id === this.currentPresident;
    });
    if (presidentIndex === (this.playerList.length - 1)) {
      this.currentPresident = this.playerList[0].user.id;
    } else {
      this.currentPresident = this.playerList[presidentIndex + 1].user.id;
    }
  }

  rejectEligiblePolicy(rejectedPolicy) {
    this.eligiblePolicies.splice(rejectedPolicy, 1);
  }

  enactPolicy() {
    this.eligiblePolicies.pop() === 'fascist'
      ? ++this.numberOfFascistPolicies
      : ++this.numberOfLiberalPolicies;
  }

  playerIsPresident(playerId) {
    return this.currentPresident === playerId;
  }

  playerIsChancellor(playerId) {
    return this.currentChancellor === playerId;
  }

  activateVetoPowerIfAppropriate() {
    if (this.numberOfFascistPolicies === 5) this.vetoPowerUnlocked = true;
  }

  executePlayer(playerId) {
    const playerIndex = this.playerList.findIndex(player => player.user.id === playerId);
    const player = this.playerList[playerIndex];
    player.execute();
    this.executedPlayers.push(player);
    this.playerList.splice(playerIndex, 1);
  }

  incrementElectionFailCount() {
    ++this.electionFailCount;
  }

  presidentShouldExecutePlayer() {
    if (this.numberOfFascistPolicies === 4 || this.numberOfFascistPolicies === 5) return true;
    else return false;
  }

  incrementAcknowledgeCount(message, countName) {
    ++this.acknowledgeCounts[countName];
    if (this.acknowledgeCounts[countName] >= this.playerList.length) {
      return this.handleAcknowledgeCountReached(message);
    }
  }

  handleAcknowledgeCountReached(message, countName) {
    this.acknowledgeCounts[countName] = 0;
    const messageMap = {
      acknowledgePlayerRole: 'showFascists',
      acknowledgeFascists: 'showPresident',
      acknowledgePresident: 'suggestChancellor',
      acknowledgeChancellor: 'showPresidentPolicyCards',
      acknowledgeChosenPolicy: this.presidentShouldExecutePlayer() ? 'askPresidentToExecutePlayer' : 'showPresident',
    }
    return messageMap[message];
  }
}