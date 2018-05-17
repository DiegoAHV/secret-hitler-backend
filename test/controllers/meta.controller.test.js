const expect = require('chai').expect;
const io = require('socket.io-client');

const server = require('../../index');

const mocks = require('../mocks');
const socketUrl = 'http://localhost:3000';

const options = {  
  transports: ['websocket'],
  'force new connection': true
};

const connectClients = (n) => {
  const clients = [];
  for (let i = 0; i < n; i++) {
    const client = io.connect(socketUrl, options)
    clients.push(client);
  }
  return clients
}

const createGame = (client) => {
  client.emit('data', {type: 'createGame', payload: {user: mocks.users[0]}});
}

const joinGame = (clients, game, n, index) => {
  for (let i = 0; i < n; i++) {
    clients[i].emit('data', {type:'joinGame', payload: {gameId: game.id, user: mocks.users[i+index]}});
  }
}

const startGame = (clients, game) => {
  clients[0].emit('data', {type: 'startGame', payload: {gameId: game.id, user: mocks.users[0]}});
}

const disconnectClients = (clients) => {
  clients.forEach(client => client && client.disconnect());
}


describe.only('Sockets', () => {  
  let game;

  describe('Meta controllers', () => {
    let clients = [];
    after(() => {
      server.close();
    })
  
    afterEach(done => {
      disconnectClients(clients);
      done();
    });
  
    it('should send a game object back when type is "createGame"', done => {
      clients = connectClients(1);
      clients[0].on('data', data => {
        game = data.payload;
        expect(game).to.be.a('object');
        done();
      });
      createGame(clients[0]);
    });
  
    it('should be able to join existing game and listen to backend', done => {
      clients = connectClients(1);
      clients[0].on('data', data => {
        game = data.payload;
        expect(game.playerList.length).to.equal(2);
        done();
      });
      joinGame(clients, game, 1, 1)
    });
  
    it('should be able to start game with correct property values', done => {
      clients = connectClients(4);
      clients[0].on('data', data => {
        game = data.payload;
        if (game.numberOfLiberals) {
  
          done();
        }
      });
      joinGame(clients, game, 3, 2);
      setTimeout(() => {
        startGame(clients, game);
      }, 50)
    });
  });

  describe('Started game properties', () => {

    it('game message should be "showRoles"', () => {
      game.message.should.equal('showRoles');
    });

    it('current president should be a name', () => {
      game.currentPresident.should.be.a('string');
    });

    it('there should be no suggested chancellor', () => {
      expect(game.suggestedChancellor).to.equal(null);
    });

    it('there should be 3 liberals in a game of 5', () => {
      const actualLiberals = game.playerList.filter(player => player.faction === 'liberal').length;
      actualLiberals.should.equal(3);
    });

    it('there should be 2 fascists in a game of 5', () => {
      const actualFascists = game.playerList.filter(player => player.faction === 'fascist').length;
      actualFascists.should.equal(2);
    });

    it('only one should be Hitler', () => {
      const numberOfHitlers = game.playerList.filter(player => player.hitler).length;
      numberOfHitlers.should.equal(1);
    });

    it('the player list array should have 5 players', () => {
      game.playerList.length.should.equal(5);
    });

    it('there should be 3 eligible policies', () => {
      game.eligiblePolicies.length.should.equal(3);
    });

    it('the player who created the game should be the initiator', () => {
      game.initiator.name.should.equal(mocks.users[0].name);
    });

    it('the value of numberOfLiberals property should be 3', () => {
      game.numberOfLiberals.should.equal(3);
    });

    it('the value of numberOfFascists property should be 2', () => {
      game.numberOfFascists.should.equal(2);
    });
  })
});

