import './style.css';
type GameTile = {
  isPlayerTower: boolean;
  isPlayerBase: boolean;
  isEnemyBase: boolean;
  isEnemyPath: boolean;
};
const gameSize = 3;

const playerBase = {
  positionX: 0,
  positionY: Math.floor(gameSize / 2),
};

const enemyBase = {
  positionX: 50,
  positionY: 100,
};

const enemy = {
  posX: enemyBase.positionX,
  posY: enemyBase.positionY,
  health: 1,
  money: 1,
};

const gameMap: GameTile[][] = [];

//----------------------------
createMap();
renderMap();
setInterval(gameLoop, 1000 / 12);

//------------------------
function gameLoop() {
  enemyMove();
  renderAll();
}

function renderAll() {
  renderEnemy();
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
        tile.innerHTML = '🔫';
      }
      if (gameMap[x][y].isPlayerBase) {
        tile.innerHTML = '💻';
      }
      if (gameMap[x][y].isEnemyBase) {
        tile.innerHTML = '🛸';
      }
      gameField?.appendChild(tile);
    }
  }
}
function renderEnemy() {
  const deleteEnemy = document.querySelector('.enemy');
  deleteEnemy?.remove();
  const enemyDiv = document.createElement('div');
  enemyDiv.className = 'enemy';
  enemyDiv.setAttribute('style', `top:${enemy.posY}px; left:${enemy.posX}px`);
  const gameField = document.querySelector('.field');
  gameField?.appendChild(enemyDiv);
}

function tileClick(IndexX: number, IndexY: number) {
  gameMap[IndexX][IndexY].isPlayerTower = !gameMap[IndexX][IndexY].isPlayerTower;
  renderMap();
}

function enemyMove() {
  let enemyPositionX = enemyBase.positionX;
  let enemyPositionY = enemyBase.positionY;
  let enemyTargetX = playerBase.positionX;
  let enemyTargetY = playerBase.positionY;

  //nothing
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
      };
      gameRow.push(tile);
    }
    gameMap.push(gameRow);
  }
}
