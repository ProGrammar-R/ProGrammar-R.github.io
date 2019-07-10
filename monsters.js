(function(self) {

  let util

  if (self) {
    util = self.adRando.util
  } else {
    util = require('./util')
  }

  const randomStarterOptionValue = 0
  const randomStarterHexKey = 6

  const allMonsters = [
    {ID: 0x01, name: "Hikewne", scaling: 0.8,},
    {ID: 0x02, name: "Kewne", scaling: 0.9,},
    {ID: 0x03, name: "Dragon", scaling: 0.8,},
    {ID: 0x04, name: "Kid", scaling: 0.8,},
    {ID: 0x05, name: "Ifrit", scaling: 0.9,},
    {ID: 0x06, name: "Flame", scaling: 0.9,},
    {ID: 0x07, name: "Grineut", scaling: 0.9,},
    {ID: 0x08, name: "Griffon", scaling: 0.9,},
    {ID: 0x09, name: "Saber", scaling: 0.9,},
    {ID: 0x0A, name: "Snowman", scaling: 0.9,},
    {ID: 0x0B, name: "Ashra", scaling: 0.9,},
    {ID: 0x0C, name: "Arachne", scaling: 0.9,},
    {ID: 0x0D, name: "Battnel", scaling: 0.9,},
    {ID: 0x0E, name: "Nyuel", scaling: 0.9,},
    {ID: 0x0F, name: "Death", scaling: 0.9,},
    {ID: 0x10, name: "Clown", scaling: 0.9,},
    {ID: 0x11, name: "Univern", scaling: 0.9,},
    {ID: 0x12, name: "Unicorn", scaling: 0.9,},
    {ID: 0x13, name: "Metal", scaling: 0.9,},
    {ID: 0x14, name: "Block", scaling: 0.9,},
    {ID: 0x15, name: "Pulunpa", scaling: 1,},
    {ID: 0x16, name: "Troll", scaling: 1,},
    {ID: 0x17, name: "Noise", scaling: 1,},
    {ID: 0x18, name: "U-Boat", scaling: 0.9,},
    {ID: 0x19, name: "Baloon", scaling: 0.9,},
    {ID: 0x1A, name: "Dreamin", scaling: 0.9,},
    {ID: 0x1B, name: "Blume", scaling: 0.9,},
    {ID: 0x1C, name: "Volcano", scaling: 0.9,},
    {ID: 0x1D, name: "Cyclone", scaling: 0.9,},
    {ID: 0x1E, name: "Manoeva", scaling: 0.9,},
    {ID: 0x1F, name: "Barong", scaling: 0.8,},
    {ID: 0x20, name: "Picket", scaling: 1,},
    {ID: 0x21, name: "Kraken", scaling: 0.9,},
    {ID: 0x22, name: "Weadog", scaling: 0.9,},
    {ID: 0x23, name: "Stealth", scaling: 0.9,},
    {ID: 0x24, name: "Viper", scaling: 0.9,},
    {ID: 0x25, name: "Naplass", scaling: 0.9,},
    {ID: 0x26, name: "Zu", scaling: 0.9,},
    {ID: 0x27, name: "Mandara", scaling: 1,},
    {ID: 0x28, name: "Killer", scaling: 0.9,},
    {ID: 0x29, name: "Garuda", scaling: 0.9,},
    {ID: 0x2A, name: "Glacier", scaling: 0.8,},
    {ID: 0x2B, name: "Tyrant", scaling: 0.9,},
    {ID: 0x2C, name: "Golem", scaling: 0.8,},
    {ID: 0x2D, name: "Maximum", scaling: 0.8,},
  ]

  function monsterFromName(name) {
    return allMonsters.filter(function(monster) {
      return monster.name === name
    })[0]
  }

  function monsterFromID(ID) {
    return allMonsters.filter(function(monster) {
      return monster.ID === ID
    })[0]
  }

  function removeMonsterNamed(someMonsters, name) {
    return someMonsters.filter(function(monster) {
      return monster.name !== name
    })
  }

  function removeMonsterWithID(someMonsters, ID) {
    return someMonsters.filter(function(monster) {
      return monster.ID !== ID
    })
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
      let lcg = new util.LCG(util.lcgConstants.modulus, util.lcgConstants.multiplier, util.lcgConstants.increment, lcgSeed)
      let barongFloorLSD = options.barongs ? lcg.rollBetween(0,9) : normalBarongFloorLSD
      while (f < 40) {
        let floorMonsters = []
        let slotsRemaining = 16
        let monsterChoices = removeMonsterNamed(allMonsters, "Barong")
        if (f >= firstPossibleBarongFloor && f % 10 === barongFloorLSD) {
          floorMonsters.push({ID: monsterFromName("Barong").ID, level: 20, slots: 1})
          slotsRemaining--
        }
        if (f === whitePicketFloor) {
          floorMonsters.push({ID: monsterFromName("Picket").ID, level: 17, slots: 1})
          monsterChoices = removeMonsterNamed(monsterChoices, "Picket")
          slotsRemaining--
        }
        if (f < firstFloorForHealers) {
          monsterChoices = removeMonsterNamed(monsterChoices, "Battnel")
          monsterChoices = removeMonsterNamed(monsterChoices, "Nyuel")
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
  }

  function setSpellsLevelOutsideNativeElement(options, data, hex) {
    console.log('Starter: ' + options.starter)
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
  }

  const exports = {
    setEnemizer: setEnemizer,
    setStarter: setStarter,
    allMonsters: allMonsters,
    randomStarterOptionValue: randomStarterOptionValue,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      monsters: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
