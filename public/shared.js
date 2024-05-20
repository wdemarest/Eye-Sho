class Sim {
  constructor(){
  }

  checkMove(pieceNum, nodeNum){
    let piece = this.gameState.pieces[pieceNum];
    let node = this.gameState.board.nodes[nodeNum];

    if(!piece || !node){
      return false;
    }

    if(piece.c == node.c && piece.r == node.r){
      return false;
    }

    return true;
  }

  makeMove(pieceNum, nodeNum){
    let piece = this.gameState.pieces[pieceNum];
    let node = this.gameState.board.nodes[nodeNum];

    piece.c = node.c;
    piece.r = node.r;
  }

  findPossibleMoves(pieceNum){
    let piece = this.gameState.pieces[pieceNum];

    let possibleMoves = [];

    let nodeChecked = [];
    for(let i = 0; i < 100; i++){
      this.findConnectedNodes(piece.c, piece.r)
    }
    possibleMoves = this.findConnectedNodes(piece.c, piece.r);

    return possibleMoves;
  }

  findConnectedNodes(c, r){
    let connectedNodes = [];

    this.gameState.board.radialConnections.forEach(connection => {
      if(connection[0].c == c && connection[0].r == r){
        connectedNodes.push({c: connection[1].c, r: connection[1].r});
      } else if(connection[1].c == c && connection[1].r == r){
        connectedNodes.push({c: connection[0].c, r: connection[0].r});
      }
    });

    this.gameState.board.circleConnections.forEach(connection => {
      if(connection[0].c == c && connection[0].r == r){
        connectedNodes.push({c: connection[1].c, r: connection[1].r});
      } else if(connection[1].c == c && connection[1].r == r){
        connectedNodes.push({c: connection[0].c, r: connection[0].r});
      }
    });

    return connectedNodes;
  }
}

class GameState {
  constructor(board, setup) {
    this.board = board;
    this.setup = setup;
    
    this.initBoard();
    this.initPieceList();
  }

  initBoard() {
    
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

export { GameState };
export { Sim };