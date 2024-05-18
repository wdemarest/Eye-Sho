//cd Code/"Eye Sho"
//nodemon
const path = require('path');
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);



app.use(express.static('public'));

let roomNum;
let sim;
let data = {};
let gameState;

function Main() {
  sim = new Sim();
  InitData();
  

  roomNum = 0;
  gameState = new GameState();
}

function InitData(){
  data.board = JSON.parse(fs.readFileSync("defaultBoard.json"));
  data.pieces = JSON.parse(fs.readFileSync("pieces.json"));
}


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('user connected');
  
  socket.join(roomNum+'');
  sendGameState(roomNum);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('move', (moveMade) => {
    sendGameState (roomNum);
  });
});

function sendGameState (roomNum) {
  io.to(roomNum+'').emit('gameState', gameState);
}

server.listen(25565, () => {
  console.log('server running at http://localhost:25565');
});


class Sim {

}

class GameState {
  constructor() {
    this.initialPosition = [];
    this.board = data.board;

  }
}

Main();