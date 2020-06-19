"use strict";
const url = require("url");
var models = require("./models");

//global session - not best practice
var session;

exports.create = function (req, res) {
  let board = models.board;

  let query = url.parse(req.url, true).query;

  //set players names
  board.players = [];
  board.players.push(query.p1.toLowerCase());
  board.players.push(query.p2.toLowerCase());

  //init board
  board.matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  //init status
  board.status = models.status.playing;

  //add to session
  session = req.session;
  session.board = board;

  res.json(board);
};

exports.place = function (req, res) {
  session = req.session;
  let board = session.board;

  let query = url.parse(req.url, true).query;
  let currentPlayer = query.p.toLowerCase();

  if (
    board && //checks "place" is not called before "create"
    board.status !== models.status.win && //check there is no win already
    (board.lastPlayBy === null || board.lastPlayBy !== currentPlayer) //check user doesn't play twice in a row
  ) {
    if (validInput(board.matrix, query.x, query.y)) {
      //place selection by player name
      board.matrix[query.x - 1][query.y - 1] =
        currentPlayer == board.players[0] ? 1 : 4;

      board.counter = board.counter + 1;

      //set last play by
      board.lastPlayBy = board.players[board.players.indexOf(currentPlayer)];

      //update board status
      board.status = getBoardStatus(board, query.x - 1, query.y - 1);

      //set winner if exists
      if (board.status === models.status.win) {
        board.winner = query.p;
      }
    } else {
      board.error = "error";
    }
  }

  res.json(board);
};

function getBoardStatus(board, x, y) {
  if (
    isRowWinner(board.matrix, x, y) ||
    isColWinner(board.matrix, x, y) ||
    isDiagonalWinner(board.matrix)
  )
    return models.status.win;
  else {
    if (board.counter === 9) {
      return models.status.tie;
    } else {
      return models.status.playing;
    }
  }
}

function isRowWinner(matrix, x, y) {
  let sum = (r) => r.reduce((a, b) => a + b);
  let rowSum = matrix.map(sum)[x];
  return rowSum === 3 || rowSum === 12;
}

function isColWinner(matrix, x, y) {
  var sum = (r, a) => r.map((b, i) => a[i] + b);
  let colSum = matrix.reduce(sum)[y];
  return colSum === 3 || colSum === 12;
}

function isDiagonalWinner(matrix) {
  return diagonalSums(matrix);
}

function diagonalSums(matrix) {
  let mainSum = 0,
    secondarySum = 0;
  for (let row = 0; row < matrix.length; row++) {
    mainSum += matrix[row][row];
    secondarySum += matrix[row][matrix.length - row - 1];
  }

  return (
    mainSum === 3 || mainSum === 12 || secondarySum === 3 || secondarySum === 12
  );
}

function validInput(board, x, y) {
  return x <= 3 && x >= 1 && y <= 3 && y >= 1 && board[x - 1][y - 1] === 0;
}

exports.status = function (req, res) {
  session = req.session;
  let board = session.board;
  res.json(board);
};
