(function(self) {

  let constants
  if (self) {
    constants = self.adRando.constants
    util = self.adRando.util
  } else {
    constants = require('./constants')
    util = require('./util')
  }

  const startingItemWidth = 6
  const randomItemHexSeed = 5

  const TYPE = constants.TYPE

  const itemOffsets = {
    bitfield: 0,
    rarity: 1,
    itemName: 4,
    description: 8,
    buyPrice: 16,
    sellPrice: 18,
  }

  const items = [
    //Herb
    { name: 'Medicinal',    type: TYPE.HERB, id: 0x01, modifiers: 0x00, inPool: false, survival: 0, address: 0x5e8ac, barong: false}, //hospital version
    { name: 'Antidote',     type: TYPE.HERB, id: 0x02, modifiers: 0x00, inPool: false, survival: 0, address: 0x5e8c0, barong: false},
    { name: 'Antichaos',    type: TYPE.HERB, id: 0x03, modifiers: 0x00, inPool: false, survival: 0, address: 0x5e8d4, barong: false},
    { name: 'Wake-Up',      type: TYPE.HERB, id: 0x04, modifiers: 0x00, inPool: false, survival: 0, address: 0x5e8e8, barong: false},
    { name: 'Cure-All',     type: TYPE.HERB, id: 0x05, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e8fc, barong: false},
    { name: 'Harak',        type: TYPE.HERB, id: 0x06, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e910, barong: false},
    { name: 'Shomuro',      type: TYPE.HERB, id: 0x07, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e924, barong: true},
    { name: 'Healing Herb', type: TYPE.HERB, id: 0x08, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e938, barong: false},
    { name: 'Poison',       type: TYPE.HERB, id: 0x09, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e94c, barong: true},
    { name: 'Paralyze',     type: TYPE.HERB, id: 0x0a, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e960, barong: true},
    { name: 'Harash',       type: TYPE.HERB, id: 0x0b, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e974, barong: true},
    { name: 'Horrey',       type: TYPE.HERB, id: 0x0c, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e988, barong: true},
    { name: 'Sleep',        type: TYPE.HERB, id: 0x0d, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e99c, barong: true},
    { name: 'Roehm',        type: TYPE.HERB, id: 0x0e, modifiers: 0x00, inPool: false, survival: 1, address: 0x5e9b0, barong: false},
    { name: 'Medicinal',    type: TYPE.HERB, id: 0x0f, modifiers: 0x00, inPool: true,  survival: 1, address: 0x5e9c4, barong: false},
    //Fruit
    { name: 'Pita',         type: TYPE.FRUIT, id: 0x01, modifiers: 0x00, inPool: false, survival: 0, address: 0x5e9ec}, //+3
    { name: 'Big Pita',     type: TYPE.FRUIT, id: 0x02, modifiers: 0x00, inPool: false, survival: 2, address: 0x5ea00},
    { name: 'Tumna',        type: TYPE.FRUIT, id: 0x03, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ea14},
    { name: 'Leva',         type: TYPE.FRUIT, id: 0x04, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ea28},
    { name: 'Leolam',       type: TYPE.FRUIT, id: 0x05, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ea3c},
    { name: 'Laev',         type: TYPE.FRUIT, id: 0x06, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ea50},
    { name: 'Roche',        type: TYPE.FRUIT, id: 0x07, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ea64},
    { name: 'Limit',        type: TYPE.FRUIT, id: 0x08, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ea78},
    { name: 'Oleem',        type: TYPE.FRUIT, id: 0x09, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ea8c},
    { name: 'Geropita',     type: TYPE.FRUIT, id: 0x0a, modifiers: 0x00, inPool: false, survival: 1, address: 0x5eaa0},
    //Seed
    { name: 'Hazak',        type: TYPE.SEED, id: 0x01, modifiers: 0x00, inPool: false, survival: 0, address: 0x5eac8}, //+5
    { name: 'Shomuro',      type: TYPE.SEED, id: 0x02, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ec0c},
    { name: 'Mazarr',       type: TYPE.SEED, id: 0x03, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ec20},
    { name: 'Mahell',       type: TYPE.SEED, id: 0x04, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ec34},
    { name: 'Light',        type: TYPE.SEED, id: 0x05, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ec48},
    { name: 'Sea',          type: TYPE.SEED, id: 0x06, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ec5c},
    { name: 'Wind',         type: TYPE.SEED, id: 0x07, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ec70},
    { name: 'Lar',          type: TYPE.SEED, id: 0x08, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ec84},
    { name: 'Slow',         type: TYPE.SEED, id: 0x09, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ec98},
    { name: 'Tovar',        type: TYPE.SEED, id: 0x0a, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ecac},
    //Ball
    { name: 'Fire',       type: TYPE.BALL, id: 0x01, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ecd4, spellId: 0x01, names: [0, 0x8002E3E8, 0, 0x8002E39C],          descriptions: [0, 0x8002E3B0, 0, 0x8002E364],},
    { name: 'Blaze',      type: TYPE.BALL, id: 0x02, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ece8, spellId: 0x04, names: [0, 0x8002E314, 0, 0x8002E2D0],          descriptions: [0, 0x8002E2E0, 0, 0x8002E2A0],},
    { name: 'Flame',      type: TYPE.BALL, id: 0x03, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ecfc, spellId: 0x07, names: [0, 0x8002E264, 0, 0x8002E218],          descriptions: [0, 0x8002E228, 0, 0x8002E1E0],},
    { name: 'Pillar',     type: TYPE.BALL, id: 0x04, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed10, spellId: 0x0a, names: [0, 0x8002E184, 0, 0x8002E138],          descriptions: [0, 0x8002E148, 0, 0x8002E10C],},
    { name: 'Poison',     type: TYPE.BALL, id: 0x05, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed24, spellId: 0x0d, names: [0, 0x8002E0B8, 0, 0x8002E078],          descriptions: [0, 0x8002E08C, 0, 0x8002E048],},
    { name: 'Water',      type: TYPE.BALL, id: 0x06, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed38, spellId: 0x11, names: [0x8002E038, 0, 0, 0x8002DF6C],          descriptions: [0x8002DFFC, 0, 0, 0x8002DF2C],},
    { name: 'Repel',      type: TYPE.BALL, id: 0x07, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed4c, spellId: 0x14, names: [0x8002DEFC, 0, 0, 0x8002DE64],          descriptions: [0x8002DEC4, 0, 0, 0x8002DE2C],},
    { name: 'Ice Rock',   type: TYPE.BALL, id: 0x08, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed60, spellId: 0x17, names: [0x8002DE1C, 0, 0, 0x8002DD58],          descriptions: [0x8002DDE0, 0, 0, 0x8002DD20],},
    { name: 'Recovery',   type: TYPE.BALL, id: 0x09, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed74, spellId: 0x1a, names: [0x8002DCF8, 0, 0, 0x8002DC6C],          descriptions: [0x8002DCBC, 0, 0, 0x8002DC34],},
    { name: 'DeForth',    type: TYPE.BALL, id: 0x0A, modifiers: 0x05, inPool: false, survival: 0, address: 0x5ed88, spellId: 0x1d, names: [0x8002DC20, 0x8002DBD8, 0, 0x8002DB84], descriptions: [0x8002DBE8, 0x8002DB98, 0, 0x8002DB4C],},
    { name: 'Blinder',    type: TYPE.BALL, id: 0x0B, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5ed9c, spellId: 0x21, names: [0x8002DB3C, 0x8002DAF4, 0, 0],          descriptions: [0x8002DB04, 0x8002DAB8, 0, 0],},
    { name: 'Binding',    type: TYPE.BALL, id: 0x0C, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5edb0, spellId: 0x24, names: [0x8002DA60, 0x8002DA10, 0, 0],          descriptions: [0x8002DA20, 0x8002D9D0, 0, 0],},
    { name: 'Sleep',      type: TYPE.BALL, id: 0x0D, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5edc4, spellId: 0x27, names: [0x8002D974, 0x8002D930, 0, 0],          descriptions: [0x8002D940, 0x8002D8FC, 0, 0],},
    { name: 'Weak',       type: TYPE.BALL, id: 0x0E, modifiers: 0x05, inPool: true,  survival: 1, address: 0x5edd8, spellId: 0x2a, names: [0x8002D8A8, 0x8002D864, 0, 0],          descriptions: [0x8002D874, 0x8002D820, 0, 0],},
    { name: 'LoGrave',    type: TYPE.BALL, id: 0x0F, modifiers: 0x05, inPool: false, survival: 0, address: 0x5edec, spellId: 0x2d, names: [0x8002D7C0, 0x8002D770, 0, 0x8002D730], descriptions: [0x8002D784, 0x8002D740, 0, 0x8002D6FC],},
    { name: 'LeoGrave',   type: TYPE.BALL, id: 0x10, modifiers: 0x05, inPool: false, survival: 0, address: 0x5ee00, spellId: 0x2c, names: [0x8002D7C0, 0x8002D770, 0, 0x8002D730], descriptions: [0x8002D784, 0x8002D740, 0, 0x8002D6FC],},
    { name: 'Acid Rain',  type: TYPE.BALL, id: 0x11, modifiers: 0x01, inPool: true,  survival: 1, address: 0x5ee14, spellId: 0x31, names: [0, 0, 0, 0],                            descriptions: [0, 0, 0, 0]},
    //Scroll
    { name: 'Holy',       type: TYPE.SCROLL, id: 0x01, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ee3c}, //+4
    { name: 'Malicious',  type: TYPE.SCROLL, id: 0x02, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ee50},
    { name: 'Trap',       type: TYPE.SCROLL, id: 0x03, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ee64},
    { name: 'Restore',    type: TYPE.SCROLL, id: 0x04, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ee78},
    { name: 'De-curse',   type: TYPE.SCROLL, id: 0x05, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ee8c},
    { name: 'Flat',       type: TYPE.SCROLL, id: 0x06, modifiers: 0x00, inPool: false, survival: 0, address: 0x5eea0},
    { name: 'Alchemic',   type: TYPE.SCROLL, id: 0x07, modifiers: 0x00, inPool: false, survival: 0, address: 0x5eeb4},
    //Crystal
    { name: 'Fire',   type: TYPE.CRYSTAL, id: 0x01, modifiers: 0x00, inPool: false, survival: 1, address: 0x5dbd8}, //+1
    { name: 'Water',  type: TYPE.CRYSTAL, id: 0x02, modifiers: 0x00, inPool: false, survival: 1, address: 0x5dbec},
    { name: 'Wind',   type: TYPE.CRYSTAL, id: 0x03, modifiers: 0x00, inPool: false, survival: 0, address: 0x5dc00},
    //Bell
    { name: 'Holy',       type: TYPE.BELL, id: 0x01, modifiers: 0x00, inPool: false, survival: 1, address: 0x5eedc}, //+1
    { name: 'Malicious',  type: TYPE.BELL, id: 0x02, modifiers: 0x00, inPool: false, survival: 0, address: 0x5eef0},
    { name: 'Familiar',   type: TYPE.BELL, id: 0x03, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ef04},
    //Glasses
    { name: 'Truth',      type: TYPE.GLASSES, id: 0x01, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ef2c}, //+1
    { name: 'Star',       type: TYPE.GLASSES, id: 0x02, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ef40},
    //Loupe
    { name: 'Exit',       type: TYPE.LOUPE, id: 0x01, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ef68}, //-1
    { name: 'Trap',       type: TYPE.LOUPE, id: 0x02, modifiers: 0x00, inPool: false, survival: 1, address: 0x5ef7c},
    { name: 'Focus',      type: TYPE.LOUPE, id: 0x03, modifiers: 0x00, inPool: false, survival: 0, address: 0x5ef90},
    { name: 'Monster',    type: TYPE.LOUPE, id: 0x04, modifiers: 0x00, inPool: false, survival: 1, address: 0x5efa4},
    { name: 'Treasure',   type: TYPE.LOUPE, id: 0x05, modifiers: 0x00, inPool: false, survival: 0, address: 0x5efb8},
    //Sand
    { name: 'Red',        type: TYPE.SAND, id: 0x01, modifiers: 0x00, inPool: false, survival: 1, address: 0x5efe0}, //0
    { name: 'Blue',       type: TYPE.SAND, id: 0x02, modifiers: 0x00, inPool: false, survival: 1, address: 0x5eff4},
    { name: 'White',      type: TYPE.SAND, id: 0x03, modifiers: 0x00, inPool: false, survival: 1, address: 0x5f008},
    //Special
    { name: 'Blue Collar',    type: TYPE.SPECIAL, id: 0x04, modifiers: 0x00, inPool: false, survival: 1, address: 0x5dc64}, //-3
    { name: '?',              type: TYPE.SPECIAL, id: 0x08, modifiers: 0x00, inPool: false, survival: 0, address: 0x5dcb4}, 
    { name: 'Oleem',          type: TYPE.SPECIAL, id: 0x09, modifiers: 0x00, inPool: false, survival: 2, address: 0x5dcc8},
    //Coin
    { name: 'Copper',         type: TYPE.COIN, id: 0x01, modifiers: 0x00, inPool: false, survival: 0, address: 0x5de08}, //0
    { name: 'Silver',         type: TYPE.COIN, id: 0x02, modifiers: 0x00, inPool: false, survival: 0, address: 0x5de1c}, 
    { name: 'Gold',           type: TYPE.COIN, id: 0x03, modifiers: 0x00, inPool: false, survival: 0, address: 0x5de30}, 
    //Sword
    { name: 'Gold Sword',     type: TYPE.SWORD, id: 0x01, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5de58,}, //-1
    { name: 'Copper Sword',   type: TYPE.SWORD, id: 0x02, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5de6c,},
    { name: 'Iron Sword',     type: TYPE.SWORD, id: 0x03, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5de80,},
    { name: 'Steel Sword',    type: TYPE.SWORD, id: 0x04, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5de94,},
    { name: 'Fire Sword',     type: TYPE.SWORD, id: 0x05, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5dea8,},
    { name: 'Blizzard Sword', type: TYPE.SWORD, id: 0x06, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5debc,},
    { name: 'Gulfwind Sword', type: TYPE.SWORD, id: 0x07, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5ded0,},
    { name: 'Vital Sword',    type: TYPE.SWORD, id: 0x08, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5dee4,},
    { name: 'Dark Sword',     type: TYPE.SWORD, id: 0x09, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5def8,},
    { name: 'Holy Sword',     type: TYPE.SWORD, id: 0x0A, modifiers: 0x00, inPool: true,  survival: 0, address: 0x5df0c,},
    { name: 'Seraphim Sword', type: TYPE.SWORD, id: 0x0B, modifiers: 0x00, inPool: false, survival: 0, address: 0x5df20,}, //cutscene version
    { name: 'Seraphim Sword', type: TYPE.SWORD, id: 0x0C, modifiers: 0x00, inPool: true,  survival: 1, address: 0x5df34,},
    { name: 'Troll Sword',    type: TYPE.SWORD, id: 0x0D, modifiers: 0x00, inPool: false, survival: 0, address: 0x5df48,},
    { name: 'Hammer',         type: TYPE.SWORD, id: 0x0E, modifiers: 0x00, inPool: false, survival: 0, address: 0x5df5c,},
    { name: 'Bow Gun',        type: TYPE.SWORD, id: 0x0F, modifiers: 0x00, inPool: false, survival: 0, address: 0x5df70,},
    //Wand
    { name: 'Wooden Wand',    type: TYPE.WAND, id: 0x01, modifiers: 0x00, inPool: true, survival: 0, address: 0x5df98,}, //-5
    { name: 'Trained Wand',   type: TYPE.WAND, id: 0x02, modifiers: 0x00, inPool: true, survival: 0, address: 0x5dfac,},
    { name: 'Life Wand',      type: TYPE.WAND, id: 0x03, modifiers: 0x00, inPool: true, survival: 1, address: 0x5dfc0,},
    { name: 'Paralyze Wand',  type: TYPE.WAND, id: 0x04, modifiers: 0x00, inPool: true, survival: 1, address: 0x5dfd4,},
    { name: 'Money Wand',     type: TYPE.WAND, id: 0x05, modifiers: 0x00, inPool: true, survival: 0, address: 0x5dfe8,},
    { name: 'Scarlet Wand',   type: TYPE.WAND, id: 0x06, modifiers: 0x00, inPool: true, survival: 1, address: 0x5dffc,},
    { name: 'Stream Wand',    type: TYPE.WAND, id: 0x07, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e010,},
    { name: 'Gulf Wand',      type: TYPE.WAND, id: 0x08, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e024,},
    { name: 'Seal Wand',      type: TYPE.WAND, id: 0x09, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e038,},
    //Shield
    { name: 'Wooden Shield',  type: TYPE.SHIELD, id: 0x01, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e060,}, //-5
    { name: 'Leather Shield', type: TYPE.SHIELD, id: 0x02, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e074,},
    { name: 'Mirror Shield',  type: TYPE.SHIELD, id: 0x03, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e088,},
    { name: 'Copper Shield',  type: TYPE.SHIELD, id: 0x04, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e09c,},
    { name: 'Iron Shield',    type: TYPE.SHIELD, id: 0x05, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e0b0,},
    { name: 'Steel Shield',   type: TYPE.SHIELD, id: 0x06, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e0c4,},
    { name: 'Diamond Shield', type: TYPE.SHIELD, id: 0x07, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e0d8,},
    { name: 'Scorch Shield',  type: TYPE.SHIELD, id: 0x08, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e0ec,},
    { name: 'Ice Shield',     type: TYPE.SHIELD, id: 0x09, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e100,},
    { name: 'Earth Shield',   type: TYPE.SHIELD, id: 0x0A, modifiers: 0x00, inPool: true, survival: 1, address: 0x5e114,},
    { name: 'Live Shield',    type: TYPE.SHIELD, id: 0x0B, modifiers: 0x00, inPool: true, survival: 0, address: 0x5e128,},
    //Egg
    { name: 'Ultimate Egg', type: TYPE.EGG, id: 0x01, modifiers: 0x14, inPool: false, survival: 0,},
    { name: 'Kewne Egg',    type: TYPE.EGG, id: 0x02, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Dragon Egg',   type: TYPE.EGG, id: 0x03, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Kid Egg',      type: TYPE.EGG, id: 0x04, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Ifrit Egg',    type: TYPE.EGG, id: 0x05, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Flame Egg',    type: TYPE.EGG, id: 0x06, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Grineut Egg',  type: TYPE.EGG, id: 0x07, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Griffon Egg',  type: TYPE.EGG, id: 0x08, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Saber Egg',    type: TYPE.EGG, id: 0x09, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Snowman Egg',  type: TYPE.EGG, id: 0x0A, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Ashra Egg',    type: TYPE.EGG, id: 0x0B, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Arachne Egg',  type: TYPE.EGG, id: 0x0C, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Battnel Egg',  type: TYPE.EGG, id: 0x0D, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Nyuel Egg',    type: TYPE.EGG, id: 0x0E, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Death Egg',    type: TYPE.EGG, id: 0x0F, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Clown Egg',    type: TYPE.EGG, id: 0x10, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Univern Egg',  type: TYPE.EGG, id: 0x11, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Unicorn Egg',  type: TYPE.EGG, id: 0x12, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Metal Egg',    type: TYPE.EGG, id: 0x13, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Block Egg',    type: TYPE.EGG, id: 0x14, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Pulunpa Egg',  type: TYPE.EGG, id: 0x15, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Troll Egg',    type: TYPE.EGG, id: 0x16, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Noise Egg',    type: TYPE.EGG, id: 0x17, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'U-Boat Egg',   type: TYPE.EGG, id: 0x18, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Baloon Egg',   type: TYPE.EGG, id: 0x19, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Dreamin Egg',  type: TYPE.EGG, id: 0x1A, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Blume Egg',    type: TYPE.EGG, id: 0x1B, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Volcano Egg',  type: TYPE.EGG, id: 0x1C, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Cyclone Egg',  type: TYPE.EGG, id: 0x1D, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Manoeva Egg',  type: TYPE.EGG, id: 0x1E, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Barong Egg',   type: TYPE.EGG, id: 0x1F, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Picket Egg',   type: TYPE.EGG, id: 0x20, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Kraken Egg',   type: TYPE.EGG, id: 0x21, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Weadog Egg',   type: TYPE.EGG, id: 0x22, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Stealth Egg',  type: TYPE.EGG, id: 0x23, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Viper Egg',    type: TYPE.EGG, id: 0x24, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Naplass Egg',  type: TYPE.EGG, id: 0x25, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Zu Egg',       type: TYPE.EGG, id: 0x26, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Mandara Egg',  type: TYPE.EGG, id: 0x27, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Killer Egg',   type: TYPE.EGG, id: 0x28, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Garuda Egg',   type: TYPE.EGG, id: 0x29, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Glacier Egg',  type: TYPE.EGG, id: 0x2A, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Tyrant Egg',   type: TYPE.EGG, id: 0x2B, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Golem Egg',    type: TYPE.EGG, id: 0x2C, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Maximum Egg',  type: TYPE.EGG, id: 0x2D, modifiers: 0x14, inPool: true, survival: 0,},
    { name: 'Frog Egg',     type: TYPE.EGG, id: 0x2E, modifiers: 0x14, inPool: false, survival: 0,},
  ]

  function itemsByType(type, ignorePool) {
    return items.filter(function(item) {
      return item.type == type && (item.inPool || ignorePool)
    })
  }

  function itemFromID(id, type) {
    return items.filter(function(item) {
      return item.id == id && item.type == type
    })[0]
  }

  function setStartingItems(options, data, hex) {
    let lcgSeed = hex.length > randomItemHexSeed ? Math.abs(hex[randomItemHexSeed]) : 15;
    let lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
    if (options.startingItems || options.ballElements || options.newBalls || options.fastTutorial) {
      allowAnyBalls(data)
      const defaultWeaponIndex = 1
      const defaultShieldIndex = 0
      const defaultBallIndex = 0
      const defaultEggIndex = 0x13

      let startingItemIndex = 0
      //randomize weapon
      let swords = itemsByType(TYPE.SWORD, false)
      let wands = itemsByType(TYPE.WAND, false)
      let weapons = swords.concat(wands)
      let weaponIndex = options.startingItems ? lcg.rollBetween(0, weapons.length-1) : defaultWeaponIndex
      setItem(startingItemIndex++, weapons[weaponIndex], data, 0, options)
      //randomize shield
      let shields = itemsByType(TYPE.SHIELD, false)
      let shieldIndex = options.startingItems ? lcg.rollBetween(0, shields.length-1) : defaultShieldIndex
      setItem(startingItemIndex++, shields[shieldIndex], data, 1, options)
      //randomize ball
      let balls = itemsByType(TYPE.BALL, options.newBalls)
      let ballIndex = options.startingItems ? lcg.rollBetween(0, balls.length-1) : defaultBallIndex
      setItem(startingItemIndex++, balls[ballIndex], data, 2, options)
      //randomize egg
      let eggs = itemsByType(TYPE.EGG, false)
      let eggIndex = options.startingItems ? lcg.rollBetween(0, eggs.length-1) : defaultEggIndex
      setItem(startingItemIndex++, eggs[eggIndex], data, 3, options)

      if (options.newBalls) {
        writeMissingBallNames(data, options.newBalls)
      }
      //set medicial
      let medicinalHerb = itemsByType(TYPE.HERB, false)[0]
      setItem(startingItemIndex++, medicinalHerb, data, 4, options)

      //if fast tutorial, move elevator Y coordinate
      if (options.fastTutorial) {
        data.writeByte(constants.romAddresses.tutorialElevatorYpos, 0x31)
      }

      if (options.ballElements) {
        let balls = itemsByType(TYPE.BALL, options.newBalls)
        //length - 2 to avoid touching acid rain ball
        for (i = 0; i < balls.length - 2; i++) {
          let newElement = lcg.rollBetween(1, 3)
          //want value to be any of 1,2,4  FIXME replace with actual elements reference
          if (newElement == 3) {
            newElement++
          }
          setBallToElement(balls[i].id, newElement, data, options.newBalls)
        }
      }
    }
    if (options.eggomizer) {
      const floorEggOffset = 32
      const addressIncrement = constants.sectorSize
      let eggs = itemsByType(TYPE.EGG, false)

      for (i = 0; i < 39; i++) {
        let floorEggAddress = constants.romAddresses.floorMonsterTable + i * addressIncrement + floorEggOffset
        for (j = 0; j < 32; j++) {
          let eggIndex = lcg.rollBetween(0, eggs.length-1)
          data.writeByte(floorEggAddress++, eggs[eggIndex].id)
        }
      }
    }
    if (options.barongItems) {
      const herbs = itemsByType(TYPE.HERB, true)
      herbs.forEach(function(herb) {
        if (herb.barong) {
          data.writeByte(herb.address, 0x08)
        }
      })
    }
    applySurvivalMode(options, data)
  }

  function setItem(startingItemIndex, item, data, itemIndex, options) {
    const itemIdOffset = 2
    const defaultState = 0
    const newX = 0x1f
    const startingNewY = 0x36
    let itemAddress = constants.romAddresses.tutorialStartingItems + startingItemIndex * startingItemWidth
    if (options.fastTutorial) {
      data.writeByte(itemAddress++, newX)
      data.writeByte(itemAddress++, startingNewY - itemIndex)
    } else {
      itemAddress += itemIdOffset
    }
    data.writeByte(itemAddress++, item.id)
    data.writeByte(itemAddress++, item.type)
    data.writeByte(itemAddress++, options.startingItems ? defaultState : 0x80)
    data.writeByte(itemAddress++, item.modifiers)
  }

  function writeMissingBallNames(data, addNewBalls) {
    setBallToElement(0x0A, 0x2, data, addNewBalls)
    setBallToElement(0x0F, 0x4, data, addNewBalls)
    setBallToElement(0x10, 0x2, data, addNewBalls)
  }

  function setBallToElement(ball, element, data, addNewBalls) {
    let ballItem = itemFromID(ball, TYPE.BALL)
    let ballBitfield = data.readByte(ballItem.address + itemOffsets.bitfield)
    // if ball is not normally in game, give it default sell price
    if ((ballBitfield & 0x10) != 0) {
      const defaultSellPrice = 0x01f4
      data.writeShort(ballItem.address + itemOffsets.sellPrice, defaultSellPrice)

      //if adding ball to game, make it spawn with same rarity as other balls
      if (addNewBalls) {
        const defaultRarity = 0x20
        ballBitfield = (ballBitfield & 0xef)
        data.writeByte(ballItem.address + itemOffsets.rarity, defaultRarity)
      }
    }

    //set ball's new element
    data.writeByte(ballItem.address + itemOffsets.bitfield, (0xF0 & ballBitfield) | element)
    let newBallName = ballItem.names[element - 1]
    //if new name is 0, keep old name
    if (newBallName != 0) {
      data.writeWord(ballItem.address + itemOffsets.itemName, newBallName)
    }
    //if new name is 0, keep old name
    let newBallDesc = ballItem.descriptions[element - 1]
    if (newBallDesc != 0) {
      data.writeWord(ballItem.address + itemOffsets.description, newBallDesc)
    }

    //need to change buy price since reusing that field as actual spell
    let newSpellId = ballItem.spellId
    //FIXME replace with actual elements reference
    let spellElement = ((ballItem.spellId - 1) % 3) + 1
    if (spellElement == 3) {
      spellElement++
    }
    while (spellElement < element) {
      spellElement *= 2
      newSpellId++
    }
    while (spellElement > element) {
      spellElement /= 2
      newSpellId--
    }
    console.log("Set ball "+ballItem.name+" to element "+spellElement)
    data.writeByte(ballItem.address + itemOffsets.buyPrice, newSpellId)
  }

  function allowAnyBalls(data) {
    const balls = itemsByType(TYPE.BALL, true)
    balls.forEach(function(ball) {
      data.writeByte(ball.address + itemOffsets.buyPrice, ball.spellId)
    })
    //write custom code
    let addressWhereGetBallsSpellId = 0x1c98df0
    data.writeInstruction(addressWhereGetBallsSpellId, 0x10004290)
    var i;
    for (i = 0; i < 7; i++) {
      addressWhereGetBallsSpellId += 4
      data.writeInstruction(addressWhereGetBallsSpellId, 0x00000000)
    }
  }

  function applySurvivalMode(options, data) {
    if (options.survival) {
      let currentAddress = constants.romAddresses.debugFloorFirstItem
      let instance = 0
      let category = 0
      let instanceWithinCategory = 0

      items.forEach(function(item) {
        //set current category
        if (item.type !== category) {
          category = item.type
          instanceWithinCategory = 0
        }
        //prevent item from spawning
        if (item.address) {
          data.writeByte(item.address, data.readByte(item.address) | 0x10)
        }
        for(instance = 0; instance < item.survival; instance++) {
          //place item in test room
          if (currentAddress < constants.romAddresses.debugFloorItemEnd) {
            data.writeByte(currentAddress++, item.type * 2 + 0x10) //x position
            data.writeByte(currentAddress++, ++instanceWithinCategory + 0x10) //y position
            data.writeByte(currentAddress++, item.id) //ID
            data.writeByte(currentAddress++, item.type) //category
            data.writeByte(currentAddress++, 0) //status
            data.writeByte(currentAddress++, item.modifiers) //quality
          }
        }
      })

      //fill any blank items - shouldn't be any with current settings
      let questionItem = itemFromID(0x08, TYPE.SPECIAL)
      instance = 0
      while (currentAddress < constants.romAddresses.debugFloorItemEnd) {
        data.writeByte(currentAddress++, 0x10) //x position
        data.writeByte(currentAddress++, instance++) //y position
        data.writeByte(currentAddress++, questionItem.id) //ID
        data.writeByte(currentAddress++, questionItem.type) //category
        data.writeByte(currentAddress++, 0) //status
        data.writeByte(currentAddress++, questionItem.modifiers) //quality
      }

      //replace tutorial with test room
      data.writeByte(constants.romAddresses.tutorialFloorId1, 0x08)
      data.writeByte(constants.romAddresses.tutorialFloorId2, 0x08)

      //overwrite call to replace kewne with tutorial version or game crashes with Kewne in survival mode due to wild routine 0x800f6d28 being called from 0x80152980
      data.writeInstruction(constants.romAddresses.callReplaceKewneTut1, 0x00000000)
      data.writeInstruction(constants.romAddresses.callReplaceKewneTut2, 0x00000000)

      //turn off spawning extra wind crystals
      data.writeByte(constants.romAddresses.windCrystalCheck1, 0x00)
      data.writeByte(constants.romAddresses.windCrystalCheck2, 0x00)
    }
  }

  const exports = {items: items,
                   setStartingItems: setStartingItems,}
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      items: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
