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
        if (field.get() != field.getDefault()) {
          randomize += field.toOptionValue()
        }
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
    const intSize = 0x20
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
    miniSeed1 = changeEndianShort(miniSeed1) << 0x10
    miniSeed1 = miniSeed1 | hex[i++] & 0xffff
    let miniSeed2 = hex[i++] & 0xffff
    miniSeed2 = changeEndianShort(miniSeed2) << 0x10
    miniSeed2 = miniSeed2 | hex[i++] & 0xffff
    let seeds = []
    const maxFloor = 99
    for (let floor = 1; floor <= maxFloor; floor++) {
      let floorSeed = ror(miniSeed1, floor) ^ ror(miniSeed2, floor >>> 3)
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
    data.writeInstruction(0x1c5879c,0x82778271)
    data.writeInstruction(0x1c587a0,0x826d8266)

    data.writeInstruction(0x6f44ac,0x82718274)
    data.writeInstruction(0x6f44b0,0x826d826d)
    data.writeInstruction(0x6f44b4,0x82710061)
    data.writeByte(0x20efd72,0x71)
    data.writeByte(0x20efd79,0x74)
    data.writeInstruction(0x20efd7a,0x826d826d)

    if (!userSeed) {
      seed = validateOrReplaceSeed(seed, 0)
    }

    let hex = sjcl.hash.sha256.hash(seed)

    if (options.derandomize) {
      //fix RNG sources
      data.writeShort(0x1c6de68,0x1468)

      //overwrite call to check_for_koh_icons to just return a constant v0 = 0
      data.writeInstruction(constants.romAddresses.callCheckFor2ndTower1,0x8c66000c)
      data.writeInstruction(constants.romAddresses.callCheckFor2ndTower2,0x8c66000c)

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
        {start: constants.romAddresses.checkIfTower2Availbl1,},
        {start: constants.romAddresses.checkIfTower2Availbl2,}
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
                  {data: 0x0610a400, toSeed: false,},
                  {data: 0xe0ffa524, toSeed: false,},
                  {data: 0x23280500, toSeed: false,},
                  {data: 0x0420a400, toSeed: false,},
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

  function setAppliedOptions(options, data, hex) {
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
    applyElevatorSpawns(options, data)
    makeFrog(options, data)
    applyThemes(options, data, hex)
    applyQuestReload(options, data)
    applyPortableElevators(options, data)
    applySecondTower(options, data)
    applyFloor2(options, data)
    applyLiftItemCap(options, data)
    applyBlueCollar(options, data)
    applyFixCrashes(options, data)
    applyKohElement(options, data, hex)
    applyWidescreen(options, data)
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
        //8001f48c - do not write here or else top floor will display as floor 40
        // data.writeByte(0x1eae744, top)
        // data.writeByte(0x2188494, top)
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
          {instruction: 0x28000324, enduranceDifficulty: true,  timeDifficulty: false,}, //li    v1,40      ; set endurance difficulty multiplier
          {instruction: 0x19007000, enduranceDifficulty: false, timeDifficulty: false,}, //multu v1,s0      ; multiply endurance difficulty multiplier by number of times past 40
          {instruction: 0x10000324, enduranceDifficulty: false, timeDifficulty: false,}, //li    v1,16      ; set loop counter
          {instruction: 0x0180043c, enduranceDifficulty: false, timeDifficulty: false,}, //lui   a0,0x8001  ;
          {instruction: 0x12800000, enduranceDifficulty: false, timeDifficulty: false,}, //mflo  s0         ; s0 = monster level increase for endurance
          {instruction: 0x1c02848c, enduranceDifficulty: false, timeDifficulty: false,}, //lw    a0,540(a0) ; get time elapsed for time difficulty
          {instruction: 0x1f000524, enduranceDifficulty: false, timeDifficulty: true,},  //li    a1,31      ; get scaling factor for time difficulty (use 31 if no time difficulty, 32 acts like 0)
          {instruction: 0x0620a400, enduranceDifficulty: false, timeDifficulty: false,}, //srlv  a0,a0,a1   ; a0 = monster level increase for time difficulty
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
            if (instruction.timeDifficulty && options.timeDifficulty > 0 && options.timeDifficulty <= maxTimeDifficultyValue) {
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
          {instruction: 0x1400b0af,}, //sw  s0,20(sp)
          {instruction: 0x21808000,}, //move s0,a0
          {instruction: 0x16000524,}, //li  a1,16
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
          {instruction: 0x21200002,}, //move a0,s0
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
          {instruction: 0x1400b08f,}, //lw  s0,20(sp)
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
      const beldoInitialStatsAddress = constants.romAddresses.initialStatsTable + constants.rowLength.initialStats * beldoUnitId
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell1Id, constants.spells.poison)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell1Level, 1)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell1LevelAlt, 1)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell2Id, constants.spells.lagrave)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell2Level, 1)
      data.writeByte(beldoInitialStatsAddress + constants.monsterStats.spell2LevelAlt, 1)

      //change Beldo's stat growth
      const beldoStatGrowthAddress = constants.romAddresses.statGrowthTable + constants.rowLength.statGrowth * beldoUnitId
      data.writeByte(beldoStatGrowthAddress + constants.monsterStats.attack, 0x05)
      data.writeByte(beldoStatGrowthAddress + constants.monsterStats.defense, 0x4b)
      data.writeByte(beldoStatGrowthAddress + constants.monsterStats.hp, 0x00)

      //set Beldo's level based on endurance mode
      data.writeByte(constants.romAddresses.beldoLevel, (options.endurance > 0) ? 60 : 40)
    }
  }

  function applyElevatorSpawns(options, data) {
    data.writeByte(constants.romAddresses.multiElevatorSpawns1, options.elevatorSpawns & 0xff)
    data.writeByte(constants.romAddresses.multiElevatorSpawns2, options.elevatorSpawns & 0xff)
  }

  function makeFrog(options, data) {
    if (options.frog) {
      addCharacter(data, 0x2e)
      //add selfi
      addCharacter(data, 0x32)
    }
  }

  function addCharacter(data, characterId) {
    const sourceMonsterId = 0x2d
    let sourceAddress = 0x2EE8100
    const characterAddress = sourceAddress + (characterId - sourceMonsterId) * 0x303c0
    let destinationAddress = characterAddress
    let sectorIndex = 0
    let addressRemainder = 0
    while (sourceAddress < characterAddress) {
      sectorIndex = sourceAddress % constants.sectorSize
      if (sectorIndex >= 24 && sectorIndex < 2072) { // don't overwrite section or checksum data
        data.writeWord(destinationAddress, data.readWord(sourceAddress))
        addressRemainder = sourceAddress % 28224
        if (addressRemainder == 0x4a60) { // set monster type to be chosen character type
          data.writeByte(destinationAddress, characterId)
        } else if (addressRemainder == 0x16f4 || addressRemainder == 0x16f8) { //overwrite missing animations for jumping up
          data.writeWord(destinationAddress, 0x1d1d1d1d)
        } else if (addressRemainder == 0x16ec || addressRemainder == 0x16f0) { //overwrite missing animations for getting hit
          data.writeWord(destinationAddress, 0x29292929)
        } else if (addressRemainder == 0x170c || addressRemainder == 0x1710) { //overwrite missing animations for dying
          data.writeWord(destinationAddress, 0x0d0d0d0d)
        } else if (addressRemainder == 0x53a4) { //prevent frog from attacking to prevent crash / softlock
          data.writeShort(destinationAddress, 0x0000)
        }
      }
      sourceAddress+=4
      destinationAddress+=4
    }
    data.writeByte(0x1c7e2b0, 0xd1) //change call to is_monster_a_frog_or_salamander to only return if is a salamander
    data.writeInstruction(0x375dac0, 0x00000000) //remove override of monster ID with backup monster ID in case of non-standard monster in line-up menu
  }

  function applyThemes(options, data, hex) {
    if (options.themes) {
      const randomThemeHexSeed = 1;
      const lcgSeed = hex.length > randomThemeHexSeed ? Math.abs(hex[randomThemeHexSeed]) : 15;

      const floorThemeOffset = 64
      const themeCount = 0x1b
      const themes = new Array(themeCount)
      //fill array
      for (let i = 0; i < themeCount; i++) {
        themes[i] = i
      }
      shuffle(themes, lcgSeed)
      let themeAddress = constants.romAddresses.floorMonsterTable + floorThemeOffset
      let theme = 0 //leave floor 1 as theme 0, though this probably doesn't get used

      for (let i = 1; i < 40; i++) {
        //as in vanilla game, only change themes on even numbered floors
        if (i % 2 === 0) {
          theme = themes.pop()
        }
        data.writeByte(themeAddress, theme)
        themeAddress += constants.sectorSize
      }
    }
  }

  function applyQuestReload(options, data) {
    if (options.questReload) {
      data.writeInstruction(constants.romAddresses.markQuestAsLoaded1, 0x00000000)
      data.writeInstruction(constants.romAddresses.markQuestAsLoaded2, 0x00000000)
    }
  }

  function applyPortableElevators(options, data) {
    if (options.portableElevators) {
      const maxPortableElevators = 0x02
      //make icon a chest
      data.writeByte(constants.romAddresses.elevatorIcon, 0x14)
      //make hold/usable
      data.writeByte(constants.romAddresses.elevatorUseOptions, 0x00)
      //prevent crash when use - 98a37 -> 14 to take alt path when 0
      data.writeByte(constants.romAddresses.elevatorAltPath, 0x14)
      //dd707 -> 0 to take alt path
      data.writeByte(constants.romAddresses.itemCategDamageTable+3, 0x00)

      //give value to used ball and first 3 used scroll items to prevent them from taking the alt path
      for (let i = 0; i < 80; i += 4) {
        data.writeByte(constants.romAddresses.usedBallItemTable + i + 3, 0x0b)
      }

      //replace nop on alt path with custom routine - 98a3c -> ff bc 00 0c    jal 8002f3fc
      data.writeInstruction(constants.romAddresses.elevatorAltPath+5, 0xffbc000c)

      //replace extra wind crystals with portable elevators
      data.writeByte(constants.romAddresses.windCrystalCheck1-20, 0x14)
      data.writeByte(constants.romAddresses.windCrystalCheck1-12, 0x02)
      data.writeLEShort(constants.romAddresses.windCrystalCheck1+0x78, 0x0214)
      data.writeByte(constants.romAddresses.windCrystalCheck2-20, 0x14)
      data.writeByte(constants.romAddresses.windCrystalCheck2-12, 0x02)
      data.writeLEShort(constants.romAddresses.windCrystalCheck2+0x78, 0x0214)

      //set max portable elevators
      data.writeByte(constants.romAddresses.windCrystalCheck1, maxPortableElevators)
      data.writeByte(constants.romAddresses.windCrystalCheck2, maxPortableElevators)

      const customElevatorCode = [
        //custom routine to set custom item use routine triggered when take alt path
        {instruction: 0x0300143c,}, //lui s4,0x3
        {instruction: 0x0800e003,}, //jr ra
        {instruction: 0x08f49426,}, //addiu s4,s4,0xf408
        //custom item use routine
        {instruction: 0xe8ffbd27,}, //addiu sp,sp,-0x18
        {instruction: 0x1000a4af,}, //sw a0,0x10(sp)
        {instruction: 0x1400bfaf,}, //sw ra,0x14(sp)
                                    //set number of pending items back to 0
        {instruction: 0x0880023c,}, //lui v0,0x8008
        {instruction: 0x6a344394,}, //lhu v1,0x346a(v0)
        {instruction: 0x00000000,}, //nop
        {instruction: 0xffff6324,}, //addiu v1,v1,0xffff
        {instruction: 0x6a3443a4,}, //sh v1,0x346a(v0)
                                    //set koh's action to go up and wipe item
        {instruction: 0x25000324,}, //li  v1,25
        {instruction: 0x523543a4,}, //sh v1,0x3552(v0)
        {instruction: 0x443540ac,}, //sw r0,0x3544(v0)
        {instruction: 0x803543a4,}, //sh v1,0x3580(v0)
        //{instruction: 0x00000000,},
        {instruction: 0xce62020c,}, //jal 0x80098b38
        {instruction: 0x2120a000,}, //move a0,a1
                                    //end routine
        {instruction: 0x1400bf8f,}, //lw ra,0x14(sp)
        {instruction: 0x1000a48f,}, //lw a0,0x10(sp)
        {instruction: 0x1800bd27,}, //addiu sp,sp,0x18
        {instruction: 0x0800e003,}, //jr ra
        {instruction: 0x01000224,}, //li  v0,1
      ]
      customElevatorAddress = constants.romAddresses.ropeDescription
      customElevatorCode.forEach(function(instruction) {
          data.writeInstruction(customElevatorAddress, instruction.instruction)
          customElevatorAddress += 4
        }
      )
    }
  }

  function applySecondTower(options, data) {
    if (options.secondTower) {
      //point suspicious elevator description to overwritten balloon item description
      data.writeWord(constants.romAddresses.suspiciousElevatorDesc, 0x8002f220)

      //overwrite call to check_for_koh_icons with custom routine to add second tower
      data.writeInstruction(constants.romAddresses.callCheckFor2ndTower1,0xeebc000c)
      data.writeInstruction(constants.romAddresses.callCheckFor2ndTower2,0xeebc000c)

      //slightly alter Koh's possible response to Ghosh's text to squeeze in a call to update the elevator tile
      //these aren't actually instructions, but rather text commands. This is just more compact
      data.writeInstruction(constants.romAddresses.kohsReplyToGhoshPart, 0x82934c58)
      data.writeInstruction(constants.romAddresses.kohsReplyToGhoshPart + 4, 0xf4028003)

      //replace mallet description with custom code to add second tower at 0x8002f3b8
      const addSecondTowerCode = [
        {instruction: 0xd80a8287,}, //lh	v0,ad8(gp) (load floor number from 8008146c)
        {instruction: 0xe8ffbd27,}, //addiu	sp,sp,-24
        {instruction: 0x01000424,}, //li    a0,0x1
        {instruction: 0x09004410,}, //beq	v0,a0,0x.... (skip if floor number is 1, which luckily a0 will always be)
        {instruction: 0x1400bfaf,}, //sw	ra,20(sp)
        {instruction: 0x0e80023c,}, //lui   v0,0x800e
        {instruction: 0x04000324,}, //li    v1,0x4
        {instruction: 0xe03c43a4,}, //sh    v1,0x3ce0(v0)=>floorElevators
        {instruction: 0x08000424,}, //li    a0,0x8
        //{instruction: 0x20000624,}, //li    a2,0x20         (assume this is already so)
        //{instruction: 0xe63c40a4,}, //sh   zero,0x3ce6(v0)  (assume this is already so)
        {instruction: 0xe23c44a4,}, //sh    a0,0x3ce2(v0)=>floorElevators[0].xCoord
        {instruction: 0x09000524,}, //li    a1,0x9
        {instruction: 0x8768020c,}, //jal   modifyFloorDataTypeOccupied
        {instruction: 0xe43c45a4,}, //sh    a1,0x3ce4(v0)=>floorElevators[0].yCoord
        {instruction: 0x1400bf8f,}, //lw	ra,20(sp)
        {instruction: 0x00000000,}, //nop
        {instruction: 0x0800e003,}, //jr	ra
        {instruction: 0x1800bd27,}, //addiu	sp,sp,24
      ]
        //{instruction: 0x16bd000c,}, //jal   addSecondTowerCode2

      //code to update tile, will reside at 0x8002f458
      const addSecondTowerCode2 = [
        {instruction: 0x0f80023c,}, //lui   v0,0x800f
        {instruction: 0x01000324,}, //li    v1,0x1
        {instruction: 0xb0ad43a4,}, //sh    v1,0xadb0(v0)=>tileStatus (eadb0)
        {instruction: 0x0800e003,}, //jr	ra
        {instruction: 0xb4ad40a4,}, //sh    zero,0xadb4(v0)=>tileStatus (eadb4)
      ]

      let addSecondTowerAddr = constants.romAddresses.malletDescription
      addSecondTowerCode.forEach(function(instruction) {
          data.writeInstruction(addSecondTowerAddr, instruction.instruction)
          addSecondTowerAddr += 4
        }
      )
      addSecondTowerAddr = constants.romAddresses.ropeDescription + 92
      addSecondTowerCode2.forEach(function(instruction) {
          data.writeInstruction(addSecondTowerAddr, instruction.instruction)
          addSecondTowerAddr += 4
        }
      )
    }
  }

  function applyFloor2(options, data) {
    if (options.floor2) {
      data.writeInstruction(constants.romAddresses.floor2CheckFirstTime1, 0x00000000)
      data.writeInstruction(constants.romAddresses.floor2CheckFirstTime2, 0x00000000)
    }
  }

  function applyLiftItemCap(options, data) {
    if (options.itemCap) {
      data.writeByte(constants.romAddresses.towerItemCap, 21)
    }
  }

  function applyBlueCollar(options, data) {
    if (options.blueCollar) {
      data.writeShort(constants.romAddresses.initialRedCollarStatus, 0x101) //have both collars
      data.writeByte(constants.romAddresses.initialRedCollarStatus + 11, 0xa6) //write hword instead
    }
  }

  function applyFixCrashes(options, data) {
    if (options.fixCrashes) {
      const fixExperienceCrash = [
        {instruction: 0x80002232,}, //andi	v0,s1,0x80     if this is for EXP,
        {instruction: 0x91ff4014,}, //bnez	v0,0x800b4d60    treat normally after
        {instruction: 0x21180002,}, //move v1,s0             setting the signed experience amount to the unsigned amount
        {instruction: 0x27280300,}, //nor  a1,zero,v1
      ]

      let experiencePopupBugAddr = constants.romAddresses.experiencePopupBug
      fixExperienceCrash.forEach(function(instruction) {
          data.writeInstruction(experiencePopupBugAddr, instruction.instruction)
          experiencePopupBugAddr += 4
        }
      )

      const fixExperiencePopupBeingSigned = [constants.romAddresses.popupExperience1, constants.romAddresses.popupExperience2]
      fixExperiencePopupBeingSigned.forEach(function(fixAddress) {
        data.writeInstruction(fixAddress, 0x21304002) //move	a2,s2
        data.writeInstruction(fixAddress + 4, 0x00000000) //nop
      })

      //fix infinite loop in placeMonsterInRoom when trying to spawn > level 99 monster
      data.writeInstruction(constants.romAddresses.placeMonsterLeveledUp, 0x08000412)
      //ditto for the poor soul that steps on a monster den on floor 99 of the second tower
      data.writeInstruction(constants.romAddresses.monsterDenLeveledUp, 0x08000412)
      //ditto for egg-bombing with Koh level 50+
      data.writeInstruction(constants.romAddresses.eggBombLevelUp, 0x07002412)
    }
  }

  function applyKohElement(options, data, hex) {
    if (options.kohElement) {
      const randomKohElementHexSeed = 2;
      const lcgSeed = hex.length > randomKohElementHexSeed ? Math.abs(hex[randomKohElementHexSeed]) : 15;
      const lcg = new util.LCG(constants.lcgConstants.modulus, constants.lcgConstants.multiplier, constants.lcgConstants.increment, lcgSeed)
      let kohElement = options.kohElement == -1 ? lcg.rollBetween(0,3) : (options.kohElement & 0xff)
      if (kohElement === 3) {
        kohElement = 4;
      }
      const keepElement = 0xf8 + kohElement;
      //keep element when attacking
      data.writeByte(constants.romAddresses.resetElementStartAtk, keepElement) //800b34e8
      //keep element after mix magic attack
      data.writeByte(constants.romAddresses.resetElementAfterMix, keepElement) //800b3cb4
      //set initial element
      data.writeByte(constants.romAddresses.hardcodeKohProperty1, kohElement)
      data.writeByte(constants.romAddresses.hardcodeKohProperty2, kohElement)
    }
  }

  function applyWidescreen(options, data) {
    if (options.experimentalChanges) {
      const width = 0x180;
      data.writeShort(0x1aac0, width) //80037c08, renderTextBoxNameHandle
      data.writeShort(0x213c0, width) //8003d7f8, defineDrawAndDispEnvs
      data.writeShort(0x2151c, width) //8003d824, defineDrawAndDispEnvs
      data.writeShort(0x21534, width) //8003d83c, defineDrawAndDispEnvs
      data.writeShort(0x21554, width) //8003d85c, defineDrawAndDispEnvs
      data.writeShort(0x3a540, width) //80053538, performFadeFromBlackScreenEffect
      data.writeShort(0x3a718, width) //80053710, performFadeToBlackScreenEffect
      data.writeShort(0x1c6e178, width) //8009be60, floorModificationHandleRoutine
      data.writeShort(0x1c70bfc, width) //8009e2f4, handleMinimap
      data.writeShort(0x1c70cac, width) //8009e3a4, handleMinimap
      data.writeShort(0x1c79c74, width) //800a606c, someRenderingMethod_800a5fc0
      data.writeShort(0x1c79c98, width) //800a6090, someRenderingMethod_800a5fc0

      //fix culling
      data.writeShort(0x71bcc8,  width/2) //800ab8e0, town culling
      data.writeShort(0x71bd08,  width/2) //800ab920
      data.writeByte( 0x71bd14,   0x58) //800ab92c, initial culling x
      data.writeShort(0x71bd24, 0x212)  //800ab93c, initial culling limit

      // data.writeShort(0x1ea3ea0, width/2) //80016148, setFloorRenderingParametersToDefault
      // data.writeShort(0x1ea3eb0, width/2) //80016158, setFloorRenderingParametersToDefault
      // data.writeByte( 0x1ea3ee4, 0x58)  //8001618c, setFloorRenderingParametersToDefault, might remove
      // data.writeShort(0x1ea3ef4, 0x212) //8001619c, setFloorRenderingParametersToDefault
      // data.writeShort(0x217dbf0, width/2) //80016148, setFloorRenderingParametersToDefault
      // data.writeShort(0x217dc00, width/2) //80016158, setFloorRenderingParametersToDefault
      // data.writeByte( 0x217dc34, 0x58)  //8001618c, setFloorRenderingParametersToDefault, might remove
      // data.writeShort(0x217dc44, 0x212) //8001619c, setFloorRenderingParametersToDefault

      //fix menus
      data.writeShort(0x312a4,   width) //8004b59c, loadMenuFunctionsIntoActiveMemory
      data.writeShort(0x1bae710, width) //8004b59c, loadMenuFunctionsIntoActiveMemory
      data.writeShort(0x20efd60, width) //8004b59c, loadMenuFunctionsIntoActiveMemory

      //re-center Koh
      //data.writeByte(0x6e778, width/2) //80080b60, initialFloorXRelativeToTowerCamera

      data.writeShort(0x388baa0, width) //??, ??
      data.writeShort(0x3891814, width) //??, ??

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
    kohElement,
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
    survival,
    traps,
    barongItems,
    tutorialBarong,
    elevatorSpawns,
    monsterSpawns,
    goDownTraps,
    altTrapAlgorithm,
    themes,
    questReload,
    portableElevators,
    secondTower,
    floor2,
    itemCap,
    blueCollar,
    fixCrashes,
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
    this.kohElement = kohElement,
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
    this.survival = survival
    this.traps = traps
    this.barongItems = barongItems
    this.tutorialBarong = tutorialBarong
    this.elevatorSpawns = elevatorSpawns
    this.monsterSpawns = monsterSpawns
    this.goDownTraps = goDownTraps
    this.altTrapAlgorithm = altTrapAlgorithm
    this.themes = themes
    this.questReload = questReload
    this.portableElevators = portableElevators
    this.secondTower = secondTower
    this.floor2 = floor2
    this.itemCap = itemCap
    this.blueCollar = blueCollar
    this.fixCrashes = fixCrashes
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
    pauseAfterDeath: pauseAfterDeath,
    saltSeed: saltSeed,
    setAppliedOptions: setAppliedOptions,
    restoreFile: restoreFile,
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
