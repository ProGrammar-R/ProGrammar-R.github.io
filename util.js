(function(self) {

  let constants
  let items
  let sjcl

  if (self) {
    constants = self.adRando.constants
    items = self.adRando.items
    sjcl = self.sjcl
  } else {
    constants = require('./constants')
    items = require('./items')
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
    const options = {}
    let i = 0
    while (i < randomize.length) {
      let c = randomize[i++]
      switch (c) {
      case 'P':
        // Check for an argument.
        if (randomize[i] !== ':') {
          throw new Error('Expected argument')
        }
        let arg
        let start
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
        options.preset = arg
        if (randomize[i] === ',') {
          i++
        }
        break
      case 's':
        options.singleRoom = true
        break
      default:
        throw new Error('Invalid randomization: ' + c)
      }
    }
    if (!Object.getOwnPropertyNames(options).length) {
      throw new Error('No randomizations')
    }
    return options
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
    while (Object.getOwnPropertyNames(options).length) {
      if ('preset' in options) {
        randomize += 'P:' + options.preset
        if (Object.getOwnPropertyNames(options).length > 1) {
          randomize += ','
        }
        delete options.preset
      } else if ('singleRoom' in options) {
        if (options.singleRoom) {
          randomize += 's'
        }
        delete options.singleRoom
      } else {
        const unknown = Object.getOwnPropertyNames(options).pop()
        throw new Error('Unknown options: ' + unknown)
      }
    }
    return randomize
  }

  function optionsFromUrl(url) {
    url = new URL(url)
    const args = url.search.slice(1).split(',')
    let options
    let checksum
    let seed
    if (args.length > 2) {
      options = optionsFromString(args.slice(0, args.length - 2).join(','))
    } else {
      options = optionsFromString(constants.defaultOptions)
    }
    seed = decodeURIComponent(args.pop())
    checksum = parseInt(args.pop(), 16)
    return {
      options: options,
      checksum: checksum,
      seed: seed,
    }
  }

  function optionsToUrl(options, checksum, seed, baseUrl) {
    options = constants.defaultOptions
    const args = []
    if (options !== constants.defaultOptions) {
      args.push(options)
    }
    args.push(checksum.toString(16))
    args.push(encodeURIComponent(seed))
    return baseUrl + '?' + args.join(',')
  }

  const map = {
    ',': 0x8143,
    '.': 0x8144,
    ':': 0x8146,
    ';': 0x8147,
    '?': 0x8148,
    '!': 0x8149,
    '`': 0x814d,
    '"': 0x814e,
    '^': 0x814f,
    '_': 0x8151,
    '~': 0x8160,
    '\'': 0x8166,
    '(': 0x8169,
    ')': 0x816a,
    '[': 0x816d,
    ']': 0x816e,
    '{': 0x816f,
    '}': 0x8170,
    '+': 0x817b,
    '-': 0x817c,
    '0': 0x824f,
    '1': 0x8250,
    '2': 0x8251,
    '3': 0x8252,
    '4': 0x8253,
    '5': 0x8254,
    '6': 0x8255,
    '7': 0x8256,
    '8': 0x8257,
    '9': 0x8258,
  }

  function setSeedAzureDreams(data, seed) {
    //fix RNG sources
    data.writeInstruction(0x6f44ac,0x82718274)
    data.writeInstruction(0x6f44b0,0x826d826d)
    data.writeInstruction(0x6f44b4,0x82710061)
    data.writeByte(0x20efd72,0x71)
    data.writeByte(0x20efd79,0x74)
    data.writeInstruction(0x20efd7a,0x826d826d)
    data.writeShort(0x1c6de68,0x1468)

    //overwrite call to check_for_koh_icons to just return a constant v0 = 0
    data.writeInstruction(0x1ea692c,0x8c66000c)
    data.writeInstruction(0x218067c,0x8c66000c)

    //overwrite first alt RNG to call custom routine
    data.writeInstruction(0x1ea6e8c,0x7266000c)
    data.writeInstruction(0x2180bdc,0x7266000c)

    //very important
    data.writeInstruction(0x1c5879c,0x82778271)
    data.writeInstruction(0x1c587a0,0x826d8266)

    //overwrite setting seed
    data.writeInstruction(0x1ea6e8c+0x30,0x5c33b08c)
    data.writeInstruction(0x1ea6e8c+0x34,0x00000000)
    data.writeInstruction(0x1ea6e8c+0x38,0x00000000)
    data.writeInstruction(0x2180bdc+0x30,0x5c33b08c)
    data.writeInstruction(0x2180bdc+0x34,0x00000000)
    data.writeInstruction(0x2180bdc+0x38,0x00000000)

    const addresses = [
      {start: 0x1ea7f70,},
      {start: 0x2181cc0,}
    ]

    let hex = sjcl.hash.sha256.hash(seed)

    //write custom routine
    var routine = [
                {data: 0x0880033c, toSeed: false,},
                {data: 0x6c146684, toSeed: false,},
                {data: 0xe8ffbd27, toSeed: false,},
                {data: 0x1400bfaf, toSeed: false,},
                {data: 0x1000b0af, toSeed: false,},
                {data: 0x0000043c, toSeed: true,},
                {data: 0x00008434, toSeed: true,},
                {data: 0x8e66000C, toSeed: false,},
                {data: 0x2128c000, toSeed: false,},
                {data: 0x21808000, toSeed: false,},
                {data: 0x0000043c, toSeed: true,},
                {data: 0x00008434, toSeed: true,},
                {data: 0x8e66000C, toSeed: false,},
                {data: 0x42280600, toSeed: false,},
                {data: 0x26800402, toSeed: false,},
                {data: 0x0180033c, toSeed: false,},
                {data: 0x2c02658c, toSeed: false,},
                {data: 0x0000043c, toSeed: true,},
                {data: 0x8e66000C, toSeed: false,},
                {data: 0x00008434, toSeed: true,},
                {data: 0x26800402, toSeed: false,},
                {data: 0x0880033c, toSeed: false,},
                {data: 0x5c3370ac, toSeed: false,},
                {data: 0x1400bf8f, toSeed: false,},
                {data: 0x1000b08f, toSeed: false,},
                {data: 0x1800bd27, toSeed: false,},
                {data: 0x0800e003, toSeed: false,},
                {data: 0x00000224, toSeed: false,},
                {data: 0x1f00a530, toSeed: false,},
                {data: 0xffff023c, toSeed: false,},
                {data: 0xffff4234, toSeed: false,},
                {data: 0x0610a200, toSeed: false,},
                {data: 0x26104200, toSeed: false,},
                {data: 0x24108200, toSeed: false,},
                {data: 0x0620a400, toSeed: false,},
                {data: 0x0800e003, toSeed: false,},
                {data: 0x25208200, toSeed: false,}]

    addresses.forEach(function(address) {
      let a = 0
      let v = 0
      let s = 0
      while (v < routine.length) {
        let toWrite = routine[v].data
        if (routine[v].toSeed) {
          let seedVal = hex[s++] & 0xffff
          toWrite = toWrite | (seedVal << 16)
        }
        data.writeInstruction(address.start + a, toWrite)
        a = a + 4
        v++
      }
    })
  }

  function setSingleRoom(options, data) {
    if (options.singleRoom) {
      data.writeShort(0x1ea8188, 0x7fff)
      data.writeShort(0x2181ed8, 0x7fff)
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

  function restoreFile(data, file) {
    const dataLength = file.len + Math.floor(file.len / 0x800) * 0x130
    data = data.slice(file.pos, file.pos + dataLength)
    file = Buffer.alloc(file.len)
    let curr = file
    while (data.length) {
      curr.set(data.slice(0, 0x800))
      curr = curr.slice(0x800)
      data = data.slice(0x800 + 0x130)
    }
    return file
  }

  function shuffled(array) {
    const copy = array.slice()
    const shuffled = []
    while (copy.length) {
      const rand = Math.floor(Math.random() * copy.length)
      shuffled.push(copy.splice(rand, 1)[0])
    }
    return shuffled
  }

  function Preset(
    id,
    name,
    description,
    author,
    weight,
    singleRoom,
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.author = author
    this.weight = weight
    this.singleRoom = singleRoom
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
    // Single-room floors
    this.singleRoom = false
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
    const singleRoom = self.singleRoom
    return new Preset(
      self.metadata.id,
      self.metadata.name,
      self.metadata.description,
      self.metadata.author,
      self.metadata.weight || 0,
      equipment,
      singleRoom,
    )
  }

  const exports = {
    assert: assert,
    bufToHex: bufToHex,
    numToHex: numToHex,
    checked: checked,
    optionsFromString: optionsFromString,
    optionsFromUrl: optionsFromUrl,
    optionsToUrl: optionsToUrl,
    setSeedAzureDreams: setSeedAzureDreams,
    saltSeed: saltSeed,
    setSingleRoom: setSingleRoom,
    restoreFile: restoreFile,
    shuffled: shuffled,
    Preset: Preset,
    PresetBuilder: PresetBuilder,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      util: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
