import './style.css';

type GameTile = {
  isPlayerTower: number | null;
  isPlayerBase: boolean;
  isEnemyBase: boolean;
  isEnemyPath: boolean;
};

type Enemy = {
  type: keyof typeof ENEMIES;
  pathPosition: number;
  posX: number;
  posY: number;
  health: number;
  money: number;
};
/** @description position as Index */
const path: {
  positionX: number;
  positionY: number;
}[] = [];
/** @description position as Pixel @description pathPosition as Index */
const enemies: Enemy[] = [];

let interval: number;

let gameTicks = 0;
//------------------------------
const gameSize = 11;

export const player = {
  positionX: Math.floor(gameSize / 2),
  positionY: 0,
  health: 20,
  money: 100,
};
const TURRETS = {
  1: {
    cost: 20,
    damage: 1,
  },
};

const ENEMIES = {
  zombie: {
    health: 5,
    money: 10,
  },
  spider: {
    health: 3,
    money: 15,
  },
};
export const enemyBase = {
  positionY: gameSize - 1,
  positionX: Math.floor(gameSize / 2),
};

const gameMap: GameTile[][] = [];

//----------------------------
console.log(player.health);
game();
function game() {
  player.health = 20;
  createMap();
  createPath();
  renderMap();
  interval = setInterval(gameLoop, 1000 / 24);
}
//------------------------
function gameLoop() {
  gameTicks++;
  if (gameTicks % 24 === 0) {
    towerAttack();
  }
  if (gameTicks % 24 === 0) {
    spawnEnemy();
  }
  enemyDeath();
  CheckWinLose();
  enemyMove();
  renderAll();
  console.log(player.money);
}

function renderAll() {
  renderPlayerStats();
  renderEnemy();
}
function renderPlayerStats() {
  const health = document.querySelector('.health') as HTMLDivElement;
  health.innerText = `Player Health = ${player.health}`;
  const money = document.querySelector('.money') as HTMLDivElement;
  money.innerText = `Money = ${player.money}`;
}

function CheckWinLose() {
  if (player.health <= 0) {
    clearInterval(interval);
    const deathText = document.querySelector('.death') as HTMLDialogElement;
    deathText.showModal();
  }
}

function playerDamage(Damage: number) {
  player.health -= Damage;
}

function renderMap() {
  gameMap[enemyBase.positionX][enemyBase.positionY].isEnemyBase = true;
  gameMap[player.positionX][player.positionY].isPlayerBase = true;
  const gameField = document.querySelector('.field');
  if (gameField !== null) {
    gameField.innerHTML = '';
  }
  gameField?.setAttribute('style', `grid-template-columns: repeat(${gameSize},1fr); width: ${64 * gameSize}px;`);
  for (let y = 0; y < gameSize; y++) {
    for (let x = 0; x < gameSize; x++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.onclick = () => {
        tileClick(x, y);
      };
      if (gameMap[x][y].isPlayerTower) {
        tile.classList.add('tower');
      }
      if (gameMap[x][y].isPlayerBase) {
        tile.classList.add('playerBase');
      }
      if (gameMap[x][y].isEnemyBase) {
        tile.classList.add('enemyBase');
      }
      if (path.find(a => a.positionX === x && a.positionY === y)) {
        tile.classList.add('path');
      }
      gameField?.appendChild(tile);
    }
  }
}
function renderEnemy() {
  document.querySelectorAll('.enemy').forEach(a => {
    a.remove();
  });
  for (const enemy of enemies) {
    const enemyDiv = document.createElement('div');
    enemyDiv.className = 'enemy';
    enemyDiv.setAttribute('style', `top:${enemy.posY}px; left:${enemy.posX}px`);
    const gameField = document.querySelector('.field');
    gameField?.appendChild(enemyDiv);
  }
}
function tileClick(IndexX: number, IndexY: number) {
  if (path.find(a => a.positionX !== IndexX && a.positionY !== IndexY)) {
    if (gameMap[IndexX][IndexY].isPlayerTower == null) {
      gameMap[IndexX][IndexY].isPlayerTower = 1;
    } else {
      gameMap[IndexX][IndexY].isPlayerTower = null;
    }
    renderMap();
  }
}
function indexToPixel(index: number) {
  return index * 64 + 32;
}
function pixelToIndex(index: number) {
  return (index - 32) / 64;
}
function enemyMove() {
  for (const enemy of enemies) {
    if (pixelToIndex(enemy.posX) === path[enemy.pathPosition + 1].positionX && pixelToIndex(enemy.posY) === path[enemy.pathPosition + 1].positionY) {
      enemy.pathPosition++;
    } else if (path[enemy.pathPosition + 1].positionX - pixelToIndex(enemy.posX) < 0) {
      enemy.posX -= 2;
    } else if (path[enemy.pathPosition + 1].positionX - pixelToIndex(enemy.posX) > 0) {
      enemy.posX += 2;
    } else if (path[enemy.pathPosition + 1].positionY - pixelToIndex(enemy.posY) < 0) {
      enemy.posY -= 2;
    } else if (path[enemy.pathPosition + 1].positionY - pixelToIndex(enemy.posY) > 0) {
      enemy.posY += 2;
    }
    if (pixelToIndex(enemy.posX) === player.positionX && pixelToIndex(enemy.posY) === player.positionY) {
      enemy.posX = indexToPixel(enemyBase.positionX);
      enemy.posY = indexToPixel(enemyBase.positionY);
      enemy.pathPosition = 0;
      playerDamage(1);
      renderEnemy();
    }
  }
}

