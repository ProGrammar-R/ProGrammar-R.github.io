(function(window) {
  const tilesPerAxis = 64;
  const urlText = window.location.href;
  const urlBase = window.location.href.match('.*/');
  let floor;
  let pageIsSetUp = false;

  const appearances = {
    void:         0x00,
    elevator:     0x01,
    skewElevator: 0x02,
    mapBoundary:  0x03,

  }

  function importTextHandler(event) {
    const importExportField = document.getElementById('import-export');
    floor = JSON.parse(importExportField.value);
    makeTilesReflectText();
    event.preventDefault();
    event.stopPropagation();
  }

  function getEditMode() {
    return document.querySelector('input[name="edit-mode"]:checked').value;
  }

  function getHeight() {
    return document.getElementById('tile-height').value;
  }

  function getAppearance() {
    return document.getElementById('tile-appearance').value;
  }

  function getTileStatus() {
    return document.getElementById('tile-status').value;
  }

  function getTileElemByCoords(xCoord, yCoord) {
    const tileNumber = xCoord + tilesPerAxis * yCoord;
    return document.getElementById('tile-'+tileNumber);
  }

  function getFloorTileByCoords(xCoord, yCoord) {
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

  function makeTilesReflectText() {
    for (const tile of floor.tiles) {
      const sTile = getTileElemByCoords(tile.xCoord, tile.yCoord);
      const newSrc = new URL(urlBase + 'tiles/Appr'+tile.appearance+'.png');
      sTile.src = newSrc;
    }
  }

  function makeTileReflectValues(xCoord, yCoord) {
    let fTile = getFloorTileByCoords(xCoord, yCoord);
    if (fTile != undefined) {
      const sTile = getTileElemByCoords(xCoord, yCoord);
      const appearance = getAppearance();
      if (appearance != undefined) {
        const newSrc = new URL(urlBase + 'tiles/Appr'+appearance+'.png');
        sTile.src = newSrc;
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
    }
  }

  function makeValuesReflectTile(xCoord, yCoord) {
    const fTile = getFloorTileByCoords(xCoord, yCoord);
    if (fTile != undefined) {
      document.getElementById('tile-appearance').value = fTile.appearance;
      document.getElementById('tile-height').value = fTile.height;
      document.getElementById('tile-status').value = fTile.status;
    }
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

  function setCoords(x, y) {
    document.getElementById('x-coord').value = x;
    document.getElementById('y-coord').value = y;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
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
    
    document.getElementById('import-text').addEventListener('click', importTextHandler);
    return true;
  }
})(typeof(window) !== 'undefined' ? window : null)