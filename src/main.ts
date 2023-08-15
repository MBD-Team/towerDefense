import './style.css';

type GameTile = {
  isPlayerTower: number | null;
  isEmpty: boolean;
};
type EnemyTypes = 'zombie' | 'skeleton' | 'spider' | 'enderman' | 'bat';
type Enemy = {
  type: EnemyTypes;
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
let towers = 0;
let gameTicks = 0;
//------------------------------
const gameSizeX = 19;
const gameSizeY = 11;

let waveCount = 0;

const player = {
  positionX: Math.floor(gameSizeX / 2),
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

const ENEMY_OPTIONS = {
  zombie: {
    health: 7,
    money: 10,
    strength: 6,
  },
  spider: {
    health: 3,
    money: 5,
    strength: 4,
  },
  skeleton: {
    health: 5,
    money: 7,
    strength: 5,
  },
  enderman: {
    health: 15,
    money: 20,
    strength: 12,
  },
  bat: {
    health: 1,
    money: 1,
    strength: 1,
  },
};
const enemyBase = {
  positionY: gameSizeY - 1,
  positionX: Math.floor(gameSizeX / 2),
};

const gameMap: GameTile[][] = [];

//----------------------------
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

  if ((gameTicks % 24) * 30 === 0) {
    waveGeneration();
  }

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
  const gameField = document.querySelector('.field');
  if (gameField !== null) {
    gameField.innerHTML = '';
  }
  gameField?.setAttribute('style', `grid-template-columns: repeat(${gameSizeX},1fr); width: ${64 * gameSizeX}px;`);
  for (let y = 0; y < gameSizeY; y++) {
    for (let x = 0; x < gameSizeX; x++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.onclick = () => {
        openOptionsMenu(x, y);
      };
      if (gameMap[x][y].isPlayerTower) {
        tile.classList.add('tower');
      }
      if (path.at(-1)?.positionX === x && path.at(-1)?.positionY === y) {
        tile.classList.add('playerBase');
      }
      if (path[0].positionX === x && path[0].positionY === y) {
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
  if (path.find(a => a.positionX === IndexX && a.positionY === IndexY)) {
    return;
  }
  if (gameMap[IndexX][IndexY].isPlayerTower == null && player.money >= 50 + 5 * towers) {
    gameMap[IndexX][IndexY].isPlayerTower = 1;
    player.money -= 50 + 5 * towers;
    towers += 1;
  } else {
    gameMap[IndexX][IndexY].isPlayerTower = null;
  }
  renderMap();
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
      enemy.posX = indexToPixel(path[0].positionX);
      enemy.posY = indexToPixel(path[0].positionY);
      enemy.pathPosition = 0;
      playerDamage(1);
      renderEnemy();
    }
  }
}

function createMap() {
  for (let x = 0; x < gameSizeX; x++) {
    const gameRow: GameTile[] = [];
    for (let y = 0; y < gameSizeY; y++) {
      const tile: GameTile = {
        isPlayerTower: null,
        isEmpty: true,
      };
      gameRow.push(tile);
    }
    gameMap.push(gameRow);
  }
}

function towerAttack() {
  for (const tower of gameMap.flat().filter(a => a.isPlayerTower)) {
    enemies[0].health -= TURRETS[1].damage;
    enemyDeath(); // FIXME: checking if all enemies are dead while only the first one got shot (performance problems maybe)
  }
}
function enemyDeath() {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].health <= 0) {
      if (enemies[i].type === 'zombie') {
        player.money += ENEMY_OPTIONS.zombie.money;
      }
      if (enemies[i].type === 'spider') {
        player.money += ENEMY_OPTIONS.spider.money;
      }
    }
  }
}
function waveGeneration() {
  waveCount++;
  let waveStrength = waveCount * 10 + waveCount ** 2 * 10;
  while (waveStrength > 0) {
    const random = Math.random() * 100;
    if (random <= 5) {
      waveStrength -= spawnEnemy('enderman');
    } else if (random <= 50 && random > 5) {
      waveStrength -= spawnEnemy('zombie');
    } else if (random <= 70 && random > 50) {
      waveStrength -= spawnEnemy('skeleton');
    } else if (random <= 85 && random > 70) {
      waveStrength -= spawnEnemy('bat');
    } else {
      waveStrength -= spawnEnemy('spider');
    }
  }
}

