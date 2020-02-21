//origBoard array will have some default values and keep track of where which user has clicked
//make huPlayer and aiPlayer dynamic

let origBoard;
const huPlayer = "O",
  aiPlayer = "X",
  winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
  ];

const cells = document.querySelectorAll(".cell");
// console.log(cells);

//gameOver function (if we found any array from wincombo in the current state of the origBoard array then it will have the player and the index of the matching array in winCombos - else it will be null)
//called in turn function
//index will contain elements of array of winning combo clicked by user
gameOver = gameWon => {
  //change the color cells according to the player who won
  for (let index of winCombos[gameWon.index]) {
    // console.log(index);
    document.getElementById(index).style.backgroundColor =
      gameWon.player === huPlayer ? "blue" : "red";
  }
  //disabling the click function once game is finished
  for (let i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
  }
  declareWinner(gameWon.player == huPlayer ? "You Win!" : "You Loose..");
};

//check win
//checkWin has the current state of the board
//plays is the array containing the cell id of all cells clicked after each click(it is getting it from 'board' array which has the current state of the board )
checkWin = (board, player) => {
  let plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);
  // console.log(plays);
  // console.log(board);
  let gameWon = null;
  //win is individual array in winCombo array
  //we check for every array in winCombos, that plays is having all elements of any array in winCombo
  //if statement says that has the player played in every spot that counts as a win for that win
  for (let [index, win] of winCombos.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      gameWon = { index: index, player: player };
      // console.log(gameWon);
      break;
    }
  }
  // console.log(gameWon);
  return gameWon;
};

//keeps track of the cells clicked in the origBoard array and also changing the view of that particular cell-(later matching with the winning combination)
turn = (squareId, player) => {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerText = player;
  // console.log(origBoard);
  let gameWon = checkWin(origBoard, player);
  // console.log(gameWon);
  if (gameWon) {
    gameOver(gameWon);
  }
};

//passing the id of cell, and player(human) who has clicked, to the turn function
//clicking is done by human(obvious), huPlayer here determines the symbol(X/O) which user can select (we know by now which symbol is to be written)
turnClick = e => {
  // console.log(e.target.id);
  //below if statement checks the cell is being clicked or not,initially origBoard array is assigned to numbers and when user clicks that number is changed to characters 'X' or 'O' .
  if (typeof origBoard[e.target.id] == "number") {
    turn(e.target.id, huPlayer);

    //we check if there is a tie(all cells filled),if not call the turn with the aiPlayer as a player and the spot to be clicked is decided by function bestSpot
    if (!checkWin(origBoard, huPlayer) && !checkTie())
      turn(bestSpot(), aiPlayer);
  }
};

//start game
startGame = () => {
  document.querySelector(".endgame").style.display = "none";
  //generating a array to define initial state of board
  // console.log(Array(9)); -will generate empty array of 9 elements and we are generating a new array from the indices of that
  //origBoard = [0,1,2,3,4,5,6,7,8]
  origBoard = Array.from(Array(9).keys());
  // console.log(origBoard);
  //initialising the default state of the cells
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = "";
    cells[i].style.removeProperty("background-color"); //we are adding color to the cells when game finishes -so when restart set it to normal
    cells[i].addEventListener("click", turnClick, false);
  }
};

startGame();

declareWinner = who => {
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerText = who;
};
emptySquares = () => {
  // console.log(
  //   "hello",
  //   origBoard.filter(s => typeof s == "number")
  // );
  // console.log(origBoard);
  // console.log(origBoard.filter(s => typeof s == "number"));
  return origBoard.filter(s => typeof s == "number");
};

//empty squares function is a dummy function which returns the array of empty cells (unclicked) - and then we use the firt element of that array for ai to click --testing purpose
bestSpot = () => {
  // return emptySquares()[0]; // will use this for very easy level
  return minimax(origBoard, aiPlayer).index;
};

checkTie = () => {
  if (emptySquares().length == 0) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.backgroundColor = "green";
      cells[i].removeEventListener("click", turnClick, false);
    }
    declareWinner("Tie game");
    return true;
  }
  return false;
};
minimax = (newBoard, player) => {
  var availSpots = emptySquares();
  // console.log(availSpots);
  // let condition1 = checkWin(newBoard, huPlayer);
  // let condition2 = checkWin(newBoard, aiPlayer);
  if (checkWin(newBoard, huPlayer)) {
    // console.log("human win", condition1);
    //Math.floor(Math.random() * 100)
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    // console.log("ai win", condition2);
    return { score: 10 };
  } else if (availSpots.length === 0) {
    // console.log("tie match ..");
    return { score: 0 };
  }
  var moves = [];
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = newBoard[availSpots[i]];
    // console.log(move);

    newBoard[availSpots[i]] = player;

    if (player == aiPlayer) {
      var result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[availSpots[i]] = move.index;

    moves.push(move);
  }
  // console.log(moves);
  var bestMove;
  if (player === aiPlayer) {
    // var bestScore = -10000;
    var bestScore = -20;

    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // var bestScore = 10000;
    var bestScore = 20;

    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
};
document.getElementById("replay-button").addEventListener("click", startGame);
