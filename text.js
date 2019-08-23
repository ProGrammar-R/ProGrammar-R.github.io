(function(self) {

  let util

  if (self) {
    util = self.adRando.util
    constants = self.adRando.constants
  } else {
    util = require('./util')
    constants = require('./constants')
  }

  function produceText(data) {
    const minSeqBytes = 1
    let seqCodes = 0
    let firstAddress = data.length
    let tempOut = new Array()
    while(nextAddress < data.length) {
      firstAddress = Math.min(firstAddress, nextAddress)
      cByte = data.readByte(nextAddress++)
      cCode = cMap.get(cByte)
      let isValid = cCode !== undefined
      if (isValid) {
        seqCodes++
        aBytes = new Array(cCode.numBytes)
        for (var i = 0; i < cCode.numBytes; i++) {
          aBytes.push(data.readByte(nextAddress++));
        }
        isValid = cCode.method(aBytes, tempOut)
      }
      if (!isValid) {
        if (seqCodes > minSeqBytes) {
          out.push("\n\n<address 0x" + firstAddress + ">")
          out.push(tempOut)
        }
        firstAddress = data.length
        seqCodes = 0
      }
    }
  }

  function method81Symbol(aBytes, tempOut) {
    let toPush = symbol81.get(aBytes[0])
    let result = toPush !== undefined
    if (result) {
      tempOut.push(toPush)
    }
    return result
  }

  function method82LetterDigit(aBytes, tempOut) {
    let toPush = letterDigit82.get(aBytes[0])
    let result = toPush !== undefined
    if (result) {
      tempOut.push(toPush)
    }
    return result
  }

  const symbols = [
    {symbol: "\\0", code: 0x00, battle: 0x00},
    {symbol: "\\3", code: 0x03,},
    {symbol: "\\c", code: 0x08,},
    {symbol: "\\n", code: 0x0a, battle: 0x0a00}, //battle written in big endian to distinguish control codes
    {symbol: "\\p", code: 0x11, battle: 0x1100},
    {symbol: " ", code: 0x8140, battle: 0x01},
    {symbol: ",", code: 0x8143, battle: 0x1b},
    {symbol: ".", code: 0x8144, battle: 0x0e},
    {symbol: "♥", code: 0x8145,},
    {symbol: ":", code: 0x8146, battle: 0x2e},
    {symbol: ";", code: 0x8147,},
    {symbol: "?", code: 0x8148,},
    {symbol: "!", code: 0x8149, battle: 0x18},
    {symbol: "^", code: 0x814F,},
    {symbol: "♥", code: 0x8150,},
    {symbol: "_", code: 0x8151,},
    {symbol: "/", code: 0x815E,},
    {symbol: "♥", code: 0x815F,},
    {symbol: "~", code: 0x8160,},
    {symbol: "♥", code: 0x8161,},
    {symbol: "|", code: 0x8162,},
    {symbol: "♥", code: 0x8163,},
    {symbol: "♥", code: 0x8164,},
    {symbol: "`", code: 0x8165,},
    {symbol: "'", code: 0x8166, battle: 0x16},
    {symbol: "♥", code: 0x8167,},
    {symbol: '"', code: 0x8168,},
    {symbol: "(", code: 0x8169,},
    {symbol: ")", code: 0x816A,},
    {symbol: "♥", code: 0x816B,},
    {symbol: "♥", code: 0x816C,},
    {symbol: "[", code: 0x816D,},
    {symbol: "]", code: 0x816E,},
    {symbol: "{", code: 0x816F,},
    {symbol: "}", code: 0x8170,},
    {symbol: "+", code: 0x817B,},
    {symbol: "-", code: 0x817C, battle: 0x2c},
    {symbol: "♥", code: 0x817D,},
    {symbol: "Χ", code: 0x817E,},
    {symbol: "♥", code: 0x817F,},
    {symbol: "♥", code: 0x8180,},
    {symbol: "=", code: 0x8181,},
    {symbol: "♥", code: 0x8182,},
    {symbol: "<", code: 0x8183,},
    {symbol: ">", code: 0x8184,},
    //{symbol: "\", code: 0x818F,},
    {symbol: "$", code: 0x8190,},
    {symbol: "♥", code: 0x8191,},
    {symbol: "♥", code: 0x8192,},
    {symbol: "%", code: 0x8193,},
    {symbol: "#", code: 0x8194,},
    {symbol: "&", code: 0x8195,},
    {symbol: "х", code: 0x8196,},
    {symbol: "@", code: 0x8197,},
    {symbol: "○", code: 0x819B,},
    {symbol: "□", code: 0x81A0,},
    {symbol: "♥", code: 0x81A1,},
    {symbol: "∆", code: 0x81A2,},
    {symbol: "0", code: 0x824F,},
    {symbol: "1", code: 0x8250, battle: 0x32},
    {symbol: "2", code: 0x8251,},
    {symbol: "3", code: 0x8252,},
    {symbol: "4", code: 0x8253,},
    {symbol: "5", code: 0x8254,},
    {symbol: "6", code: 0x8255,},
    {symbol: "7", code: 0x8256,},
    {symbol: "8", code: 0x8257,},
    {symbol: "9", code: 0x8258,},
    {symbol: "A", code: 0x8260, battle: 0x20},
    {symbol: "B", code: 0x8261, battle: 0x1d},
    {symbol: "C", code: 0x8262, battle: 0x30},
    {symbol: "D", code: 0x8263, battle: 0x26},
    {symbol: "E", code: 0x8264, battle: 0x22},
    {symbol: "F", code: 0x8265, battle: 0x1f},
    {symbol: "G", code: 0x8266,},
    {symbol: "H", code: 0x8267, battle: 0x23},
    {symbol: "I", code: 0x8268, battle: 0x2d},
    {symbol: "J", code: 0x8269,},
    {symbol: "K", code: 0x826A, battle: 0x33},
    {symbol: "L", code: 0x826B, battle: 0x27},
    {symbol: "M", code: 0x826C, battle: 0x24},
    {symbol: "N", code: 0x826D, battle: 0x28},
    {symbol: "O", code: 0x826E,},
    {symbol: "P", code: 0x826F, battle: 0x21},
    {symbol: "Q", code: 0x8270,},
    {symbol: "R", code: 0x8271, battle: 0x36},
    {symbol: "S", code: 0x8272, battle: 0x35},
    {symbol: "T", code: 0x8273, battle: 0x1c},
    {symbol: "U", code: 0x8274, battle: 0x31},
    {symbol: "V", code: 0x8275,},
    {symbol: "W", code: 0x8276, battle: 0x34},
    {symbol: "X", code: 0x8277, battle: 0x2a},
    {symbol: "Y", code: 0x8278, battle: 0x29},
    {symbol: "Z", code: 0x8279,},
    {symbol: "a", code: 0x8281, battle: 0x03},
    {symbol: "b", code: 0x8282, battle: 0x14},
    {symbol: "c", code: 0x8283, battle: 0x0c},
    {symbol: "d", code: 0x8284, battle: 0x0a},
    {symbol: "e", code: 0x8285, battle: 0x02},
    {symbol: "f", code: 0x8286, battle: 0x13},
    {symbol: "g", code: 0x8287, battle: 0x12},
    {symbol: "h", code: 0x8288, battle: 0x0b},
    {symbol: "i", code: 0x8289, battle: 0x08},
    {symbol: "j", code: 0x828A, battle: 0x2b},
    {symbol: "k", code: 0x828B, battle: 0x19},
    {symbol: "l", code: 0x828C, battle: 0x0d},
    {symbol: "m", code: 0x828D, battle: 0x15},
    {symbol: "n", code: 0x828E, battle: 0x05},
    {symbol: "o", code: 0x828F, battle: 0x07},
    {symbol: "p", code: 0x8290, battle: 0x10},
    {symbol: "q", code: 0x8291, battle: 0x2f},
    {symbol: "r", code: 0x8292, battle: 0x09},
    {symbol: "s", code: 0x8293, battle: 0x06},
    {symbol: "t", code: 0x8294, battle: 0x04},
    {symbol: "u", code: 0x8295, battle: 0x0f},
    {symbol: "v", code: 0x8296, battle: 0x17},
    {symbol: "w", code: 0x8297, battle: 0x11},
    {symbol: "x", code: 0x8298, battle: 0x1e},
    {symbol: "y", code: 0x8299, battle: 0x1a},
    {symbol: "z", code: 0x829A, battle: 0x25},
  ]

  const validTextBytes = [0x08, 0x0a, 0x11, 0x81, 0x82]

  function codeFromSymbol(someSymbol) {
    return symbols.filter(function(symbol) {
      return symbol.symbol === someSymbol
    })[0].code
  }

  function battleFromSymbol(someSymbol) {
    return symbols.filter(function(symbol) {
      return symbol.symbol === someSymbol
    })[0].battle
  }

  function writeTextToFile(data, address, text) {
    let offset = 0
    let toConvert = ""
    for (var i = 0; i < text.length; i++) {
      toConvert += text.charAt(i)
      if (toConvert === "\\") {
        continue
      }
      let toWrite = codeFromSymbol(toConvert)
      if (toWrite < 0x100) {
        data.writeByte(address + offset++, toWrite)
      } else {
        data.writeLEShort(address + offset, toWrite)
        offset += 2
      }
      toConvert = ""
    }
    return address + offset
  }

  function ensureNextCharIsValid(data, address) {
    //attempt to fix some slight offset issues
    let offset = 0
    let nextByte = data.readByte(address + offset)
    let nextByteIsValid = false
    for (var i = 0; i < validTextBytes.length; i++) {
      if (nextByte === validTextBytes[i]) {
        nextByteIsValid = true
        break
      }
    }
    if (!nextByteIsValid) {
      data.writeByte(address + offset++, 0x03)
    }
    return address + offset
  }

  function fillTextToNextPrompt(data, address) {
    let offset = 0
    while (data.readByte(address + offset) !== 0x11) {
      data.writeByte(address + offset++, 0x03)
    }
    return address + offset
  }

  function writeBattleTextToFile(data, address, text) {
    let offset = 0
    let toConvert = ""
    for (var i = 0; i < text.length; i++) {
      toConvert += text.charAt(i)
      if (toConvert === "\\") {
        continue
      }
      let toWrite = battleFromSymbol(toConvert)
      if (toWrite > 0x100) {
        //control codes written in big endian, so need to write big endian
        data.writeShort(address + offset, toWrite)
        offset += 2
      } else {
        data.writeByte(address + offset++, toWrite)
      }
      toConvert = ""
    }
    return address + offset
  }

  function embedSeedAndFlagsInAngelText(data, seed, options) {
    let nextAddress = writeTextToFile(data, constants.romAddresses.angelFirstWord, "Azure Dreams Randomizer\\nhttps://programmar-r.github.io/\\p\\c")
    nextAddress = writeTextToFile(data, nextAddress, "Seed: " + seed.toString())
    let optionString = util.optionsToString(options)
    //nextAddress = writeTextToFile(data, nextAddress, "\\nFlags: " optionString + "\\p\\c") FIXME
    fillTextToNextPrompt(data, nextAddress)
  }

  const exports = {
    writeTextToFile: writeTextToFile,
    writeBattleTextToFile: writeBattleTextToFile,
    embedSeedAndFlagsInAngelText: embedSeedAndFlagsInAngelText,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      text: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)

