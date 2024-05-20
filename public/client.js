const socket = io();

let data = {};
let imagesAllLoaded = false;

let myPlayerNum;

socket.on('initialInfo', (initalInfo) => {
  console.log('initial info recieved');
  data.pieces = initalInfo.pieceData;

  gameState.board = initalInfo.board;

  myPlayerNum = initalInfo.playerNum;
});

socket.on('pieceList', (pieces) => {
  gameState.pieces = pieces;

  view.render();
});

//images
let piecesImg = new Image();
piecesImg.src = 'http://localhost:25565/img/Pieces.png';

//make sure all images are loaded
piecesImg.onload = () => {
  imagesAllLoaded = true;
  
  view.render();
}

class GameState {
  constructor() {
    this.setup = data.setup;
    this.board = data.board;
    this.pieces = [];
  }
}


//SIM
class Sim {
  constructor(){
  }

  tryMovePiece(pieceNum, nodeNum){
    console.log('try move piece', pieceNum, nodeNum);
  }
}

//VIEW

class View {
  constructor(){
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');


    this.boardCenter = {x: 600, y: 600};
    this.boardDrawRadius = 400;
    this.boardDrawMargin = 0;
    this.boardInitialized = false;

    this.pieceDrawSize = this.boardDrawRadius / 4.75;
    this.piecesInitialized = false;

    this.nodeViewStates = [];
    this.pieceViewStates = [];
  }

  render(){
    if(!imagesAllLoaded){
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if(gameState.board){
      this.renderBoard();
    }

    if(gameState.pieces.length > 0){
      this.renderPieces();
    }
  }

  renderBoard(){
    if(!this.boardInitialized){
      this.degreesPerRadial = 360/gameState.board.radialCount;
      this.distBetweenCircles = (this.boardDrawRadius-this.boardDrawMargin) / gameState.board.circleCount;

      this.initNodeStates();

      this.boardInitialized = true;
    }

    this.renderBoardNodes();
    this.renderBoardLines();
  }

  renderBoardNodes(){
    this.nodeViewStates.forEach(node => {
      this.ctx.strokeStyle = (node.hover) ? 'cyan' : 'white';
      this.ctx.lineWidth = (node.hover) ? 3 : 1;
      let nodeDrawSize = 20;

      this.drawCircle(node.x, node.y, nodeDrawSize/2);
    });
  }

  renderBoardLines(){
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 1;

    gameState.board.radialConnections.forEach(connection => {
      let start = this.CRToXY(connection[0].c, connection[0].r);
      let end = this.CRToXY(connection[1].c, connection[1].r);

      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    });

    gameState.board.circleConnections.forEach(connection => {
      let radius = this.CToDistFromCenter(connection[0].c);

      let angle1 = this.RToAngle(connection[0].r);
      let angle2 = this.RToAngle(connection[1].r);

      this.ctx.beginPath();
      this.ctx.arc(this.boardCenter.x, this.boardCenter.y, radius, angle1, angle2);
      this.ctx.stroke();
    });
  }

  renderPieces(){
    if(!this.piecesInitialized){
      this.pieceResolution = piecesImg.width / Object.keys(data.pieces).length;

      for(let i = 0; i < gameState.pieces.length; i++){

        this.pieceViewStates.push({
          selected: false
        });
      }

      this.piecesInitialized = true;
    }

    for(let i = 0; i < gameState.pieces.length; i++){
      let piece = gameState.pieces[i];
      let coords = this.CRToXY(piece.c, piece.r);

      let pieceImg = data.pieces[piece.type];

      let pieceImgX = data.pieces[piece.type].numInTilesheet * this.pieceResolution
      let pieceImgY = (1-piece.player) * this.pieceResolution;

      if(this.pieceViewStates[i].selected){
        this.ctx.strokeStyle = 'cyan';
        this.ctx.lineWidth = 3;
        this.drawCircle(coords.x, coords.y, this.pieceDrawSize/2);
      }

      this.ctx.drawImage(piecesImg, pieceImgX, pieceImgY, this.pieceResolution, this.pieceResolution, coords.x-this.pieceDrawSize/2, coords.y-this.pieceDrawSize/2, this.pieceDrawSize, this.pieceDrawSize);
    }
  }


  /*
  drawCircleByCR(c, r, radius){
    this.drawCircle(this.CRToXY(c, r), radius);
    
  }*/

  drawCircle(x, y, radius){
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }



  calcOffset(startingPos, angle, length){
    return {
      x: startingPos.x + length * Math.cos(angle * Math.PI / 180),
      y: startingPos.y + length * Math.sin(angle * Math.PI / 180)
    }
  }

  CToDistFromCenter(c){
    return this.distBetweenCircles * c;
  }

  RToAngle(r){
    return (this.degreesPerRadial * r)-90;
  }

  CRToXY(c, r){
    let distFromCenter = this.CToDistFromCenter(c);
    let angle = this.RToAngle(r)

    


    return {
      x: this.boardCenter.x + distFromCenter * Math.cos(angle * Math.PI / 180),
      y: this.boardCenter.y + distFromCenter * Math.sin(angle * Math.PI / 180)
    }
  }

  initNodeStates(){
    for(let i = 0; i < gameState.board.nodes.length; i++){
      let coords = this.CRToXY(gameState.board.nodes[i].c, gameState.board.nodes[i].r);
      
      this.nodeViewStates.push({
        x: coords.x,
        y: coords.y,
        hover: false
      });
    }
  }
}

class Control{
  constructor(){
    this.selectedPiece = null;


    //click event
    view.canvas.addEventListener('click', (e) => {
      let rect = view.canvas.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      this.click(x, y);
      view.render();
    });

    //mouse move event
    view.canvas.addEventListener('mousemove', (e) => {
      let rect = view.canvas.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      
      this.hover(x, y);
      view.render();
    });
  }

  click(x, y){
    let nodeNum = this.XYToNode(x, y);

    if(nodeNum !== null){


      //if I clicked one of my pieces
      for(let i = 0; i < gameState.pieces.length; i++){
        let piece = gameState.pieces[i];
        let node = gameState.board.nodes[nodeNum];

        if(piece.c == node.c && piece.r == node.r && piece.player == myPlayerNum){

          if(view.pieceViewStates[i].selected){
            this.deselectAllPieces();
          } else {
            for(let j = 0; j < view.pieceViewStates.length; j++){
              view.pieceViewStates[j].selected = (j === i);
            }

            this.selectedPiece = i;
          }

          return;
        }
      }

      if(this.selectedPiece !== null){
        sim.tryMovePiece(this.selectedPiece, nodeNum);
      }
    }

    this.deselectAllPieces();
  }

  deselectAllPieces(){
    for(let i = 0; i < view.pieceViewStates.length; i++){
      view.pieceViewStates[i].selected = false;
    }
    this.selectedPiece = null;
  }


  hover(x, y){
    let nodeNum = this.XYToNode(x, y);

    for(let i = 0; i < view.nodeViewStates.length; i++){
      view.nodeViewStates[i].hover = (i === nodeNum);
    }
  }

  XYToNode(x, y){
    for(let i = 0; i < view.nodeViewStates.length; i++){
      let node = view.nodeViewStates[i];
      if(Math.sqrt((node.x-x)**2 + (node.y-y)**2) < view.pieceDrawSize/2){
        return i;
      }
    }
    return null;
  }
}

const sim = new Sim();
const view = new View();
const control = new Control();
const gameState = new GameState();