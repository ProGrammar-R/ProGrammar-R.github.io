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
    //Ball
    { name: 'Fire',       type: TYPE.BALL, id: 0x01, modifiers: 0x05, inPool: true,  address: 0x5ecd4, spellId: 0x01, names: [0, 0x8002E3E8, 0, 0x8002E39C],          descriptions: [0, 0x8002E3B0, 0, 0x8002E364],},
    { name: 'Blaze',      type: TYPE.BALL, id: 0x02, modifiers: 0x05, inPool: true,  address: 0x5ece8, spellId: 0x04, names: [0, 0x8002E314, 0, 0x8002E2D0],          descriptions: [0, 0x8002E2E0, 0, 0x8002E2A0],},
    { name: 'Flame',      type: TYPE.BALL, id: 0x03, modifiers: 0x05, inPool: true,  address: 0x5ecfc, spellId: 0x07, names: [0, 0x8002E264, 0, 0x8002E218],          descriptions: [0, 0x8002E228, 0, 0x8002E1E0],},
    { name: 'Pillar',     type: TYPE.BALL, id: 0x04, modifiers: 0x05, inPool: true,  address: 0x5ed10, spellId: 0x0a, names: [0, 0x8002E184, 0, 0x8002E138],          descriptions: [0, 0x8002E148, 0, 0x8002E10C],},
    { name: 'Poison',     type: TYPE.BALL, id: 0x05, modifiers: 0x05, inPool: true,  address: 0x5ed24, spellId: 0x0d, names: [0, 0x8002E0B8, 0, 0x8002E078],          descriptions: [0, 0x8002E08C, 0, 0x8002E048],},
    { name: 'Water',      type: TYPE.BALL, id: 0x06, modifiers: 0x05, inPool: true,  address: 0x5ed38, spellId: 0x11, names: [0x8002E038, 0, 0, 0x8002DF6C],          descriptions: [0x8002DFFC, 0, 0, 0x8002DF2C],},
    { name: 'Repel',      type: TYPE.BALL, id: 0x07, modifiers: 0x05, inPool: true,  address: 0x5ed4c, spellId: 0x14, names: [0x8002DEFC, 0, 0, 0x8002DE64],          descriptions: [0x8002DEC4, 0, 0, 0x8002DE2C],},
    { name: 'Ice Rock',   type: TYPE.BALL, id: 0x08, modifiers: 0x05, inPool: true,  address: 0x5ed60, spellId: 0x17, names: [0x8002DE1C, 0, 0, 0x8002DD58],          descriptions: [0x8002DDE0, 0, 0, 0x8002DD20],},
    { name: 'Recovery',   type: TYPE.BALL, id: 0x09, modifiers: 0x05, inPool: true,  address: 0x5ed74, spellId: 0x1a, names: [0x8002DCF8, 0, 0, 0x8002DC6C],          descriptions: [0x8002DCBC, 0, 0, 0x8002DC34],},
    { name: 'DeForth',    type: TYPE.BALL, id: 0x0A, modifiers: 0x05, inPool: false, address: 0x5ed88, spellId: 0x1d, names: [0x8002DC20, 0x8002DBD8, 0, 0x8002DB84], descriptions: [0x8002DBE8, 0x8002DB98, 0, 0x8002DB4C],},
    { name: 'Blinder',    type: TYPE.BALL, id: 0x0B, modifiers: 0x05, inPool: true,  address: 0x5ed9c, spellId: 0x21, names: [0x8002DB3C, 0x8002DAF4, 0, 0],          descriptions: [0x8002DB04, 0x8002DAB8, 0, 0],},
    { name: 'Binding',    type: TYPE.BALL, id: 0x0C, modifiers: 0x05, inPool: true,  address: 0x5edb0, spellId: 0x24, names: [0x8002DA60, 0x8002DA10, 0, 0],          descriptions: [0x8002DA20, 0x8002D9D0, 0, 0],},
    { name: 'Sleep',      type: TYPE.BALL, id: 0x0D, modifiers: 0x05, inPool: true,  address: 0x5edc4, spellId: 0x27, names: [0x8002D974, 0x8002D930, 0, 0],          descriptions: [0x8002D940, 0x8002D8FC, 0, 0],},
    { name: 'Weak',       type: TYPE.BALL, id: 0x0E, modifiers: 0x05, inPool: true,  address: 0x5edd8, spellId: 0x2a, names: [0x8002D8A8, 0x8002D864, 0, 0],          descriptions: [0x8002D874, 0x8002D820, 0, 0],},
    { name: 'LoGrave',    type: TYPE.BALL, id: 0x0F, modifiers: 0x05, inPool: false, address: 0x5edec, spellId: 0x2d, names: [0x8002D7C0, 0x8002D770, 0, 0x8002D730], descriptions: [0x8002D784, 0x8002D740, 0, 0x8002D6FC],},
    { name: 'LeoGrave',   type: TYPE.BALL, id: 0x10, modifiers: 0x05, inPool: false, address: 0x5ee00, spellId: 0x2c, names: [0x8002D7C0, 0x8002D770, 0, 0x8002D730], descriptions: [0x8002D784, 0x8002D740, 0, 0x8002D6FC],},
    { name: 'Acid Rain',  type: TYPE.BALL, id: 0x11, modifiers: 0x01, inPool: true,  address: 0x5ee14, spellId: 0x31, names: [0, 0, 0, 0],                            descriptions: [0, 0, 0, 0]},
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
    { name: 'Ultimate Egg', type: TYPE.EGG, id: 0x01, modifiers: 0x14, inPool: false,},
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
    if (options.startingItems || options.ballElements) {
      allowAnyBalls(data)
      if (options.startingItems) {
        let startingItemIndex = 0
        //randomize weapon
        let swords = itemsByType(TYPE.SWORD, false)
        let wands = itemsByType(TYPE.WAND, false)
        let weapons = swords.concat(wands)
        let weaponIndex = lcg.rollBetween(0, weapons.length-1)
        setItem(startingItemIndex++, weapons[weaponIndex], data)
        //randomize shield
        let shields = itemsByType(TYPE.SHIELD, false)
        let shieldIndex = lcg.rollBetween(0, shields.length-1)
        setItem(startingItemIndex++, shields[shieldIndex], data)
        //randomize ball
        let balls = itemsByType(TYPE.BALL, options.newBalls)
        let ballIndex = lcg.rollBetween(0, balls.length-1)
        setItem(startingItemIndex++, balls[ballIndex], data)
        //randomize egg
        let eggs = itemsByType(TYPE.EGG, false)
        let eggIndex = lcg.rollBetween(0, eggs.length-1)
        setItem(startingItemIndex++, eggs[eggIndex], data)
        if (options.newBalls) {
          writeMissingBallNames(data, options.newBalls)
        }
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
    let balls = itemsByType(TYPE.BALL, true)
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
