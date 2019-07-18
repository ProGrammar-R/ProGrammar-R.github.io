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
  const randomItemHexSeed = 8

  const TYPE = constants.TYPE

  const items = [
    //Ball
    { name: 'Fire',       type: TYPE.BALL, id: 0x01, modifiers: 0x05, inPool: true,},
    { name: 'Blaze',      type: TYPE.BALL, id: 0x02, modifiers: 0x05, inPool: true,},
    { name: 'Flame',      type: TYPE.BALL, id: 0x03, modifiers: 0x05, inPool: true,},
    { name: 'Pillar',     type: TYPE.BALL, id: 0x04, modifiers: 0x05, inPool: true,},
    { name: 'Poison',     type: TYPE.BALL, id: 0x05, modifiers: 0x05, inPool: true,},
    { name: 'Water',      type: TYPE.BALL, id: 0x06, modifiers: 0x05, inPool: true,},
    { name: 'Repel',      type: TYPE.BALL, id: 0x07, modifiers: 0x05, inPool: true,},
    { name: 'Ice Rock',   type: TYPE.BALL, id: 0x08, modifiers: 0x05, inPool: true,},
    { name: 'Recovery',   type: TYPE.BALL, id: 0x09, modifiers: 0x05, inPool: true,},
    { name: 'DeForth',    type: TYPE.BALL, id: 0x0A, modifiers: 0x05, inPool: true,},
    { name: 'Blinder',    type: TYPE.BALL, id: 0x0B, modifiers: 0x05, inPool: true,},
    { name: 'Binding',    type: TYPE.BALL, id: 0x0C, modifiers: 0x05, inPool: true,},
    { name: 'Sleep',      type: TYPE.BALL, id: 0x0D, modifiers: 0x05, inPool: true,},
    { name: 'Weak',       type: TYPE.BALL, id: 0x0E, modifiers: 0x05, inPool: true,},
    { name: 'LaGrave',    type: TYPE.BALL, id: 0x0F, modifiers: 0x05, inPool: true,},
    //{ name: 'Unknown (No Name)', type: TYPE.BALL, id: 0x10, modifiers: 0x00, inPool: false,},
    { name: 'Acid Rain',  type: TYPE.BALL, id: 0x11, modifiers: 0x01, inPool: true,},
    //Sword
    { name: 'Gold Sword',     type: TYPE.SWORD, id: 0x01, modifiers: 0x00, inPool: true,},
    { name: 'Copper Sword',   type: TYPE.SWORD, id: 0x02, modifiers: 0x00, inPool: true,},
    { name: 'Iron Sword',     type: TYPE.SWORD, id: 0x03, modifiers: 0x00, inPool: true,},
    { name: 'Steel Sword',    type: TYPE.SWORD, id: 0x04, modifiers: 0x00, inPool: true,},
    { name: 'Fire Sword',     type: TYPE.SWORD, id: 0x05, modifiers: 0x00, inPool: true,},
    { name: 'Blizzard Sword', type: TYPE.SWORD, id: 0x06, modifiers: 0x00, inPool: true,},
    { name: 'Gulfwind Sword', type: TYPE.SWORD, id: 0x07, modifiers: 0x00, inPool: true,},
    { name: 'Vital Sword',    type: TYPE.SWORD, id: 0x08, modifiers: 0x00, inPool: true,},
    { name: 'Dark Sword',     type: TYPE.SWORD, id: 0x09, modifiers: 0x00, inPool: true,},
    { name: 'Holy Sword',     type: TYPE.SWORD, id: 0x0A, modifiers: 0x00, inPool: true,},
    { name: 'Seraphim Sword', type: TYPE.SWORD, id: 0x0B, modifiers: 0x00, inPool: false,}, //cutscene version
    { name: 'Seraphim Sword', type: TYPE.SWORD, id: 0x0C, modifiers: 0x00, inPool: true,},
    //Wand
    { name: 'Wooden Wand',    type: TYPE.WAND, id: 0x01, modifiers: 0x00, inPool: true,},
    { name: 'Trained Wand',   type: TYPE.WAND, id: 0x02, modifiers: 0x00, inPool: true,},
    { name: 'Life Wand',      type: TYPE.WAND, id: 0x03, modifiers: 0x00, inPool: true,},
    { name: 'Paralyze Wand',  type: TYPE.WAND, id: 0x04, modifiers: 0x00, inPool: true,},
    { name: 'Money Wand',     type: TYPE.WAND, id: 0x05, modifiers: 0x00, inPool: true,},
    { name: 'Scarlet Wand',   type: TYPE.WAND, id: 0x06, modifiers: 0x00, inPool: true,},
    { name: 'Stream Wand',    type: TYPE.WAND, id: 0x07, modifiers: 0x00, inPool: true,},
    { name: 'Gulf Wand',      type: TYPE.WAND, id: 0x08, modifiers: 0x00, inPool: true,},
    { name: 'Seal Wand',      type: TYPE.WAND, id: 0x09, modifiers: 0x00, inPool: true,},
    //Shield
    { name: 'Wooden Shield',  type: TYPE.SHIELD, id: 0x01, modifiers: 0x00, inPool: true,},
    { name: 'Leather Shield', type: TYPE.SHIELD, id: 0x02, modifiers: 0x00, inPool: true,},
    { name: 'Mirror Shield',  type: TYPE.SHIELD, id: 0x03, modifiers: 0x00, inPool: true,},
    { name: 'Copper Shield',  type: TYPE.SHIELD, id: 0x04, modifiers: 0x00, inPool: true,},
    { name: 'Iron Shield',    type: TYPE.SHIELD, id: 0x05, modifiers: 0x00, inPool: true,},
    { name: 'Steel Shield',   type: TYPE.SHIELD, id: 0x06, modifiers: 0x00, inPool: true,},
    { name: 'Diamond Shield', type: TYPE.SHIELD, id: 0x07, modifiers: 0x00, inPool: true,},
    { name: 'Scorch Shield',  type: TYPE.SHIELD, id: 0x08, modifiers: 0x00, inPool: true,},
    { name: 'Ice Shield',     type: TYPE.SHIELD, id: 0x09, modifiers: 0x00, inPool: true,},
    { name: 'Earth Shield',   type: TYPE.SHIELD, id: 0x0A, modifiers: 0x00, inPool: true,},
    { name: 'Live Shield',    type: TYPE.SHIELD, id: 0x0B, modifiers: 0x00, inPool: true,},
    //Egg
    { name: 'Ultimate Egg', type: TYPE.EGG, id: 0x01, modifiers: 0x14, inPool: true,},
    { name: 'Kewne Egg',    type: TYPE.EGG, id: 0x02, modifiers: 0x14, inPool: true,},
    { name: 'Dragon Egg',   type: TYPE.EGG, id: 0x03, modifiers: 0x14, inPool: true,},
    { name: 'Kid Egg',      type: TYPE.EGG, id: 0x04, modifiers: 0x14, inPool: true,},
    { name: 'Ifrit Egg',    type: TYPE.EGG, id: 0x05, modifiers: 0x14, inPool: true,},
    { name: 'Flame Egg',    type: TYPE.EGG, id: 0x06, modifiers: 0x14, inPool: true,},
    { name: 'Grineut Egg',  type: TYPE.EGG, id: 0x07, modifiers: 0x14, inPool: true,},
    { name: 'Griffon Egg',  type: TYPE.EGG, id: 0x08, modifiers: 0x14, inPool: true,},
    { name: 'Saber Egg',    type: TYPE.EGG, id: 0x09, modifiers: 0x14, inPool: true,},
    { name: 'Snowman Egg',  type: TYPE.EGG, id: 0x0A, modifiers: 0x14, inPool: true,},
    { name: 'Ashra Egg',    type: TYPE.EGG, id: 0x0B, modifiers: 0x14, inPool: true,},
    { name: 'Arachne Egg',  type: TYPE.EGG, id: 0x0C, modifiers: 0x14, inPool: true,},
    { name: 'Battnel Egg',  type: TYPE.EGG, id: 0x0D, modifiers: 0x14, inPool: true,},
    { name: 'Nyuel Egg',    type: TYPE.EGG, id: 0x0E, modifiers: 0x14, inPool: true,},
    { name: 'Death Egg',    type: TYPE.EGG, id: 0x0F, modifiers: 0x14, inPool: true,},
    { name: 'Clown Egg',    type: TYPE.EGG, id: 0x10, modifiers: 0x14, inPool: true,},
    { name: 'Univern Egg',  type: TYPE.EGG, id: 0x11, modifiers: 0x14, inPool: true,},
    { name: 'Unicorn Egg',  type: TYPE.EGG, id: 0x12, modifiers: 0x14, inPool: true,},
    { name: 'Metal Egg',    type: TYPE.EGG, id: 0x13, modifiers: 0x14, inPool: true,},
    { name: 'Block Egg',    type: TYPE.EGG, id: 0x14, modifiers: 0x14, inPool: true,},
    { name: 'Pulunpa Egg',  type: TYPE.EGG, id: 0x15, modifiers: 0x14, inPool: true,},
    { name: 'Troll Egg',    type: TYPE.EGG, id: 0x16, modifiers: 0x14, inPool: true,},
    { name: 'Noise Egg',    type: TYPE.EGG, id: 0x17, modifiers: 0x14, inPool: true,},
    { name: 'U-Boat Egg',   type: TYPE.EGG, id: 0x18, modifiers: 0x14, inPool: true,},
    { name: 'Baloon Egg',   type: TYPE.EGG, id: 0x19, modifiers: 0x14, inPool: true,},
    { name: 'Dreamin Egg',  type: TYPE.EGG, id: 0x1A, modifiers: 0x14, inPool: true,},
    { name: 'Blume Egg',    type: TYPE.EGG, id: 0x1B, modifiers: 0x14, inPool: true,},
    { name: 'Volcano Egg',  type: TYPE.EGG, id: 0x1C, modifiers: 0x14, inPool: true,},
    { name: 'Cyclone Egg',  type: TYPE.EGG, id: 0x1D, modifiers: 0x14, inPool: true,},
    { name: 'Manoeva Egg',  type: TYPE.EGG, id: 0x1E, modifiers: 0x14, inPool: true,},
    { name: 'Barong Egg',   type: TYPE.EGG, id: 0x1F, modifiers: 0x14, inPool: true,},
    { name: 'Picket Egg',   type: TYPE.EGG, id: 0x20, modifiers: 0x14, inPool: true,},
    { name: 'Kraken Egg',   type: TYPE.EGG, id: 0x21, modifiers: 0x14, inPool: true,},
    { name: 'Weadog Egg',   type: TYPE.EGG, id: 0x22, modifiers: 0x14, inPool: true,},
    { name: 'Stealth Egg',  type: TYPE.EGG, id: 0x23, modifiers: 0x14, inPool: true,},
    { name: 'Viper Egg',    type: TYPE.EGG, id: 0x24, modifiers: 0x14, inPool: true,},
    { name: 'Naplass Egg',  type: TYPE.EGG, id: 0x25, modifiers: 0x14, inPool: true,},
    { name: 'Zu Egg',       type: TYPE.EGG, id: 0x26, modifiers: 0x14, inPool: true,},
    { name: 'Mandara Egg',  type: TYPE.EGG, id: 0x27, modifiers: 0x14, inPool: true,},
    { name: 'Killer Egg',   type: TYPE.EGG, id: 0x28, modifiers: 0x14, inPool: true,},
    { name: 'Garuda Egg',   type: TYPE.EGG, id: 0x29, modifiers: 0x14, inPool: true,},
    { name: 'Glacier Egg',  type: TYPE.EGG, id: 0x2A, modifiers: 0x14, inPool: true,},
    { name: 'Tyrant Egg',   type: TYPE.EGG, id: 0x2B, modifiers: 0x14, inPool: true,},
    { name: 'Golem Egg',    type: TYPE.EGG, id: 0x2C, modifiers: 0x14, inPool: true,},
    { name: 'Maximum Egg',  type: TYPE.EGG, id: 0x2D, modifiers: 0x14, inPool: true,},
  ]

  function itemsByType(type) {
    return items.filter(function(item) {
      return item.type == type && item.inPool
    })
  }

  function setStartingItems(options, data, hex) {
    if (options.startingItems) {
      let lcgSeed = hex.length > randomItemHexSeed ? Math.abs(hex[randomItemHexSeed]) : 15;
      let lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
      let startingItemIndex = 0
      //randomize weapon
      let swords = itemsByType(TYPE.SWORD)
      let wands = itemsByType(TYPE.WAND)
      let weapons = swords.concat(wands)
      let weaponIndex = lcg.rollBetween(0, weapons.length-1)
      setItem(startingItemIndex++, weapons[weaponIndex], data)
      //randomize shield
      let shields = itemsByType(TYPE.SHIELD)
      let shieldIndex = lcg.rollBetween(0, shields.length-1)
      setItem(startingItemIndex++, shields[shieldIndex], data)
      //randomize ball
      let balls = itemsByType(TYPE.BALL)
      let ballIndex = lcg.rollBetween(0, balls.length-1)
      setItem(startingItemIndex++, balls[ballIndex], data)
      //randomize egg
      let eggs = itemsByType(TYPE.EGG)
      let eggIndex = lcg.rollBetween(0, eggs.length-1)
      setItem(startingItemIndex++, eggs[eggIndex], data)
    }
  }

  function setItem(startingItemIndex, item, data) {
    const startingItemsAddress = 0x248CF78
    const itemIdOffset = 2
    const defaultState = 0
    let itemAddress = startingItemsAddress + startingItemIndex * startingItemWidth + itemIdOffset
    data.writeByte(itemAddress++, item.id)
    data.writeByte(itemAddress++, item.type)
    data.writeByte(itemAddress++, defaultState)
    data.writeByte(itemAddress++, item.modifiers)
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
