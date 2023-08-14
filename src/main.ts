import './style.css';
type GameMap = {
  isPlayerTower: boolean;
  playerBase: boolean;
  enemyStart: boolean;
  enemyPath: boolean;
  isEnemy: boolean;
}[][];

const gameMap: GameMap = [];

const gameSize = 3;

function renderMap() {
  const gameField = document.querySelector('.field');
  if (gameField !== null) {
    gameField.innerHTML = '';
  }
}

function createMap() {
  for (let x = 0; x < gameMap.length; x++) {
    const gameRow = [];
    for (let y = 0; y < gameMap.length; y++) {
      const tile = {
        isPlayerTower: false,
        playerBase: false,
        enemyStart: false,
        enemyPath: false,
        isEnemy: false,
      };
      gameRow.push(tile);
    }
    gameMap.push(gameRow);
  }
}
