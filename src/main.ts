//------------------Imports-and-exports------------------

import './style.css';

//------------------declaration-of-types------------------

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
  maxHealth: number;
  speed: number;
  walkedPixels: number;
};
type TargetTypes = 'first' | 'mostHealth' | 'close' | 'furthest' | 'leastHealth';
type TurretTypes = 'dispenser' | 'ironGolem';
type Turret = {
  type: TurretTypes;
  level: number;
  cost: number;
  damage: number;
  dealtDamage: number;
  posX: number;
  posY: number;
  range: number;
  targetType: TargetTypes;
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

//-----------------------Game-Infos---------------------
let gameTicks = 0;
const gameSizeX = 19;
const gameSizeY = 11;
let waveCount = 0;
let functionOn = false;
const hearths20 = document.querySelector('.hearths20');
hearths20?.setAttribute('style', `width:  162px; `);
const expFull = document.querySelector('.expFull');
expFull?.setAttribute('style', `width:  162px; `);

//------------------------Objects-------------------------
const player = {
  positionX: Math.floor(gameSizeX / 2),
  positionY: 0,
  health: 20,
  money: 0,
  exp: 0,
  level: 1,
};

const TURRET_OPTIONS = {
  dispenser: {
    cost: 50,
    damage: 1,
    range: indexToPixel(3),
  },
  ironGolem: {
    cost: 150,
    damage: 2.5,
    range: indexToPixel(1),
  },
};

const ENEMY_OPTIONS = {
  zombie: {
    health: 7,
    maxHealth: 7,
    strength: 6,
    speed: 1,
  },
  spider: {
    health: 3,
    maxHealth: 3,
    strength: 4,
    speed: 2,
  },
  skeleton: {
    health: 5,
    maxHealth: 5,
    strength: 5,
    speed: 2,
  },
  enderman: {
    health: 15,
    maxHealth: 15,
    strength: 12,
    speed: 2,
  },
  bat: {
    health: 1,
    maxHealth: 1,
    strength: 1,
    speed: 4,
  },
};

const gameMap: GameTile[][] = [];
let selectedTurret: null | TurretTypes = null;
//-------------------------Game---------------------------

game();

//--------------------Game-Functions-----------------------
function game() {
  reset();
  createMap();
  createPath();
  renderMap();
  renderShop();
  waveGeneration();
  interval = setInterval(gameLoop, 1000 / 24);
}

function reset() {
  player.exp = 0;
  player.level = 0;
  player.health = 20;
  player.money = 90;
  playerDamage(0);
  path.splice(0);
  gameMap.splice(0);
  enemies.splice(0);
  turrets.splice(0);
  waveCount = 0;
}
function gameLoop() {
  checkMoney();
  gameTicks++;
  if (gameTicks % 24 === 0) {
    towerAttack();
    renderWaveStats();
  }
  if (gameTicks % (24 * 30) === 0) {
    waveGeneration();
  }
  checkWinLose();
  enemyMove();
  renderEnemy();

  playerXP();
}

//-----------------------Renders---------------------------

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
        placeTower(x, y);
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
    turretDiv.onclick = () => {
      functionOn = !functionOn;
      openTowerMenu(pixelToIndex(tower.posX), pixelToIndex(tower.posY), tower);
      renderRange(tower);
    };
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
    enemyDiv.classList.add(`enemy`, enemy.type);
    enemyDiv.setAttribute('style', `top:${enemy.posY}px; left:${enemy.posX}px`);
    const gameField = document.querySelector('.field');
    gameField?.appendChild(enemyDiv);
  }
}

function renderRange(tower: Turret) {
  if (!document.querySelector('.range')) {
    const rangeDiv = document.createElement('div');
    rangeDiv.setAttribute(
      'style',
      `border-radius:50%; background-color:rgba(255,0,0,0.1);
    top:${tower.posY}px; left:${tower.posX}px;
    width: ${tower.range * 2}px; height: ${tower.range * 2}px;
    position:absolute;transform: translate(-50%,-50%);
    border: 1px solid red;
    box-sizing:border-box;
    pointer-events: none;`
    );
    rangeDiv.className = 'range';
    document.querySelector('.field')?.appendChild(rangeDiv);
  } else {
    document.querySelector('.range')?.remove();
  }
}

function renderWaveStats() {
  const showWave = document.querySelector('.wave') as HTMLSpanElement;
  const remainingEnemies = document.querySelector('.remainingEnemies') as HTMLSpanElement;
  showWave.innerHTML = `Wave: ${waveCount}`;
  remainingEnemies.innerHTML = `Remaining enemies: ${enemies.length}`;
}
//------------------------Create---------------------------
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

