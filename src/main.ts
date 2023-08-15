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
const gameSize = 7;

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
  pathPosition: 0,
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
  for (let y = 0; y < gameSize; y++) {
    for (let x = 0; x < gameSize; x++) {
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
      if (path.find(a => a.positionX === x && a.positionY === y)) {
        tile.classList.add('path');
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
function pixelToIndex(index: number) {
  return (index - 25) / 50;
}
function enemyMove() {
  if (pixelToIndex(enemy.posX) === path[enemy.pathPosition + 1].positionX && pixelToIndex(enemy.posY) === path[enemy.pathPosition + 1].positionY) {
    enemy.pathPosition++;
  } else if (path[enemy.pathPosition + 1].positionX - pixelToIndex(enemy.posX) < 0) {
    enemy.posX--;
  } else if (path[enemy.pathPosition + 1].positionX - pixelToIndex(enemy.posX) > 0) {
    enemy.posX++;
  } else if (path[enemy.pathPosition + 1].positionY - pixelToIndex(enemy.posY) < 0) {
    enemy.posY--;
  } else if (path[enemy.pathPosition + 1].positionY - pixelToIndex(enemy.posY) > 0) {
    enemy.posY++;
  }
  if (pixelToIndex(enemy.posX) === player.positionX && pixelToIndex(enemy.posY) === player.positionY) {
    enemy.posX = indexToPixel(enemyBase.positionX);
    enemy.posY = indexToPixel(enemyBase.positionY);
    enemy.pathPosition = 0;
    playerDamage(1);
    renderEnemy();
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
  // let pathX = gameSize - 1;
  // let pathY = Math.floor(gameSize / 2);
  // for (let x = 0; x < gameSize; x++) {
  //   const direction = Math.floor(Math.random() * 3) + 1;
  //   if (direction === 1) {
  //     if (gameMap[pathX - 1]) {
  //       console.log('test1');
  //     }
  //   }
  //   if (direction === 2) {
  //     if (gameMap[pathY + 1]) {
  //       console.log('test2');
  //     }
  //   }
  //   if (direction === 3) {
  //     if (gameMap[pathY - 1]) {
  //       console.log('test3');
  //     }
  //   }

  path.push({ positionX: 3, positionY: 6 });
  path.push({ positionX: 2, positionY: 6 });
  path.push({ positionX: 2, positionY: 5 });
  path.push({ positionX: 2, positionY: 4 });
  path.push({ positionX: 2, positionY: 3 });
  path.push({ positionX: 2, positionY: 2 });
  path.push({ positionX: 2, positionY: 1 });
  path.push({ positionX: 3, positionY: 1 });
  path.push({ positionX: 3, positionY: 0 });
}

//----------------------
