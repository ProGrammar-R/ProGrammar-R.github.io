(function(self) {

  let constants;

  if (self) {
    constants = self.adRando.constants
  } else {
    constants = require('../constants')
  }

  const fiveColorBits = 5;
  const extraBitsToShiftForFiveBitColor = 8 - fiveColorBits;
  const bitsToShiftForR = 16 + extraBitsToShiftForFiveBitColor;
  const bitsToShiftForG = 8 + extraBitsToShiftForFiveBitColor;
  const bitsToShiftForB = extraBitsToShiftForFiveBitColor;

  function writeColor(colorAsNumber, location, data) {
    const r = (colorAsNumber & 0xff0000) >>> bitsToShiftForR;
    const g = (colorAsNumber & 0x00ff00) >>> bitsToShiftForG;
    const b = (colorAsNumber & 0x0000ff) >>> bitsToShiftForB;
    const colorAsUshort = (b << (2 * fiveColorBits)) | (g << fiveColorBits) | r;
    data[location] = (colorAsUshort & 0xff);
    data[location + 1] = (colorAsUshort >>> 8);
  }

  function recolorSprites(data, customPalettes) {
    if (!!customPalettes.monsters) {
      recolorMonsters(data, customPalettes.monsters);
    }
  }

  function recolorMonsters(data, customPalettes) {
    const offsetBetweenPalettes = 0x80;
    const palettesLocation = (constants.paletteInfo.firstMonsterSector + 
      constants.paletteInfo.animationDataSectors + constants.paletteInfo.spriteDataSectors) * constants.sectorSize + constants.headerSize;
    
    // const palettesLocation = (constants.paletteInfo.firstMonsterSector + (monsterId - 1) *
    //   (constants.paletteInfo.animationDataSectors + constants.paletteInfo.spriteDataSectors + constants.paletteInfo.paletteDataSectors) +
    //   constants.paletteInfo.animationDataSectors) * constants.sectorSize + constants.headerSize;
    for (let monsterIdText of Object.getOwnPropertyNames(customPalettes)) {
      const monsterId = parseInt(monsterIdText);
      if (!!monsterId) {
        const palettesForMonster = customPalettes[monsterIdText];
        const monsterPalettesLocation = palettesLocation + (monsterId - 1) * constants.sectorSize *
          (constants.paletteInfo.animationDataSectors + constants.paletteInfo.spriteDataSectors + constants.paletteInfo.paletteDataSectors);
        for (let paletteTypeText of Object.getOwnPropertyNames(palettesForMonster)) {
          const paletteType = parseInt(paletteTypeText);
          if (!isNaN(paletteType) && paletteType >= constants.paletteInfo.paletteTypes.Enemy && paletteType <= constants.paletteInfo.paletteTypes.Wind) {
            const colorsForPalette = palettesForMonster[paletteTypeText];
            for (let colorIndex = 0; colorIndex < colorsForPalette.length && colorIndex < constants.paletteInfo.colorsPerPalette; colorIndex++) {
              const colorToWrite = colorsForPalette[colorIndex];
              if (colorToWrite.match('#[0-9a-fA-F]{6}')) {
                const colorAsNumber = parseInt(colorToWrite.replace('#', '0x'));
                writeColor(colorAsNumber, monsterPalettesLocation + offsetBetweenPalettes * paletteType + colorIndex * 2, data);
              }
            }
          }
        }
      }
    }
  }

  const exports = {
    recolorSprites: recolorSprites,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      recolor: exports,
    })
  } else {
    module.exports = exports
  }
}) (typeof(self) !== 'undefined' ? self : null)
