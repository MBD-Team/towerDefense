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
type TowerTypes = 'dispenser' | 'ironGolem';
type Tower = {
  type: TowerTypes | null;
  cost: number;
  damage: number;
  dealtDamage: number;
  posX: number;
  posY: number;
  range: number;
  targetType: TargetTypes;
  attackSpeed: number;
  multishot: number;
  looting: number;
  currentDamage: () => number;
  currentRange: () => number;
  upgrades: {
    damageLevel: number;
    attackSpeedLevel: number;
    rangeLevel: number;
    multishotLevel: number;
    lootingLevel: number;
  };
};
/** @description position as Index */
const path: {
  positionX: number;
  positionY: number;
}[] = [];
/** @description position as Pixel @description pathPosition as Index */
const enemies: Enemy[] = [];
const towers: Tower[] = [];
let interval: number;

//-----------------------Game-Infos---------------------
let gameTicks = 0;
const gameSizeX = 19;
const gameSizeY = 11;
let waveCount = 0;
const TICKS_PER_SECOND = 24;
const biome: 'vanilla' | 'nether' = 'vanilla';
const hearths20 = document.querySelector('.hearths20');
const expFull = document.querySelector('.expFull');

//------------------------Objects-------------------------
const player = {
  positionX: Math.floor(gameSizeX / 2),
  positionY: 0,
  health: 20,
  money: 0,
  exp: 0,
  level: 1,
};
const TOWER_OPTIONS = {
  dispenser: {
    cost: 50,
    damage: 1,
    range: indexToPixel(3),
    attackSpeed: 1,
    multishot: 1,
    looting: 0,
  },
  ironGolem: {
    cost: 150,
    damage: 2.5,
    range: indexToPixel(1),
    attackSpeed: 1,
    multishot: 1,
    looting: 0,
  },
} as const;

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
    speed: 3,
  },
};

const gameMap: GameTile[][] = [];
const selectedTower: Tower = {
  type: null,
  cost: 0,
  damage: 1,
  dealtDamage: 0,
  posX: 0,
  posY: 0,
  range: 1,
  targetType: 'first',
  attackSpeed: 1,
  multishot: 1,
  looting: 1,
  currentDamage: () => 0,
  currentRange: () => 0,
  upgrades: {
    damageLevel: 1,
    attackSpeedLevel: 1,
    lootingLevel: 1,
    multishotLevel: 1,
    rangeLevel: 1,
  },
};
//-------------------------Game---------------------------

game();
const tryToPlay = setInterval(() => {
  const audio = document.getElementById('player') as HTMLAudioElement;
  audio
    .play()
    .then(() => {
      clearInterval(tryToPlay);
    })
    .catch(error => {});
}, 1000);

//--------------------Game-Functions-----------------------
function game() {
  reset();
  createMap();
  createPath();
  renderMap();
  renderShop();
  // openTowerMenu();
  waveGeneration();
  interval = setInterval(gameLoop, 1000 / TICKS_PER_SECOND);
}

