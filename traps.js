(function(self) {

  let constants
  let fields
  let util
  let text

  if (self) {
    constants = self.adRando.constants
    fields = self.adRando.fields
    util = self.adRando.util
    text = self.adRando.text
  } else {
    constants = require('./constants')
    fields = require('./fields')
    util = require('./util')
    text = require('./text')
  }

  const TRAP_FREQUENCIES = {
    Off: 3,
    Less: 2,
    Average: 1,
    More: 0,
  }

  const MONSTER_DEN_FREQUENCIES = {
    Rare: 3,
    Less: 2,
    Average: 1,
    More: 0,
  }

  const TRAP_SPAWNS = {
    Fewer: 0,
    Normal: 1, //3
    More: 2, //12
    Max: 3,  //32
  }

  const TRAP_SPAWN_RATES = {
    0: {maxTrapsRoll:  0, maxWeightRoll:  0x00,},
    1: {maxTrapsRoll:  3, maxWeightRoll:  0x3f,},
    2: {maxTrapsRoll: 15, maxWeightRoll:  0x7f,},
    3: {maxTrapsRoll: 31, maxWeightRoll: 0x7ff,},
  }

  const TRAP_TYPES = {
    spawns: 0, //pseudo type
    reversal: 1,
    slow: 2,
    warp: 3,
    goUp: 4,
    chaos: 5,
    //blank
    bomb: 7,
    slam: 8,
    sleep: 9,
    blinder: 10,
    poison: 11,
    prison: 12,
    frog: 13,
    bump: 14,
    crack: 15,
    upheaval: 16,
    seal: 17,
    rust: 18,
    monsterDen: 19,
  }

  const charMap = {
    '-': 0,
    '_': 1,
    '0': 2,
    '1': 3,
    '2': 4,
    '3': 5,
    '4': 6,
    '5': 7,
    '6': 8,
    '7': 9,
    '8': 10,
    '9': 11,
    'a': 12,
    'b': 13,
    'c': 14,
    'd': 15,
    'e': 16,
    'f': 17,
    'g': 18,
    'h': 19,
    'i': 20,
    'j': 21,
    'k': 22,
    'l': 23,
    'm': 24,
    'n': 25,
    'o': 26,
    'p': 27,
    'q': 28,
    'r': 29,
    's': 30,
    't': 31,
    'u': 32,
    'v': 33,
    'w': 34,
    'x': 35,
    'y': 36,
    'z': 37,
    'A': 38,
    'B': 39,
    'C': 40,
    'D': 41,
    'E': 42,
    'F': 43,
    'G': 44,
    'H': 45,
    'I': 46,
    'J': 47,
    'K': 48,
    'L': 49,
    'M': 50,
    'N': 51,
    'O': 52,
    'P': 53,
    'Q': 54,
    'R': 55,
    'S': 56,
    'T': 57,
    'U': 58,
    'V': 59,
    'W': 60,
    'X': 61,
    'Y': 62,
    'Z': 63,  
  }

  const reverseCharMap = {
    0:  '-',
    1:  '_',
    2:  '0',
    3:  '1',
    4:  '2',
    5:  '3',
    6:  '4',
    7:  '5',
    8:  '6',
    9:  '7',
    10:  '8',
    11:  '9',
    12:  'a',
    13:  'b',
    14:  'c',
    15:  'd',
    16:  'e',
    17:  'f',
    18:  'g',
    19:  'h',
    20:  'i',
    21:  'j',
    22:  'k',
    23:  'l',
    24:  'm',
    25:  'n',
    26:  'o',
    27:  'p',
    28:  'q',
    29:  'r',
    30:  's',
    31:  't',
    32:  'u',
    33:  'v',
    34:  'w',
    35:  'x',
    36:  'y',
    37:  'z',
    38:  'A',
    39:  'B',
    40:  'C',
    41:  'D',
    42:  'E',
    43:  'F',
    44:  'G',
    45:  'H',
    46:  'I',
    47:  'J',
    48:  'K',
    49:  'L',
    50:  'M',
    51:  'N',
    52:  'O',
    53:  'P',
    54:  'Q',
    55:  'R',
    56:  'S',
    57:  'T',
    58:  'U',
    59:  'V',
    60:  'W',
    61:  'X',
    62:  'Y',
    63:  'Z',  
  }

  class TrapOption extends fields.DropdownOption {
    constructor(
      properName,
      elementName,
      values,
      defaultValue,
    ) {
      super(properName, elementName, '', values, defaultValue, null);
      this.trapId = TRAP_TYPES[this.properName]
      this.parent = null;
    }

    set(newValue) {
      super.set(newValue);
      if (this.parent) {
        this.parent.saveToLocalStorage();
      }
    }
  }

  class TrapsOption extends fields.DropdownOption {
    constructor(
      properName,
      elementName,
      shortName,
      values,
      defaultValue,
    ) {
      super(properName, elementName, shortName, values, defaultValue, 'traps');
      const self = this;
      this.values.forEach(function(value) {
        value.parent = self;
      })
      fields.allOptions.traps = this;
    }

    set(newValue) {
      let i = 0
      this.values.forEach(function(value) {
        let firstSixBits = charMap[newValue[Math.floor(i / 3)]];
        let toSet = (firstSixBits >>> (2 * ( 2 - (i % 3)))) & 0x03;
        value.set(toSet);
        i++;
      })
    }

    get() {
      let newValue = '';
      let i = 0;
      let currentSixBits = 0;
      const maxIndex = this.values.length - 1;
      this.values.forEach(function(value) {
        currentSixBits = (currentSixBits << 2) | (value.get() & 0x3);
        if ((i % 3) === 2 || i === maxIndex) {
          //shift any remaining amount
          currentSixBits <<= (2 * ( 2 - (i % 3)));
          newValue += reverseCharMap[currentSixBits];
          currentSixBits = 0;
        }
        i++;
      })
      return newValue;
    }

    initialize(document) {
      this.values.forEach(function(value) {
        value.initialize(document);
      })
    }

    setDisabled(isDisabled) {
      this.values.forEach(function(value) {
        value.setDisabled(isDisabled);
      })
    }

    changeHandler() {
      // this can be undefined for some reason, so check first
      if (this) {
        this.values.forEach(function(value) {
          value.changeHandler();
        })
        this.saveToLocalStorage();
      }
    }

    saveToLocalStorage() {}
  }

  const trapOptions = [
    new TrapOption("spawns", "trap-spawns", TRAP_SPAWNS, 1),
    new TrapOption("reversal", "trap-reversal", TRAP_FREQUENCIES, 1),
    new TrapOption("slow", "trap-slow", TRAP_FREQUENCIES, 0),
    new TrapOption("warp", "trap-warp", TRAP_FREQUENCIES, 1),
    new TrapOption("goUp", "trap-goup", TRAP_FREQUENCIES, 1),
    new TrapOption("chaos", "trap-chaos", TRAP_FREQUENCIES, 0),
    //blank
    new TrapOption("bomb", "trap-bomb", TRAP_FREQUENCIES, 1),
    new TrapOption("slam", "trap-slam", TRAP_FREQUENCIES, 1),
    new TrapOption("sleep", "trap-sleep", TRAP_FREQUENCIES, 0),
    new TrapOption("blinder", "trap-blinder", TRAP_FREQUENCIES, 1),
    new TrapOption("poison", "trap-poison", TRAP_FREQUENCIES, 0),
    new TrapOption("prison", "trap-prison", TRAP_FREQUENCIES, 1),
    new TrapOption("frog", "trap-frog", TRAP_FREQUENCIES, 2),
    new TrapOption("bump", "trap-bump", TRAP_FREQUENCIES, 2),
    new TrapOption("crack", "trap-crack", TRAP_FREQUENCIES, 0),
    new TrapOption("upheaval", "trap-upheaval", TRAP_FREQUENCIES, 0),
    new TrapOption("seal", "trap-seal", TRAP_FREQUENCIES, 0),
    new TrapOption("rust", "trap-rust", TRAP_FREQUENCIES, 1),
    new TrapOption("monsterDen", "trap-monster-den", MONSTER_DEN_FREQUENCIES, 3),
  ]

  const DEFAULT_TRAPS = 'iiifC_K';

  const allTraps = new TrapsOption("traps", "traps", "r", trapOptions, DEFAULT_TRAPS);

  function setTraps(data, options) {
    if (options.traps !== DEFAULT_TRAPS) {
      let firstActiveTrap = Object.getOwnPropertyNames(TRAP_TYPES).length;
      let lastActiveTrap = 1;
      let i = 0;
      decodedTrapString = decodeTrapString(options.traps);
      Object.getOwnPropertyNames(TRAP_TYPES).forEach(function(trapTypeName) {
        const trapId = TRAP_TYPES[trapTypeName];
        const trapValue = decodedTrapString[i++];
        if (trapId === 0) {
          data.writeByte(constants.romAddresses.trapRollMaxSingleRm1, TRAP_SPAWN_RATES[trapValue].maxTrapsRoll);
          data.writeByte(constants.romAddresses.trapRollMaxSingleRm1 + 0x18, TRAP_SPAWN_RATES[trapValue].maxTrapsRoll);
          data.writeByte(constants.romAddresses.trapRollMaxSingleRm2, TRAP_SPAWN_RATES[trapValue].maxTrapsRoll);
          data.writeByte(constants.romAddresses.trapRollMaxSingleRm2 + 0x18, TRAP_SPAWN_RATES[trapValue].maxTrapsRoll);
          data.writeShort(constants.romAddresses.trapRollMaxPerFloor1, TRAP_SPAWN_RATES[trapValue].maxWeightRoll);
          data.writeShort(constants.romAddresses.trapRollMaxPerFloor2, TRAP_SPAWN_RATES[trapValue].maxWeightRoll);
        } else {
          if (trapId < firstActiveTrap && trapValue !== TRAP_FREQUENCIES.Off) {
            firstActiveTrap = trapId;
          }
          if (trapId > lastActiveTrap && trapValue !== TRAP_FREQUENCIES.Off) {
            lastActiveTrap = trapId;
          }
          data.writeByte(constants.romAddresses.trapTable + trapId * constants.rowLength.trap + 1, ((trapValue & 0x03) << 4) | 0x02);
        }
      })
      //apply some sane limits
      firstActiveTrap = Math.max(1, firstActiveTrap);
      lastActiveTrap = Math.min(19, lastActiveTrap);
      data.writeByte(constants.romAddresses.trapRollLowestId1, firstActiveTrap);
      data.writeByte(constants.romAddresses.trapRollLowestId1 + 8, lastActiveTrap);
      data.writeByte(constants.romAddresses.trapRollLowestId2, firstActiveTrap);
      data.writeByte(constants.romAddresses.trapRollLowestId2 + 8, lastActiveTrap);
    }
    applyGoDownTraps(options, data)
  }

  function applyGoDownTraps(options, data) {
    if (options.goDownTraps) {
      if (self) {
        text = self.adRando.text
      } else {
        text = require('./text')
      }
      data.writeShort(constants.romAddresses.goUpTrapIncrement, 0xffff)
      data.writeShort(constants.romAddresses.goUpTrapIncrement + 4, 0xffff)

      //in battle text
      text.writeBattleTextToFile(data, constants.romAddresses.toUpstairsBattleText, "\\n\\Bdown")
      //trap description
      text.writeTextToFile(data, constants.romAddresses.goUpTrapDescription, "\\K will be sent down one\\nfloor.\\0Go Down\\0")
      //text.writeTextToFile(data, constants.romAddresses.anUpperFloorText, "\\3a lower")
      //update pointer to trap name
      data.writeWord(constants.romAddresses.trapTable + 4 * constants.rowLength.trap + 4, 0x80031354)
    }
  }

  function decodeTrapString(trapString) {
    const result = [];
    let i = 0;
    Object.getOwnPropertyNames(TRAP_TYPES).forEach(function(_trapTypeName) {
      const firstSixBits = charMap[trapString[Math.floor(i / 3)]];
      const toSet = (firstSixBits >>> (2 * ( 2 - (i % 3)))) & 0x03;
      result.push(toSet);
      i++;
    })
    return result;
  }
  
  const exports = {
    charMap: charMap,
    reverseCharMap: reverseCharMap,
    allTraps: allTraps,
    setTraps: setTraps,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      traps: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
  
  