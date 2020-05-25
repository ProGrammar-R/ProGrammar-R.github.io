(function(window) {
  const tilesPerAxis = 64;
  const urlText = window.location.href;
  const urlBase = window.location.href.match('.*/');
  const clearURl = new URL(urlBase + 'clear.png');
  const minPossibleHeight = -32768;
  const maxPossibleHeight = 32767;

  let floor;
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
    switch (getViewMode()) {
      case "appearance":
        const newSrc = new URL(urlBase + 'tiles/Appr'+fTile.appearance+'.png');
        eTile.src = newSrc;
        break;
      case "height":
        if (recalc) {
          recalculateMinMaxHeight();
        }
        eTile.src = clearURl;
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
        eTile.src = clearURl;
        if (fTile.appearance == 0 || fTile.appearance == 3) {
          eTile.style = 'background-color:black';
          eTile.alt = 'Empty';
        } else {
          eTile.style = 'background-color:blue';
          eTile.alt = 'Hallway';
          roomLoop:
          for (let room of floor.rooms) {
            for (let yOffset = 0; yOffset < room.ySize; yOffset++) {
              for (let xOffset = 0; xOffset < room.xSize; xOffset++) {
                if (fTile.xCoord == (room.xCoord + xOffset) && fTile.yCoord == (room.yCoord + yOffset)) {
                  eTile.style = 'background-color:red';
                  eTile.alt = 'Room';
                  break roomLoop;
                }
              }
            }
            for (let door of room.doors) {
              if (fTile.xCoord == door.xCoord && fTile.yCoord == door.yCoord) {
                eTile.style = 'background-color:green';
                eTile.alt = 'Door';
                break;
              }
            }
          }
        }
        break;
    }
  }

  function makeTilesReflectViewMode() {
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

  function importFileHandler(event) {
    const importFileField = document.getElementById('import-file');
    if (importFileField.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
        const importExportField = document.getElementById('import-export');
        importExportField.value = this.result;
        floor = JSON.parse(importExportField.value);
        makeTilesReflectViewMode(); 
      }
      reader.readAsText(importFileField.files[0]);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function importTextHandler(event) {
    const importExportField = document.getElementById('import-export');
    floor = JSON.parse(importExportField.value);
    makeTilesReflectViewMode();
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

  function setUpPage() {
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
        //tile.textContent= '.';
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
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
  }
})(typeof(window) !== 'undefined' ? window : null)