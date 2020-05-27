(function(window) {
  const tilesPerAxis = 64;
  const urlText = window.location.href;
  const urlBase = window.location.href.match('.*/');
  const clearURL = new URL(urlBase + 'clear.png');
  const clearNumberURLs = [new URL(urlBase + 'clear0.png'), new URL(urlBase + 'clear1.png'), new URL(urlBase + 'clear2.png'), new URL(urlBase + 'clear3.png')]
  const standardBackgroundColor = 'background-color:#044020';
  const minPossibleHeight = -32768;
  const maxPossibleHeight = 32767;
  const NO_SPAWN = 99;

  const TYPE = {
    HERB:     0x1,
    FRUIT:    0x2,
    SEED:     0x3,
    BALL:     0x4,
    SCROLL:   0x5,
    CRYSTAL:  0x6,
    BELL:     0x7,
    GLASSES:  0x8,
    LOUPE:    0x9,
    SAND:     0xA,
    GIFT:     0xB,
    SPECIAL:  0xC,
    QUEST:    0xD,
    COIN:     0xE,
    SWORD:    0xF,
    WAND:     0x10,
    SHIELD:   0x11,
    EGG:      0x12,
    FAMILIAR: 0x13,
    ELEVATOR: 0x14,
    TRAP:     0x15,
  }

  const exportBytes = {
    data: new Uint8Array(0x1000),
    index: 0
  };

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
    return document.getElementById('x-coord').value;
  }

  function getYCoord() {
    return document.getElementById('y-coord').value;
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

  function writeRooms() {
    for (let room of floor.rooms) {
      writeLEUshort(room.xCoord, null);
      writeLEUshort(room.yCoord, null);
      writeLEUshort(room.xSize, null);
      writeLEUshort(room.ySize, null);
      for (let door of room.doors) {
        writeByte(door.xCoord, null);
        writeByte(door.yCoord, null);
        writeLEUshort(door.unk_0, null);
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
    if (floor.doNotSpawnItems) {
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
      writeByte(TYPE.TRAP, null);
      writeByte(trap.status, null);
      writeByte(trap.graphicId, null);
    }
    if (floor.doNotSpawnTraps) {
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
      writeByte(TYPE.FAMILIAR, null);
      writeByte(monster.unk_0, null);
      writeByte(monster.level, null);
    }
    if (floor.doNotSpawnMonsters) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
  }

  function writeTiles() {
  }

  function writeFloor() {
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
    event.preventDefault();
    event.stopPropagation();
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
    
    document.getElementById('tile-appearance').addEventListener('change', appearanceChangeHandler);
    document.getElementById('tile-height').addEventListener('change', heightChangeHandler);
    document.getElementById('import-file').addEventListener('change', importFileHandler);
    document.getElementById('import-text').addEventListener('click', importTextHandler);
    document.getElementById('export-text').addEventListener('click', exportTextHandler);
    document.getElementById('export-file').addEventListener('click', exportFileHandler);
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
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
  }
})(typeof(window) !== 'undefined' ? window : null)