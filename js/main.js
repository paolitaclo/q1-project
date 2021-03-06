let initialBoardMatrix = [
  ['r', 'r', 'RR', 'r', 'r'],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['b', 'b', 'BB', 'b', 'b']
];

let boardMatrixCard = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', 'O', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

let game = {
  cardsTurn: [],
  cardsOpponent: [],
  cardOnTable: undefined,
  boardOnTable: undefined,
  whosTurn: undefined,
  selectedCard: undefined,
  selectedPosition: undefined
};

let randomNum = (num) => Math.floor(Math.random()*num);

$(".button-collapse").sideNav();
$(".game-setup").hide();
$(".modal1").hide();
function getOrPrompt(lsKeyValue) {
  var valInStorage = localStorage.getItem(lsKeyValue);

  if(!valInStorage) {
    valInStorage = prompt(`Enter a value for ${lsKeyValue}`);
    localStorage.setItem(lsKeyValue, valInStorage);
  }

  return valInStorage;
}

let apiKey = getOrPrompt('api-key');

function addSquares(array, element) {
  let matFormat = '';
  if (element === '.middle-moveCard') {
    matFormat = '<div class="col s8 no-padding">'
  }
  if (element === '.board') {
    matFormat = '<div class="col s12">';
  }
  else{
    matFormat = '<div class="col s9 no-padding">';
  }
  for (var i = 0; i < array.length; i++) {
    matFormat += '<div class="row no-margin">';
    for (var j = 0; j < array[i].length; j++) {
      let blueOrRed = array[i][j];
      let classRedOrBlue;
      if (blueOrRed !== '' && blueOrRed !== 'O') {
        classRedOrBlue = (blueOrRed === 'r' || blueOrRed === 'RR') ? 'red' : 'blue';
      }

      let offset =  (j === 0) ? 'offset-s1' : '';
      matFormat += `<div class="col s2 ${offset} squares elem-${i}-${j} ${classRedOrBlue}">
      ${blueOrRed}</div>`;
    }
    matFormat += '</div>';
  }
  matFormat += '</div>';
  $(element).prepend(matFormat);
}

$(".play").on('click', () => {
  $(".btn-play").hide();
  $(".game-setup").show();
  let gameCards = getRandomCards(cards);
  getGameSetUp(gameCards);
  addSquares(game.boardOnTable, ".board");
  markMovePieces(game.whosTurn);
  $(".board").css('background-color', game.whosTurn);
  updateCardsOnTable();
});

function getRandomCards(allCardsArr) {
  let deckCards = [];
    while (deckCards.length < 5) {
      let cardRandom =  allCardsArr[randomNum(16)];
      if (deckCards.indexOf(cardRandom) === -1) {
        deckCards.push(cardRandom);
      }
    }
    return deckCards;
}

function getGameSetUp(arrOfDeckCards) {
  game.cardsTurn = [arrOfDeckCards[0], arrOfDeckCards[1]];
  game.cardsOpponent = [arrOfDeckCards[2], arrOfDeckCards[3]];
  game.cardOnTable = arrOfDeckCards[4];
  game.whosTurn = arrOfDeckCards[4].color;
  game.boardOnTable = initialBoardMatrix.map(function (subArray) {
    return subArray.slice();
  });
  if (game.whosTurn === 'red') {
    game.boardOnTable = rotateBoard(game.boardOnTable);
  }
  return game;
}

function rotateBoard (arrBoard) {
  let arrRotated = arrBoard.map(function(row) {
    return row.reverse();
  });
  return arrRotated.reverse();
}

function markMovePieces(color) {
  $(`.${color}`).addClass('canMove');
}

function addInfoToCard(card, element) {
  $(element).find('.nameAnimal').text(card.name);
  $(element).find('.animalImage').attr('src', card.picture);
  $(`${element} .card-matrix`).empty();
  addSquares(boardMatrixCard, `${element} .card-matrix`);
  addPosMoveColor(element, [2,2], card.distance, 'teal');
}

function updateCardsOnTable() {
  addInfoToCard(game.cardsOpponent[0] ,'.top-A');
  addInfoToCard(game.cardsOpponent[1] ,'.top-B');
  addInfoToCard(game.cardsTurn[0] ,'.botton-A');
  addInfoToCard(game.cardsTurn[1] ,'.botton-B');
  addInfoToCard(game.cardOnTable ,'.middle-moveCard');
}

