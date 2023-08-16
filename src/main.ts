import './style.css';

type GameTile = {
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

type TurretTypes = 'Tier I' | 'Tier II';
type Turret = {
  type: TurretTypes;
  cost: number;
  damage: number;
  posX: number;
  posY: number;
};
/** @description position as Index */
const path: {
  positionX: number;
  positionY: number;
}[] = [];
/** @description position as Pixel @description pathPosition as Index */
const enemies: Enemy[] = [];
const turrets: Turret[] = [];
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
const TURRET_OPTIONS = {
  'Tier I': {
    cost: 50,
    damage: 1,
  },
  'Tier II': {
    cost: 150,
    damage: 2.5,
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

const gameMap: GameTile[][] = [];

//----------------------------
game();
function game() {
  player.health = 20;
  createMap();
  createPath();
  renderMap();
  waveGeneration();
  interval = setInterval(gameLoop, 1000 / 24);
}
//------------------------
function gameLoop() {
  gameTicks++;
  if (gameTicks % 24 === 0) {
    towerAttack();
  }

  if (gameTicks % (24 * 30) === 0) {
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
  // const health20 = document.querySelector('.health20');
  // health20?.setAttribute(`width:  174px; `);
  // 174
  // ${174/5*player.health}
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

function renderTurret() {
  document.querySelectorAll('.turret').forEach(a => {
    a.remove();
  });
  for (const tower of turrets) {
    const turretDiv = document.createElement('div');
    turretDiv.className = 'turret';
    turretDiv.setAttribute('style', `top:${tower.posY}px; left:${tower.posX}px`);
    const gameField = document.querySelector('.field');
    gameField?.appendChild(turretDiv);
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
function tileClick(indexX: number, indexY: number, type: TurretTypes) {
  if (path.find(a => a.positionX === indexX && a.positionY === indexY)) {
    console.log('didnt work');
    return;
  }
  if (player.money >= TURRET_OPTIONS[type].cost + 5 * towers) {
    turrets.push({
      ...TURRET_OPTIONS[type],
      posX: indexToPixel(indexX),
      posY: indexToPixel(indexY),
      type: type,
    });
    player.money -= TURRET_OPTIONS[type].cost + 5 * towers;
    towers += 1;
    console.log(turrets);
  }
  renderTurret();
  console.log('render turret');
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
      enemies.splice(0, 1);
    }
  }
}

function createMap() {
  for (let x = 0; x < gameSizeX; x++) {
    const gameRow: GameTile[] = [];
    for (let y = 0; y < gameSizeY; y++) {
      const tile: GameTile = {
        isEmpty: true,
      };
      gameRow.push(tile);
    }
    gameMap.push(gameRow);
  }
}

function towerAttack() {
  if (!enemies.length) {
    return;
  }
  for (const tower of turrets) {
    enemies[0].health -= tower.damage;
    if (enemies[0].health <= 0) {
      player.money += ENEMY_OPTIONS[enemies[0].type].money;
      enemies.splice(0, 1);
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

function sellTower(xIndex: number, yIndex: number) {
  turrets.splice(xIndex && yIndex, 1);
  player.money += 30;
  towers -= 1;
  renderTurret();
  console.log('sell Tower');
}

function openOptionsMenu(x: number, y: number) {
  const optionsMenu = document.querySelector('.optionsMenu') as HTMLDialogElement;
  optionsMenu.show();
  const menuOption1 = document.querySelector('#menuOption1') as HTMLDivElement;
  menuOption1.onclick = () => {
    optionsMenu.close();
    console.log('close Tier I');
    tileClick(x, y, 'Tier I');
  };
  const menuOption2 = document.querySelector('#menuOption2') as HTMLDivElement;
  menuOption2.onclick = () => {
    optionsMenu.close();
    console.log('close Tier II');
    tileClick(x, y, 'Tier II');
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
  }
}
window.game = game;

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
