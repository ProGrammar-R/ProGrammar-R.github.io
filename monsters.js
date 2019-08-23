(function(self) {

  let util

  if (self) {
    util = self.adRando.util
    constants = self.adRando.constants
  } else {
    util = require('./util')
    constants = require('./constants')
  }

  const randomStarterOptionValue = 0

  //which words from the hex string control which aspects
  const randomStarterHexKey = 6
  const randomStarterElementHexKey = 7

  const initialStatsAddress = 0x57f30;
  const initialStatsRowLength = 24;
  const initialStatsElementOffset = 20;
  const initialStatsSpell1Offset = 8;

  const allElements = [
    {ID: -3, name: "Default",   primary: false, isDefault: true},
    {ID: -2, name: "Randomize", primary: false, isDefault: false},
    {ID: -1, name: "Atypical",  primary: false, isDefault: false},
    {ID: 0,  name: "Tri",       primary: false, isDefault: false},
    {ID: 0x01, name: "Fire",    primary: true,  isDefault: false},
    {ID: 0x02, name: "Water",   primary: true,  isDefault: false},
    {ID: 0x04, name: "Wind",    primary: true,  isDefault: false},
  ]

  const allMonsters = [
    {ID: 0x01, name: "Hikewne", scaling: 0.8,},
    {ID: 0x02, name: "Kewne",   scaling: 0.9,},
    {ID: 0x03, name: "Dragon",  scaling: 0.8,},
    {ID: 0x04, name: "Kid",     scaling: 0.8,},
    {ID: 0x05, name: "Ifrit",   scaling: 0.9,},
    {ID: 0x06, name: "Flame",   scaling: 0.9,},
    {ID: 0x07, name: "Grineut", scaling: 0.9,},
    {ID: 0x08, name: "Griffon", scaling: 0.9,},
    {ID: 0x09, name: "Saber",   scaling: 0.9,},
    {ID: 0x0A, name: "Snowman", scaling: 0.9,},
    {ID: 0x0B, name: "Ashra",   scaling: 0.9,},
    {ID: 0x0C, name: "Arachne", scaling: 0.9,},
    {ID: 0x0D, name: "Battnel", scaling: 0.9,},
    {ID: 0x0E, name: "Nyuel",   scaling: 0.9,},
    {ID: 0x0F, name: "Death",   scaling: 0.9,},
    {ID: 0x10, name: "Clown",   scaling: 0.9,},
    {ID: 0x11, name: "Univern", scaling: 0.9,},
    {ID: 0x12, name: "Unicorn", scaling: 0.9,},
    {ID: 0x13, name: "Metal",   scaling: 0.9,},
    {ID: 0x14, name: "Block",   scaling: 0.9,},
    {ID: 0x15, name: "Pulunpa", scaling: 1,},
    {ID: 0x16, name: "Troll",   scaling: 1,},
    {ID: 0x17, name: "Noise",   scaling: 1,},
    {ID: 0x18, name: "U-Boat",  scaling: 0.9,},
    {ID: 0x19, name: "Baloon",  scaling: 0.9,},
    {ID: 0x1A, name: "Dreamin", scaling: 0.9,},
    {ID: 0x1B, name: "Blume",   scaling: 0.9,},
    {ID: 0x1C, name: "Volcano", scaling: 0.9,},
    {ID: 0x1D, name: "Cyclone", scaling: 0.9,},
    {ID: 0x1E, name: "Manoeva", scaling: 0.9,},
    {ID: 0x1F, name: "Barong",  scaling: 0.8,},
    {ID: 0x20, name: "Picket",  scaling: 1,},
    {ID: 0x21, name: "Kraken",  scaling: 0.9,},
    {ID: 0x22, name: "Weadog",  scaling: 0.9,},
    {ID: 0x23, name: "Stealth", scaling: 0.9,},
    {ID: 0x24, name: "Viper",   scaling: 0.9,},
    {ID: 0x25, name: "Naplass", scaling: 0.9,},
    {ID: 0x26, name: "Zu",      scaling: 0.9,},
    {ID: 0x27, name: "Mandara", scaling: 1,},
    {ID: 0x28, name: "Killer",  scaling: 0.9,},
    {ID: 0x29, name: "Garuda",  scaling: 0.9,},
    {ID: 0x2A, name: "Glacier", scaling: 0.8,},
    {ID: 0x2B, name: "Tyrant",  scaling: 0.9,},
    {ID: 0x2C, name: "Golem",   scaling: 0.8,},
    {ID: 0x2D, name: "Maximum", scaling: 0.8,},
  ]

  const hiddenSpellOptions = [
    {ID: 0, name: "Default (none)",             isDefault: true,},
    {ID: 1, name: "Starting monster's type",    isDefault: false,},
    {ID: 2, name: "All monsters", isDefault: false,},
  ]

  function thingFromName(thingList, name) {
    return thingList.filter(function(thing) {
      return thing.name === name
    })[0]
  }

  function removeValueNamed(someValues, name) {
    return someValues.filter(function(someValue) {
      return someValue.name !== name
    })
  }

  function removeValueWithID(someValues, ID) {
    return someValues.filter(function(someValue) {
      return someValue.ID != ID
    })
  }


  function getPrimaryElements() {
    return allElements.filter(function(element) {
      return element.primary
    })
  }

  function elementFromName(name) {
    return thingFromName(allElements, name)
  }

  function monsterFromName(name) {
    return thingFromName(allMonsters, name)
  }

  function monsterFromID(ID) {
    return allMonsters.filter(function(monster) {
      return monster.ID == ID
    })[0]
  }

  function removeMonsterWithID(someMonsters, ID) {
    return someMonsters.filter(function(monster) {
      return monster.ID != ID
    })
  }

  function hiddenSpellOptionFromName(name) {
    return thingFromName(hiddenSpellOptions, name)
  }

  function setEnemizer(options, data, hex) {
    if (options.enemizer) {
      const addressIncrement = 0x930
      const maxMonsterTypesPerFloor = 4
      const firstPossibleBarongFloor = 10
      const normalBarongFloorLSD = 6
      const whitePicketFloor = 25
      const firstFloorForHealers = 6

      let address = 0x24638e8
      let f = 1
      let s = 0
      let lcgSeed = hex.length > 0 ? Math.abs(hex[s++]) : 15;
      let lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
      let barongFloorLSD = options.barongs ? lcg.rollBetween(0,9) : normalBarongFloorLSD
      while (f < 40) {
        let floorMonsters = []
        let slotsRemaining = 16
        let monsterChoices = removeValueNamed(allMonsters, "Barong")
        if (f >= firstPossibleBarongFloor && f % 10 === barongFloorLSD) {
          floorMonsters.push({ID: monsterFromName("Barong").ID, level: 20, slots: 1})
          slotsRemaining--
        }
        if (f === whitePicketFloor) {
          floorMonsters.push({ID: monsterFromName("Picket").ID, level: 17, slots: 1})
          monsterChoices = removeValueNamed(monsterChoices, "Picket")
          slotsRemaining--
        }
        if (f < firstFloorForHealers) {
          monsterChoices = removeValueNamed(monsterChoices, "Battnel")
          monsterChoices = removeValueNamed(monsterChoices, "Nyuel")
          if (!!options.hiddenSpells) { //these monsters gain healing
            monsterChoices = removeValueNamed(monsterChoices, "Pulunpa")
            monsterChoices = removeValueNamed(monsterChoices, "Manoeva")
            monsterChoices = removeValueNamed(monsterChoices, "Mandara")
          }
        }
        while (floorMonsters.length < maxMonsterTypesPerFloor) {
          let idOfMonsterToAdd = lcg.rollBetween(0, monsterChoices.length-1)
          let monsterToAdd = monsterChoices[idOfMonsterToAdd]
          monsterChoices = removeMonsterWithID(monsterChoices, monsterToAdd.ID)

          let monsterSlots = 0
          //is this the last monster to add?
          if (floorMonsters.length + 1 === maxMonsterTypesPerFloor) {
            monsterSlots = slotsRemaining
          } else {
            let monsterSlotsMin = Math.max(1, Math.round(slotsRemaining / (maxMonsterTypesPerFloor - floorMonsters.length)))
            let monsterSlotsMax = Math.min(Math.round(slotsRemaining / 2), slotsRemaining - (maxMonsterTypesPerFloor + 1 - floorMonsters.length))

            //some of these checks may not be strictly necessary, but exist for peace of mind
            if (monsterSlotsMax > slotsRemaining) {
              monsterSlotsMax = slotsRemaining
            }
            if (monsterSlotsMin > slotsRemaining) {
              monsterSlotsMin = slotsRemaining
            }
            if (monsterSlotsMin > monsterSlotsMax) {
              monsterSlotsMin = monsterSlotsMax
            }
            monsterSlots = lcg.rollBetween(monsterSlotsMin, monsterSlotsMax)
          }
          slotsRemaining -= monsterSlots

          let monsterLevel = Math.max(1, Math.round(monsterToAdd.scaling * f))
          //let's make Trolls always at least level 2, for old time's sake
          if (monsterToAdd.name === "Troll") {
            monsterLevel = Math.max(2, monsterLevel)
          }
          floorMonsters.push({ID: monsterToAdd.ID, level: monsterLevel, slots: monsterSlots})
        }

        let floorMonsterAddress = address
        floorMonsters.forEach(function(floorMonster, index) {
          while(floorMonster.slots-- > 0) {
            data.writeByte(floorMonsterAddress++, floorMonster.ID)
            data.writeByte(floorMonsterAddress++, floorMonster.level)
          }
        })
        address += addressIncrement
        f++
      }
    }
    //For some reason, calling setStarter from index.js doesn't work
    setStarter(options, data, hex)
  }

  function setStarter(options, data, hex) {
    const addresses = [
      {location: 0xa2d8b0,},
      {location: 0xa2d92c,},
      {location: 0xa2d94c,},
    ]
    let starter = options.starter
    if (starter == randomStarterOptionValue) {
      if (hex.length > randomStarterHexKey) {
        starter = 1 + Math.abs(hex[randomStarterHexKey]) % allMonsters.length
      } else {
        starter = monsterFromName("Kewne").ID
      }
    }
    addresses.forEach(function(starterAddress) {
      data.writeByte(starterAddress.location, starter)
    })
    setHiddenSpellsAvailable(options, data, starter)
    setRandomStarterElement(options, data, hex, starter)
    randomizeMonsterElements(options, data, hex, starter)
  }

  function setRandomStarterElement(options, data, hex, starterId) {
    let initialElementAddress = getElementStatAddressForMonster(starterId)
    let starterElement = data.readByte(initialElementAddress)
    let starterDefaultElement = starterElement
    let tri = elementFromName("Tri").ID
    let atypical = elementFromName("Atypical").ID
    //console.log('Initial starter element ' + starterElement)
    primaryElements = getPrimaryElements()

    if (options.starterElement != util.getDefaultFromList(allElements).ID) {
      if (options.starterElement == elementFromName("Randomize").ID || options.starterElement == atypical) {
        let elementIndex = 0
        let elementsToChooseFrom = primaryElements
        //if chosen atypical, remove the default option from the list, except if tri, in which case all primary are atypical
        if (options.starterElement == atypical && starterElement != tri) {
          elementsToChooseFrom = removeValueWithID(elementsToChooseFrom, starterElement)
        }
        if (hex.length > randomStarterElementHexKey) {
          elementIndex = Math.abs(hex[randomStarterElementHexKey]) % elementsToChooseFrom.length
        }
        starterElement = elementsToChooseFrom[elementIndex].ID
      } else {
        starterElement = options.starterElement
      }
      //console.log('New starter element ' + starterElement)
      data.writeByte(initialElementAddress, starterElement)

      //need to change starter spell to match element
      let initialSpellAddress = initialStatsAddress + starterId * initialStatsRowLength + initialStatsSpell1Offset
      let starterSpell = data.readByte(initialSpellAddress)

      //but only change it for monsters that have spells, aren't Tri, and weren't originally Tri (Hikewne)
      if (!!starterSpell && starterDefaultElement != tri) {
        if (starterElement != tri) {
          let spellElement = primaryElements[(starterSpell - 1) % primaryElements.length].ID
          //console.log('Spell ID '+starterSpell)
          //console.log('Spell element '+spellElement)
          //console.log('Starter element '+starterElement)
          while (spellElement < starterElement) {
            spellElement *= 2
            starterSpell++
            //console.log('starterSpell ID ' + starterSpell)
          }
          while (spellElement > starterElement) {
            spellElement /= 2
            starterSpell--
            //console.log('starterSpell ID ' + starterSpell)
          }
        } else {
          //disable for monsters that weren't originally Tri
          starterSpell = 0
          //zero out levels, too
          data.writeByte(initialSpellAddress + 1, 0)
          data.writeByte(initialSpellAddress + 2, 0)
        }
        data.writeByte(initialSpellAddress, starterSpell)
      }
    }
  }

  function setHiddenSpellsAvailable(options, data, starter) {
    const hiddenSpellTableAddress = 0x376318c
    if (options.hiddenSpells != util.getDefaultFromList(hiddenSpellOptions).ID) {
      let changeForAllMonsters = options.hiddenSpells == hiddenSpellOptionFromName("All monsters").ID
      allMonsters.forEach(function(monster) {
        if (changeForAllMonsters || monster.ID == starter) {
          let hiddenSpell = data.readByte(hiddenSpellTableAddress + monster.ID)
          let initialSpellAddress = initialStatsAddress + monster.ID * initialStatsRowLength + initialStatsSpell1Offset
          if (!!hiddenSpell) {
            data.writeByte(initialSpellAddress, hiddenSpell)
            data.writeByte(initialSpellAddress + 1, 0x01) // set initial level
            data.writeByte(initialSpellAddress + 2, 0x01) // set initial target level
          }
        }
      })
    }
  }

  function randomizeMonsterElements(options, data, hex, starterId) {
    const loadMonsterNopReferenceAddress = 0x2aa6a64
    const getPaletteForMonsterAddress = 0x272bc
    if (options.monsterElements) {
      //override reference to loadMonsterNop with call to load monster palette
      data.writeWord(loadMonsterNopReferenceAddress, 0x80042984)
      //override check to only set friendly colors with nop
      data.writeWord(getPaletteForMonsterAddress + 12, 0x00000000)

      let lcgSeed = hex.length > 0 ? Math.abs(hex[0]) : 15;
      let lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
      let tri = elementFromName("Tri").ID
      let primaryElements = getPrimaryElements()

      allMonsters.forEach(function(monster) {
        let initialElementAddress = getElementStatAddressForMonster(monster.ID)
        if (monster.ID != starterId && data.readByte(initialElementAddress) != tri) {
          data.writeByte(initialElementAddress, primaryElements[lcg.rollBetween(0, 2)].ID)
        }
      })
    }
  }

  function getElementStatAddressForMonster(monsterID) {
    return initialStatsAddress + monsterID * initialStatsRowLength + initialStatsElementOffset
  }

  const exports = {
    setEnemizer: setEnemizer,
    setStarter: setStarter,
    allMonsters: allMonsters,
    randomStarterOptionValue: randomStarterOptionValue,
    allElements: allElements,
    hiddenSpellOptions: hiddenSpellOptions,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      monsters: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