function createPath() {
  let pathY = gameSizeY - 1;
  let pathX = Math.floor(Math.random() * gameSizeX) + 1;
  while (pathY > 0) {
    const direction = Math.floor(Math.random() * 100) + 1;

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
//------------------------Checks---------------------------
function checkWinLose() {
  if (player.health <= 0) {
    clearInterval(interval);
    const deathText = document.querySelector('.death') as HTMLDialogElement;
    deathText.showModal();
  }
}

function checkMoney() {
  let moneyString = player.money.toString();
  moneyString = moneyString.padStart(5, '0');

  const copper = document.querySelector('#copper') as HTMLDivElement;
  copper.innerText = `${moneyString.substring(5, 4)}`;

  const iron = document.querySelector('#iron') as HTMLDivElement;
  iron.innerText = `${moneyString.substring(4, 3)}`;

  const gold = document.querySelector('#gold') as HTMLDivElement;
  gold.innerText = `${moneyString.substring(3, 2)}`;

  const diamond = document.querySelector('#diamond') as HTMLDivElement;
  diamond.innerText = `${moneyString.substring(2, 1)}`;

  const netherite = document.querySelector('#netherite') as HTMLDivElement;

  netherite.innerText = `${moneyString.substring(1, 0)}`;
}

//--------------------Player-Functions-----------------------
function playerDamage(damage: number) {
  player.health -= damage;
  hearths20?.setAttribute('style', `width:  ${8 * player.health + 1}px; `);
}

function playerXP() {
  if (player.level < 16) {
    if (player.exp >= player.level * 2 + 7) {
      player.exp -= player.level * 2 + 7;
      player.level++;
    }
  } else if (player.level < 31) {
    if (player.exp >= player.level * 5 + 7) {
      player.exp -= player.level * 5 + 7;
      player.level++;
    }
  } else if (player.level >= 30) {
    if (player.exp >= player.level * 9 + 7) {
      player.exp -= player.level * 9 + 7;
      player.level++;
    }
  }
  //162
  if (player.level < 16) {
    expFull?.setAttribute('style', `width:  ${1 + 3.8 * player.exp}px; `);
    const level = document.querySelector('#level') as HTMLDivElement;
    level.innerText = `${player.level}`;
  } else if (player.level < 31) {
    expFull?.setAttribute('style', `width:  ${1 + 3.8 * player.exp}px; `);
    const level = document.querySelector('#level') as HTMLDivElement;
    level.innerText = `${player.level}`;
  } else if (player.level >= 30) {
    expFull?.setAttribute('style', `width:  ${1 + 3.8 * player.exp}px; `);
    const level = document.querySelector('#level') as HTMLDivElement;
    level.innerText = `${player.level}`;
  }
}

//---------------------Calculations------------------------
function indexToPixel(index: number) {
  return index * 64 + 32;
}
function pixelToIndex(index: number) {
  return (index - 32) / 64;
}
//-------------------Enemy-functions-----------------------
function enemyMove() {
  for (const enemy of enemies) {
    if (pixelToIndex(enemy.posX) === path[enemy.pathPosition + 1].positionX && pixelToIndex(enemy.posY) === path[enemy.pathPosition + 1].positionY) {
      enemy.pathPosition++;
    } else if (path[enemy.pathPosition + 1].positionX - pixelToIndex(enemy.posX) < 0) {
      enemy.posX -= enemy.speed;
      enemy.walkedPixels += enemy.speed;
    } else if (path[enemy.pathPosition + 1].positionX - pixelToIndex(enemy.posX) > 0) {
      enemy.posX += enemy.speed;
      enemy.walkedPixels += enemy.speed;
    } else if (path[enemy.pathPosition + 1].positionY - pixelToIndex(enemy.posY) < 0) {
      enemy.posY -= enemy.speed;
      enemy.walkedPixels += enemy.speed;
    } else if (path[enemy.pathPosition + 1].positionY - pixelToIndex(enemy.posY) > 0) {
      enemy.posY += enemy.speed;
      enemy.walkedPixels += enemy.speed;
    }
    if (pixelToIndex(enemy.posX) === path[path.length - 1].positionX && pixelToIndex(enemy.posY) === path[path.length - 1].positionY) {
      enemy.posX = indexToPixel(path[0].positionX);
      enemy.posY = indexToPixel(path[0].positionY);
      enemy.pathPosition = 0;
      playerDamage(1);
      enemies.splice(0, 1);
    }
  }
}
function waveGeneration() {
  waveCount++;
  let waveStrength = waveCount * 10 + waveCount ** 2 * 0.5;
  let mobCount = 0;
  console.log(waveCount, waveStrength);
  while (waveStrength >= 0) {
    mobCount++;
    const random = Math.random() * 100;

    if (random <= 5) {
      waveStrength -= spawnEnemy('enderman', mobCount);
    } else if (random <= 50 && random > 5) {
      waveStrength -= spawnEnemy('zombie', mobCount);
    } else if (random <= 70 && random > 50) {
      waveStrength -= spawnEnemy('skeleton', mobCount);
    } else if (random <= 85 && random > 70) {
      waveStrength -= spawnEnemy('bat', mobCount);
    } else {
      waveStrength -= spawnEnemy('spider', mobCount);
    }
  }
}

function spawnEnemy(type: EnemyTypes, delay: number) {
  setTimeout(
    () =>
      enemies.push({
        ...ENEMY_OPTIONS[type],
        pathPosition: 0,
        posX: indexToPixel(path[0].positionX),
        posY: indexToPixel(path[0].positionY),
        type: type,
        walkedPixels: 0,
      }),
    delay * 500
  );
  return ENEMY_OPTIONS[type].strength;
}
//-------------------Tower-functions-----------------------
function turretUpgrade() {
  for (const tower of turrets) {
    tower.damage = tower.damage * (tower.damage + tower.level / 2);
  }
}

function closestRange(towerX: number, towerY: number) {
  let closesEnemy = 0;
  let closestEnemyDistance = Math.sqrt(Math.pow(indexToPixel(gameSizeY), 2) + Math.pow(indexToPixel(gameSizeX), 2));
  let enemyDistance = null;

  for (let i = 0; i < enemies.length; i++) {
    enemyDistance = Math.sqrt(Math.pow(towerX - enemies[i].posX, 2) + Math.pow(towerY - enemies[i].posY, 2));
    if (enemyDistance < closestEnemyDistance) {
      closestEnemyDistance = enemyDistance;
      closesEnemy = i;
    }
  }
  return closesEnemy;
}

function furthestRange(towerX: number, towerY: number) {
  let closesEnemy = 0;
  let closestEnemyDistance = Math.sqrt(Math.pow(indexToPixel(gameSizeY), 2) + Math.pow(indexToPixel(gameSizeX), 2));
  let enemyDistance = null;

  for (let i = 0; i < enemies.length; i++) {
    enemyDistance = Math.sqrt(Math.pow(towerX - enemies[i].posX, 2) + Math.pow(towerY - enemies[i].posY, 2));
    if (enemyDistance > closestEnemyDistance) {
      closestEnemyDistance = enemyDistance;
      closesEnemy = i;
    }
  }
  return closesEnemy;
}

function mostDistance() {
  let firstEnemy = 0;
  let mostEnemyDistance = 0;
  let enemyDistance = 0;

  for (let i = 0; i < enemies.length; i++) {
    enemyDistance = enemies[i].walkedPixels;
    if (enemyDistance > mostEnemyDistance) {
      mostEnemyDistance = enemyDistance;
      firstEnemy = i;
    }
  }

  return firstEnemy;
}

function mostHealth() {
  let mostHealthyEnemy = 0;
  let mostHealthyEnemyHealth = (gameSizeX * gameSizeY) / 2;
  let enemyHealth = 0;
  for (let i = 0; i < enemies.length; i++) {
    enemyHealth = enemies[i].maxHealth;
    if (enemyHealth > mostHealthyEnemyHealth) {
      mostHealthyEnemyHealth = enemyHealth;
      mostHealthyEnemy = i;
    }
  }
  return mostHealthyEnemy;
}

function leastHealth() {
  let leastHealthyEnemy = 10000;
  let leastHealthyEnemyHealth = (gameSizeX * gameSizeY) / 2;
  let enemyHealth = 0;
  for (let i = 0; i < enemies.length; i++) {
    enemyHealth = enemies[i].health;
    if (enemyHealth < leastHealthyEnemyHealth) {
      leastHealthyEnemyHealth = enemyHealth;
      leastHealthyEnemy = i;
    }
  }
  return leastHealthyEnemy;
}

function towerAttack() {
  for (const tower of turrets) {
    if (enemies.length) {
      let targetEnemy = -1;
      if (tower.targetType === 'first') {
        targetEnemy = mostDistance();
      } else if (tower.targetType === 'close') {
        targetEnemy = closestRange(indexToPixel(tower.posX), indexToPixel(tower.posY));
      } else if (tower.targetType === 'mostHealth') {
        targetEnemy = mostHealth();
      } else if (tower.targetType === 'leastHealth') {
        targetEnemy = leastHealth();
      } else {
        targetEnemy = furthestRange(indexToPixel(tower.posX), indexToPixel(tower.posY));
      }
      const distance = (tower.posX - enemies[targetEnemy].posX) ** 2 + (tower.posY - enemies[targetEnemy].posY) ** 2;
      if (distance <= tower.range ** 2) {
        if (targetEnemy !== -1) {
          enemies[targetEnemy].health -= Math.ceil(tower.damage);
          console.log(tower, tower.dealtDamage);
          tower.dealtDamage += Math.ceil(tower.damage);
        }
        console.log(tower.damage);
        if (enemies[targetEnemy].health < 1) {
          player.money += ENEMY_OPTIONS[enemies[targetEnemy].type].strength * 2;
          player.exp += ENEMY_OPTIONS[enemies[targetEnemy].type].strength;
          player.money = Math.floor(player.money);
          enemies.splice(targetEnemy, 1);
        }
        targetEnemy = -1;
      }
    }
  }
}

function sellTower(xIndex: number, yIndex: number) {
  const turretIndex = turrets.findIndex(a => pixelToIndex(a.posX) === xIndex && pixelToIndex(a.posY) === yIndex);
  document.querySelector('.range')?.remove();
  player.money += TURRET_OPTIONS[turrets[turretIndex].type].cost * 0.7;
  turrets.splice(turretIndex, 1);
  renderTurret();
  renderShop();
}

function renderShop() {
  const dispenser = document.querySelector('#dispenser') as HTMLElement;
  const ironGolem = document.querySelector('#ironGolem') as HTMLElement;
  const shopItem = document.querySelectorAll<HTMLElement>('.shopItem');
  const dispenserCost = document.querySelector('#dispenserCost') as HTMLSpanElement;
  const ironGolemCost = document.querySelector('#ironGolemCost') as HTMLSpanElement;
  ironGolemCost.innerHTML = `${TURRET_OPTIONS.ironGolem.cost + 5 * turrets.length}`;
  dispenserCost.innerHTML = `${TURRET_OPTIONS.dispenser.cost + 5 * turrets.length}`;
  shopItem.forEach(a => {
    a.setAttribute('style', 'background-color:#0000005d');
  });
  dispenser.onclick = () => {
    shopItem.forEach(a => {
      a.setAttribute('style', 'background-color:#0000005d');
    });
    if (selectedTurret !== 'dispenser') {
      selectedTurret = 'dispenser';
      dispenser.setAttribute('style', 'background-color:red;');
    } else {
      selectedTurret = null;
    }
  };
  ironGolem.onclick = () => {
    shopItem.forEach(a => {
      a.setAttribute('style', 'background-color:#0000005d');
    });
    if (selectedTurret !== 'ironGolem') {
      selectedTurret = 'ironGolem';
      ironGolem.setAttribute('style', 'background-color:red;');
    } else {
      selectedTurret = null;
    }
  };
}

function openTowerMenu(x: number, y: number, tower: Turret) {
  const menuItem = document.querySelectorAll('.menuItem');
  menuItem.forEach(a => {
    a.setAttribute('style', 'background-color:#0000005d');
  });
  const towerMenuObject1 = document.querySelector('#towerObject1') as HTMLElement;
  if (functionOn) {
    towerMenuObject1.onclick = () => {};
    const towerMenuObject2 = document.querySelector('#towerObject2') as HTMLElement;
    towerMenuObject2.onclick = () => {};
    const towerMenuObject4 = document.querySelector('#towerObject4') as HTMLElement;
    towerMenuObject4.onclick = () => {
      tower.targetType = 'first';
    };
    const towerMenuObject5 = document.querySelector('#towerObject5') as HTMLElement;
    towerMenuObject5.onclick = () => {
      tower.targetType = 'mostHealth';
    };
    const towerMenuObject6 = document.querySelector('#towerObject6') as HTMLElement;
    towerMenuObject6.onclick = () => {
      tower.targetType = 'close';
    };
    const towerMenuObject7 = document.querySelector('#towerObject7') as HTMLElement;
    towerMenuObject7.onclick = () => {
      tower.targetType = 'furthest';
    };
    const towerMenuObject8 = document.querySelector('#towerObject8') as HTMLDivElement;
    towerMenuObject8.onclick = () => {
      tower.targetType = 'leastHealth';
    };
    const towerMenuObject3 = document.querySelector('#towerObject3') as HTMLElement;
    towerMenuObject3.onclick = () => {
      sellTower(x, y);
    };
  }
}
function placeTower(indexX: number, indexY: number) {
  if (path.find(a => a.positionX === indexX && a.positionY === indexY) || selectedTurret === null) {
    return;
  }

  if (player.money > TURRET_OPTIONS[selectedTurret].cost + 5 * turrets.length) {
    player.money -= TURRET_OPTIONS[selectedTurret].cost + 5 * turrets.length;
    turrets.push({
      ...TURRET_OPTIONS[selectedTurret],
      posX: indexToPixel(indexX),
      posY: indexToPixel(indexY),
      type: selectedTurret,
      level: 1,
      dealtDamage: 0,
      targetType: 'first',
    });
    selectedTurret = null;
    renderShop();
    renderTurret();
  }
}
//-------------------Type-Script-Bullshit-----------------------
declare global {
  interface Window {
    game: () => void;
  }
}
window.game = game;
