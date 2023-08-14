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
  positionX: gameSize - 1,
  positionY: Math.floor(gameSize / 2),
};

const gameMap: GameTile[][] = [];

//----------------------------
createMap();
setInterval(gameLoop, 1000 / 30);

//------------------------
function gameLoop() {
  enemyMove();
  renderAll();
}

function renderAll() {
  renderEnemy();
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
        tile.innerHTML = '🔫';
      }
      if (gameMap[x][y].isPlayerBase) {
        tile.innerHTML = '💻';
      }
      if (gameMap[x][y].isEnemyBase) {
        tile.innerHTML = '🛸';
      }
<<<<<<< HEAD
      if (gameMap[x][y].isEnemy) {
        tile.innerHTML = '👾';
      }
=======
>>>>>>> 16e7050db26639f180d966aaa1f3b4ee887bb6e1
      gameField?.appendChild(tile);
    }
  }
}
function renderEnemy() {
  const enemy = document.createElement('div');
  enemy.className = 'enemy';
  enemy.setAttribute('style', `top${0}px`);
}

function enemyMove() {
  let enemyPositionX = enemyBase.positionX;
  let enemyPositionY = enemyBase.positionY;
  let enemyTargetX = playerBase.positionX;
  let enemyTargetY = playerBase.positionY;

  //nothing
}

function tileClick(IndexX: number, IndexY: number) {
  gameMap[IndexX][IndexY].isPlayerTower = !gameMap[IndexX][IndexY].isPlayerTower;
  renderMap();
}

function renderEnemy() {
  const enemy = document.createElement('div');
  enemy.className = 'enemy';
  enemy.setAttribute('style', `top${0}px`);
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
