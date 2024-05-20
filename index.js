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
  data.pieces = JSON.parse(fs.readFileSync("pieces.json"));

  data.board = JSON.parse(fs.readFileSync("defaultBoard.json"));
  data.setup = JSON.parse(fs.readFileSync("defaultSetup.json"));
}


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('user connected');
  
  socket.join(roomNum+'');
  sendInitialInfo(roomNum);
  sendPieceList(roomNum);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('move', (moveMade) => {
    sendInitialInfo (roomNum);
  });
});

function sendInitialInfo (roomNum) {
  let initialInfo = {
    pieceData: data.pieces,
    board: data.board,
    playerNum: 0
  };

  io.to(roomNum+'').emit('initialInfo', initialInfo);
  console.log('initial info sent');
}

function sendPieceList (roomNum) {
  io.to(roomNum+'').emit('pieceList', gameState.pieces);
}


server.listen(25565, () => {
  console.log('server running at http://localhost:25565');
});


class Sim {

}

class GameState {
  constructor() {
    this.setup = data.setup;
    this.board = data.board;

    this.initPieceList()
  }

  initPieceList() {
    this.pieces = this.setup;

    for (let i = 0; i < this.pieces.length; i++) {
      let piece = this.pieces[i];
      if(piece.onBoard !== false) {
        piece.onBoard = true;
      }
      piece.dead = false;
    }
  }
}

Main();