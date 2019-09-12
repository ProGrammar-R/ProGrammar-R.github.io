(function(self) {

  let constants
  let sjcl

  if (self) {
    constants = self.adRando.constants
    sjcl = self.sjcl
  } else {
    constants = require('./constants')
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
    const options = {}
    let i = 0
    while (i < randomize.length) {
      let c = randomize[i++]
      let arg
      let start
      switch (c) {
      case 'P':
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
        options.preset = arg
        if (randomize[i] === ',') {
          i++
        }
        break
      case 'd':
        options.derandomize = true
        break
      case 't':
        options.tutorialSkip = true
        break
      case 'i':
        options.introSkip = true
        break
      case 'f':
        options.fastTutorial = true
        break
      case 'e':
        options.enemizer = true
        break
      case 'b':
        options.barongs = true
        break
      case 'S':
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
        options.starter = arg
        if (randomize[i] === ',') {
          i++
        }
        break
      case 'n':
        options.nonnativeSpellsLevel = true
        break
      case 'E':
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
        options.starterElement = arg
        if (randomize[i] === ',') {
          i++
        }
        break
      case 'h':
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
        options.hiddenSpells = arg
        if (randomize[i] === ',') {
          i++
        }
        break
	  	case 'w':
        options.newBalls = true
        break
	  	case 'I':
        options.startingItems = true
        break
      case 'B':
        options.ballElements = true
        break
      case 'm':
        options.monsterElements = true
        break
      case 'g':
        options.eggomizer = true
        break
      case 's':
        options.singleRoom = true
        break
      case 'N':
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
        options.endurance = arg
        if (randomize[i] === ',') {
          i++
        }
        break
      case 'o':
        options.boss = true
        break
      case 'T':
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
        options.timeDifficulty = arg
        if (randomize[i] === ',') {
          i++
        }
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
      } else if ('derandomize' in options) {
        if (options.derandomize) {
          randomize += 'd'
        }
        delete options.derandomize
      } else if ('tutorialSkip' in options) {
        if (options.tutorialSkip) {
          randomize += 't'
        }
        delete options.tutorialSkip
      } else if ('introSkip' in options) {
        if (options.introSkip) {
          randomize += 'i'
        }
        delete options.introSkip
      } else if ('fastTutorial' in options) {
        if (options.fastTutorial) {
          randomize += 'f'
        }
        delete options.fastTutorial
      } else if ('enemizer' in options) {
        if (options.enemizer) {
          randomize += 'e'
        }
        delete options.enemizer

        //only do this if enemizer is set
        if ('barongs' in options) {
          if (options.barongs) {
            randomize += 'b'
          }
          delete options.barongs
        }
      } else if ('starter' in options) {
        randomize += 'S:' + options.starter + ','
        delete options.starter
      } else if ('nonnativeSpellsLevel' in options) {
        if (options.nonnativeSpellsLevel) {
          randomize += 'n'
        }
        delete options.nonnativeSpellsLevel
      } else if ('starterElement' in options) {
        randomize += 'E:' + options.starterElement + ','
        delete options.starterElement
      } else if ('hiddenSpells' in options) {
        randomize += 'h:' + options.hiddenSpells + ','
        delete options.hiddenSpells
      } else if ('newBalls' in options) {
        if (options.newBalls) {
          randomize += 'w'
        }
        delete options.newBalls
      } else if ('startingItems' in options) {
        if (options.startingItems) {
          randomize += 'I'
        }
        delete options.startingItems
      } else if ('ballElements' in options) {
        if (options.ballElements) {
          randomize += 'B'
        }
        delete options.ballElements
      } else if ('monsterElements' in options) {
        if (options.monsterElements) {
          randomize += 'm'
        }
        delete options.monsterElements
      } else if ('eggomizer' in options) {
        if (options.eggomizer) {
          randomize += 'g'
        }
        delete options.eggomizer
      } else if ('singleRoom' in options) {
        if (options.singleRoom) {
          randomize += 's'
        }
        delete options.singleRoom
      } else if ('endurance' in options) {
        randomize += 'N:' + options.endurance + ','
        delete options.endurance
      } else if ('boss' in options) {
        if (options.boss) {
          randomize += 'o'
        }
        delete options.boss
      } else if ('timeDifficulty' in options) {
        randomize += 'T:' + options.timeDifficulty + ','
        delete options.timeDifficulty
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
    options = optionsToString(options)
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

  function setSeedAzureDreams(data, options, seed) {
    //very important
    data.writeInstruction(0x1c5879c,0x82778271)
    data.writeInstruction(0x1c587a0,0x826d8266)

    data.writeInstruction(0x6f44ac,0x82718274)
    data.writeInstruction(0x6f44b0,0x826d826d)
    data.writeInstruction(0x6f44b4,0x82710061)
    data.writeByte(0x20efd72,0x71)
    data.writeByte(0x20efd79,0x74)
    data.writeInstruction(0x20efd7a,0x826d826d)

    let hex = sjcl.hash.sha256.hash(seed)

    if (options.derandomize) {
      //fix RNG sources
      data.writeShort(0x1c6de68,0x1468)

      //overwrite call to check_for_koh_icons to just return a constant v0 = 0
      data.writeInstruction(0x1ea692c,0x8c66000c)
      data.writeInstruction(0x218067c,0x8c66000c)

      //overwrite first alt RNG to call custom routine
      data.writeInstruction(0x1ea6e8c,0x7266000c)
      data.writeInstruction(0x2180bdc,0x7266000c)

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
                  {data: 0xc2280600, toSeed: false,},
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
    return hex
  }

  function setAppliedOptions(options, data) {
    if (options.nonnativeSpellsLevel) {
      data.writeInstruction(0x1c75450, 0x21106000)
    }
    if (options.singleRoom) {
      data.writeShort(0x1ea8188, 0x7fff)
      data.writeShort(0x2181ed8, 0x7fff)
    }
    applyTutorialSkip(options, data)
    applyIntroSkip(options, data)
    applyEnduranceAndTimeDifficulty(options, data)
    applyBoss(options, data)
    //if (options.experimentalChanges) {
      //always make cursor start at New Game
      //data.writeInstruction(0x43a920, 0x01000224)
    //}
  }

  function applyTutorialSkip(options, data) {
    if (options.tutorialSkip) {
      data.writeInstruction(0x312b31c, 0x544e0508)
      data.writeInstruction(0x313215c, 0x544e0508)
      data.writeInstruction(0x3138f9c, 0x544e0508)
      data.writeInstruction(0x313fddc, 0x544e0508)
      data.writeInstruction(0x3146c1c, 0x544e0508)
      data.writeInstruction(0x314da5c, 0x544e0508)
      data.writeInstruction(0x315489c, 0x544e0508)
    }
  }

  function applyIntroSkip(options, data) {
    if (options.introSkip) {
      //skip from angel to intro video before waking up
      data.writeByte(0xee5f84, 0x05)

      let wakeAddress = 0xb946d8
      //from waking up, mark priest scene as done
      data.writeByte(wakeAddress++, 0x0c)
      data.writeWord(wakeAddress, 0x0014)
      wakeAddress += 2

      //now get a pita fruit
      data.writeByte(wakeAddress++, 0x0c)
      data.writeInstruction(wakeAddress, 0x16002e79)
      wakeAddress += 4

      //skip from there to end when leaving house
      data.writeByte(wakeAddress++, 0x3e)
      data.writeByte(wakeAddress++, 0x00)
      data.writeWord(wakeAddress, 0x8002221e) //skip to address -1
    }
  }

  function applyEnduranceAndTimeDifficulty(options, data) {
    if (options.endurance > 0 || options.timeDifficulty > 0) {
      if (options.endurance > 0) {
        const top = 0x63
        //8001788c
        data.writeByte(0x1ea5974, top)
        data.writeByte(0x217f6c4, top)
        //80018f58
        data.writeByte(0x1ea72a0, top)
        data.writeByte(0x1ea72c8, top)
        data.writeByte(0x2180ff0, top)
        data.writeByte(0x2181018, top)
        //8001f48c
        data.writeByte(0x1eae744, top)
        data.writeByte(0x2188494, top)
        //8003e16c
        data.writeByte(0x21f94, top + 1)
        data.writeByte(0x21f9c, top)
        //800b0618
        data.writeByte(0x1c859e0, top)
        //800bcffc
        data.writeByte(0x1c942a4, top)
        data.writeByte(0x1c94354, top)
        //800c0330
        data.writeByte(0x1c97cf8, top)
        //800c26ac
        data.writeByte(0x1c9a534, top)
      }

      //custom routine
      const spawnCodeAddresses = [0x1ea795c,0x21816ac,]
      spawnCodeAddresses.forEach(function(spawnCodeAddr) {
        //move new instructions in place
        const newSpawnCode = [
          {instruction: 0x28000624, enduranceDifficulty: false, timeDifficulty: false,}, //li    a2,40
          {instruction: 0x033c0700, enduranceDifficulty: false, timeDifficulty: false,}, //sra   a3,a3,0x10
          {instruction: 0x1b00e600, enduranceDifficulty: false, timeDifficulty: false,}, //divu  a3,a2
          {instruction: 0x1000a627, enduranceDifficulty: false, timeDifficulty: false,}, //addiu a2,sp,16
          {instruction: 0x00000000, enduranceDifficulty: false, timeDifficulty: false,}, //nop
          {instruction: 0x10380000, enduranceDifficulty: false, timeDifficulty: false,}, //mfhi  a3
          {instruction: 0x12800000, enduranceDifficulty: false, timeDifficulty: false,}, //mflo  s0
          {instruction: 0x2000bfaf, enduranceDifficulty: false, timeDifficulty: false,}, //sw    ra,32(sp)
          {instruction: 0xb5fd000c, enduranceDifficulty: false, timeDifficulty: false,}, //                      jal	0x8003f6d4
          {instruction: 0x5e3fe724, enduranceDifficulty: false, timeDifficulty: false,}, //                      addiu	a3,a3,16222                 ; a3 = floor number + 0x3f5e
          {instruction: 0x06000424, enduranceDifficulty: false, timeDifficulty: false,}, //                      li	a0,6                            ; a0 = 6
          {instruction: 0x1000a527, enduranceDifficulty: false, timeDifficulty: false,}, //                      addiu	a1,sp,16
          {instruction: 0x3ff9000c, enduranceDifficulty: false, timeDifficulty: false,}, //                      jal	0x8003e4fc
          {instruction: 0x21300000, enduranceDifficulty: false, timeDifficulty: false,}, //                      move	a2,zero                         ; a2 = 0
          {instruction: 0xc8fc000c, enduranceDifficulty: false, timeDifficulty: false,}, //                      jal	0x8003f320
          {instruction: 0x00000000, enduranceDifficulty: false, timeDifficulty: false,}, //                      nop
          {instruction: 0x0880023c, enduranceDifficulty: false, timeDifficulty: false,}, //                      lui	v0,0x8008                       ; v0 = 0x80080000
          {instruction: 0x7834428c, enduranceDifficulty: false, timeDifficulty: false,}, //                      lw	v0,13432(v0)                    ; v0 = $80083478
          {instruction: 0x00a02626, enduranceDifficulty: false, timeDifficulty: false,}, //                      addiu	a2,s1,-24576                ; a2 = 0x8014a000
          {instruction: 0x28000324, enduranceDifficulty: true,  timeDifficulty: false,}, //li    v1,40
          {instruction: 0x19007000, enduranceDifficulty: false, timeDifficulty: false,}, //multu v1,s0
          {instruction: 0x10000324, enduranceDifficulty: false, timeDifficulty: false,}, //li    v1,16
          {instruction: 0x0180043c, enduranceDifficulty: false, timeDifficulty: false,}, //lui   a0,0x8001  ; for time difficulty
          {instruction: 0x12800000, enduranceDifficulty: false, timeDifficulty: false,}, //mflo  s0
          {instruction: 0x1c02848c, enduranceDifficulty: false, timeDifficulty: false,}, //lw    a0,540(a0) ; for time difficulty
          {instruction: 0x20000524, enduranceDifficulty: false, timeDifficulty: true,},  //li    a1,32
          {instruction: 0x0620a400, enduranceDifficulty: false, timeDifficulty: false,}, //srlv  a0,a0,a1   ; for time difficulty
          {instruction: 0x21800402, enduranceDifficulty: false, timeDifficulty: false,}, //addu  s0,s0,a0   ; for time difficulty
                      //loop:
          {instruction: 0x0000c490, enduranceDifficulty: false, timeDifficulty: false,}, //lbu   a0,0(a2)
          {instruction: 0x0100c590, enduranceDifficulty: false, timeDifficulty: false,}, //lbu   a1,1(a2)
          {instruction: 0x02008014, enduranceDifficulty: false, timeDifficulty: false,}, //bnez  a0,2
          {instruction: 0x00000000, enduranceDifficulty: false, timeDifficulty: false,}, //nop
          {instruction: 0x20000424, enduranceDifficulty: false, timeDifficulty: false,}, //li    a0,20

          {instruction: 0x000044a0, enduranceDifficulty: false, timeDifficulty: false,}, //sb    a0,0(v0)
          {instruction: 0x2128b000, enduranceDifficulty: false, timeDifficulty: false,}, //addu  a1,a1,s0
          {instruction: 0x0001a42c, enduranceDifficulty: false, timeDifficulty: false,}, //sltiu a0,a1,256
          {instruction: 0x0200801c, enduranceDifficulty: false, timeDifficulty: false,}, //bgtz  a0,8
          {instruction: 0x00000000, enduranceDifficulty: false, timeDifficulty: false,}, //nop
          {instruction: 0xff000524, enduranceDifficulty: false, timeDifficulty: false,}, //li    a1,255
          {instruction: 0x010045a0, enduranceDifficulty: false, timeDifficulty: false,}, //sb    a1,1(v0)
          {instruction: 0x0200c624, enduranceDifficulty: false, timeDifficulty: false,}, //addiu a2,a2,2
          {instruction: 0x02004224, enduranceDifficulty: false, timeDifficulty: false,}, //addiu v0,v0,2
          {instruction: 0xf1ff6014, enduranceDifficulty: false, timeDifficulty: false,}, //bnez  v1,loop
          {instruction: 0xffff6324, enduranceDifficulty: false, timeDifficulty: false,}, //addiu v1,v1,-1
          {instruction: 0x00a03026, enduranceDifficulty: false, timeDifficulty: false,}, //addiu s0,s1,-24576

          {instruction: 0x00000000, enduranceDifficulty: false, timeDifficulty: false,}, //nop
        ]
        const timeDifficultyShiftOffset = 11; //actually about 0xe01 per minute, but use 0x1000 as an approximation
        const maxTimeDifficultyValue = 31 - timeDifficultyShiftOffset - 1; //31 is max non-zero shift, then remove shift offset plus 1 for min difficulty of 1
        newSpawnCode.forEach(function(instruction) {
            data.writeInstruction(spawnCodeAddr, instruction.instruction)
            if (instruction.enduranceDifficulty) {
            	data.writeByte(spawnCodeAddr, options.endurance & 0xff)
            }
            if (instruction.timeDifficulty && !!options.timeDifficulty && options.timeDifficulty > 0 && options.timeDifficulty <= maxTimeDifficultyValue) {
              data.writeByte(spawnCodeAddr, timeDifficultyShiftOffset + (options.timeDifficulty & 0xff))
            }
            spawnCodeAddr += 4
          }
        )
      })
    }
  }

  function applyBoss(options, data) {
    if (options.boss) {
      //make Beldo killable
      let beldoAddress = constants.romAddresses.beldoInvulnerability
      const beldoVulnerableCode = [
          {instruction: 0x0000628c,}, //lw	v0,0(v1)
          {instruction: 0x9b000392,}, //lbu	v1,155(s0)
          {instruction: 0x08004000,}, //jr	v0
          {instruction: 0x01006324,}, //addiu	v1,v1,1
          {instruction: 0x9b0003a2,}, //sb	v1,155(s0)
          {instruction: 0x34b5020c,}, //jal	0x800ad4d0  ; call change_monster_or_player_health
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
        ]
      beldoVulnerableCode.forEach(function(instruction) {
        data.writeInstruction(beldoAddress, instruction.instruction)
          beldoAddress += 4
        }
      )

      //remove lose to win condition
      data.writeInstruction(constants.romAddresses.checkKohDeathTopFloor, 0x0000033c) //lui	v1,0x00

      //prevent crash under certain conditions
      data.writeInstruction(constants.romAddresses.beldoCrashFixPart1, 0x21184000) // move v1,v0
      beldoAddress = constants.romAddresses.beldoCrashFixPart2
      const beldoCrashFixPart2Code = [
          {instruction: 0x05004010,}, //beqz	v0,0x8009b2c8                 ; if result of routine_8009a350 is 0, essentially jump to routine_8009b25c_end, returning v0 = 0
          {instruction: 0x00336330,}, //andi	v1,v1,0x3300                  ; if secondary result of routine_8009a350 didn't have bits 0x3300 set
          {instruction: 0x5c00028e,}, //lw	v0,92(s0)                       ; v0 = monster s0's nearby pointer (can freeze when load v0 = 0)
          {instruction: 0x05006014,}, //bnez	v1,0x8009b2d4                 ;   jump to routine_8009b25c_end, returning v0 = 0
          {instruction: 0x00000000,}, //nop
        ]
      beldoCrashFixPart2Code.forEach(function(instruction) {
        data.writeInstruction(beldoAddress, instruction.instruction)
          beldoAddress += 4
        }
      )

      //custom Beldo code
      const customBeldoCode = [
          {instruction: 0x21200000,}, //move a0,0
          {instruction: 0x21280000,}, //move a1,0
          //loop
          {instruction: 0x0000c38c,}, //lw  v1,0(a2)
          {instruction: 0x0100a524,}, //addiu  a1,a1,1
          {instruction: 0x1800a3af,}, //sw  v1,24(sp)
          {instruction: 0x0400c624,}, //addiu  a2,a2,4
          {instruction: 0x0800a22c,}, //sltiu  v0,a1,8
          {instruction: 0xfaff4014,}, //bnez  v0,0x80171db4
          {instruction: 0x0400bd27,}, //addiu  sp,sp,4
          {instruction: 0x21280000,}, //move  a1,zero
          {instruction: 0x01008424,}, //addiu  a0,a0,1
          {instruction: 0x0200822c,}, //sltiu  v0,a0,2
          {instruction: 0xf5ff4014,}, //bnez  v0,0x80171db4
          {instruction: 0x7402c624,}, //addiu  a2,a2,628
          {instruction: 0xadc70508,}, //j  0x80171eb4
          {instruction: 0xc0ffbd27,}, //addiu  sp,sp,-64
          //new routine
          {instruction: 0xd0ffbd27,}, //addiu  sp,sp,-48
          {instruction: 0x2800bfaf,}, //sw  ra,40(sp)
          {instruction: 0x2400a4af,}, //sw  a0,36(sp)
          {instruction: 0x2000a5af,}, //sw  a1,32(sp)
          {instruction: 0x1c00a6af,}, //sw  a2,28(sp)
          {instruction: 0x1800a7af,}, //sw  a3,24(sp)
          {instruction: 0x10000524,}, //li  a1,16
          {instruction: 0x3c92020c,}, //jal  0x800a48f0
          {instruction: 0x0f000624,}, //li  a2,15
          {instruction: 0x0f80033c,}, //lui  v1,0x800f
          {instruction: 0x88000224,}, //li  v0,0x88
          {instruction: 0xc5d062a0,}, //sb  v0,-12091(v1)
          {instruction: 0x00010224,}, //li  v0,0x0100
          {instruction: 0x00000000,}, //nop
          {instruction: 0x44d262a4,}, //sh  v0,-11708(v1)
          {instruction: 0x4ad262a4,}, //sh  v0,-11702(v1)
          {instruction: 0x3ed262a4,}, //sh  v0,-11714(v1)
          {instruction: 0xcad062a4,}, //sh  v0,-12086(v1)
          {instruction: 0xbed062a4,}, //sh  v0,-12098(v1)
          {instruction: 0x0e80033c,}, //lui  v1,0x800e
          {instruction: 0x4a3560a0,}, //sb  zero,0x354a(v1)
          //set fast
          {instruction: 0x07000524,}, //li   a1,7
          {instruction: 0x3c92020c,}, //jal	0x800a48f0
          {instruction: 0x01000624,}, //li   a2,1
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00000000,}, //nop
          {instruction: 0x2800bf8f,}, //lw  ra,40(sp)
          {instruction: 0x1800a78f,}, //lw  a3,24(sp)
          {instruction: 0x1c00a68f,}, //lw  a2,28(sp)
          {instruction: 0x2000a58f,}, //lw  a1,32(sp)
          {instruction: 0x2400a48f,}, //lw  a0,36(sp)
          {instruction: 0x0800e003,}, //jr  ra
          {instruction: 0x3000bd27,}, //addiu  sp,sp,48
        ]
      beldoAddress = constants.romAddresses.customBeldoCode
      customBeldoCode.forEach(function(instruction) {
        data.writeInstruction(beldoAddress, instruction.instruction)
          beldoAddress += 4
        }
      )

      //make this routine get called instead of setting beldo as fast directly
      data.writeInstruction(constants.romAddresses.beldoSetFast, 0x7bc7050c)

      //give Beldo spells
      const beldoUnitId = 0x38
      const beldoInitialStatsAddress = constants.romAddresses.initialStatsTable + constants.initialStatsRowLength * beldoUnitId
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell1Id, constants.spells.poison)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell1Level, 1)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell1LevelAlt, 1)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell2Id, constants.spells.lagrave)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell2Level, 1)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell2LevelAlt, 1)

      //increase Beldo's stat growth to be more like Koh's
      const beldoStatGrowthAddress = constants.romAddresses.statGrowthTable + constants.statGrowthRowLength * beldoUnitId
      data.writeByte(beldoStatGrowthAddress + constants.monsterStats.attack, 0x08)
      data.writeByte(beldoStatGrowthAddress + constants.monsterStats.defense, 0x0b)
      data.writeByte(beldoStatGrowthAddress + constants.monsterStats.hp, 0x10)

      //set Beldo's level based on endurance mode
      data.writeByte(constants.romAddresses.beldoLevel, (options.endurance > 0) ? 60 : 40)
    }
  }

  function pauseAfterDeath(data) {
    // write text that is directed to after death to introduce a pause
    data.writeLEShort(constants.romAddresses.pauseAfterDeathText, 0x1101)

    // now add a new condition for exiting, which is done such that if the demo were to die, it might also be possible for it to exit to Koh's house or crash
    let pauseCodeAddr = constants.romAddresses.pauseAfterDeathCode
    const pauseCode = [
          {instruction: 0x0880023c,}, //lui v0,0x8008
          {instruction: 0xe02a428c,}, //lw v0,0x2ae0(v0) (is story text cursor on 00?)
          {instruction: 0x00000000,}, //nop
          {instruction: 0x00004290,}, //lbu v0,0(v0)
          {instruction: 0x00000000,}, //nop
          {instruction: 0x3400401c,}, //bgtz	v0,0x8008e250
          {instruction: 0x960002a6,}, //sh	v0,150(s0)
          {instruction: 0x6a380208,}, //j 0x8008e1a8
         ]
    pauseCode.forEach(function(instruction) {
        data.writeInstruction(pauseCodeAddr, instruction.instruction)
        pauseCodeAddr += 4
      }
    )
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
    derandomize,
    tutorialSkip,
    introSkip,
    fastTutorial,
    enemizer,
    barongs,
    starter,
    nonnativeSpellsLevel,
    starterElement,
    hiddenSpells,
    newBalls,
    startingItems,
    ballElements,
    monsterElements,
    eggomizer,
    singleRoom,
    endurance,
    boss,
    timeDifficulty,
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.author = author
    this.weight = weight
    this.derandomize = derandomize
    this.tutorialSkip = tutorialSkip
    this.introSkip = introSkip
    this.fastTutorial = fastTutorial
    this.enemizer = enemizer,
    this.barongs = barongs,
    this.starter = starter,
    this.nonnativeSpellsLevel = nonnativeSpellsLevel,
    this.starterElement = starterElement,
    this.hiddenSpells = hiddenSpells,
    this.newBalls = newBalls,
    this.startingItems = startingItems,
    this.ballElements = ballElements,
    this.monsterElements = monsterElements,
    this.eggomizer = eggomizer,
    this.singleRoom = singleRoom,
    this.endurance = endurance,
    this.boss = boss,
    this.timeDifficulty = timeDifficulty
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
    this.derandomize = true
    this.tutorialSkip = true
    this.introSkip = true
    this.fastTutorial = false
    this.enemizer = false
    this.barongs = false
    this.starter = 0x02
    this.nonnativeSpellsLevel = false
    this.starterElement = -3
    this.hiddenSpells = 0
    this.newBalls = false
    this.startingItems = false
    this.ballElements = false
    this.monsterElements = false
    this.eggomizer = false
    this.singleRoom = false
    this.endurance = 0
    this.boss = false
    this.timeDifficulty = 0
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
    const derandomize = self.derandomize
    const tutorialSkip = self.tutorialSkip
    const introSkip = self.introSkip
    const fastTutorial = self.fastTutorial
    const enemizer = self.enemizer
    const barongs = self.barongs
    const starter = self.starter
    const nonnativeSpellsLevel = self.nonnativeSpellsLevel
    const starterElement = self.starterElement
    const hiddenSpells = self.hiddenSpells
    const newBalls = self.newBalls
    const startingItems = self.startingItems
    const ballElements = self.ballElements
    const monsterElements = self.monsterElements
    const eggomizer = self.eggomizer
    const singleRoom = self.singleRoom
    const endurance = self.endurance
    const boss = self.boss
    const timeDifficulty = self.timeDifficulty
    return new Preset(
      self.metadata.id,
      self.metadata.name,
      self.metadata.description,
      self.metadata.author,
      self.metadata.weight || 0,
      derandomize,
      tutorialSkip,
      introSkip,
      fastTutorial,
      enemizer,
      barongs,
      starter,
      nonnativeSpellsLevel,
      starterElement,
      hiddenSpells,
      newBalls,
      startingItems,
      ballElements,
      monsterElements,
      eggomizer,
      singleRoom,
      endurance,
      boss,
      timeDifficulty,
    )
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
    pauseAfterDeath: pauseAfterDeath,
    saltSeed: saltSeed,
    setAppliedOptions: setAppliedOptions,
    restoreFile: restoreFile,
    shuffled: shuffled,
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