function reset() {
  player.exp = 0;
  player.level = 0;
  expFull?.setAttribute('style', `width:  162px; `);
  player.health = 20;
  playerDamage(0);
  hearths20?.setAttribute('style', `width:  162px; `);
  player.money = 100;
  gameTicks = 0;
  path.splice(0);
  gameMap.splice(0);
  enemies.splice(0);
  towers.splice(0);
  waveCount = 0;
}
function gameLoop() {
  checkWinLose();
  gameTicks++;
  waveGeneration();
  renderWaveStats();
  renderEnemy();
  enemyMove();
  towerAttack();
  playerXP();
  checkMoney();
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
      tile.classList.add('tile', biome + '_background');
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
        tile.classList.add(biome + '_path');
      }
      gameField?.appendChild(tile);
    }
  }
}
function renderTower() {
  document.querySelectorAll('.tower').forEach(a => {
    a.remove();
  });
  for (const tower of towers) {
    const towerDiv = document.createElement('div');
    towerDiv.className = 'tower';
    towerDiv.onclick = () => {
      if (selectedTower.type === null) {
        openTowerMenu(pixelToIndex(tower.posX), pixelToIndex(tower.posY), tower);
        renderRange(tower);
      } else {
        selectedTower.type = null;
      }
    };
    towerDiv.setAttribute('style', `top:${tower.posY}px; left:${tower.posX}px`);
    const gameField = document.querySelector('.field');
    gameField?.appendChild(towerDiv);
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

function renderRange(tower: Tower) {
  if (!document.querySelector('.range')) {
    const towerRange = tower.currentRange();
    const rangeDiv = document.createElement('div');
    rangeDiv.setAttribute(
      'style',
      `border-radius:50%; background-color:rgba(255,0,0,0.1);
    top:${tower.posY}px; left:${tower.posX}px;
    width: ${towerRange * 2}px; height: ${towerRange * 2}px;
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
      if (direction < 49) {
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
      if (direction < 98 && direction >= 49) {
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
      if (direction >= 98) {
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
  if (path.length < 85) {
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
      //player.exp/2 -7
      player.exp -= player.level * 2 + 7;
      player.level++;
    }
  } else if (player.level < 31) {
    if (player.exp >= player.level * 5 + 7) {
      player.exp -= player.level * 5 + 7;
      player.level++;
    }
  } else if (player.level > 30) {
    if (player.exp >= player.level * 9 + 7) {
      player.exp -= player.level * 9 + 7;
      player.level++;
    }
  }
  //382
  if (player.level < 16) {
    expFull?.setAttribute('style', `width:  ${(player.exp / (player.level * 2 + 7)) * 382}px; `);
    const level = document.querySelector('#level') as HTMLDivElement;
    level.innerText = `${player.level}`;
  } else if (player.level < 31) {
    expFull?.setAttribute('style', `width:  ${(player.exp / (player.level * 5 + 7)) * 382}px; `);
    const level = document.querySelector('#level') as HTMLDivElement;
    level.innerText = `${player.level}`;
  } else if (player.level > 30) {
    expFull?.setAttribute('style', `width:  ${(player.exp / (player.level * 9 + 7)) * 382}px; `);
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
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].pathPosition = Math.floor(enemies[i].walkedPixels / 64);
    if (path[enemies[i].pathPosition + 1]) {
      const pathDifferenceX = path[enemies[i].pathPosition + 1]?.positionX - path[enemies[i].pathPosition]?.positionX;
      const pathDifferenceY = path[enemies[i].pathPosition + 1]?.positionY - path[enemies[i].pathPosition]?.positionY;
      enemies[i].posY += pathDifferenceY * enemies[i].speed;
      enemies[i].posX += pathDifferenceX * enemies[i].speed;
      enemies[i].walkedPixels += enemies[i].speed;
    } else {
      enemies.splice(i, 1);
      playerDamage(1);
    }
  }
}
function waveGeneration() {
  if (gameTicks % (TICKS_PER_SECOND * 30) === 0) {
    waveCount++;
    let waveStrength = waveCount * 10 + waveCount ** 2 * 0.5;
    let mobCount = 0;
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
function getDistance(e1: { posX: number; posY: number }, e2: { posX: number; posY: number }) {
  const distance = Math.sqrt((e1.posX - e2.posX) ** 2 + (e1.posY - e2.posY) ** 2);
  return distance;
}

function towerAttack() {
  for (const tower of towers) {
    if (gameTicks % (TICKS_PER_SECOND / (tower.attackSpeed + tower.upgrades.attackSpeedLevel * 0.1)) <= 1 && enemies.length) {
      for (let i = 0; i < enemies.length; i++) {
        if (getDistance(tower, enemies[i]) <= tower.currentRange() ** 2) {
          let targetEnemy = -1;
          //-------------------------------------
          if (tower.targetType === 'first') {
            let mostEnemyDistance = 0;
            let enemyDistance = 0;
            enemyDistance = enemies[i].walkedPixels;
            if (enemyDistance > mostEnemyDistance) {
              mostEnemyDistance = enemyDistance;
            }
            targetEnemy = i;
          }
          //-------------------------------------
          if (tower.targetType === 'close') {
            let closesEnemy = 0;
            let closestEnemyDistance = Math.sqrt(Math.pow(indexToPixel(gameSizeY), 2) + Math.pow(indexToPixel(gameSizeX), 2));
            let enemyDistance = null;
            closesEnemy++;
            enemyDistance = Math.sqrt(Math.pow(tower.posX - enemies[i].posX, 2) + Math.pow(tower.posY - enemies[i].posY, 2));
            if (enemyDistance < closestEnemyDistance) {
              closestEnemyDistance = enemyDistance;
            }
            targetEnemy = closesEnemy;
          }
          //-------------------------------------
          if (tower.targetType === 'mostHealth') {
            let mostHealthyEnemy = 0;
            let mostHealthyEnemyHealth = 0;
            let enemyHealth = 0;
            mostHealthyEnemy++;
            enemyHealth = enemies[i].maxHealth;
            if (enemyHealth > mostHealthyEnemyHealth) {
              mostHealthyEnemyHealth = enemyHealth;
            }
            targetEnemy = mostHealthyEnemy;
          }

          if (tower.targetType === 'leastHealth') {
            targetEnemy = leastHealth();
          } else {
            targetEnemy = furthestRange(indexToPixel(tower.posX), indexToPixel(tower.posY));
          }

          const distance = (tower.posX - enemies[targetEnemy].posX) ** 2 + (tower.posY - enemies[targetEnemy].posY) ** 2;
          if (distance <= tower.currentRange() ** 2) {
            if (targetEnemy !== -1) {
              const multishotRate = 0.2 * tower.upgrades.multishotLevel;
              let multishotValue = 0;
              const random = Math.random();
              if (multishotRate > 1) {
                multishotValue = Math.floor(multishotRate);
              }
              if (random <= multishotRate % 1) {
                multishotValue += 1;
              }
              const towerDamage = tower.currentDamage() * (multishotValue + 1);
              enemies[targetEnemy].health -= Math.ceil(towerDamage);
              tower.dealtDamage += Math.ceil(towerDamage);
            }
            if (enemies[targetEnemy].health < 1) {
              player.money += ENEMY_OPTIONS[enemies[targetEnemy].type].strength * 2 * (1 + tower.upgrades.lootingLevel / 10);
              player.exp += ENEMY_OPTIONS[enemies[targetEnemy].type].strength;
              player.money = Math.floor(player.money);
              enemies.splice(targetEnemy, 1);
            }
            targetEnemy = -1;
          }
        }
      }
    }
  }
}

function sellTower(xIndex: number, yIndex: number) {
  const towerIndex = towers.findIndex(a => pixelToIndex(a.posX) === xIndex && pixelToIndex(a.posY) === yIndex);
  document.querySelector('.range')?.remove();
  const type = towers[towerIndex].type;
  if (type !== null) {
    player.money += TOWER_OPTIONS[type].cost * 0.7;
    towers.splice(towerIndex, 1);
  }
  renderTower();
  renderShop();
}

function renderShop() {
  const dispenser = document.querySelector('#dispenser') as HTMLElement;
  const ironGolem = document.querySelector('#ironGolem') as HTMLElement;
  const shopItem = document.querySelectorAll<HTMLElement>('.shopItem');
  const dispenserCost = document.querySelector('#dispenserCost') as HTMLSpanElement;
  const ironGolemCost = document.querySelector('#ironGolemCost') as HTMLSpanElement;
  ironGolemCost.innerHTML = `${TOWER_OPTIONS.ironGolem.cost + 5 * towers.length}`;
  dispenserCost.innerHTML = `${TOWER_OPTIONS.dispenser.cost + 5 * towers.length}`;
  shopItem.forEach(a => {
    a.setAttribute('style', 'background-color:#0000005d');
  });
  if (selectedTower.type === 'dispenser') {
    dispenser.setAttribute('style', 'background-color:red;');
  } else if (selectedTower.type === 'ironGolem') {
    ironGolem.setAttribute('style', 'background-color:red;');
  }
  dispenser.onclick = () => {
    if (selectedTower.type === null) {
      selectedTower.type = 'dispenser';
    } else {
      selectedTower.type = null;
    }
    renderShop();
  };
  ironGolem.onclick = () => {
    if (selectedTower.type === null) {
      selectedTower.type = 'ironGolem';
    } else {
      selectedTower.type = null;
    }
    renderShop();
  };
}

function openTowerMenu(x: number, y: number, tower: Tower) {
  const menuItem = document.querySelectorAll<HTMLElement>('.menuItem');
  menuItem.forEach(a => {
    a.setAttribute('style', 'background-color:#0000005d');
  });
  for (const stat of ['damage', 'attackSpeed', 'range', 'multishot', 'looting'] as const) {
    (document.querySelector('#' + stat) as HTMLElement).onclick = () => {
      if (player.level >= tower.upgrades[`${stat}Level`]) {
        player.level -= tower.upgrades[`${stat}Level`];
        tower.upgrades[`${stat}Level`]++;
        renderRange(tower);
      }
    };
  }
  const towerMenuObject7 = document.querySelector('#towerObject7 ') as HTMLElement;
  towerMenuObject7.onclick = () => {
    tower.targetType = 'first';
  };
  const towerMenuObject8 = document.querySelector('#towerObject8') as HTMLElement;
  towerMenuObject8.onclick = () => {
    tower.targetType = 'mostHealth';
  };
  const towerMenuObject9 = document.querySelector('#towerObject9') as HTMLElement;
  towerMenuObject9.onclick = () => {
    tower.targetType = 'close';
  };
  const towerMenuObject10 = document.querySelector('#towerObject10') as HTMLElement;
  towerMenuObject10.onclick = () => {
    tower.targetType = 'furthest';
  };
  const towerMenuObject11 = document.querySelector('#towerObject11') as HTMLDivElement;
  towerMenuObject11.onclick = () => {
    tower.targetType = 'leastHealth';
  };
  const towerMenuObject12 = document.querySelector('#towerObject12') as HTMLElement;
  towerMenuObject12.onclick = () => {
    sellTower(x, y);
  };
}

function placeTower(indexX: number, indexY: number) {
  if (path.find(a => a.positionX === indexX && a.positionY === indexY) || selectedTower.type === null) {
    return;
  }

  if (player.money > TOWER_OPTIONS[selectedTower.type].cost + 5 * towers.length) {
    player.money -= TOWER_OPTIONS[selectedTower.type].cost + 5 * towers.length;
    towers.push({
      ...TOWER_OPTIONS[selectedTower.type],
      posX: indexToPixel(indexX),
      posY: indexToPixel(indexY),
      type: selectedTower.type,
      dealtDamage: 1,
      targetType: 'first',
      attackSpeed: 1,
      multishot: 1,
      looting: 0,
      currentDamage: function () {
        return this.damage + this.upgrades.damageLevel * 0.5;
      },
      currentRange: function () {
        return this.range + this.upgrades.rangeLevel * this.range * 0.1;
      },
      upgrades: {
        attackSpeedLevel: 1,
        damageLevel: 1,
        lootingLevel: 1,
        multishotLevel: 1,
        rangeLevel: 1,
      },
    });
    selectedTower.type = null;
    renderShop();
    renderTower();
  }
}
//-------------------Type-Script-Bullshit-----------------------
declare global {
  interface Window {
    game: () => void;
  }
}
window.game = game;
