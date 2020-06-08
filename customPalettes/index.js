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
  const pixelsPerAxis = pixelsPerTile * tilesPerAxis;
  
  const tiles = [];
  const elems = {};
  let allPalettes = {};
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
    for (let colorClickedLabelIndex = 1; colorClickedLabelIndex < constants.paletteInfo.colorsPerPalette; colorClickedLabelIndex++) {
      elems.colorLastClickedLabels[colorClickedLabelIndex].hidden = colorClickedLabelIndex !== paletteColorIndex;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function getNearestFiveBitColorForChannel(singleColor) {
    if (singleColor >= 0xf8) {
      return 0xf8;
    }
    if ((singleColor & 0x7) < 4) {
      return singleColor & 0xf8;
    }
    return (singleColor + (8 - (singleColor & 0x7))) & 0xff;
  }

  function getNearestFiveBitColor(color) {
    let closestColor = color;
    if (color.match('#[0-9a-fA-F]{6}')) {
      const colorAsNumber = parseInt(color.replace('#', '0x'));
      const r = getNearestFiveBitColorForChannel((colorAsNumber & 0xff0000) >>> 16);
      const g = getNearestFiveBitColorForChannel((colorAsNumber & 0x00ff00) >>> 8);
      const b = getNearestFiveBitColorForChannel(colorAsNumber & 0x0000ff);
      closestColor = '#' + ensureHexStringHasTwoDigits(r.toString(HEX_FORMAT)) +
                                 ensureHexStringHasTwoDigits(g.toString(HEX_FORMAT)) +
                                 ensureHexStringHasTwoDigits(b.toString(HEX_FORMAT));
      //special logic to avoid transparency
      if (closestColor === '#000000') {
        closestColor = '#080808';
      }
    }
    return closestColor;
  }

  function transparencyColorHandler(event) {
    //TODO this should use CSS
    elems.spriteArea.style = 'background-color: ' + elems.transparencyColor.value;
    //document.getElementById('palette-color-0').value = elems.transparencyColor.value;
    event.preventDefault();
    event.stopPropagation();
  }

  function updatePaletteColorsToMatchPaletteType() {
    for (let paletteColorIndex = 1; paletteColorIndex < constants.paletteInfo.colorsPerPalette; paletteColorIndex++) {
      document.getElementById('palette-color-'+ paletteColorIndex.toString()).value = allPalettes.monsters[getMonsterId()][getPaletteType()][paletteColorIndex];
    }
  }

  function updateTilesToMatchPaletteAndPaletteType() {
    const palettesByType = allPalettes.monsters[getMonsterId()];
    const palettes = palettesByType[getPaletteType()];
    for (let paletteColorIndex = 1; paletteColorIndex < constants.paletteInfo.colorsPerPalette; paletteColorIndex++) {
      colorStyles.deleteRule(paletteColorIndex);
      colorStyles.insertRule('.color-'+paletteColorIndex.toString()+' { background-color: '+ palettes[paletteColorIndex] + '}', paletteColorIndex);
    }
  }

  function makePixelsMatchChosenMonster() {
    const monsterId = getMonsterId();
    const spritesLocation = (constants.paletteInfo.firstMonsterSector + (monsterId - 1) *
      (constants.paletteInfo.animationDataSectors + constants.paletteInfo.spriteDataSectors + constants.paletteInfo.paletteDataSectors) +
      constants.paletteInfo.animationDataSectors) * constants.sectorSize + constants.headerSize;
    const sprites = new DataView(romArrayBuffer, spritesLocation, sectorsToShow * constants.sectorSize);
    for (let spriteSet = 0; spriteSet < sectorsToShow; spriteSet++) {
      for (let offset = 0; offset < constants.sectorDataSize; offset++) {
        let value = sprites.getUint8(spriteSet * constants.sectorSize + offset);
        tiles[(spriteSet * constants.sectorDataSize + offset)*2].className = 'floor-tile color-' + (value & 0x0f).toString();
        tiles[(spriteSet * constants.sectorDataSize + offset)*2 + 1].className = 'floor-tile color-' + (value >>> 4).toString();
      }
    }
    if (!allPalettes.monsters) {
      allPalettes.monsters = {};
    }
    if (!allPalettes.monsters[monsterId]) {
      const paletteData = new DataView(romArrayBuffer, spritesLocation + constants.paletteInfo.spriteDataSectors * constants.sectorSize, constants.sectorDataSize);
      const monsterPalette = {};
      for (let paletteType = 0; paletteType < constants.paletteInfo.numPaletteTypes; paletteType++) {
        const palette = [];
        let paletteColorIndex = 0;
        if (paletteData.getUint16(paletteColorIndex * 2 + paletteType * 0x80, true) !== 0) {
          logToOutput('Color index 0 is not transparent');
        }
        for (; paletteColorIndex < constants.paletteInfo.colorsPerPalette; paletteColorIndex++) {
          const read = paletteData.getUint16(paletteColorIndex * 2 + paletteType * 0x80, true);
          const b = (read & 0x7fff) >>> 10;
          const g = (read & 0x03ff) >>> 5;
          const r = (read & 0x001f);
          palette[paletteColorIndex] = '#' + fiveBitsToByte(r) + fiveBitsToByte(g) + fiveBitsToByte(b);
        }
        monsterPalette[paletteType] = palette;
      }
      allPalettes.monsters[monsterId] = monsterPalette;
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
    const snappedColor = getNearestFiveBitColor(clicked.value);
    clicked.value = snappedColor;
    allPalettes.monsters[getMonsterId()][getPaletteType()][clickedId] = clicked.value;
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
      logToOutput('Reading file, please wait...');
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

  function tryParsingJson() {
    try {
      allPalettes = JSON.parse(elems.importExport.value);
      updatePaletteColorsToMatchPaletteType();
      updateTilesToMatchPaletteAndPaletteType();
    } catch (error) {
      logToOutput(error.message);
    }
  }

  function importFileHandler(event) {
    if (elems.importFile.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
        elems.importExport.value = this.result;
        tryParsingJson();
      }
      reader.readAsText(elems.importFile.files[0]);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function importTextHandler(event) {
    //catch enter being pressed in other fields which triggers this, for some reason
    if (event.detail !== 0) {
      tryParsingJson();
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function exportTextHandler(event) {
    elems.importExport.value = JSON.stringify(allPalettes);
    event.preventDefault();
    event.stopPropagation();
  }

  function exportFileHandler(event) {
    const urlDownload = URL.createObjectURL(new Blob([JSON.stringify(allPalettes)], {
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

  async function logToOutput(message) {
    elems.importOutput.value = message;
    await new Promise(handler => setTimeout(handler, 5000));
    elems.importOutput.value = '';
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
    elems.importExport = document.getElementById('import-export');
    elems.spriteArea = document.getElementById('sprite-area');
    elems.importOutput = document.getElementById('import-output');
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
    colorStyles.insertRule('.color-0 {opacity: 0;}', 0);

    for (let styleIndex = 1; styleIndex < 16; styleIndex++) {
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
        tile.tabIndex = -1;
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
    for (let paletteColorIndex = 1; paletteColorIndex < constants.paletteInfo.colorsPerPalette; paletteColorIndex++) {
      const div = document.createElement('div');
      div.className = 'pure-u-1 hflow';
      const elementId = 'palette-color-' + paletteColorIndex.toString();
      const label = document.createElement('label');
      label.for = elementId;
      label.innerText = paletteColorIndex.toString(HEX_FORMAT).toUpperCase();
      div.appendChild(label);
      const input = document.createElement('input');
      input.type = 'color';
      input.id = elementId;
      input.className = 'space-right';
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
    Object.getOwnPropertyNames(constants.paletteInfo.paletteTypes).forEach(function(paletteType) {
      const option = document.createElement('option');
      option.value = constants.paletteInfo.paletteTypes[paletteType];
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