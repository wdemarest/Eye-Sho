class Sim {
  constructor(){
    this.util = new Util;
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

  findValidMoves(pieceNum){
    let piece = this.gameState.pieces[pieceNum];

    let validMoves = [];

    let nodesExhausted = [];
    
    //run crawlers through all paths while starting node is not exhausted
    while(!this.util.arrayIncludesNode(nodesExhausted, {c: piece.c, r: piece.r})){
      let crawler = {c: piece.c, r: piece.r};
      console.log('NEW PATH');
      let moveRemaining = [];
      let nodesSteppedOnThisLoop = [];

      //shallow copy
      this.data.pieces[piece.type].move.forEach(dist => {
        moveRemaining.push(dist);
      });



      //CRAWLIN TIME BABY ========================================


      //run crawler through all nodes in a path
      while (moveRemaining.length > 0){
        console.log('crawler:', crawler.c, crawler.r);
        //DEBUGGING
        //this.gameState.pieces[1].c = crawler.c;
        //this.gameState.pieces[1].r = crawler.r;
        //this.view.render();

        let connectedNodes = this.findConnectedNodes(crawler.c, crawler.r);
        let nodeToStepTo = null;

        let thisIsFirstStep = nodesSteppedOnThisLoop.length == 0;
        let goingStraight = thisIsFirstStep && moveRemaining[0] > 0;
        

        //iterate through connected nodes
        for(let j = 0; j < connectedNodes.length; j++){
          let newNode = connectedNodes[j];

          

          //if node has been stepped on this loop or has been exhausted
          if(this.util.arrayIncludesNode(nodesSteppedOnThisLoop, newNode) || this.util.arrayIncludesNode(nodesExhausted, newNode)){
            continue;
          }

          let nodeIsStraightAhead;
          
          if(!thisIsFirstStep){
            let prevNode = nodesSteppedOnThisLoop[nodesSteppedOnThisLoop.length-1];

            nodeIsStraightAhead = Math.sign(newNode.c-crawler.c) == Math.sign(prevNode.c-crawler.c)*-1 || Math.sign(newNode.r-crawler.r) == Math.sign(prevNode.r-crawler.r)*-1;
          }
            
          if(thisIsFirstStep || goingStraight == nodeIsStraightAhead){
            nodeToStepTo = newNode;
            break;
          }
        }



        if(nodeToStepTo !== null){
          nodesSteppedOnThisLoop.push({c: crawler.c, r: crawler.r});
          crawler = nodeToStepTo;
          

          if (moveRemaining[0] == 0){
            moveRemaining.shift();
          }
          moveRemaining[0]--;

        }else{
          nodesExhausted.push({c: crawler.c, r: crawler.r});
          //DEBUGGING
          //this.view.nodeViewStates[this.gameState.board.nodes.findIndex(node => node.c == crawler.c && node.r == crawler.r)].hover = true;
          break;
        }

        if(moveRemaining.length <= 1 && moveRemaining[0] <= 0){
          validMoves.push({c: crawler.c, r: crawler.r});
          console.log('possible move', crawler.c, crawler.r);
          //DEBUGGING
          //this.view.nodeViewStates[this.gameState.board.nodes.findIndex(node => node.c == crawler.c && node.r == crawler.r)].validMove = true;

          nodesExhausted.push({c: crawler.c, r: crawler.r});
          break;
        }


        /*
        if !somewhere to go
        exhaust

        if no moves left
        exhaust
        possible move

        if somewhere to go
        move and decrease move remaining

        */

      }
    }

    return validMoves;
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

class Util {
  arrayIncludesNode(array, node){
    return array.some(node2 => {
      if(node2.c == node.c && node2.r == node.r) return true;
    });
  }
}

export { GameState, Sim, Util };