(function(window) {

  let constants;
  let monsters;
  let pack;

  if (self) {
    constants = self.adRando.constants;
    monsters = self.adRando.monsters;
    pack = self.adRando.pack;
  } else {
    constants = require('../constants');
    monsters = require('../monsters');
    pack = require('./pack');
  }

  const tilesPerAxis = 64;
  const urlText = window.location.href;
  const urlBase = window.location.href.match('.*/');
  const clearURL = new URL(urlBase + 'clear.png');
  const clearNumberURLs = [new URL(urlBase + 'clear0.png'), new URL(urlBase + 'clear1.png'), new URL(urlBase + 'clear2.png'), new URL(urlBase + 'clear3.png')]
  const standardBackgroundColor = 'background-color:#044020';
  const minPossibleHeight = -32768;
  const maxPossibleHeight = 32767;
  const minQuality = -99;
  const maxQuality = 99;
  const itemUnidentified = 0x80;
  const itemIdentified = 0xff ^ itemUnidentified;
  const itemCursed = 0x40;
  const itemUncursed = 0xff ^ itemCursed;

  const elems = {}

  let floor = {
    rooms: [],
    elevators: [],
    items: [],
    traps: [],
    monsters: [],
    tiles: [],
  };
  let pageIsSetUp = false;

  let minHeight = minPossibleHeight;
  let maxHeight = maxPossibleHeight;

  const appearances = {
    void:         0x00,
    elevator:     0x01,
    skewElevator: 0x02,
    mapBoundary:  0x03,
    bush:         115,
  }

  const statuses = {
    water:        0x400,
    noSpawns:     0x4000,
    noTile:       0x8000,
  }

  function getXCoord() {
    return elems.xCoord.value & 0xff;
  }

  function getYCoord() {
    return elems.yCoord.value & 0xff;
  }

  function isCoordValid(coord) {
    return coord >= 0 && coord < tilesPerAxis && Math.round(coord) === coord;
  }

  function areCoordsValid(xCoord, yCoord) {
    return isCoordValid(xCoord) && isCoordValid(yCoord);
  }

  function getEditMode() {
    return document.querySelector('input[name="edit-mode"]:checked').value;
  }

  function getViewMode() {
    return document.querySelector('input[name="view-mode"]:checked').value;
  }

  function getHeight() {
    return parseInt(document.getElementById('tile-height').value);
  }

  function getAppearance() {
    return parseInt(document.getElementById('tile-appearance').value);
  }

  function getTileStatus() {
    return (document.getElementById('status-no-tile').checked ? statuses.noTile : 0) |
    (document.getElementById('status-no-spawns').checked ? statuses.noSpawns : 0) |
    (document.getElementById('status-water').checked ? statuses.water : 0);
  }

  function getTileElemByCoords(xCoord, yCoord) {
    xCoord = xCoord & 0xff;
    yCoord = yCoord & 0xff;
    if (!areCoordsValid(xCoord, yCoord)) {
      return undefined;
    }
    const tileNumber = xCoord + tilesPerAxis * yCoord;
    return document.getElementById('tile-'+tileNumber);
  }

  function getFloorTileByCoords(xCoord, yCoord) {
    xCoord = xCoord & 0xff;
    yCoord = yCoord & 0xff;
    if (!areCoordsValid(xCoord, yCoord)) {
      return undefined;
    }
    let fTile;
    let foundMatch = false;
    //first attempt to find directly if ordered
    const tileNumber = xCoord + tilesPerAxis * yCoord;
    fTile = floor.tiles[tileNumber];
    if (fTile.xCoord == xCoord && fTile.yCoord == yCoord) {
      return fTile;
    }
    for (fTile of floor.tiles) {
      if (fTile.xCoord == xCoord && fTile.yCoord == yCoord) {
        foundMatch = true;
        break;
      }
    }
    return foundMatch ? fTile : undefined;
  }

  function recalculateMinMaxHeight() {
    let newMinHeight = 0;
    let newMaxHeight = 0;
    for (let fTile of floor.tiles) {
      if (fTile.appearance != 0 && fTile.appearance != 3) {
        if (fTile.height < newMinHeight) {
          newMinHeight = fTile.height
        } else if (fTile.height > newMaxHeight) {
          newMaxHeight = fTile.height
        }
      }
    }
    minHeight = newMinHeight;
    maxHeight = newMaxHeight;
  }

  function ensureHexStringHasTwoDigits(hexString) {
    if (hexString.length < 2) {
      return '0'+hexString;
    }
    return hexString;
  }

  function updateVisibleTile(eTile, fTile, recalc) {
    const viewMode = getViewMode();
    switch (viewMode) {
      case "appearance":
        const newSrc = new URL(urlBase + 'tiles/Appr'+fTile.appearance+'.png');
        eTile.src = newSrc;
        eTile.alt = '';
        break;
      case "height":
        if (recalc) {
          recalculateMinMaxHeight();
        }
        eTile.src = clearURL;
        if (fTile.appearance == 0 || fTile.appearance == 3) {
          eTile.style = 'background-color:black';
        } else if (fTile.height == 0) {
          eTile.style = 'background-color:blue';
        } else if (fTile.height > 0) {
          const scale = Math.round(255 * fTile.height / maxHeight) & 0xff;
          const gValue = ensureHexStringHasTwoDigits(scale.toString(16));
          const bValue = ensureHexStringHasTwoDigits((255 - scale).toString(16));
          eTile.style = 'background-color:#00'+gValue+bValue;
        } else {
          const scale = Math.round(255 * fTile.height / minHeight) & 0xff;
          const rValue = ensureHexStringHasTwoDigits(scale.toString(16));
          const bValue = ensureHexStringHasTwoDigits((255 - scale).toString(16));
          eTile.style = 'background-color:#'+rValue+'00'+bValue;
        }
        break;
      case "rooms":
        eTile.src = clearURL;
        if (fTile.appearance == 0 || fTile.appearance == 3) {
          eTile.style = 'background-color:black';
          eTile.alt = 'Empty';
        } else {
          eTile.style = standardBackgroundColor;
          eTile.alt = 'Hallway';
          roomLoop:
          for (let room of floor.rooms) {
            for (let waypoint of room.waypoints) {
              if (fTile.xCoord == waypoint.xCoord && fTile.yCoord == waypoint.yCoord) {
                eTile.style = 'background-color:green';
                eTile.alt = 'waypoint-'+waypoint.relativeHeight;
                if (Number.isInteger(waypoint.relativeHeight) && waypoint.relativeHeight >= 0 && waypoint.relativeHeight < clearNumberURLs.length) {
                  eTile.src = clearNumberURLs[waypoint.relativeHeight];
                }
                break roomLoop;
              }
            }
            for (let yOffset = 0; yOffset < room.ySize; yOffset++) {
              for (let xOffset = 0; xOffset < room.xSize; xOffset++) {
                if (fTile.xCoord == (room.xCoord + xOffset) && fTile.yCoord == (room.yCoord + yOffset)) {
                  eTile.style = 'background-color:red';
                  eTile.alt = 'Room';
                  break roomLoop;
                }
              }
            }
          }
        }
        break;
      case "elevators":
      case "items":
      case "traps":
      case "monsters":
        eTile.src = clearURL;
        if (fTile.appearance == 0 || fTile.appearance == 3) {
          eTile.style = 'background-color:black';
          eTile.alt = 'Empty';
        } else {
          eTile.style = standardBackgroundColor;
          eTile.alt = 'No ' + viewMode;
          for (let floorObject of floor[viewMode]) {
            if (fTile.xCoord == floorObject.xCoord && fTile.yCoord == floorObject.yCoord) {
              switch (viewMode) {
                case "elevators":
                  eTile.style = 'background-color:green';
                  eTile.alt = 'Elevator';
                  break;
                case "items":
                  eTile.style = 'background-color:blue';
                  eTile.alt = 'Item';
                  break;
                case "traps":
                  eTile.style = 'background-color:fuchsia';
                  eTile.alt = 'Trap';
                  break;
                case "monsters":
                  eTile.style = 'background-color:red';
                  eTile.alt = 'Monster';
                  break;
              }
              break;
            }
          }
        }
        break;
    }
  }

  function updateVisibleByCoords(xCoord, yCoord) {
    const eTile = getTileElemByCoords(xCoord, yCoord);
    const fTile = getFloorTileByCoords(xCoord, yCoord);
    if (eTile != undefined && fTile != undefined) {
      updateVisibleTile(eTile, fTile, false);
    }
  }

  function makeTilesReflectViewMode() {
    if (floor === null) {
      return;
    }
    let firstTile = true;
    for (const tile of floor.tiles) {
      const sTile = getTileElemByCoords(tile.xCoord, tile.yCoord);
      if (sTile != undefined) {
        updateVisibleTile(sTile, tile, firstTile);
      }
      firstTile = false;
    }
  }

  function makeTileReflectValues(xCoord, yCoord) {
    const fTile = getFloorTileByCoords(xCoord, yCoord);
    const sTile = getTileElemByCoords(xCoord, yCoord);
    if (fTile != undefined && sTile != undefined) {
      const appearance = getAppearance();
      if (appearance != undefined) {
        fTile.appearance = appearance;
      }
      const height = getHeight();
      if (height != undefined) {
        fTile.height = height;
      }
      const tileStatus = getTileStatus();
      if (tileStatus != undefined) {
        fTile.status = tileStatus;
      }
      updateVisibleTile(sTile, fTile, true);
    }
  }

  function makeValuesReflectTile(xCoord, yCoord) {
    const fTile = getFloorTileByCoords(xCoord, yCoord);
    if (fTile != undefined) {
      document.getElementById('tile-appearance').value = fTile.appearance;
      document.getElementById('tile-height').value = fTile.height;
      document.getElementById('status-no-tile').checked = !!(fTile.status & statuses.noTile);
      document.getElementById('status-no-spawns').checked = !!(fTile.status & statuses.noSpawns);
      document.getElementById('status-water').checked = !!(fTile.status & statuses.water);
    }
  }

  function setCoords(x, y) {
    document.getElementById('x-coord').value = x;
    document.getElementById('y-coord').value = y;
  }

  function processImport() {
    makeTilesReflectViewMode();
    document.getElementById('spawns-items').checked = floor.spawnRandomItems;
    document.getElementById('spawns-traps').checked = floor.spawnRandomTraps;
    document.getElementById('spawns-monsters').checked = floor.spawnRandomMonsters;
  }

  function tileHandler(event) {
    const sTile = event.target;
    setCoords(sTile.xCoord, sTile.yCoord);
    coordChangeHandler(event);
    switch (getEditMode()) {
      case "select":
        makeValuesReflectTile(sTile.xCoord, sTile.yCoord);
        break;
      case "apply":
        makeTileReflectValues(sTile.xCoord, sTile.yCoord);
        break;
    }
  }

  function viewModeHandler(event) {
    makeTilesReflectViewMode();
    event.preventDefault();
    event.stopPropagation();
  }

  function appearanceChangeHandler(_event) {
    let appearance = Math.round(getAppearance());
    if (appearance < appearances.void) {
      appearance = appearances.void;
      document.getElementById('tile-appearance').value = appearance;
    } else if (appearance > appearances.bush) {
      appearance = appearances.bush;
      document.getElementById('tile-appearance').value = appearance;
    }
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    const eTile = getTileElemByCoords(xCoord, yCoord);
    const fTile = getFloorTileByCoords(xCoord, yCoord);
    if (!!eTile && !!fTile) {
      const appearanceDiffers = fTile.appearance != appearance;
      fTile.appearance = appearance;
      if (appearanceDiffers && getViewMode() === "appearance") {
        updateVisibleTile(eTile, fTile, false);
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function heightChangeHandler(_event) {
    let height = getHeight();
    if (height < minPossibleHeight) {
      height = minPossibleHeight;
      document.getElementById('tile-height').value = height;
    } else if (height > maxPossibleHeight) {
      height = maxPossibleHeight;
      document.getElementById('tile-height').value = height;
    }
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    const eTile = getTileElemByCoords(xCoord, yCoord);
    const fTile = getFloorTileByCoords(xCoord, yCoord);
    if (!!eTile && !!fTile) {
      const heightDiffers = fTile.height != height;
      fTile.height = height;
      if (heightDiffers && getViewMode() === "height") {
        updateVisibleTile(eTile, fTile, true);
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function changeSpawnsHandler(event) {
    if (floor === null) {
      return;
    }
    floor.spawnRandomItems = !!document.getElementById('spawns-items').checked;
    floor.spawnRandomTraps = !!document.getElementById('spawns-traps').checked;
    floor.spawnRandomMonsters = !!document.getElementById('spawns-monsters').checked;
    event.preventDefault();
    event.stopPropagation();
  }

  function coordChangeHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      makeRoomMatchCoords(xCoord, yCoord);
      makeElevatorMatchCoords(xCoord, yCoord);
      makeItemMatchCoords(xCoord, yCoord);
      makeTrapMatchCoords(xCoord, yCoord);
      makeMonsterMatchCoords(xCoord, yCoord);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function setElevatorEnabled(enabled) {
    elems.tileElevatorType.disabled = !enabled;
    elems.tileElevatorType.value = 0;
  }

  function setItemEnabled(enabled) {
    elems.tileItemId.disabled = !enabled;
    elems.tileItemId.value = enabled ? 1 : "";
    elems.tileItemCategory.disabled = !enabled;
    elems.tileItemCategory.value = enabled ? 1 : "";
    elems.tileItemQuality.disabled = !enabled;
    elems.tileItemQuality.value = enabled ? 0 : "";
    elems.tileItemUnidentified.disabled = !enabled;
    elems.tileItemCursed.disabled = !enabled;
    if (!enabled) {
      elems.tileItemUnidentified.checked = false;
      elems.tileItemCursed.checked = false;
    }
  }

  function setTrapEnabled(enabled) {
    elems.tileTrapId.disabled = !enabled;
    elems.tileTrapId.value = enabled ? 1 : "";
    elems.tileTrapLevel.disabled = !enabled;
    elems.tileTrapLevel.value = enabled ? 0 : "";
    elems.tileTrapHidden.disabled = !enabled;
    elems.tileTrapNotAttackable.disabled = !enabled;
    if (!enabled) {
      elems.tileTrapHidden.value = false;
      elems.tileTrapNotAttackable.value = false;
      elems.tileTrapLevel.hidden = true;
    }
  }

  function setMonsterEnabled(enabled) {
    elems.tileMonsterId.disabled = !enabled;
    elems.tileMonsterId.value = enabled ? 1 : "";
    elems.tileMonsterLevel.disabled = !enabled;
    elems.tileMonsterLevel.value = enabled ? 1 : "";
  }

  function setRoomEnabled(enabled) {
    elems.tileRoomXSize.disabled = !enabled;
    elems.tileRoomXSize.value = enabled ? 1 : "";
    elems.tileRoomYSize.disabled = !enabled;
    elems.tileRoomYSize.value = enabled ? 1 : "";
  }

  function makeElevatorMatchCoords(xCoord, yCoord) {
    let foundMatch = false;
    for (let elevator of floor.elevators) {
      if (elevator.xCoord === xCoord && elevator.yCoord === yCoord) {
        foundMatch = true;
        if (!elems.tileElevator.checked) {
          elems.tileElevator.checked = true;
          setElevatorEnabled(true);
        }
        elems.tileElevatorType.value = !!elevator.type ? elevator.type : 0; //FIXME
      }
    }
    if (!foundMatch && !!elems.tileElevator.checked) {
      elems.tileElevator.checked = false;
      setElevatorEnabled(false);
    }
  }

  function makeItemMatchCoords(xCoord, yCoord) {
    let foundMatch = false;
    for (let item of floor.items) {
      if (item.xCoord === xCoord && item.yCoord === yCoord) {
        foundMatch = true;
        if (!elems.tileItem.checked) {
          elems.tileItem.checked = true;
          setItemEnabled(true);
        }
        elems.tileItemId.value = item.id;
        elems.tileItemCategory.value = item.category;
        elems.tileItemQuality.value = item.quality;
        elems.tileItemUnidentified.checked = item.status & itemUnidentified !== 0;
        elems.tileItemCursed.checked = item.status & itemCursed !== 0;
      }
    }
    if (!foundMatch && !!elems.tileItem.checked) {
      elems.tileItem.checked = false;
      setItemEnabled(false);
    }
  }

  function makeTrapMatchCoords(xCoord, yCoord) {
    let foundMatch = false;
    for (let trap of floor.traps) {
      if (trap.xCoord === xCoord && trap.yCoord === yCoord) {
        foundMatch = true;
        if (!elems.tileTrap.checked) {
          elems.tileTrap.checked = true;
          setTrapEnabled(true);
        }
        elems.tileTrapId.value = trap.id;
        elems.tileTrapHidden.checked = trap.status & itemUnidentified !== 0;
        elems.tileTrapNotAttackable.checked = trap.status & itemCursed !== 0;
        elems.tileTrapLevel.hidden = trap.id != constants.TRAP_TYPES.monsterDen;
        elems.tileTrapLevel.value = trap.level;
      }
    }
    if (!foundMatch && !!elems.tileTrap.checked) {
      elems.tileTrap.checked = false;
      setTrapEnabled(false);
    }
  }

  function makeMonsterMatchCoords(xCoord, yCoord) {
    let foundMatch = false;
    for (let monster of floor.monsters) {
      if (monster.xCoord === xCoord && monster.yCoord === yCoord) {
        foundMatch = true;
        if (!elems.tileMonster.checked) {
          elems.tileMonster.checked = true;
          setMonsterEnabled(true);
        }
        elems.tileMonsterId.value = monster.id;
        elems.tileMonsterLevel.value = monster.level;
      }
    }
    if (!foundMatch && !!elems.tileMonster.checked) {
      elems.tileMonster.checked = false;
      setMonsterEnabled(false);
    }
  }

  function makeRoomMatchCoords(xCoord, yCoord) {
    let foundMatch = false;
    for (let room of floor.rooms) {
      if (room.xCoord === xCoord && room.yCoord === yCoord) {
        foundMatch = true;
        if (!elems.tileRoom.checked) {
          elems.tileRoom.checked = true;
          setRoomEnabled(true);
        }
        elems.tileRoomXSize.value = room.xSize;
        elems.tileRoomYSize.value = room.ySize;
      }
    }
    if (!foundMatch && !!elems.tileRoom.checked) {
      elems.tileRoom.checked = false;
      setRoomEnabled(false);
    }
  }

  function tileElevatorHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      setElevatorEnabled(!!elems.tileElevator.checked);
      if (elems.tileElevator.checked) {
        const elevator = {
          xCoord: xCoord,
          yCoord: yCoord,
          type: 0
        };
        floor.elevators.push(elevator);
      } else {
        floor.elevators = floor.elevators.filter(function(elevator) {
          elevator.xCoord != xCoord || elevator.yCoord != yCoord
        });
      }
      updateVisibleByCoords(xCoord, yCoord);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileElevatorTypeHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let elevator of floor.elevators) {
        if (elevator.xCoord == xCoord && elevator.yCoord == yCoord) {
          elevator.type = elems.tileElevatorType.value & 0xff;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileItemHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      setItemEnabled(!!elems.tileItem.checked);
      if (elems.tileItem.checked) {
        const item = {
          xCoord: xCoord,
          yCoord: yCoord,
          id: elems.tileItemId.value & 0xff,
          category: elems.tileItemCategory.value & 0xff,
          quality: elems.tileItemQuality.value & 0xff,
          status: 0,
        };
        floor.items.push(item);
      } else {
        floor.items = floor.items.filter(function(item) {
          item.xCoord != xCoord || item.yCoord != yCoord
        });
      }
      updateVisibleByCoords(xCoord, yCoord);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileItemIdHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    const minItemId = 1;
    const maxItemId = 0x2d;
    let itemId = elems.tileItemId.value & 0xff;
    if (itemId > maxItemId) {
      itemId = maxItemId;
    } else if (itemId < minItemId) {
      itemId = minItemId;
    }
    if (areCoordsValid(xCoord, yCoord)) {
      for (let item of floor.items) {
        if (item.xCoord == xCoord && item.yCoord == yCoord) {
          item.id = itemId;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileItemCategoryHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let item of floor.items) {
        if (item.xCoord == xCoord && item.yCoord == yCoord) {
          item.category = elems.tileItemCategory.value & 0xff;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileItemQualityHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    let itemQuality = elems.tileItemQuality.value & 0xff;
    if (itemQuality > maxQuality) {
      itemQuality = maxQuality;
    } else if (itemQuality < minQuality) {
      itemQuality = minQuality;
    }
    if (areCoordsValid(xCoord, yCoord)) {
      for (let item of floor.items) {
        if (item.xCoord == xCoord && item.yCoord == yCoord) {
          item.quality = itemQuality;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileItemUnidentifiedHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let item of floor.items) {
        if (item.xCoord == xCoord && item.yCoord == yCoord) {
          item.status = elems.tileItemUnidentified.checked ? item.status | itemUnidentified : item.status & itemIdentified;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileItemCursedHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let item of floor.items) {
        if (item.xCoord == xCoord && item.yCoord == yCoord) {
          item.status = elems.tileItemCursed.checked ? item.status | itemCursed : item.status & itemUnidentified;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileTrapHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      setTrapEnabled(!!elems.tileTrap.checked);
      if (elems.tileTrap.checked) {
        const trap = {
          xCoord: xCoord,
          yCoord: yCoord,
          id: elems.tileTrapId.value & 0xff,
          status: 0,
          level: elems.tileTrapLevel.value & 0xff,         
        };
        floor.traps.push(trap);
      } else {
        floor.traps = floor.traps.filter(function(trap) {
          trap.xCoord != xCoord || trap.yCoord != yCoord
        });
      }
      updateVisibleByCoords(xCoord, yCoord);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileTrapIdHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    const trapId = elems.tileTrapId.value & 0xff;
    if (areCoordsValid(xCoord, yCoord)) {
      for (let trap of floor.traps) {
        if (trap.xCoord == xCoord && trap.yCoord == yCoord) {
          trap.id = trapId;
        }
      }
      if (trapId === constants.TRAP_TYPES.monsterDen) {
        elems.tileTrapLevel.hidden = false;
      } else {
        elems.tileTrapLevel.hidden = true;
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileTrapHiddenHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let trap of floor.traps) {
        if (trap.xCoord == xCoord && trap.yCoord == yCoord) {
          trap.status = elems.tileTrapHidden.checked ? trap.status | 0x80 : trap.status & 0x7f;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileTrapNotAttackableHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let trap of floor.traps) {
        if (trap.xCoord == xCoord && trap.yCoord == yCoord) {
          trap.status = elems.tileTrapNotAttackable.checked ? trap.status | 0x40 : trap.status & 0xbf;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileTrapLevelHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let trap of floor.traps) {
        if (trap.xCoord == xCoord && trap.yCoord == yCoord) {
          trap.level = elems.tileTrapLevel.value & 0xff;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileMonsterHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      setMonsterEnabled(!!elems.tileMonster.checked);
      if (elems.tileMonster.checked) {
        const monster = {
          xCoord: xCoord,
          yCoord: yCoord,
          id: elems.tileMonsterId.value & 0xff,
          level: elems.tileMonsterLevel.value & 0xff,         
        };
        floor.monsters.push(monster);
      } else {
        floor.monsters = floor.monsters.filter(function(monster) {
          monster.xCoord != xCoord || monster.yCoord != yCoord
        });
      }
      updateVisibleByCoords(xCoord, yCoord);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileMonsterIdHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      for (let monster of floor.monsters) {
        if (monster.xCoord == xCoord && monster.yCoord == yCoord) {
          monster.id = elems.tileMonsterId.value & 0xff;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileMonsterLevelHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    let monsterLevel = elems.tileMonsterLevel.value & 0xff;
    if (monsterLevel > maxQuality) {
      monsterLevel = maxQuality;
    } else if (monsterLevel < 1) {
      monsterLevel = 1;
    }
    if (areCoordsValid(xCoord, yCoord)) {
      for (let monster of floor.monsters) {
        if (monster.xCoord == xCoord && monster.yCoord == yCoord) {
          monster.level = elems.tileMonsterLevel.value & 0xff;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileRoomHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      setRoomEnabled(!!elems.tileRoom.checked);
      if (elems.tileRoom.checked) {
        const room = {
          xCoord: xCoord,
          yCoord: yCoord,
          xSize: elems.tileRoomXSize.value & 0xff,
          ySize: elems.tileRoomYSize.value & 0xff,
          waypoints: []
        };
        floor.rooms.push(room);
        updateVisibleByCoords(xCoord, yCoord);
      } else {
        floor.rooms = floor.rooms.filter(function(room) {
          room.xCoord != xCoord || room.yCoord != yCoord
        });
        makeTilesReflectViewMode();
      }
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function tileRoomXSizeHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      if (xCoord + parseInt(elems.tileRoomXSize.value) > tilesPerAxis) {
        elems.tileRoomXSize.value = tilesPerAxis - xCoord;
      }
      for (let room of floor.rooms) {
        if (room.xCoord == xCoord && room.yCoord == yCoord) {
          room.xSize = parseInt(elems.tileRoomXSize.value);
        }
      }
    }
    makeTilesReflectViewMode();
    event.preventDefault();
    event.stopPropagation();
  }

  function tileRoomYSizeHandler(event) {
    const xCoord = getXCoord();
    const yCoord = getYCoord();
    if (areCoordsValid(xCoord, yCoord)) {
      if (yCoord + parseInt(elems.tileRoomYSize.value) > tilesPerAxis) {
        elems.tileRoomYSize.value = tilesPerAxis - yCoord;
      }
      for (let room of floor.rooms) {
        if (room.xCoord == xCoord && room.yCoord == yCoord) {
          room.ySize = parseInt(elems.tileRoomYSize.value);
        }
      }
    }
    makeTilesReflectViewMode();
    event.preventDefault();
    event.stopPropagation();
  }

  function importFileHandler(event) {
    const importFileField = document.getElementById('import-file');
    if (importFileField.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
        const importExportField = document.getElementById('import-export');
        importExportField.value = this.result;
        floor = JSON.parse(importExportField.value);
        processImport();
      }
      reader.readAsText(importFileField.files[0]);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function importTextHandler(event) {
    const importExportField = document.getElementById('import-export');
    floor = JSON.parse(importExportField.value);
    processImport();
    event.preventDefault();
    event.stopPropagation();
  }

  function exportTextHandler(event) {
    const importExportTextbox = document.getElementById('import-export');
    importExportTextbox.value = JSON.stringify(floor);
    event.preventDefault();
    event.stopPropagation();
  }

  function exportFileHandler(event) {
    const urlDownload = URL.createObjectURL(new Blob([JSON.stringify(floor)], {
      type: 'text/json; charset=UTF-8',
    }));
    const downloadFileElem = document.getElementById('download-file');
    downloadFileElem.href = urlDownload;
    downloadFileElem.download = 'customFloor.json';
    downloadFileElem.click();
    URL.revokeObjectURL(urlDownload);
    event.preventDefault();
    event.stopPropagation();
  }

  function exportBinHandler(event) {
    const exportBytes = pack.writeFloor(floor);
    const urlDownload = URL.createObjectURL(new Blob([exportBytes.data], {
      type: 'application/octet-binary',
    }));
    const binFileElem = document.getElementById('bin-file');
    binFileElem.href = urlDownload;
    binFileElem.download = 'customFloor.bin';
    binFileElem.click();
    URL.revokeObjectURL(urlDownload);
    event.preventDefault();
    event.stopPropagation();
  }

  function keyPressHandler(event) {
    const keyCode = event.which;
    if (keyCode != null) {
      const keyString = String.fromCharCode(keyCode);
      switch (keyString) {
      case "a":
        document.getElementById('apply-mode').click();
        break;
      case "s":
        document.getElementById('select-mode').click();
        break;
      }
    }
  }

  function setUpPage() {
    document.onkeypress = keyPressHandler;
    const floorArea = document.getElementById('floor-area');
    tileNumber = 0;
    for (row = 0; row < tilesPerAxis; row++) {
      const tileRow = document.createElement('div');
      tileRow.className = 'tile-row';
      for (tileIndex = 0; tileIndex < tilesPerAxis; tileIndex++) {
        const tile = document.createElement('input');
        tile.type = 'image';
        tile.src = 'tiles/Appr0.png'
        tile.tileNumber = tileNumber;
        tile.id = 'tile-' + tileNumber;
        tile.className = 'floor-tile';
        tile.xCoord = tileIndex;
        tile.yCoord = row;
        tile.addEventListener('click', tileHandler);
        tileRow.appendChild(tile);
        floor.tiles[tileNumber++] = {xCoord: tile.xCoord, yCoord: tile.yCoord, appearance: 0, height: 0, status: 0};
      }
      floorArea.appendChild(tileRow);
    }
    const trapIdElem = document.getElementById('tile-trap-id');
    Object.getOwnPropertyNames(constants.TRAP_TYPES).forEach(function(trap) {
      if (constants.TRAP_TYPES[trap] !== 0) {
        const option = document.createElement('option');
        option.value = constants.TRAP_TYPES[trap];
        option.id = 'trap-' +trap;
        option.innerText = trap[0].toUpperCase() + trap.substring(1);
        trapIdElem.appendChild(option);
      }
    })
    const monsterIdElem = document.getElementById('tile-monster-id');
    monsters.allMonsters.forEach(function(monster) {
      const option = document.createElement('option');
      option.value = monster.ID;
      option.id = 'monster-' + monster.name;
      option.innerText = monster.name;
      monsterIdElem.appendChild(option);
    })

    elems.xCoord = document.getElementById('x-coord');
    elems.yCoord = document.getElementById('y-coord');
    elems.tileElevator = document.getElementById('tile-elevator');
    elems.tileElevatorType = document.getElementById('tile-elevator-type');
    elems.tileItem = document.getElementById('tile-item');
    elems.tileItemId = document.getElementById('tile-item-id');
    elems.tileItemCategory = document.getElementById('tile-item-category');
    elems.tileItemQuality = document.getElementById('tile-item-quality');
    elems.tileItemUnidentified = document.getElementById('tile-item-unidentified');
    elems.tileItemCursed = document.getElementById('tile-item-cursed');
    elems.tileTrap = document.getElementById('tile-trap');
    elems.tileTrapId = document.getElementById('tile-trap-id');
    elems.tileTrapHidden = document.getElementById('tile-trap-hidden');
    elems.tileTrapNotAttackable = document.getElementById('tile-trap-not-attackable');
    elems.tileTrapLevel = document.getElementById('tile-trap-level');
    elems.tileMonster = document.getElementById('tile-monster');
    elems.tileMonsterId = document.getElementById('tile-monster-id');
    elems.tileMonsterLevel = document.getElementById('tile-monster-level');
    elems.tileRoom = document.getElementById('tile-room');
    elems.tileRoomXSize = document.getElementById('tile-room-x-size');
    elems.tileRoomYSize = document.getElementById('tile-room-y-size');

    document.getElementById('tile-appearance').addEventListener('change', appearanceChangeHandler);
    document.getElementById('tile-height').addEventListener('change', heightChangeHandler);
    document.getElementById('import-file').addEventListener('change', importFileHandler);
    document.getElementById('import-text').addEventListener('click', importTextHandler);
    document.getElementById('export-text').addEventListener('click', exportTextHandler);
    document.getElementById('export-file').addEventListener('click', exportFileHandler);
    document.getElementById('export-bin').addEventListener('click', exportBinHandler);
    document.getElementById('appearance-mode').addEventListener('change', viewModeHandler);
    document.getElementById('height-mode').addEventListener('change', viewModeHandler);
    document.getElementById('rooms-mode').addEventListener('change', viewModeHandler);
    document.getElementById('elevators-mode').addEventListener('change', viewModeHandler);
    document.getElementById('items-mode').addEventListener('change', viewModeHandler);
    document.getElementById('traps-mode').addEventListener('change', viewModeHandler);
    document.getElementById('monsters-mode').addEventListener('change', viewModeHandler);
    document.getElementById('spawns-items').addEventListener('change', changeSpawnsHandler);
    document.getElementById('spawns-traps').addEventListener('change', changeSpawnsHandler);
    document.getElementById('spawns-monsters').addEventListener('change', changeSpawnsHandler);

    elems.xCoord.addEventListener('change', coordChangeHandler);
    elems.yCoord.addEventListener('change', coordChangeHandler);
    elems.tileElevator.addEventListener('change', tileElevatorHandler);
    elems.tileElevatorType.addEventListener('change', tileElevatorTypeHandler);
    elems.tileItem.addEventListener('change', tileItemHandler);
    elems.tileItemId.addEventListener('change', tileItemIdHandler);
    elems.tileItemCategory.addEventListener('change', tileItemCategoryHandler);
    elems.tileItemQuality.addEventListener('change', tileItemQualityHandler);
    elems.tileItemUnidentified.addEventListener('change', tileItemUnidentifiedHandler);
    elems.tileItemCursed.addEventListener('change', tileItemCursedHandler);
    elems.tileTrap.addEventListener('change', tileTrapHandler);
    elems.tileTrapId.addEventListener('change', tileTrapIdHandler);
    elems.tileTrapHidden.addEventListener('change', tileTrapHiddenHandler);
    elems.tileTrapNotAttackable.addEventListener('change', tileTrapNotAttackableHandler);
    elems.tileTrapLevel.addEventListener('change', tileTrapLevelHandler);
    elems.tileMonster.addEventListener('change', tileMonsterHandler);
    elems.tileMonsterId.addEventListener('change', tileMonsterIdHandler);
    elems.tileMonsterLevel.addEventListener('change', tileMonsterLevelHandler);
    elems.tileRoom.addEventListener('change', tileRoomHandler);
    elems.tileRoomXSize.addEventListener('change', tileRoomXSizeHandler);
    elems.tileRoomYSize.addEventListener('change', tileRoomYSizeHandler);
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
  }
})(typeof(window) !== 'undefined' ? window : null)