function getPositionsinCard(arrayOfTwo, arrOfDistances) {
  let sum = arrOfDistances.map(function (eachDistance) {
    return [arrayOfTwo[0] + eachDistance[0], arrayOfTwo[1] + eachDistance[1]];
  });
   let sumFiltered = sum.filter(function (eachArr) {
     return (eachArr[0] >= 0 && eachArr[0] < 5) && (eachArr[1] >= 0 && eachArr[1] < 5);
   });
   return sumFiltered;
}

function addPosMoveColor(matrixElement, moveFrom, cardDistanceList, classColor) {
  let positionInCard = getPositionsinCard(moveFrom, cardDistanceList);
  for (var i = 0; i < positionInCard.length; i++) {
    let pos = positionInCard[i];
    posIntoClass = `.elem-${pos[0]}-${pos[1]}`;
    $(matrixElement).find(posIntoClass).addClass(classColor);
  }
}

function clearPreview(matrixElement) {
  $(matrixElement).find('.teal').removeClass('teal');
}

function getPositionFromClassName(element) {
  let classes = element.classList;
  let position = [];
  for (var i = 0; i < classes.length; i++) {
    if (classes[i].includes('elem-')) {
      position = [Number.parseInt(classes[i].charAt(5)),
      Number.parseInt(classes[i].charAt(7))];
      break;
    }
  }
  return position;
}

$('.deck-pl1 .card').on('click', function(event) {
  $('.card').removeClass('cardPreviewSel');
  $(this).addClass('cardPreviewSel');
  if ($(this).find('.botton-A').length > 0) {
    game.selectedCard = game.cardsTurn[0];
  } else {
    game.selectedCard = game.cardsTurn[1];
  }
});

$('.board').on('mouseenter mouseleave', '.canMove', function (event) {
  if (event.type === 'mouseleave') {
    clearPreview('.board');
  } else if (game.selectedCard !== undefined) {
    clearPreview('.board');
    addPosMoveColor('.board', getPositionFromClassName(event.target), game.selectedCard.distance, 'teal');
  }
});

$('.board').on('click', '.canMove', function (event) {
  if (game.selectedCard !== undefined) {
    game.selectedPosition = getPositionFromClassName(event.target);
    addPosMoveColor('.board', game.selectedPosition, game.selectedCard.distance, 'movesToChose');
  }
});

$('.board').on('click', '.movesToChose', function (event) {
  let [i, j] = game.selectedPosition;
  let [y, z] = getPositionFromClassName(event.target);
  let valueTonWin = game.boardOnTable[y][z];
  let value = game.boardOnTable[i][j];
  if (valueTonWin === 'BB' || valueTonWin === 'RR') {
      $('#modal1').modal().modal('open');
  }
  game.boardOnTable[i][j] = '';
  game.boardOnTable[y][z] = value;
  $('.board').empty();
  addSquares(game.boardOnTable, '.board');
  game.selectedPosition = undefined;
})

function updateTurn() {
  for (var i = 0; i < game.cardsTurn.length; i++) {
    if (game.cardsTurn[i] === game.selectedCard) {
      game.cardsTurn[i] = game.cardOnTable;
    }
  }
  game.cardOnTable = game.selectedCard;
  game.selectedCard = undefined;
  let tempPairOfCards = game.cardsTurn;
  game.cardsTurn = game.cardsOpponent;
  game.cardsOpponent = tempPairOfCards;

  game.cardsOpponent;
  if(game.whosTurn === 'blue') {
    game.whosTurn = 'red';
  }else{
    game.whosTurn = 'blue';
  }
  game.boardOnTable = rotateBoard(game.boardOnTable);

}

$('.done').on('click', function () {
  updateTurn();
  $('.board').empty();
  addSquares(game.boardOnTable, '.board');
  markMovePieces(game.whosTurn);
  $(".board").css('background-color', game.whosTurn);
  updateCardsOnTable();
  game.selectedCard = undefined;
  $('.card').removeClass('cardPreviewSel');
});
