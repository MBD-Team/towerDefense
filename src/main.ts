import './style.css';

type GameTile = {
  isPlayerTower: number | null;
  isPlayerBase: boolean;
  isEnemyBase: boolean;
  isEnemyPath: boolean;
};

type Enemy = {
  type: keyof typeof ENEMYOPTIONS;
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
  money: 1000,
};
const TURRETS = {
  1: {
    cost: 20,
    damage: 1,
  },
};

const ENEMYOPTIONS = {
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

  if (gameTicks % 12 === 0) {
    spawnEnemy();
  }

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
        openOptionsMenu(x, y);
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
  if (path.find(a => a.positionX === IndexX && a.positionY === IndexY)) {
    return;
  }
  if (gameMap[IndexX][IndexY].isPlayerTower == null && player.money >= 50) {
    gameMap[IndexX][IndexY].isPlayerTower = 1;
    player.money -= 50;
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
  for (const tower of gameMap.flat().filter(a => a.isPlayerTower)) {
    enemies[0].health -= TURRETS[1].damage;
    enemyDeath(); // FIXME: checking if all enemies are dead if only the first one got shot (performance)
  }
}
function enemyDeath() {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].health <= 0) {
      enemies.splice(i, 1);
      if (enemies[i].type === 'zombie') {
        player.money += ENEMYOPTIONS.zombie.money;
      }
      if (enemies[i].type === 'spider') {
        player.money += ENEMYOPTIONS.spider.money;
      }
    }
  }
}

function spawnEnemy() {
  enemies.push({
    ...ENEMYOPTIONS.zombie,
    pathPosition: 0,
    posX: indexToPixel(enemyBase.positionX),
    posY: indexToPixel(enemyBase.positionY),
    type: 'zombie',
  });
}

function sellTower(x: number, y: number) {
  if (gameMap[x][y].isPlayerTower !== null) {
    gameMap[x][y].isPlayerTower = null;
    player.money += 30;
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
