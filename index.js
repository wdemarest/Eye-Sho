//cd Code/"Eye Sho"
//nodemon
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { Server } from 'socket.io';
import fs from 'fs';

import { Sim, GameState } from './public/shared.js';

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
  gameState = new GameState(data.board, data.setup);
  sim.gameState = gameState;
}

function InitData(){
  data.pieces = JSON.parse(fs.readFileSync("pieces.json"));

  data.board = JSON.parse(fs.readFileSync("defaultBoard.json"));
  data.setup = JSON.parse(fs.readFileSync("defaultSetup.json"));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    tryMove(moveMade.pieceNum, moveMade.nodeNum);
  });
});

function sendInitialInfo (roomNum) {
  let initialInfo = {
    pieceData: data.pieces,
    board: data.board,
    setup: data.setup,
    playerNum: 0
  };

  io.to(roomNum+'').emit('initialInfo', initialInfo);
  console.log('initial info sent');
}

function sendPieceList (roomNum) {
  io.to(roomNum+'').emit('pieceList', gameState.pieces);
}


function tryMove(pieceNum, nodeNum){
  console.log('try move piece', pieceNum, nodeNum);
  if(sim.checkMove(pieceNum, nodeNum)){

    sim.makeMove(pieceNum, nodeNum);
    
    io.to(roomNum+'').emit('move', {pieceNum: pieceNum, nodeNum: nodeNum});
  }
}


server.listen(25565, () => {
  console.log('server running at http://localhost:25565');
});

Main();