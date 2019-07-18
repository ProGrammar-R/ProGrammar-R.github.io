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

  // List of type names for logging.
  const typeNames = [
    'HEART',
    'GOLD',
    'SUBWEAPON',
    'POWERUP',
    'WEAPON1',
    'WEAPON2',
    'SHIELD',
    'HELMET',
    'ARMOR',
    'CLOAK',
    'ACCESSORY',
    'USABLE',
  ]

  const ZONE = {
    ST0:  0,  // Final Stage: Bloodlines
    ARE:  1,  // Colosseum
    CAT:  2,  // Catacombs
    CHI:  3,  // Abandoned Mine
    DAI:  4,  // Royal Chapel
    LIB:  5,  // Long Library
    NO0:  6,  // Marble Gallery
    NO1:  7,  // Outer Wall
    NO2:  8,  // Olrox's Quarters
    NO3:  9,  // Castle Entrance
    NP3:  10, // Castle Entrance (after visiting Alchemy Laboratory)
    NO4:  11, // Underground Caverns
    NZ0:  12, // Alchemy Laboratory
    NZ1:  13, // Clock Tower
    TOP:  14, // Castle Keep
    RARE: 15, // Reverse Colosseum
    RCAT: 16, // Floating Catacombs
    RCHI: 17, // Cave
    RDAI: 18, // Anti-Chapel
    RLIB: 19, // Forbidden Library
    RNO0: 20, // Black Marble Gallery
    RNO1: 21, // Reverse Outer Wall
    RNO2: 22, // Death Wing's Lair
    RNO3: 23, // Reverse Entrance
    RNO4: 24, // Reverse Caverns
    RNZ0: 25, // Necromancy Laboratory
    RNZ1: 26, // Reverse Clock Tower
    RTOP: 27, // Reverse Castle Keep
  }

  const lcgConstants = {modulus: 0x1fffFFFFffff, multiplier: 0x5DEECE66D, increment: 11,}

  const tileIdOffset = 0x80

  const SLOT = {
    RIGHT_HAND: 'r',
    LEFT_HAND: 'l',
    HEAD: 'h',
    BODY: 'b',
    CLOAK: 'c',
    OTHER: 'o',
    AXEARMOR: 'a',
    LUCK_MODE: 'x',
  }

  const exports = {
    defaultOptions: defaultOptions,
    TYPE: TYPE,
    typeNames: typeNames,
    ZONE: ZONE,
    lcgConstants: lcgConstants,
    tileIdOffset: 0x80,
    SLOT: SLOT,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      constants: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
