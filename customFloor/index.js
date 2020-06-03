(function(window) {

  let constants;
  let monsters;

  if (self) {
    constants = self.adRando.constants
    monsters = self.adRando.monsters
  } else {
    constants = require('../constants')
    monsters = require('../monsters')
  }

  const tilesPerAxis = 64;
  const urlText = window.location.href;
  const urlBase = window.location.href.match('.*/');
  const clearURL = new URL(urlBase + 'clear.png');
  const clearNumberURLs = [new URL(urlBase + 'clear0.png'), new URL(urlBase + 'clear1.png'), new URL(urlBase + 'clear2.png'), new URL(urlBase + 'clear3.png')]
  const standardBackgroundColor = 'background-color:#044020';
  const minPossibleHeight = -32768;
  const maxPossibleHeight = 32767;
  const NO_SPAWN = 99;
  const minQuality = -99;
  const maxQuality = 99;
  const itemUnidentified = 0x80;
  const itemIdentified = 0xff ^ itemUnidentified;
  const itemCursed = 0x40;
  const itemUncursed = 0xff ^ itemCursed;

  const exportBytes = {
    data: new Uint8Array(0x1000),
    index: 0,
    controlIndex: 0,
    controlByte: 0,
    controlBitIndex: 0,
  };

  const elems = {}

  let floor = null;
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
    if (!areCoordsValid(xCoord, yCoord) || floor === null) {
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
            for (let door of room.doors) {
              if (fTile.xCoord == door.xCoord && fTile.yCoord == door.yCoord) {
                eTile.style = 'background-color:green';
                eTile.alt = 'Door'+door.unk;
                if (Number.isInteger(door.unk) && door.unk >= 0 && door.unk < clearNumberURLs.length) {
                  eTile.src = clearNumberURLs[door.unk];
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

  function fillBytes(toWrite, count) {
    for (let i = 0; i < count; i++){
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
    }
  }

  function writeByte(toWrite, index) {
    if (index === null) {
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
    } else {
      exportBytes.data[index] = toWrite & 0xff;
    }
  }

  function writeUshort(toWrite, index) {
    if (index === null) {
      exportBytes.data[exportBytes.index++] = toWrite >>> 8;
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
    } else {
      exportBytes.data[index] = toWrite >>> 8;
      exportBytes.data[index+1] = toWrite & 0xff;
    }
  }

  function writeLEUshort(toWrite, index) {
    if (index === null) {
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
      exportBytes.data[exportBytes.index++] = toWrite >>> 8;
    } else {
      exportBytes.data[index] = toWrite & 0xff;
      exportBytes.data[index+1] = toWrite >>> 8;
    }
  }

  function writeLEShort(toWrite, index) {
    writeLEUshort(toWrite, index);
  }

  function putTwoBytes(toWrite, index, data) {
    data[index] = toWrite & 0xff;
    data[index+1] = toWrite >>> 8;
  }

  function writeRooms() {
    for (let room of floor.rooms) {
      writeLEUshort(room.xCoord, null);
      writeLEUshort(room.yCoord, null);
      writeLEUshort(room.xSize, null);
      writeLEUshort(room.ySize, null);
      for (let door of room.doors) {
        writeByte(door.xCoord, null);
        writeByte(door.yCoord, null);
        writeLEUshort(door.unk, null);
      }
      writeUshort(0, null);
    }
    fillBytes(0, 8);
  }
  
  function writeElevators() {
    for (let elevator of floor.elevators) {
      writeByte(elevator.xCoord, null);
      writeByte(elevator.yCoord, null);
      writeUshort(0, null);
    }
    writeUshort(0, null);
  }

  function writeItems() {
    let count = 0;
    for (let item of floor.items) {
      if (count++ >= 32) {
        break;
      }
      writeByte(item.xCoord, null);
      writeByte(item.yCoord, null);
      writeByte(item.id, null);
      writeByte(item.category, null);
      writeByte(item.status, null);
      writeByte(item.quality, null);
    }
    if (!floor.spawnRandomItems) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
  }
  
  function writeTraps() {
    let count = 0;
    for (let trap of floor.traps) {
      if (count++ >= 30) {
        break;
      }
      writeByte(trap.xCoord, null);
      writeByte(trap.yCoord, null);
      writeByte(trap.id, null);
      writeByte(constants.TYPE.TRAP, null);
      writeByte(trap.status, null);
      writeByte(trap.graphicId, null);
    }
    if (!floor.spawnRandomTraps) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
    return count;
  }
  
  function writeMonsters(count) {
    for (let monster of floor.monsters) {
      if (count++ >= 31) {
        break;
      }
      writeByte(monster.xCoord, null);
      writeByte(monster.yCoord, null);
      writeByte(monster.id, null);
      writeByte(constants.TYPE.FAMILIAR, null);
      writeByte(monster.unk_0, null);
      writeByte(monster.level, null);
    }
    if (!floor.spawnRandomMonsters) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
  }

  function convertTilesToArray() {
    const bytesPerTile = 6;
    const unpackedSize = tilesPerAxis * tilesPerAxis * bytesPerTile;
    const unpackedFloorTiles = {
      index: 0,
      data: new Uint8Array(unpackedSize),
      straightBytesToReadCount: 0,
      numBytes: unpackedSize,
    };
    for (let tile of floor.tiles) {
      const offset = (tilesPerAxis * tile.yCoord + tile.xCoord) * bytesPerTile;
      putTwoBytes(tile.appearance, offset, unpackedFloorTiles.data);
      putTwoBytes(tile.height, offset + 2, unpackedFloorTiles.data);
      putTwoBytes(tile.status, offset + 4, unpackedFloorTiles.data);
    }
    return unpackedFloorTiles;
  }

  function areAtEnd(src) {
    return src.index === src.numBytes;
  }

  function getNumberOfMatchingBytes(src, fromIndex) {
    let matchingBytes = 0;
    while (src.index + matchingBytes < src.numBytes && matchingBytes < 0x100 &&
      src.data[src.index + matchingBytes] === src.data[fromIndex + matchingBytes]) {
        matchingBytes++;
    }
    return matchingBytes;
  }

  function getLookbackDistance(src) {
    const maxLookbackDistance = 0xfff;
    let optimalLookbackDistance = -1;
    let optimalLookbackDistanceMatchingBytes = 0;
    for (let lookbackDistance = 1; src.index >= lookbackDistance && lookbackDistance <= maxLookbackDistance; lookbackDistance++) {
      if (src.data[src.index] == src.data[src.index - lookbackDistance]) {
        const matchingBytes = getNumberOfMatchingBytes(src, src.index - lookbackDistance);
        if (matchingBytes > optimalLookbackDistanceMatchingBytes) {
          optimalLookbackDistance = lookbackDistance;
          optimalLookbackDistanceMatchingBytes = matchingBytes;
        }
      }
    }
    src.straightBytesToReadCount = optimalLookbackDistanceMatchingBytes;
    return optimalLookbackDistance;
  }

  function pushControlBit(pushedBit) {
    const indexOfLastBitInByte = 7;
    if (exportBytes.controlBitIndex <= 0) {
      console.log("\nWriting control byte " + ensureHexStringHasTwoDigits(exportBytes.controlByte.toString(16)));
      writeByte(exportBytes.controlByte, exportBytes.controlIndex);
      exportBytes.controlIndex = exportBytes.index;
      exportBytes.index++;
      exportBytes.controlByte = pushedBit << indexOfLastBitInByte;
      exportBytes.controlBitIndex = indexOfLastBitInByte;
    } else {
      exportBytes.controlByte >>= 1;
      exportBytes.controlByte |= (pushedBit << indexOfLastBitInByte);
      exportBytes.controlBitIndex--;
    }
  }

  function packData(src) {
    const maxIndex = 8;
    exportBytes.controlIndex= exportBytes.index;
    exportBytes.controlByte= 0;
    exportBytes.controlBitIndex= 0;
   
    let lookbackDistance = 0;
    do {
       /* Read a control byte. For each 0 bit from LS to MS,
        * copy a byte from src to set. If exhaust the control
        * byte, read another. If encounter 1 bit, stop.*/
      while (true) {
        if (areAtEnd(src)) {
          pushControlBit(1);
          pushControlBit(0);
          exportBytes.data[exportBytes.controlIndex] = exportBytes.controlByte >> (maxIndex - exportBytes.controlBitIndex);
          return exportBytes;
        }
        lookbackDistance = getLookbackDistance(src);
        if (src.straightBytesToReadCount > 1) {
          pushControlBit(1);
          break;
        }
        pushControlBit(0);
        exportBytes.data[exportBytes.index++] = src.data[src.index++];
        console.log("new " + ensureHexStringHasTwoDigits(exportBytes.data[exportBytes.index-1].toString(16)));
      }
      console.log("\nLookback " + lookbackDistance + "  repeatCount " + src.straightBytesToReadCount);
  
      if (lookbackDistance > 0x100 || src.straightBytesToReadCount > 5 || src.straightBytesToReadCount == 1) {
        pushControlBit(0);
        if (src.straightBytesToReadCount > 0x11 || src.straightBytesToReadCount <= 2) {
          console.log("        lookbackUshort " + (lookbackDistance << 4).toString(16) + "  ");
          writeUshort(lookbackDistance << 4, null);
          console.log("repeatByte "+ ensureHexStringHasTwoDigits((src.straightBytesToReadCount - 1).toString(16)));
          writeByte(src.straightBytesToReadCount - 1, null);
        } else {
          console.log("        lookback|repeat  "+ ((lookbackDistance << 4) | (src.straightBytesToReadCount - 2)).toString(16));
          writeUshort((lookbackDistance << 4) | (src.straightBytesToReadCount - 2), null);
        }
      } else {
        pushControlBit(1);
        let bytesToReadLess2 = src.straightBytesToReadCount - 2;
        pushControlBit((bytesToReadLess2 & 0x2) >> 1);
        pushControlBit(bytesToReadLess2 & 0x1);
        if (lookbackDistance == 0x100) {
          lookbackDistance = 0;
        }
        console.log("        Bits + repeatByte " + ensureHexStringHasTwoDigits(src.straightBytesToReadCount.toString(16)));
        writeByte(lookbackDistance, null);
      }
      src.index += src.straightBytesToReadCount;
    } while (true);
  }

  function writeTiles() {
    const unpackedTiles = convertTilesToArray();
    packData(unpackedTiles);
  }

  function writeFloor() {
    exportBytes.data.fill(0);
    exportBytes.index= 0;
    exportBytes.controlIndex= 0;
    exportBytes.controlByte= 0;
    exportBytes.controlBitIndex= 0;
    writeLEUshort(6, null);
    writeLEUshort(6, null);
  
    writeRooms();
    writeElevators();
    writeItems();
    writeTraps();
    writeMonsters();
    writeTiles();
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
        elems.tileTrapLevel.value = trap.graphicId;
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
          graphicId: elems.tileTrapLevel.value & 0xff,         
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
          trap.graphicId = elems.tileTrapLevel.value & 0xff;
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
    writeFloor();
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
        tile.id = 'tile-' + tileNumber++;
        tile.className = 'floor-tile';
        tile.xCoord = tileIndex;
        tile.yCoord = row;
        tile.addEventListener('click', tileHandler);
        tileRow.appendChild(tile);
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
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
  }
})(typeof(window) !== 'undefined' ? window : null)