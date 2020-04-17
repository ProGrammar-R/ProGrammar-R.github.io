(function(self) {

  let constants
  let fields
  let sjcl

  if (self) {
    constants = self.adRando.constants
    fields = self.adRando.fields
    sjcl = self.sjcl
  } else {
    constants = require('./constants')
    fields = require('./fields')
    sjcl = require('sjcl')
  }

  function AssertionError(message) {
    this.name = 'AssertionError'
    this.message = message
    this.stack = new Error(message).stack
  }

  const _error = function() {}
  _error.prototype = Error.prototype
  AssertionError.prototype = new _error()

  function assert(value, message) {
    if (!value) {
      message = message || 'Assertion failed: ' + value
      throw new AssertionError(message)
    }
  }

  assert.equal = function equal(actual, expected, message) {
    if (actual !== expected) {
      message = message || 'Assertion failed: ' + actual + ' === ' + expected
      throw new AssertionError(message)
    }
  }

  assert.notEqual = function equal(actual, expected, message) {
    if (actual === expected) {
      message = message || 'Assertion failed: ' + actual + ' !== ' + expected
      throw new AssertionError(message)
    }
  }

  assert.oneOf = function equal(actual, expected, message) {
    if (expected.indexOf(actual) === -1) {
      message = message || 'Assertion failed: ' + actual + ' one of '
        + expected.join(', ')
      throw new AssertionError(message)
    }
  }

  function bufToHex(buf) {
    return Array.from(buf).map(function(byte) {
      return ('00' + byte.toString(16)).slice(-2)
    }).join('')
  }

  function numToHex(num, width) {
    const zeros = Array(width).fill('0').join('')
    const hex = (zeros + num.toString(16)).slice(-width)
    return '0x' + hex
  }

  function changeEndianWord(word) {
    let leftSword = changeEndianShort(word & 0xffff) << 16
    let rightSword = changeEndianShort((word & 0xffff0000) >>> 16)
    return leftSword | rightSword
  }

  function changeEndianShort(sword) {
    return ((sword & 0xff) << 8) | (sword >>> 8)
  }

  function checked(data) {
    if (data) {
      this.data = data
    }
    this.writes = {}
  }

  checked.prototype.readByte = function readByte(address) {
    return this.data[address]
  }

  checked.prototype.readShort = function readShort(address) {
    return (this.readByte(address + 1) << 8) + (this.readByte(address + 0))
  }

  checked.prototype.readLEShort = function readLEShort(address) {
    return changeEndianShort(this.readShort(address))
  }

  checked.prototype.readWord = function readWord(address) {
    return (this.readShort(address + 2) << 16) + (this.readShort(address + 0))
  }

  checked.prototype.writeByte = function writeByte(address, val) {
    if (this.data) {
      this.data[address] = val
    }
    this.writes[address] = val
  }

  checked.prototype.writeShort = function writeShort(address, val) {
    this.writeByte(address + 0, val & 0xff)
    this.writeByte(address + 1, val >>> 8)
  }

  checked.prototype.writeWord = function writeWord(address, val) {
    this.writeShort(address + 0, val & 0xffff)
    this.writeShort(address + 2, val >>> 16)
  }

  checked.prototype.writeLEShort = function writeLEShort(address, val) {
    this.writeShort(address, changeEndianShort(val))
  }

  checked.prototype.writeInstruction = function writeInstruction(address, val) {
    this.writeWord(address, changeEndianWord(val))
  }

  checked.prototype.sum = function sum() {
    const state = JSON.stringify(this.writes)
    let hex = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(state))
    let zeros = 0
    while (hex.length > 3 && hex[zeros] === '0') {
      zeros++
    }
    return parseInt(hex.slice(zeros, zeros + 3), 16)
  }

  function optionsFromString(randomize) {
    let i = 0
    let currentIndex
    let found
    const fieldNames = Object.getOwnPropertyNames(fields.allOptions)
    let result = {}
    while (i < randomize.length) {
      currentIndex = i
      found = fieldNames.find(function(fieldName) {
        i = fields.allOptions[fieldName].setIfNext(randomize, i)
        return currentIndex !== i
      })
      if (!found) {
        let c = randomize[i++]
        if (c === 'P') {
          // Check for an argument.
          if (randomize[i] !== ':') {
            throw new Error('Expected argument')
          }

          // Parse the arg name.
          start = ++i
          while (i < randomize.length
                 && [',', ':'].indexOf(randomize[i]) === -1) {
            i++
          }
          arg = randomize.slice(start, i)
          if (!arg.length) {
            throw new Error('Expected argument')
          }
          result.preset = arg
          if (randomize[i] === ',') {
            i++
          }
        } else {
          throw new Error('Invalid randomization: ' + c)
        }
      }
    }
    result.allOptions = fields.allOptions
    return result
  }

  function optionsToString(options) {
    options = Object.assign({}, options)
    delete options.checkVanilla
    delete options.verbose
    Object.getOwnPropertyNames(options).forEach(function(opt) {
      if (options[opt] === false) {
        delete options[opt]
      }
    })
    let randomize = ''
    if ('preset' in options) {
      randomize += 'P:' + options.preset
      if (Object.getOwnPropertyNames(options).length > 1) {
        randomize += ','
      }
      delete options.preset
    }
    Object.getOwnPropertyNames(options).forEach(function(someOption) {
      const field = fields.get(someOption)
      if (field) {
        //TODO this next line probably isn't necessary, but if this function gets reused, it will be. Refactor to avoid the need to do this.
        field.set(options[someOption])
        randomize += field.toOptionValue()
      } else {
        throw new Error('Unknown option: ' + someOption)
      }
    })
    return randomize
  }

  function optionsFromUrl(url) {
    url = new URL(url)
    const args = url.search.slice(1).split(',')
    let optionsAndPreset
    let checksum
    let seed
    if (args.length >= 2) {
      optionsAndPreset = optionsFromString(args.slice(0, Math.max(args.length - 2, 1)).join(','))
    } else {
      optionsAndPreset = optionsFromString(constants.defaultOptions)
    }
    seed = decodeURIComponent(args.pop())
    checksum = parseInt(args.pop(), 16)
    return {
      options: optionsAndPreset.allOptions,
      preset: optionsAndPreset.preset,
      checksum: checksum,
      seed: seed,
    }
  }

  function optionsToUrl(options, checksum, seed, baseUrl) {
    options = optionsToString(options)
    const args = []
    if (options !== constants.defaultOptions) {
      args.push(options)
    }
    if (checksum) {
      args.push(checksum.toString(16))
    }
    args.push(encodeURIComponent(seed))
    return baseUrl + '?' + args.join(',')
  }

  function ror(toRotate, amount) {
    const intSize = 0x10
    amount &= (intSize-1)
    let lowerResult = toRotate >>> amount
    let upperResult = toRotate << (intSize - amount)
    return upperResult | lowerResult
  }

  function validateOrReplaceSeed(seed, depth) {
    const maxDepth = 10
    if (depth > maxDepth) {
      console.log("Reached max depth without finding a valid seed. Something is wrong.")
      return seed
    }
    let hex = sjcl.hash.sha256.hash(seed)
    let i = 0
    let miniSeed1 = hex[i++] & 0xffff
    let miniSeed2 = hex[i++] & 0xffff
    let miniSeed3 = hex[i++] & 0xffff
    let seeds = []
    const maxFloor = 99
    for (let floor = 1; floor <= maxFloor; floor++) {
      let floorSeed = ror(miniSeed1, floor) ^ ror(miniSeed2, floor >>> 3) ^ ror(miniSeed3, floor >>> 3)
      if (seeds.includes(floorSeed)) {
        console.log("System-generated seed lacks sufficient randomness, picking a new seed")
        return validateOrReplaceSeed(seed + 1, depth + 1)
      }
      seeds.push(floorSeed)
    }
    return seed
  }

  function setSeedAzureDreams(data, options, seed, userSeed) {
    //very important
    let gbcChecksum = data.readLEShort(constants.romAddresses.globalGbcChecksum)
    data.writeLEShort(constants.romAddresses.toOverwrite, 0x7e)
    console.log("Initial checksum " + gbcChecksum);

    if (!userSeed) {
      seed = validateOrReplaceSeed(seed, 0)
    }

    let hex = sjcl.hash.sha256.hash(seed)

    if (options.derandomize) {
      //overwrite setting seed
      gbcChecksum -= data.readByte(constants.romAddresses.beforeFirstRngCall)
      gbcChecksum -= data.readByte(constants.romAddresses.beforeFirstRngCall + 1)
      gbcChecksum -= data.readByte(constants.romAddresses.beforeFirstRngCall + 2)

      console.log("Checksum after remove bytes" + gbcChecksum);

      data.writeByte(constants.romAddresses.beforeFirstRngCall, 0xcd)
      const newFirstRngCall = 0x3d6d
      data.writeShort(constants.romAddresses.beforeFirstRngCall + 1, newFirstRngCall)
      gbcChecksum += 0xcd
      gbcChecksum += newFirstRngCall & 0xff
      gbcChecksum += (newFirstRngCall >> 8) & 0xff

      const maxSeeds = 3
      let address = constants.romAddresses.derandomizingCode

      //put seeds
      let s = 0
      while (s < maxSeeds) {
        let seedVal = hex[s++] & 0xffff
        data.writeLEShort(address, seedVal)
        address += 2
        gbcChecksum += seedVal & 0xff
        gbcChecksum += (seedVal >> 8) & 0xff
      }

      //write custom routine
      var routine = [
        //##3d48 ; load seed into BC
        0xf5, //          PUSH AF
        0x2a, //          LDI A,(HL)      
        0x47, //          LD B,A
        0x2a, //          LDI A,(HL)
        0x4f, //          LD C,A
        0xf1, //          POP AF
        0xc9, //          RET

        //##3d4f ; rotate BC by A and XOR into DE, shift A right 3 (i.e. DE ^= BC ror A, A >>= 3)
        0xf5, //          PUSH AF
        0xa7, //          AND A       ; check if A is 0
        0x28, 0x0c, //    JR Z,12     ;  if so, jump to after_loop
        //##start_of_loop, 3d53
        0xcb, 0x38, //    SRL B
        0xcb, 0x19, //    RR C
        0x30, 0x02, //    JR NC,2     ; if bit rotated out of C
        0xcb, 0xf8, //    SET 7,B
        0x3d, //          DEC A
        0xc2, 0x53, 0x3d, //    JP NZ,0x3d53 ; if A != 0, jump to start_of_loop
        //##after_loop, 3d5f
        0x78, //          LD A,B      ; done looping, so XOR B into D
        0xaa, //          XOR D
        0x57, //          LD D,A      ; $3d60
        0x79, //          LD A,C      ; XOR C into E
        0xab, //          XOR E
        0x5f, //          LD E,A
        0xf1, //          POP AF
        0xcb, 0x3f, //    SRL A       ; shift A right 3x
        0xcb, 0x3f, //    SRL A
        0xcb, 0x3f, //    SRL A
        0xc9, //          RET
        
        //##3d6c ; set seed by floor number
        0xf5, //          PUSH AF
        0xc5, //          PUSH BC
        0xd5, //          PUSH DE
        0xe5, //          PUSH HL
        0x21, 0x42, 0x3d, //    LD HL,0x3d42
        0xfa, 0x09, 0xd0, //    LD  A,($D009)
        0x11, 0x00, 0x00, //    LD DE,0x0
        0xcd, 0x48, 0x3d, //    CALL $3d48          ;load seed 1
        0xcd, 0x4f, 0x3d, //    CALL $3d4f          ;DE ^= BC ror A, A >>= 3
        0xcd, 0x48, 0x3d, //    CALL $3d48          ;load seed 2
        0xcd, 0x4f, 0x3d, //    CALL $3d4f          ;DE ^= BC ror A, A >>= 3
        0xcd, 0x48, 0x3d, //    CALL $3d48          ;load seed 3
        0xcd, 0x4f, 0x3d, //    CALL $3d4f          ;DE ^= BC ror A, A >>= 3
        0x21, 0x3a, 0xc8, //    LD HL,0xc83a        ;address of RNG seeds
        0x7b, //          LD A,E
        0x22, //          LDI (HL),A
        0x7a, //          LD A,D
        0x77, //          LD (HL),A
        0xe1, //          POP HL
        0xd1, //          POP DE
        0xc1, //          POP BC
        0xf1, //          POP AF
        0xfa, 0x09, 0xd0, //LD A,$floorNumber
        //0xcd, 0x41, 0x1a, //    CALL $1A41
        0xc9, //          RET
      ]
      routine.forEach(function(toWrite) {
        data.writeByte(address++, toWrite)
        gbcChecksum += toWrite
      })

      data.writeLEShort(constants.romAddresses.globalGbcChecksum, gbcChecksum & 0xffff)
    }
    return hex
  }

  function setAppliedOptions(options, data, hex) {

  }

 
  function shuffle(array, lcgSeed) {
    const lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
    //Fisher-Yates shuffle
    let j = 0
    for (let i = array.length -1; i > 0; i--) {
      j = lcg.rollBetween(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function saltSeed(version, options, seed) {
    const str = JSON.stringify({
      version: version,
      options: constants.defaultOptions,
      seed: seed,
    })
    const hex = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(str))
    return hex.match(/[0-9a-f]{2}/g).map(function(byte) {
      return String.fromCharCode(byte)
    }).join('')
  }

  function Preset(
    id,
    name,
    description,
    author,
    weight,
    derandomize,
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.author = author
    this.weight = weight
    this.derandomize = derandomize
  }

  function clone(obj) {
    if (Array.isArray(obj)) {
      return obj.slice().map(clone)
    } else if (typeof(obj) === 'object') {
      return Object.getOwnPropertyNames(obj).reduce(function(copy, prop) {
        copy[prop] = clone(obj[prop])
        return copy
      }, {})
    }
    return obj
  }

  function merge(obj) {
    const self = this
    Object.getOwnPropertyNames(obj).forEach(function(prop) {
      if (Array.isArray(obj[prop])) {
        self[prop] = clone(obj[prop])
      } else if (typeof(obj[prop]) === 'object') {
        if (Array.isArray(self[prop])) {
          self[prop] = clone(obj[prop])
        } else if (typeof(self[prop]) === 'object') {
          merge(self[prop], obj[prop])
        } else {
          self[prop] = clone(obj[prop])
        }
      } else {
        self[prop] = clone(obj[prop])
      }
    })
  }

  Preset.options = function options(options) {
    options = clone(options)
    if (options.preset) {
      let presets
      if (self) {
        presets = self.adRando.presets
      } else {
        presets = require('./presets')
      }
      let preset = presets.filter(function(preset) {
        return preset.id === options.preset
      }).pop()
      if (!preset && !self) {
        try {
          preset = require('./presets/' + options.preset)
        } catch (err) {
          if (err.code !== 'MODULE_NOT_FOUND') {
            console.error(err.stack)
            throw new Error('Error loading preset: ' + options.preset)
          }
        }
      }
      if (!preset) {
        throw new Error('Unknown preset: ' + options.preset)
      }
      delete options.preset
      const presetOptions = preset.options()
      merge.call(presetOptions, options)
      return presetOptions
    }
    return options
  }

  Preset.prototype.toString = function toString() {
    return constants.defaultOptions
  }

  Preset.prototype.options = function options() {
    const options = Object.assign({}, this)
    delete options.id
    delete options.name
    delete options.description
    delete options.author
    delete options.weight
    return clone(options)
  }

  // Helper class to create relic location locks.
  function PresetBuilder(metadata) {
    this.metadata = metadata
    const self = this
    fields.forEachField(function(field, _fieldName) {
      self[field.properName] = field.defaultValue
    })
  }

  // Convert lock sets into strings.
  PresetBuilder.prototype.build = function build() {
    const self = this
    let equipment = self.equipment
    if (typeof(equipment) === 'object') {
      equipment = {}
      Object.getOwnPropertyNames(self.equipment).forEach(function(slot) {
        const item = self.equipment[slot]
        if (item) {
          const itemName = item.name
          equipment[slot] = itemName
        } else {
          equipment[slot] = ''
        }
      })
    }

    const result = new Preset(
      self.metadata.id,
      self.metadata.name,
      self.metadata.description,
      self.metadata.author,
      self.metadata.weight || 0,
    )

    const propNames = Object.getOwnPropertyNames(fields.allOptions)
    propNames.forEach(function(propName) {
      result[propName] = self[propName]
    })
    return result
  }

  function getDefaultFromList(someList) {
    return someList.filter(function(obj) {
      return obj.isDefault
    })[0]
  }

  //LinearCongruentialGenerator
  function LCG(modulus, multiplier, increment, seed) {
    if (multiplier > modulus) {
      console.warn("Typically multiplier < modulus")
    }
    if (seed > modulus) {
      console.log("LCG seed will be truncated")
    }
    if (increment < 0) {
      throw new Error("increment must be >= 0")
    }
    this.modulus = modulus
    this.multiplier = multiplier
    this.increment = increment
    this.seed = seed & this.modulus
  }

  LCG.prototype.roll = function() {
    this.seed = (this.multiplier * this.seed + this.increment) % this.modulus
      return this.seed
  }

  //inclusive on both ends
  LCG.prototype.rollBetween = function(lower, upper) {
    if (lower === upper) {
      //corner case, return either and still roll
      this.roll()
      return upper //doesn't matter which
    }
    if (lower > upper) {
      throw new Error("lower must be < upper")
    }
    var rolled = this.roll()
    return (rolled % (upper + 1 - lower)) + lower
  }

  const exports = {
    assert: assert,
    bufToHex: bufToHex,
    numToHex: numToHex,
    checked: checked,
    optionsFromString: optionsFromString,
    optionsToString: optionsToString,
    optionsFromUrl: optionsFromUrl,
    optionsToUrl: optionsToUrl,
    setSeedAzureDreams: setSeedAzureDreams,
    saltSeed: saltSeed,
    setAppliedOptions: setAppliedOptions,
    shuffle: shuffle,
    Preset: Preset,
    PresetBuilder: PresetBuilder,
    getDefaultFromList: getDefaultFromList,
    LCG: LCG,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      util: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
