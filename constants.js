(function(self) {

  const defaultOptions = 'P:safe'

  const TYPE = {
    HERB:     0x1,
    FRUIT:    0x2,
    SEED:     0x3,
    BALL:     0x4,
    BEAM:     0x5,
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
  }

  const romAddresses = {
    angelFirstWord: 0xee5f97,
    isExhaustedBattleText: 0x1cbcc3c,
    pauseAfterDeathText: 0x55b71,
    pauseAfterDeathCode: 0x1c5e470,
    beldoLocation: 0x263cbb2, //RAM 0x800e604a
  }

  const lcgConstants = {modulus: 0x1fffFFFFffff, multiplier: 0x5DEECE66D, increment: 11,}

  const tileIdOffset = 0x80

  const exports = {
    defaultOptions: defaultOptions,
    TYPE: TYPE,
    romAddresses: romAddresses,
    lcgConstants: lcgConstants,
    tileIdOffset: 0x80,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      constants: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
