'use strict';

require('dotenv').config();

const server = require('http').createServer();
const io = require('socket.io')(server);

require('./socket/handler').socketHandler(io);

const port = process.env.PORT || 3000;
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server running on port ${port}`);
});

module.exports = server;