function createMap() {
  for (let x = 0; x < gameSize; x++) {
    const gameRow: GameTile[] = [];
    for (let y = 0; y < gameSize; y++) {
      const tile: GameTile = {
        isPlayerTower: null,
        isPlayerBase: false,
        isEnemyBase: false,
        isEnemyPath: false,
      };
      gameRow.push(tile);
    }
    gameMap.push(gameRow);
  }
}

function towerAttack() {
  for (const enemy of enemies) {
    enemy.health -=
      gameMap.reduce(
        (a, b) =>
          a +
          b.reduce((c, d) => {
            if (d.isPlayerTower === 1) {
              c++;
            }
            return c;
          }, 0),
        0
      ) * TURRETS[1].damage;
  }
}

function enemyDeath() {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].health <= 0) {
      enemies.splice(i, 1);
      if (enemies[i].type === 'zombie') {
        player.money += ENEMIES.zombie.money;
      }
      if (enemies[i].type === 'spider') {
        player.money += ENEMIES.spider.money;
      }
    }
  }
}

function spawnEnemy() {
  enemies.push({
    ...ENEMIES.zombie,
    pathPosition: 0,
    posX: indexToPixel(enemyBase.positionX),
    posY: indexToPixel(enemyBase.positionY),
    type: 'zombie',
  });
}

declare global {
  interface Window {
    game: () => void;
  }
}
window.game = game;

function createPath() {
  path.push({ positionX: enemyBase.positionX, positionY: enemyBase.positionY });
  path.push({ positionX: enemyBase.positionX - 1, positionY: enemyBase.positionY });
  path.push({ positionX: enemyBase.positionX - 2, positionY: enemyBase.positionY });
  path.push({ positionX: enemyBase.positionX - 3, positionY: enemyBase.positionY });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY });
  path.push({ positionX: enemyBase.positionX - 5, positionY: enemyBase.positionY });
  path.push({ positionX: enemyBase.positionX - 5, positionY: enemyBase.positionY - 1 });
  path.push({ positionX: enemyBase.positionX - 5, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX - 3, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX - 2, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX - 1, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX + 1, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX + 2, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX + 2, positionY: enemyBase.positionY - 1 });
  path.push({ positionX: enemyBase.positionX + 2, positionY: enemyBase.positionY - 0 });
  path.push({ positionX: enemyBase.positionX + 3, positionY: enemyBase.positionY - 0 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 0 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 1 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 2 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 3 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 4 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 5 });
  path.push({ positionX: enemyBase.positionX + 4, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX + 3, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX + 2, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX + 1, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX - 1, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX - 2, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX - 2, positionY: enemyBase.positionY - 5 });
  path.push({ positionX: enemyBase.positionX - 2, positionY: enemyBase.positionY - 4 });
  path.push({ positionX: enemyBase.positionX - 3, positionY: enemyBase.positionY - 4 });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY - 4 });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY - 5 });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY - 6 });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY - 7 });
  path.push({ positionX: enemyBase.positionX - 4, positionY: enemyBase.positionY - 8 });
  path.push({ positionX: enemyBase.positionX - 3, positionY: enemyBase.positionY - 8 });
  path.push({ positionX: enemyBase.positionX - 2, positionY: enemyBase.positionY - 8 });
  path.push({ positionX: enemyBase.positionX - 1, positionY: enemyBase.positionY - 8 });
  path.push({ positionX: enemyBase.positionX, positionY: enemyBase.positionY - 8 });
  path.push({ positionX: enemyBase.positionX, positionY: enemyBase.positionY - 9 });
  //--------------------
  path.push({ positionX: player.positionX, positionY: player.positionY });
}
