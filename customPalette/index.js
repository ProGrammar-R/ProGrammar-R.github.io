(function(window) {

  let constants;
  let monsters;

  if (self) {
    constants = self.adRando.constants;
    monsters = self.adRando.monsters;
  } else {
    constants = require('../constants');
    monsters = require('../monsters');
  }

  const HEX_FORMAT = 16;
  const sectorsToShow = 4;
  const pixelsPerTile = 8;
  const tilesPerAxis = 16;
  const colorsPerPalette = 16;
  const pixelsPerAxis = pixelsPerTile * tilesPerAxis;
  const urlText = window.location.href;
  const urlBase = window.location.href.match('.*/');
  const clearURL = new URL(urlBase + 'clearPixel.png');
  const standardBackgroundColor = 'background-color:#044020';
  const paletteTypes = {
    Enemy: 0,
    Fire: 1,
    Water: 2,
    Wind: 3
  };
  const numPaletteTypes = Object.getOwnPropertyNames(paletteTypes).length;
  const firstMonsterSector = 0x56d6;
  const animationDataSectors = 0x1a;
  const spriteDataSectors = 0x10;
  const paletteDataSectors = 0x1;
  
  const tiles = [];
  const elems = {};
  const monsterPalettes = {};
  let romArrayBuffer;
  let colorStyles;

  let pageIsSetUp = false;

  function ensureHexStringHasTwoDigits(hexString) {
    if (hexString.length < 2) {
      return '0'+hexString;
    }
    return hexString;
  }

  function fiveBitsToByte(fiveBits) {
    return ensureHexStringHasTwoDigits((fiveBits << 3).toString(HEX_FORMAT));
  }

  function getMonsterId() {
    return parseInt(elems.tileMonsterId.value);
  }

  function getPaletteType() {
    return parseInt(elems.tileMonsterElement.value);
  }

  function tileHandler(event) {
    const classNameTokens = event.target.className.split('-');
    const paletteColorIndex = parseInt(classNameTokens[classNameTokens.length - 1]);
    for (let colorClickedLabelIndex = 1; colorClickedLabelIndex < colorsPerPalette; colorClickedLabelIndex++) {
      elems.colorLastClickedLabels[colorClickedLabelIndex].hidden = colorClickedLabelIndex !== paletteColorIndex;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function transparencyColorHandler(event) {
    //TODO this should use CSS
    elems.spriteArea.style = 'background-color: ' + elems.transparencyColor.value;
    //document.getElementById('palette-color-0').value = elems.transparencyColor.value;
    event.preventDefault();
    event.stopPropagation();
  }

  function updatePaletteColorsToMatchPaletteType() {
    for (let paletteColorIndex = 1; paletteColorIndex < colorsPerPalette; paletteColorIndex++) {
      document.getElementById('palette-color-'+ paletteColorIndex.toString()).value = monsterPalettes[getMonsterId()][getPaletteType()][paletteColorIndex];
    }
  }

  function updateTilesToMatchPaletteAndPaletteType() {
    const palettesByType = monsterPalettes[getMonsterId()];
    const palettes = palettesByType[getPaletteType()];
    for (let paletteColorIndex = 1; paletteColorIndex < colorsPerPalette; paletteColorIndex++) {
      colorStyles.deleteRule(paletteColorIndex);
      colorStyles.insertRule('.color-'+paletteColorIndex.toString()+' { background-color: '+ palettes[paletteColorIndex] + '}', paletteColorIndex);
    }
  }

  function makePixelsMatchChosenMonster() {
    const monsterId = getMonsterId();
    const spritesLocation = (firstMonsterSector + (monsterId - 1) * (animationDataSectors + spriteDataSectors + paletteDataSectors) + animationDataSectors) * constants.sectorSize + constants.headerSize;
    const sprites = new DataView(romArrayBuffer, spritesLocation, sectorsToShow * constants.sectorSize);
    for (let spriteSet = 0; spriteSet < sectorsToShow; spriteSet++) {
      for (let offset = 0; offset < constants.sectorDataSize; offset++) {
        let value = sprites.getUint8(spriteSet * constants.sectorSize + offset);
        tiles[(spriteSet * constants.sectorDataSize + offset)*2].className = 'floor-tile color-' + (value & 0x0f).toString();
        tiles[(spriteSet * constants.sectorDataSize + offset)*2 + 1].className = 'floor-tile color-' + (value >>> 4).toString();
      }
    }
    if (!monsterPalettes[monsterId]) {
      const paletteData = new DataView(romArrayBuffer, spritesLocation + spriteDataSectors * constants.sectorSize, constants.sectorDataSize);
      const monsterPalette = {};
      for (let paletteType = 0; paletteType < numPaletteTypes; paletteType++) {
        const palette = [];
        let paletteColorIndex = 0;
        if (paletteData.getUint16(paletteColorIndex * 2 + paletteType * 0x80, true) !== 0) {
          alert('color index 0 is not transparent');
        }
        for (; paletteColorIndex < colorsPerPalette; paletteColorIndex++) {
          const read = paletteData.getUint16(paletteColorIndex * 2 + paletteType * 0x80, true);
          const b = (read & 0x7fff) >>> 10;
          const g = (read & 0x03ff) >>> 5;
          const r = (read & 0x001f);
          palette[paletteColorIndex] = '#' + fiveBitsToByte(r) + fiveBitsToByte(g) + fiveBitsToByte(b);
        }
        monsterPalette[paletteType] = palette;
      }
      monsterPalettes[monsterId] = monsterPalette;
    }
    updatePaletteColorsToMatchPaletteType();
    updateTilesToMatchPaletteAndPaletteType(); 
  }

  function tileMonsterIdHandler(event) {
    makePixelsMatchChosenMonster();
    event.preventDefault();
    event.stopPropagation();
  }

  function tileMonsterElementHandler(event) {
    updatePaletteColorsToMatchPaletteType();
    updateTilesToMatchPaletteAndPaletteType();
    event.preventDefault();
    event.stopPropagation();
  }

  function paletteColorHandler(event) {
    const clicked = event.target;
    const clickedId = clicked.id.split('-')[2];
    monsterPalettes[getMonsterId()][getPaletteType()][clickedId] = clicked.value;
    updateTilesToMatchPaletteAndPaletteType();
    event.preventDefault();
    event.stopPropagation();
  }

  function processImportBin() {
    elems.tileMonsterId.disabled = false;
    elems.tileMonsterId.value = 1;
    elems.tileMonsterElement.disabled = false;
    elems.tileMonsterElement.value = 0;
    makePixelsMatchChosenMonster();
  }

  function importBinFileHandler(event) {
    if (elems.importBinFile.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
        romArrayBuffer = this.result;
        processImportBin();
      }
      reader.readAsArrayBuffer(elems.importBinFile.files[0]);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function importFileHandler(event) {
    if (elems.importFile.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
        const importExportField = document.getElementById('import-export');
        importExportField.value = this.result;
        monsterPalettes = JSON.parse(importExportField.value);
        updatePaletteColorsToMatchPaletteType();
        updateTilesToMatchPaletteAndPaletteType();
      }
      reader.readAsText(elems.importFile.files[0]);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function importTextHandler(event) {
    //catch enter being pressed in other fields which triggers this, for some reason
    if (event.detail !== 0) {
      const importExportField = document.getElementById('import-export');
      monsterPalettes = JSON.parse(importExportField.value);
      updatePaletteColorsToMatchPaletteType();
      updateTilesToMatchPaletteAndPaletteType();
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function exportTextHandler(event) {
    const importExportTextbox = document.getElementById('import-export');
    importExportTextbox.value = JSON.stringify(monsterPalettes);
    event.preventDefault();
    event.stopPropagation();
  }

  function exportFileHandler(event) {
    const urlDownload = URL.createObjectURL(new Blob([JSON.stringify(monsterPalettes)], {
      type: 'text/json; charset=UTF-8',
    }));
    const downloadFileElem = document.getElementById('download-file');
    downloadFileElem.href = urlDownload;
    downloadFileElem.download = 'customPalettes.json';
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

      }
    }
  }

  function setUpPage() {
    document.onkeypress = keyPressHandler;

    elems.spriteArea = document.getElementById('sprite-area');
    elems.importBinFile = document.getElementById('import-bin-file');
    elems.importFile = document.getElementById('import-file');
    elems.importText = document.getElementById('import-text');
    elems.exportText = document.getElementById('export-text');
    elems.exportFile = document.getElementById('export-file');
    elems.transparencyColor = document.getElementById('transparency-color');
    elems.tileMonsterId = document.getElementById('tile-monster-id');
    elems.tileMonsterElement = document.getElementById('tile-monster-element');
    elems.paletteColors = document.getElementById('palette-colors');

    tileNumber = 0;
    const sheet = document.createElement('style')
    sheet.title = 'color-styles';
    sheet.innerHTML = '{}';
    document.body.appendChild(sheet);
    for (let stylesheet of document.styleSheets) {
      if (stylesheet.title === sheet.title) {
        colorStyles = stylesheet;
      }
    }
    for (let styleIndex = 0; styleIndex < 16; styleIndex++) {
      colorStyles.insertRule('.color-'+styleIndex.toString()+' {background-color: #778899;}', styleIndex);
    }
    
    for (row = 0; row < pixelsPerAxis; row++) {
      const tileRow = document.createElement('div');
      tileRow.className = 'tile-row';
      for (tileIndex = 0; tileIndex < pixelsPerAxis; tileIndex++) {
        const tile = document.createElement('input');
        tile.type = 'image';
        tile.src = 'clear.png';
        tile.tileNumber = tileNumber;
        tile.id = 'tile-' + tileNumber;
        tile.className = 'floor-tile color-0';
        //tile.classList = ['floor-tile', 'color-transparent'];
        tile.xCoord = tileIndex;
        tile.yCoord = row;
        tile.addEventListener('click', tileHandler);
        tileRow.appendChild(tile);
        tiles[tileNumber++] = tile;
      }
      elems.spriteArea.appendChild(tileRow);
    }

    elems.importBinFile.addEventListener('change', importBinFileHandler);
    elems.importFile.addEventListener('change', importFileHandler);
    elems.importText.addEventListener('click', importTextHandler);
    elems.exportText.addEventListener('click', exportTextHandler);
    elems.exportFile.addEventListener('click', exportFileHandler);
    elems.transparencyColor.addEventListener('input', transparencyColorHandler, false);
    elems.transparencyColor.addEventListener('change', transparencyColorHandler, false);
    elems.tileMonsterId.addEventListener('change', tileMonsterIdHandler);
    elems.tileMonsterElement.addEventListener('change', tileMonsterElementHandler);

    elems.colorLastClickedLabels = [document.getElementById('palette-color-note')];
    for (let paletteColorIndex = 1; paletteColorIndex < colorsPerPalette; paletteColorIndex++) {
      const div = document.createElement('div');
      div.className = 'pure-u-1 hflow';
      const elementId = 'palette-color-' + paletteColorIndex.toString();
      const label = document.createElement('label');
      label.for = elementId;
      label.innerText = paletteColorIndex.toString();
      div.appendChild(label);
      const input = document.createElement('input');
      input.type = 'color';
      input.id = elementId;
      input.addEventListener('change', paletteColorHandler, false);
      input.addEventListener('input', paletteColorHandler, false);
      div.appendChild(input);
      const lastClickedLabel = document.createElement('div');
      lastClickedLabel.innerText = 'Clicked this color last'
      lastClickedLabel.hidden = true;
      div.appendChild(lastClickedLabel);
      elems.colorLastClickedLabels[paletteColorIndex] = lastClickedLabel;
      elems.paletteColors.appendChild(div);
    }

    monsters.allMonsters.forEach(function(monster) {
      const option = document.createElement('option');
      option.value = monster.ID;
      option.id = 'monster-' + monster.name;
      option.innerText = monster.name;
      elems.tileMonsterId.appendChild(option);
    })
    Object.getOwnPropertyNames(paletteTypes).forEach(function(paletteType) {
      const option = document.createElement('option');
      option.value = paletteTypes[paletteType];
      option.id = 'palette-type-' +paletteType;
      option.innerText = paletteType;
      elems.tileMonsterElement.appendChild(option);
    })

    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
  }
})(typeof(window) !== 'undefined' ? window : null)