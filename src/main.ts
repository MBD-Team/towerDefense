import './style.css';
type GameTile = {
  isPlayerTower: boolean;
  isPlayerBase: boolean;
  isEnemyBase: boolean;
  isEnemyPath: boolean;
  isEnemy: boolean;
};

const gameMap: GameTile[][] = [];

const gameSize = 3;
//----------------------------
createMap();
setInterval(gameLoop, 1000 / 30);

//------------------------
function gameLoop() {
  renderAll();
}

function renderAll() {
  renderMap();
}

function renderMap() {
  const gameField = document.querySelector('.field');
  if (gameField !== null) {
    gameField.innerHTML = '';
  }
  gameField?.setAttribute('style', `grid-template-columns: repeat(${gameSize},1fr); width: ${50 * gameSize}px;`);
  for (let x = 0; x < gameSize; x++) {
    for (let y = 0; y < gameSize; y++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.onclick = () => {
        tileClick(x, y);
      };
      if (gameMap[x][y].isPlayerTower) {
        tile.className = 'isPlayerTower';
        tile.innerHTML = '🔫';
      }
      if (gameMap[x][y].isPlayerBase) {
        tile.className = 'isPlayerBase';
        tile.innerHTML = '💻';
      }
      if (gameMap[x][y].isEnemyBase) {
        tile.className = 'isEnemyBase';
        tile.innerHTML = '🛸';
      }
      if (gameMap[x][y].isEnemy) {
        tile.className = 'isEnemy';
        tile.innerHTML = '👾';
      }
      gameField?.appendChild(tile);
    }
  }
  const enemy = document.createElement('div');
  enemy.className = 'enemy';
  gameField?.appendChild(enemy);
}
function enemyMove() {}

function tileClick(IndexX: number, IndexY: number) {
  IndexX;
  IndexY;
}

function createMap() {
  for (let x = 0; x < gameSize; x++) {
    const gameRow: GameTile[] = [];
    for (let y = 0; y < gameSize; y++) {
      const tile: GameTile = {
        isPlayerTower: false,
        isPlayerBase: false,
        isEnemyBase: false,
        isEnemyPath: false,
        isEnemy: false,
      };
      gameRow.push(tile);
    }
    gameMap.push(gameRow);
  }
}

function enemyMove() {}
