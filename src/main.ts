import './style.css';
type GameMap = {
  isPlayerTower: boolean;
  isPlayerBase: boolean;
  isEnemyStart: boolean;
  isEnemyPath: boolean;
  isEnemy: boolean;
}[][];

const gameMap: GameMap = [];

const gameSize = 3;

function renderMap() {
  const gameField = document.querySelector('.field');
  if (gameField !== null) {
    gameField.innerHTML = '';
  }
  gameField?.setAttribute('style', `grid-template-columns: repeat(${gameSize},1fr); width: ${50 * gameSize}px;`);
  for (let x = 0; x !== gameSize; x++) {
    for (let y = 0; y !== gameSize; y++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.onclick = () => {
        tileClick(x, y);
      };
      if (gameMap[x][y].isPlayerTower) {
        tile.setAttribute('isPlayerTower', 'PlayerTower');
        tile.innerHTML = '🔫';
      }
      if (gameMap[x][y].isPlayerBase) {
        tile.setAttribute('isPlayerTower', 'PlayerTower');
        tile.innerHTML = '';
      }
    }
  }
}

function tileClick(IndexX: number, IndexY: number) {
  IndexX;
  IndexY;
}
