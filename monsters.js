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
  const randomSpellsHexKey = 4

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
    randomizeMonsterSpells(options, data, hex)
    if (options.enemizer) {
      const maxMonsterTypesPerFloor = 4
      const firstPossibleBarongFloor = 10
      const normalBarongFloorLSD = 6
      const whitePicketFloor = 25
      const firstFloorForHealers = 6
      const firstFloorForMajorThreats = 4
      const healers = getMonsterIdsWithHealingSpells(options, data)

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
        if (f < firstFloorForMajorThreats) {
          monsterChoices = removeValueNamed(monsterChoices, "Maximum")
          monsterChoices = removeValueNamed(monsterChoices, "Dragon")
          monsterChoices = removeValueNamed(monsterChoices, "Golem")
          monsterChoices = removeValueNamed(monsterChoices, "Killer")
        }
        if (f < firstFloorForHealers) {
          healers.forEach(function(healerMonsterId) {
            monsterChoices = removeMonsterWithID(monsterChoices, healerMonsterId)
          })
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

          let monsterLevel = Math.max(1, Math.floor(monsterToAdd.scaling * f))
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
        address += constants.sectorSize
        f++
      }
    }
    //For some reason, calling setStarter from index.js doesn't work
    setSuperKoh(options, data)
    setStarter(options, data, hex)
    replaceTutorialPulunpaWithBarong(options, data)
    setMonsterSpawns(options, data)
  }

  function getMonsterIdsWithHealingSpells(options, data) {
    const healers = []
    allMonsters.forEach(function(monster) {
      let spellId = data.readByte(getInitialStatAddressForMonster(monster.ID) + constants.monsterStats.spell1Id)
      //if the monster has no awoken spell, get the hidden spell
      if (!spellId && !!options.hiddenSpells) {
        spellId = data.readByte(constants.romAddresses.hiddenSpellTable + monster.ID)
      }
      if (spellId >= constants.spells.deaheal && spellId <= constants.spells.deoforth) {
        healers.push(monster.ID)
      }
    })
    return healers
  }

  function randomizeMonsterSpells(options, data, hex) {
    if (options.spells) {
      const lcgSeed = hex.length > randomSpellsHexKey ? Math.abs(hex[randomSpellsHexKey]) : 15;
      const lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
      const numberOfSpells = 16
      allMonsters.forEach(function(monster) {
        const spellAddress = getInitialStatAddressForMonster(monster.ID) + constants.monsterStats.spell1Id
        const newSpellId = 1 + 3 * (lcg.roll() % numberOfSpells)
        let spellId = data.readByte(spellAddress)
        if (!!spellId) {
          data.writeByte(spellAddress, getSpellInElement(newSpellId, getElementOfSpell(spellId)))
        } else {
          const spellElement = getElementOfSpell(data.readByte(constants.romAddresses.hiddenSpellTable + monster.ID))
          data.writeByte(constants.romAddresses.hiddenSpellTable + monster.ID, getSpellInElement(newSpellId, spellElement))
        }
      })
    }
  }

  function setSuperKoh(options, data) {
    if (options.superKoh) {
      allMonsters.forEach(function(monster) {
        const initialAddress = getInitialStatAddressForMonster(monster.ID)
        data.writeByte(initialAddress + constants.monsterStats.pushable, 0x01)
        data.writeByte(initialAddress + constants.monsterStats.flyingLiftable, 0x08 | data.readByte(initialAddress + constants.monsterStats.flyingLiftable))
      })
    }
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
    //override Hikewne as starter if boss mode is enabled
    if (options.boss && starter == monsterFromName("Hikewne").ID) {
      starter = monsterFromName("Kewne").ID
    }
    addresses.forEach(function(starterAddress) {
      data.writeByte(starterAddress.location, starter)
    })
    setHiddenSpellsAvailable(options, data, starter)
    setMonsterToElement(options.starterElement, data, hex[randomStarterElementHexKey], starter, true)
    randomizeMonsterElements(options, data, hex, starter)
  }

  function setMonsterToElement(desiredElement, data, randomValue, starterId, matchSpellToElement) {
    let initialElementAddress = getInitialStatAddressForMonster(starterId) + constants.monsterStats.element
    let starterElement = data.readByte(initialElementAddress)
    let starterDefaultElement = starterElement
    let tri = elementFromName("Tri").ID
    let atypical = elementFromName("Atypical").ID
    //console.log('Initial starter element ' + starterElement)
    primaryElements = getPrimaryElements()

    if (desiredElement != util.getDefaultFromList(allElements).ID) {
      if (desiredElement == elementFromName("Randomize").ID || desiredElement == atypical) {
        let elementIndex = 0
        let elementsToChooseFrom = primaryElements
        //if chosen atypical, remove the default option from the list, except if tri, in which case all primary are atypical
        if (desiredElement == atypical && starterElement != tri) {
          elementsToChooseFrom = removeValueWithID(elementsToChooseFrom, starterElement)
        }
        elementIndex = Math.abs(randomValue) % elementsToChooseFrom.length
        starterElement = elementsToChooseFrom[elementIndex].ID
      } else {
        starterElement = desiredElement
      }
      //console.log('New starter element ' + starterElement)
      data.writeByte(initialElementAddress, starterElement)

      //need to change starter spell to match element
      let initialSpellAddress = constants.romAddresses.initialStatsTable + starterId * constants.rowLength.initialStats + constants.monsterStats.spell1Id
      let starterSpell = data.readByte(initialSpellAddress)

      //but only change it for monsters that have spells, aren't Tri, and weren't originally Tri (Hikewne)
      if (matchSpellToElement && !!starterSpell && starterDefaultElement != tri) {
        if (starterElement != tri) {
          starterspell = getSpellInElement(starterSpell, starterElement)
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

  function getElementOfSpell(spell) {
    const primaryElements = getPrimaryElements()
    return primaryElements[(spell - 1) % primaryElements.length].ID
  }

  function getSpellInElement(spell, desiredElement) {
    //don't change the element of dark wave or bad things can happen
    if (spell !== constants.spells.darkWave) {
      let spellElement = getElementOfSpell(spell)
      while (spellElement < desiredElement) {
        spellElement *= 2
        spell++
      }
      while (spellElement > desiredElement) {
        spellElement /= 2
        spell--
      }
    }
    return spell
  }

  function setHiddenSpellsAvailable(options, data, starter) {
    if (options.hiddenSpells != util.getDefaultFromList(hiddenSpellOptions).ID) {
      let changeForAllMonsters = options.hiddenSpells == hiddenSpellOptionFromName("All monsters").ID
      allMonsters.forEach(function(monster) {
        if (changeForAllMonsters || monster.ID == starter) {
          let hiddenSpell = data.readByte(constants.romAddresses.hiddenSpellTable + monster.ID)
          let initialSpellAddress = getInitialStatAddressForMonster(monster.ID) + constants.monsterStats.spell1Id
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
    const getPaletteForMonsterAddress = 0x272bc
    const loadMonsterNopAddress = 0x1c7e068

    const loadMonsterNopReferenceAddresses = //10 9c 0a 80
      [0x1cbb588,0x1cbc954,0x1cbec80,0x1cbece8,0x1cbed44,0x1cbeda0,0x1cbf10c,0x1cbf118,0x1cbf11c,0x26a1e08,0x26a8c48,0x26afa88,0x26b68c8,0x26bd708,0x26c4548,0x26cb388,0x26d42c8,0x26db108,0x26e1f48,0x26e8d88,0x26efbc8,0x26f6a08,
      0x26fd848,0x2701fdc,0x2708e1c,0x270fc5c,0x2716a9c,0x271d8dc,0x272471c,0x272b55c,0x2733bd8,0x273aa18,0x2741858,0x2748698,0x274f4d8,0x2756318,0x275d158,0x2763538,0x276a378,0x27711b8,0x2777ff8,0x277ee38,0x2785c78,
      0x278cab8,0x2794b8c,0x279b9cc,0x27a280c,0x27a964c,0x27b048c,0x27b72cc,0x27be10c,0x27c34b8,0x27ca2f8,0x27d1138,0x27d7f78,0x27dedb8,0x27e5bf8,0x27eca38,0x27f44a4,0x27fb2e4,0x2802124,0x2808f64,0x280fda4,0x2816be4,
      0x281da24,0x2824a2c,0x282b86c,0x28326ac,0x28394ec,0x284032c,0x284716c,0x284dfac,0x2855c0c,0x285ca4c,0x286388c,0x286a6cc,0x287150c,0x287834c,0x287f18c,0x2883b08,0x288a948,0x2891788,0x28985c8,0x289f408,0x28a6248,
      0x28ad088,0x28b641c,0x28bd25c,0x28c409c,0x28caedc,0x28d1d1c,0x28d8b5c,0x28df99c,0x28e45c4,0x28eb404,0x28f2244,0x28f9084,0x28ffec4,0x2906d04,0x290db44,0x2915ddc,0x291cc1c,0x2923a5c,0x292a89c,0x29316dc,0x293851c,
      0x293f35c,0x29457c0,0x294c600,0x2953440,0x295a280,0x29610c0,0x2967f00,0x296ed40,0x297574c,0x297c58c,0x29833cc,0x298a20c,0x299104c,0x2997e8c,0x299eccc,0x29a5da4,0x29acbe4,0x29b3a24,0x29ba864,0x29c16a4,0x29c84e4,
      0x29cf324,0x29d6b54,0x29dd994,0x29e47d4,0x29eb614,0x29f2454,0x29f9294,0x2a000d4,0x2a06340,0x2a0d180,0x2a13fc0,0x2a1ae00,0x2a21c40,0x2a28a80,0x2a2f8c0,0x2a3797c,0x2a3e7bc,0x2a455fc,0x2a4c43c,0x2a5327c,0x2a5a0bc,
      0x2a60efc,0x2a68fe0,0x2a69040,0x2a6fe20,0x2a6fe80,0x2a76c60,0x2a76cc0,0x2a7daa0,0x2a7db00,0x2a848e0,0x2a84940,0x2a8b720,0x2a8b780,0x2a92560,0x2a925c0,0x2a98de4,0x2a9fc24,0x2aa6a64,0x2aad8a4,0x2ab46e4,0x2abb524,
      0x2ac2364,0x2ac7f50,0x2aced90,0x2ad5bd0,0x2adca10,0x2ae3850,0x2aea690,0x2af14d0,0x2af9b14,0x2b00954,0x2b07794,0x2b0e5d4,0x2b15414,0x2b1c254,0x2b23094,0x2b2a1ac,0x2b30fec,0x2b37e2c,0x2b3ec6c,0x2b45aac,0x2b4c8ec,
      0x2b5372c,0x2b571d8,0x2b571dc,0x2b5e018,0x2b5e01c,0x2b64e58,0x2b64e5c,0x2b6bc98,0x2b6bc9c,0x2b72ad8,0x2b72adc,0x2b79918,0x2b7991c,0x2b80758,0x2b8075c,0x2b894b0,0x2b902f0,0x2b97130,0x2b9df70,0x2ba4db0,0x2babbf0,
      0x2bb2a30,0x2bb8748,0x2bbf588,0x2bc63c8,0x2bcd208,0x2bd4048,0x2bdae88,0x2be1cc8,0x2beb118,0x2bf1f58,0x2bf8d98,0x2bffbd8,0x2c06a18,0x2c0d858,0x2c14698,0x2c1b4a0,0x2c1b4c8,0x2c1b4d0,0x2c1b4d4,0x2c222e0,0x2c22308,
      0x2c22310,0x2c22314,0x2c29120,0x2c29148,0x2c29150,0x2c29154,0x2c2ff60,0x2c2ff88,0x2c2ff90,0x2c2ff94,0x2c36da0,0x2c36dc8,0x2c36dd0,0x2c36dd4,0x2c3dbe0,0x2c3dc08,0x2c3dc10,0x2c3dc14,0x2c44a20,0x2c44a48,
      0x2c44a50,0x2c44a54,0x2c4a580,0x2c513c0,0x2c58200,0x2c5f040,0x2c65e80,0x2c6ccc0,0x2c73b00,0x2c7a170,0x2c80fb0,0x2c87df0,0x2c8ec30,0x2c95a70,0x2c9c8b0,
      0x2ca36f0,0x2ca9674,0x2cb04b4,0x2cb72f4,0x2cbe134,0x2cc4f74,0x2ccbdb4,0x2cd2bf4,0x2cda8b0,0x2ce16f0,0x2ce8530,0x2cef370,0x2cf61b0,0x2cfcff0,0x2d03e30,0x2d09880,0x2d106c0,0x2d17500,0x2d1e340,0x2d25180,0x2d2bfc0,
      0x2d32e00,0x2d3ac04,0x2d41a44,0x2d48884,0x2d4f6c4,0x2d56504,0x2d5d344,0x2d64184,0x2d6a5a4,0x2d713e4,0x2d78224,0x2d7f064,0x2d85ea4,0x2d8cce4,0x2d93b24,0x2d9b3ac,0x2da21ec,0x2da902c,0x2dafe6c,0x2db6cac,0x2dbdaec,
      0x2dc492c,0x2dcc028,0x2dd2e68,0x2dd9ca8,0x2de0ae8,0x2de7928,0x2dee768,0x2df55a8,0x2dfaf88,0x2e01dc8,0x2e08c08,0x2e0fa48,0x2e16888,0x2e1d6c8,0x2e24508,0x2e2bcd0,0x2e32b10,0x2e39950,0x2e40790,0x2e475d0,0x2e4e410,
      0x2e55250,0x2e5dc58,0x2e64a98,0x2e6b8d8,0x2e72718,0x2e79558,0x2e80398,0x2e871d8,0x2e8ba38,0x2e92878,0x2e996b8,0x2ea04f8,0x2ea7338,0x2eae178,0x2eb4fb8,0x2ebe0e0,0x2ec4f20,0x2ecbd60,0x2ed2ba0,0x2ed99e0,0x2ee0820,
      0x2ee7660,0x2eebd1c,0x2ef2b5c,0x2ef999c,0x2f007dc,0x2f0761c,0x2f0e45c,0x2f1529c,0x3130ef8,0x3137d38,0x313eb78,0x31459b8,0x314c7f8,0x3153638,0x315a478,0x31c6f48,0x31c7424,0x31d91b4,]

    const loadMonsterOntoStackJalAddresses = //04 a7 02 0c
      [0x269e128,0x26a4f68,0x26abda8,0x26b2be8,0x26b9a28,0x26c0868,0x26c76a8,0x26ce1e8,0x26d5028,0x26dbe68,0x26e2ca8,0x26e9ae8,0x26f0928,0x26f7768,0x26fe554,0x2705394,0x270c1d4,0x2713014,0x2719e54,0x2720c94,0x2727ad4,
      0x272e9ac,0x27357ec,0x273c62c,0x274346c,0x274a2ac,0x27510ec,0x2757f2c,0x275ed04,0x2765b44,0x276c984,0x27737c4,0x277a604,0x2781444,0x2788284,0x278f0d0,0x2795f10,0x279cd50,0x27a3b90,0x27aa9d0,0x27b1810,0x27b8650,
      0x27bf454,0x27c6294,0x27cd0d4,0x27d3f14,0x27dad54,0x27e1b94,0x27e89d4,0x27ef83c,0x27f667c,0x27fd4bc,0x28042fc,0x280b13c,0x2811f7c,0x2818dbc,0x28205fc,0x282743c,0x282e27c,0x28350bc,0x283befc,0x2842d3c,0x2849b7c,
      0x28507a0,0x28575e0,0x285e420,0x2865260,0x286c0a0,0x2872ee0,0x2879d20,0x2880354,0x2887194,0x288dfd4,0x2894e14,0x289bc54,0x28a2a94,0x28a98d4,0x28b0730,0x28b7570,0x28be3b0,0x28c51f0,0x28cc030,0x28d2e70,0x28d9cb0,
      0x28e0ad4,0x28e7914,0x28ee754,0x28f5594,0x28fc3d4,0x2903214,0x290a054,0x2910f10,0x2917d50,0x291eb90,0x29259d0,0x292c810,0x2933650,0x293a490,0x2941cf4,0x2948b34,0x294f974,0x29567b4,0x295d5f4,0x2964434,0x296b274,
      0x297162c,0x297846c,0x297f2ac,0x29860ec,0x298cf2c,0x2993d6c,0x299abac,0x29a1a2c,0x29a886c,0x29af6ac,0x29b64ec,0x29bd32c,0x29c416c,0x29cafac,0x29d1dbc,0x29d8bfc,0x29dfa3c,0x29e687c,0x29ed6bc,0x29f44fc,0x29fb33c,
      0x2a02aa4,0x2a098e4,0x2a10724,0x2a17564,0x2a1e3a4,0x2a251e4,0x2a2c024,0x2a32710,0x2a39550,0x2a40390,0x2a471d0,0x2a4e010,0x2a54e50,0x2a5bc90,0x2a62994,0x2a697d4,0x2a70614,0x2a77454,0x2a7e294,0x2a850d4,0x2a8bf14,
      0x2a944e0,0x2a9b320,0x2aa2160,0x2aa8fa0,0x2aafde0,0x2ab6c20,0x2abda60,0x2ac3ab4,0x2aca8f4,0x2ad1734,0x2ad8574,0x2adf3b4,0x2ae61f4,0x2aed034,0x2af3c84,0x2afaac4,0x2b01904,0x2b08744,0x2b0f584,0x2b163c4,0x2b1d204,
      0x2b24958,0x2b2b798,0x2b325d8,0x2b39418,0x2b40258,0x2b47098,0x2b4ded8,0x2b53ba8,0x2b5a9e8,0x2b61828,0x2b68668,0x2b6f4a8,0x2b762e8,0x2b7d128,0x2b851a4,0x2b8bfe4,0x2b92e24,0x2b99c64,0x2ba0aa4,0x2ba78e4,0x2bae724,
      0x2bb4350,0x2bbb190,0x2bc1fd0,0x2bc8e10,0x2bcfc50,0x2bd6a90,0x2bdd8d0,0x2be4704,0x2beb544,0x2bf2384,0x2bf91c4,0x2c00004,0x2c06e44,0x2c0dc84,0x2c14b24,0x2c1b964,0x2c227a4,0x2c295e4,0x2c30424,0x2c37264,0x2c3e0a4,
      0x2c45804,0x2c4c644,0x2c53484,0x2c5a2c4,0x2c61104,0x2c67f44,0x2c6ed84,0x2c754b4,0x2c7c2f4,0x2c83134,0x2c89f74,0x2c90db4,0x2c97bf4,0x2c9ea34,0x2ca55f4,0x2cac434,0x2cb3274,0x2cba0b4,0x2cc0ef4,0x2cc7d34,0x2cceb74,
      0x2cd6aac,0x2cdd8ec,0x2ce472c,0x2ceb56c,0x2cf23ac,0x2cf91ec,0x2d0002c,0x2d05d64,0x2d0cba4,0x2d139e4,0x2d1a824,0x2d21664,0x2d284a4,0x2d2f2e4,0x2d36154,0x2d3cf94,0x2d43dd4,0x2d4ac14,0x2d51a54,0x2d58894,0x2d5f6d4,
      0x2d664dc,0x2d6d31c,0x2d7415c,0x2d7af9c,0x2d81ddc,0x2d88c1c,0x2d8fa5c,0x2d968c0,0x2d9d700,0x2da4540,0x2dab380,0x2db21c0,0x2db9000,0x2dbfe40,0x2dc6ca4,0x2dcdae4,0x2dd4924,0x2ddb764,0x2de25a4,0x2de93e4,0x2df0224,
      0x2df7068,0x2dfdea8,0x2e04ce8,0x2e0bb28,0x2e12968,0x2e197a8,0x2e205e8,0x2e2740c,0x2e2e24c,0x2e3508c,0x2e3becc,0x2e42d0c,0x2e49b4c,0x2e5098c,0x2e57da8,0x2e5ebe8,0x2e65a28,0x2e6c868,0x2e736a8,0x2e7a4e8,0x2e81328,
      0x2e87bb8,0x2e8e9f8,0x2e95838,0x2e9c678,0x2ea34b8,0x2eaa2f8,0x2eb1138,0x2eb7f70,0x2ebedb0,0x2ec5bf0,0x2ecca30,0x2ed3870,0x2eda6b0,0x2ee14f0,0x2ee82d4,0x2eef114,0x2ef5f54,0x2efcd94,0x2f03bd4,0x2f0aa14,0x2f11854,
      0x30caffc,0x30d1e3c,0x30d8c7c,0x30dfabc,0x30e68fc,0x30ed73c,0x30f457c,0x312afd8,0x3131e18,0x3138c58,0x313fa98,0x31468d8,0x314d718,0x3154558,0x31bc13c,0x31c0e68,0x31c3700,0x31c6804,0x31cdc6c,0x31d8698,]

    const manoevaTransformPaletteMaskAddress = [0x2c1b124,0x2c21f64,0x2c28da4,0x2c2fbe4,0x2c36a24,0x2c3d864,0x2c446a4]

    if (+options.monsterElements) {
      //override references to load_monster_nop with end of the previous function
      loadMonsterNopReferenceAddresses.forEach(function(address) {
        data.writeWord(address, 0x800a9c08)
      })
      //override check to only set friendly colors with nop
      data.writeInstruction(getPaletteForMonsterAddress + 0x0c, 0x00000000) //nop
      //introduce special logic for no-status monsters
      data.writeInstruction(getPaletteForMonsterAddress + 0x34, 0x14004290) //lbu	v0,20(v0)
      data.writeInstruction(getPaletteForMonsterAddress + 0x38, 0x0200a010) //beqz	a1,0x80042a2c
      data.writeInstruction(getPaletteForMonsterAddress + 0x3c, 0x21184000) //move	v1,v0
      data.writeInstruction(getPaletteForMonsterAddress + 0x40, 0x24184500) //and	v1,v0,a1

      //override load_monster_nop and start of load_monster_onto_stack with call to set monster palette
      data.writeInstruction(loadMonsterNopAddress + 0x00, 0xd8ffbd27) //addiu	sp,sp,-40
      data.writeInstruction(loadMonsterNopAddress + 0x04, 0x2000bfaf) //sw	ra,32(sp)
      data.writeInstruction(loadMonsterNopAddress + 0x08, 0x1c00b3af) //sw	s3,28(sp)
      data.writeInstruction(loadMonsterNopAddress + 0x0c, 0x21988000) //move	s3,a0
      data.writeInstruction(loadMonsterNopAddress + 0x10, 0x1800b2af) //sw	s2,24(sp)
      data.writeInstruction(loadMonsterNopAddress + 0x14, 0x2190a000) //move	s2,a1
      data.writeInstruction(loadMonsterNopAddress + 0x18, 0x1400b1af) //sw	s1,20(sp)
      data.writeInstruction(loadMonsterNopAddress + 0x1c, 0x2188c000) //move	s1,a2
      data.writeInstruction(loadMonsterNopAddress + 0x20, 0x1000b0af) //sw	s0,16(sp)
      data.writeInstruction(loadMonsterNopAddress + 0x24, 0x610a010c) //jal 0x80042984
      data.writeInstruction(loadMonsterNopAddress + 0x28, 0x20008424) //addiu	a0,a0,32

      data.writeInstruction(loadMonsterNopAddress + 0x40, 0x20007026) //addiu	s0,s3,32

      //override jals to load_monster_onto_stack with newly created start
      loadMonsterOntoStackJalAddresses.forEach(function(address) {
        data.writeInstruction(address, 0x04a7020c)
      })

      //change palette mask that manoevas use when taking another monster's form to not exclude 0x04, 0x08, or 0x10
      manoevaTransformPaletteMaskAddress.forEach(function(address) {
        data.writeByte(address, 0x1f)
      })

      let lcgSeed = hex.length > 0 ? Math.abs(hex[0]) : 15;
      let lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
      let randomizeElement = elementFromName("Randomize").ID

      //don't change Kewne or Hikewne because they don't change palette
      const kewne = monsterFromName("Kewne").ID
      const hikewne = monsterFromName("Hikewne").ID

      allMonsters.forEach(function(monster) {
        if (monster.ID != starterId && monster.ID != kewne && monster.ID != hikewne) {
          setMonsterToElement(randomizeElement, data, lcg.roll(), monster.ID, (options.monsterElements & 0xf) != 2)
        }
      })

      if ((options.monsterElements & 0xf) > 1) {
        const randomizeWithinFloorRoutine = [
          0xe0ffbd27, //addiu	sp,sp,-32
          0x1800a4af, //sw	a0,24(sp)
          0x1400a5af, //sw	a1,20(sp)
          0x1000bfaf, //sw	ra,16(sp)
          0x00000424, //li	a0,0                            ; a0 = 0
          0x699b020c, //jal	0x800a6da4                      ; call get_rand_based_on_a0_and_a1
          0x02000524, //li	a1,2                            ; a1 = 2
          0x02004014, //bnez	v0,skip 2                     ; if $8001f586 != 0, skip next statement
          0x00000000, //nop
          0x04000224, //li	v0,4                            ; v0 = 4
          0x140002a2, //sb	v0,20(s0)                       ; set actual element
          //0x1c0002a2, //sb	v0,28(s0)                       ; set current element
          0x610a010c, //jal	0x80042984                      ; call set_monster_palette
          0x21200002, //move	a0,s0                         ; a0 = s0
          0x4c9b020c, //jal	0x800a6d30                      ; roll for v0
          0x00000000, //nop
          0x1000bf8f, //lw	ra,16(sp)
          0x1400a58f, //lw	a1,20(sp)
          0x1800a48f, //lw	a0,24(s4)
          0x0800e003, //jr	ra
          0x2000bd27,] //addiu	sp,sp,32
        let routineAddress = constants.romAddresses.itemCategoryNamesKanji;
        randomizeWithinFloorRoutine.forEach(function(newInstruction) {
          data.writeInstruction(routineAddress, newInstruction)
          routineAddress += 4
        })
        data.writeInstruction(constants.romAddresses.placeMonsterRollGamma, 0xf804020c) //jal 0x800813e0
      }
    }
  }

  function getInitialStatAddressForMonster(monsterID) {
    return constants.romAddresses.initialStatsTable + monsterID * constants.rowLength.initialStats
  }

  function replaceTutorialPulunpaWithBarong(options, data) {
    if (options.tutorialBarong) {
      if (options.fastTutorial) {
        data.writeLEShort(constants.romAddresses.tutorialPulunpa, 0x1f2d)
      }
      data.writeByte(constants.romAddresses.tutorialPulunpa + 2, monsterFromName("Barong").ID)
    }
  }

  function setMonsterSpawns(options, data) {
    if (options.monsterSpawns !== undefined) {
      const spawnRate = options.monsterSpawns & 0xf
      const monsterSpawnsOff = 0
      const monsterSpawnsMax = 6
      const upperBound = (spawnRate === monsterSpawnsOff ? 0 : (1 << spawnRate))
      const lowerBound = upperBound >>> 1
      data.writeByte(constants.romAddresses.initMonsterSpawnRate, Math.min(lowerBound, 16))
      data.writeByte(constants.romAddresses.initMonsterSpawnRate + 4, Math.min(upperBound, 16))

      const turnSpawnRoll = (1 << (8 - spawnRate)) - 1
      const initialTurnSpawnRoll = turnSpawnRoll >> 1
      let minTurnsBetweenSpawns
      if (spawnRate === monsterSpawnsMax) {
        minTurnsBetweenSpawns = 0
      } else if (spawnRate === monsterSpawnsOff) {
        minTurnsBetweenSpawns = 0xffff
      } else {
        minTurnsBetweenSpawns = 0x100 >>> spawnRate
      }
      data.writeShort(constants.romAddresses.turnMonsterSpawnRate, turnSpawnRoll)
      data.writeShort(constants.romAddresses.turnMonsterSpawnRate + 4, minTurnsBetweenSpawns)

      if (spawnRate === monsterSpawnsOff) {
        data.writeInstruction(constants.romAddresses.turnMonsterSpawnRate + 0x3c, 0xffff4234) // ori v0,v0,0xffff
      } else {
        data.writeShort(constants.romAddresses.turnMonsterSpawnRate + 0x3c, initialTurnSpawnRoll)
      }
    }
  }

  const exports = {
    setEnemizer: setEnemizer,
    setStarter: setStarter,
    allMonsters: allMonsters,
    randomStarterOptionValue: randomStarterOptionValue,
    allElements: allElements,
    hiddenSpellOptions: hiddenSpellOptions,
    getInitialStatAddressForMonster: getInitialStatAddressForMonster,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      monsters: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