function spawnEnemy(type: EnemyTypes) {
  enemies.push({
    ...ENEMY_OPTIONS[type],
    pathPosition: 0,
    posX: indexToPixel(path[0].positionX),
    posY: indexToPixel(path[0].positionY),
    type: type,
  });
  return ENEMY_OPTIONS[type].strength;
}

function sellTower(x: number, y: number) {
  if (gameMap[x][y].isPlayerTower !== null) {
    gameMap[x][y].isPlayerTower = null;
    player.money += 30;
    towers -= 1;
    renderMap();
  }
}
function openOptionsMenu(x: number, y: number) {
  const optionsMenu = document.querySelector('.optionsMenu') as HTMLDialogElement;
  optionsMenu.show();
  const menuOption1 = document.querySelector('#menuOption1') as HTMLDivElement;
  menuOption1.onclick = () => {
    optionsMenu.close();
    tileClick(x, y);
  };
  const menuOption2 = document.querySelector('#menuOption2') as HTMLDivElement;
  menuOption2.onclick = () => {
    optionsMenu.close();
    tileClick(x, y);
  };
  const menuOption3 = document.querySelector('#menuOption3') as HTMLDivElement;
  menuOption3.onclick = () => {
    optionsMenu.close();
    sellTower(x, y);
  };
}
declare global {
  interface Window {
    game: () => void;
    openOptionsMenu: (x: number, y: number) => void;
    tileClick: (IndexX: number, IndexY: number) => void;
  }
}
window.game = game;
window.openOptionsMenu = openOptionsMenu;
window.tileClick = tileClick;
//-----------------
function createPath() {
  let pathY = gameSizeY - 1;
  let pathX = Math.floor(Math.random() * gameSizeX) + 1;
  while (pathY > 0) {
    const direction = Math.floor(Math.random() * 100) + 1;
    //---------------------
    if (gameMap[pathX - 1] && gameMap[pathX - 1][pathY]) {
      if (direction < 45) {
        if (!path.find(field => field.positionX === pathX - 1 && field.positionY === pathY)) {
          if (countPathConnected(pathX - 1, pathY) < 2) {
            pathX = pathX - 1;
            gameMap[pathX][pathY].isEmpty = false;
            path.push({ positionX: pathX, positionY: pathY });
          }
        }
      }
    }

    if (gameMap[pathX + 1] && gameMap[pathX + 1][pathY]) {
      if (direction < 90 && direction >= 45) {
        if (!path.find(field => field.positionX === pathX + 1 && field.positionY === pathY)) {
          if (countPathConnected(pathX + 1, pathY) < 2) {
            pathX = pathX + 1;
            gameMap[pathX][pathY].isEmpty = false;
            path.push({ positionX: pathX, positionY: pathY });
          }
        }
      }
    }
    if (gameMap[pathX] && gameMap[pathX][pathY - 1]) {
      if (direction >= 90) {
        if (!path.find(field => field.positionX === pathX && field.positionY === pathY - 1)) {
          if (countPathConnected(pathX, pathY - 1) < 2) {
            pathY -= 1;
            gameMap[pathX][pathY].isEmpty = false;
            path.push({ positionX: pathX, positionY: pathY });
          }
        }
      }
    }
  }
  if (path.length < 60) {
    path.splice(0);
    createPath();
  }
}

function countPathConnected(x: number, y: number) {
  let numberOfConnectedPaths = 0;
  if (path.find(field => field.positionX === x + 1 && field.positionY === y)) {
    numberOfConnectedPaths++;
  }
  if (path.find(field => field.positionX === x - 1 && field.positionY === y)) {
    numberOfConnectedPaths++;
  }
  if (path.find(field => field.positionX === x && field.positionY === y + 1)) {
    numberOfConnectedPaths++;
  }
  if (path.find(field => field.positionX === x && field.positionY === y - 1)) {
    numberOfConnectedPaths++;
  }

  return numberOfConnectedPaths;
}
