import './style.css';
type GameTile = {
  isPlayerTower: boolean;
  isPlayerBase: boolean;
  isEnemyBase: boolean;
  isEnemyPath: boolean;
};

const path: {
  positionX: number;
  positionY: number;
}[] = [];
//------------------------------
const gameSize = 3;

const player = {
  positionX: Math.floor(gameSize / 2),
  positionY: 0,
  health: 20,
  money: 100,
};

const enemyBase = {
  positionY: gameSize - 1,
  positionX: Math.floor(gameSize / 2),
};

const enemy = {
  posX: indexToPixel(enemyBase.positionX),
  posY: indexToPixel(enemyBase.positionY),
  health: 1,
  money: 1,
};

const gameMap: GameTile[][] = [];

//----------------------------
console.log(player.health);
createMap();
createPath();
renderMap();
const interval = setInterval(gameLoop, 1000 / 24);

//------------------------
function gameLoop() {
  CheckWinLose();
  enemyMove();
  renderAll();
}

function renderAll() {
  renderPlayerStats();
  renderEnemy();
}
function renderPlayerStats() {
  const health = document.querySelector('.health') as HTMLDivElement;
  health.innerText = `Player Health = ${player.health}`;
}

function CheckWinLose() {
  if (player.health <= 0) {
    clearInterval(interval);
  }
}

function playerDamage(Damage: number) {
  player.health -= Damage;
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
function indexToPixel(index: number) {
  return index * 50 + 25;
}

function enemyMove() {
  if (!(enemy.posY < indexToPixel(player.positionY))) {
    enemy.posY -= 1;
  }
  if (enemy.posY === indexToPixel(player.positionY)) {
    enemy.posY = indexToPixel(enemyBase.positionY);
    renderEnemy();
    playerDamage(1);
    renderPlayerStats();
  }
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

function createPath() {
  for (let x = 0; x < gameSize; x++) {
    for (let y = 0; y < gameSize; y++) {
      gameMap[enemyBase.positionY][y].isEnemyPath = true;
      console.log(gameMap[x][y].isEnemyPath);
    }
  }
}
