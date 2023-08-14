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
