(function(self) {

  let util
  let constants

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
    {symbol: "\\0", code: 0x00, width: -1, battle: 0x00,},
    {symbol: "\\3", code: 0x03, width: 0,},
    {symbol: "\\c", code: 0x08, width: -1,},
    {symbol: "\\n", code: 0x0a, width: -1, battle: 0x0a00,}, //battle written in big endian to distinguish control codes
    {symbol: "\\p", code: 0x11, width: 0, battle: 0x1100,},
    {symbol: "\\B", code: 0x51, width: 0, battle: 0x51,}, //switch to battle text
    {symbol: "\\K", code: 0xfe00, width: 6,}, //Koh
    {symbol: "\\k", code: 0xfe01, width: 6,}, //Kewne
    {symbol: " ", code: 0x8140, width: 1, battle: 0x01,},
    {symbol: ",", code: 0x8143, width: 1, battle: 0x1b,},
    {symbol: ".", code: 0x8144, width: 1, battle: 0x0e,},
    {symbol: "♥", code: 0x8145, width: 1,},
    {symbol: ":", code: 0x8146, width: 1, battle: 0x2e,},
    {symbol: ";", code: 0x8147, width: 1,},
    {symbol: "?", code: 0x8148, width: 1,},
    {symbol: "!", code: 0x8149, width: 1, battle: 0x18,},
    {symbol: "^", code: 0x814F, width: 1,},
    {symbol: "♥", code: 0x8150, width: 1,},
    {symbol: "_", code: 0x8151, width: 1,},
    {symbol: "/", code: 0x815E, width: 1,},
    {symbol: "♥", code: 0x815F, width: 1,},
    {symbol: "~", code: 0x8160, width: 1,},
    {symbol: "♥", code: 0x8161, width: 1,},
    {symbol: "|", code: 0x8162, width: 1,},
    {symbol: "♥", code: 0x8163, width: 1,},
    {symbol: "♥", code: 0x8164, width: 1,},
    {symbol: "`", code: 0x8165, width: 1,},
    {symbol: "'", code: 0x8166, width: 1, battle: 0x16,},
    {symbol: "♥", code: 0x8167, width: 1,},
    {symbol: '"', code: 0x8168, width: 1,},
    {symbol: "(", code: 0x8169, width: 1,},
    {symbol: ")", code: 0x816A, width: 1,},
    {symbol: "♥", code: 0x816B, width: 1,},
    {symbol: "♥", code: 0x816C, width: 1,},
    {symbol: "[", code: 0x816D, width: 1,},
    {symbol: "]", code: 0x816E, width: 1,},
    {symbol: "{", code: 0x816F, width: 1,},
    {symbol: "}", code: 0x8170, width: 1,},
    {symbol: "+", code: 0x817B, width: 1,},
    {symbol: "-", code: 0x817C, width: 1, battle: 0x2c,},
    {symbol: "♥", code: 0x817D, width: 1,},
    {symbol: "Χ", code: 0x817E, width: 1,},
    {symbol: "♥", code: 0x817F, width: 1,},
    {symbol: "♥", code: 0x8180, width: 1,},
    {symbol: "=", code: 0x8181, width: 1,},
    {symbol: "♥", code: 0x8182, width: 1,},
    {symbol: "<", code: 0x8183, width: 1,},
    {symbol: ">", code: 0x8184, width: 1,},
    //{symbol: "\", code: 0x818F,},
    {symbol: "$", code: 0x8190, width: 1,},
    {symbol: "♥", code: 0x8191, width: 1,},
    {symbol: "♥", code: 0x8192, width: 1,},
    {symbol: "%", code: 0x8193, width: 1,},
    {symbol: "#", code: 0x8194, width: 1,},
    {symbol: "&", code: 0x8195, width: 1,},
    {symbol: "х", code: 0x8196, width: 1,},
    {symbol: "@", code: 0x8197, width: 1,},
    {symbol: "○", code: 0x819B, width: 1,},
    {symbol: "□", code: 0x81A0, width: 1,},
    {symbol: "♥", code: 0x81A1, width: 1,},
    {symbol: "∆", code: 0x81A2, width: 1,},
    {symbol: "0", code: 0x824F, width: 1,},
    {symbol: "1", code: 0x8250, width: 1, battle: 0x32,},
    {symbol: "2", code: 0x8251, width: 1,},
    {symbol: "3", code: 0x8252, width: 1,},
    {symbol: "4", code: 0x8253, width: 1,},
    {symbol: "5", code: 0x8254, width: 1,},
    {symbol: "6", code: 0x8255, width: 1,},
    {symbol: "7", code: 0x8256, width: 1,},
    {symbol: "8", code: 0x8257, width: 1,},
    {symbol: "9", code: 0x8258, width: 1,},
    {symbol: "A", code: 0x8260, width: 1, battle: 0x20,},
    {symbol: "B", code: 0x8261, width: 1, battle: 0x1d,},
    {symbol: "C", code: 0x8262, width: 1, battle: 0x30,},
    {symbol: "D", code: 0x8263, width: 1, battle: 0x26,},
    {symbol: "E", code: 0x8264, width: 1, battle: 0x22,},
    {symbol: "F", code: 0x8265, width: 1, battle: 0x1f,},
    {symbol: "G", code: 0x8266, width: 1,},
    {symbol: "H", code: 0x8267, width: 1, battle: 0x23,},
    {symbol: "I", code: 0x8268, width: 1, battle: 0x2d,},
    {symbol: "J", code: 0x8269, width: 1,},
    {symbol: "K", code: 0x826A, width: 1, battle: 0x33,},
    {symbol: "L", code: 0x826B, width: 1, battle: 0x27,},
    {symbol: "M", code: 0x826C, width: 1, battle: 0x24,},
    {symbol: "N", code: 0x826D, width: 1, battle: 0x28,},
    {symbol: "O", code: 0x826E, width: 1,},
    {symbol: "P", code: 0x826F, width: 1, battle: 0x21,},
    {symbol: "Q", code: 0x8270, width: 1,},
    {symbol: "R", code: 0x8271, width: 1, battle: 0x36,},
    {symbol: "S", code: 0x8272, width: 1, battle: 0x35,},
    {symbol: "T", code: 0x8273, width: 1, battle: 0x1c,},
    {symbol: "U", code: 0x8274, width: 1, battle: 0x31,},
    {symbol: "V", code: 0x8275, width: 1,},
    {symbol: "W", code: 0x8276, width: 1, battle: 0x34,},
    {symbol: "X", code: 0x8277, width: 1, battle: 0x2a,},
    {symbol: "Y", code: 0x8278, width: 1, battle: 0x29,},
    {symbol: "Z", code: 0x8279, width: 1,},
    {symbol: "a", code: 0x8281, width: 1, battle: 0x03,},
    {symbol: "b", code: 0x8282, width: 1, battle: 0x14,},
    {symbol: "c", code: 0x8283, width: 1, battle: 0x0c,},
    {symbol: "d", code: 0x8284, width: 1, battle: 0x0a,},
    {symbol: "e", code: 0x8285, width: 1, battle: 0x02,},
    {symbol: "f", code: 0x8286, width: 1, battle: 0x13,},
    {symbol: "g", code: 0x8287, width: 1, battle: 0x12,},
    {symbol: "h", code: 0x8288, width: 1, battle: 0x0b,},
    {symbol: "i", code: 0x8289, width: 1, battle: 0x08,},
    {symbol: "j", code: 0x828A, width: 1, battle: 0x2b,},
    {symbol: "k", code: 0x828B, width: 1, battle: 0x19,},
    {symbol: "l", code: 0x828C, width: 1, battle: 0x0d,},
    {symbol: "m", code: 0x828D, width: 1, battle: 0x15,},
    {symbol: "n", code: 0x828E, width: 1, battle: 0x05,},
    {symbol: "o", code: 0x828F, width: 1, battle: 0x07,},
    {symbol: "p", code: 0x8290, width: 1, battle: 0x10,},
    {symbol: "q", code: 0x8291, width: 1, battle: 0x2f,},
    {symbol: "r", code: 0x8292, width: 1, battle: 0x09,},
    {symbol: "s", code: 0x8293, width: 1, battle: 0x06,},
    {symbol: "t", code: 0x8294, width: 1, battle: 0x04,},
    {symbol: "u", code: 0x8295, width: 1, battle: 0x0f,},
    {symbol: "v", code: 0x8296, width: 1, battle: 0x17,},
    {symbol: "w", code: 0x8297, width: 1, battle: 0x11,},
    {symbol: "x", code: 0x8298, width: 1, battle: 0x1e,},
    {symbol: "y", code: 0x8299, width: 1, battle: 0x1a,},
    {symbol: "z", code: 0x829A, width: 1, battle: 0x25,},
  ]

  const validTextBytes = [0x08, 0x0a, 0x11, 0x81, 0x82]

  function getSymbol(someSymbol) {
    return symbols.filter(function(symbol) {
      return symbol.symbol === someSymbol
    })[0]
  }

  function codeFromSymbol(someSymbol) {
    return getSymbol(someSymbol).code
  }

  function battleFromSymbol(someSymbol) {
    return getSymbol(someSymbol).battle
  }

  function writeTextToFile(data, address, text) {
    const maxCharsPerLine = 30
    let offset = 0
    let toConvert = ""
    let lineWidth = 0
    for (var i = 0; i < text.length; i++) {
      toConvert += text.charAt(i)
      if (toConvert === "\\") {
        continue
      }
      let symbol = getSymbol(toConvert)
      //if we've reached the end of the line, we need to wrap, so insert a newline
      if (lineWidth > maxCharsPerLine && symbol.width > 0) {
        data.writeByte(address + offset++, codeFromSymbol("\\n"))
        lineWidth = 0
      }
      let toWrite = symbol.code
      if (toWrite < 0x100) {
        data.writeByte(address + offset++, toWrite)
      } else {
        data.writeLEShort(address + offset, toWrite)
        offset += 2
      }
      if (symbol.width < 0) {
        lineWidth = 0
      } else {
        lineWidth += symbol.width
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

  function embedSeedAndFlagsInAngelText(data, options, seed) {
    let nextAddress = writeTextToFile(data, constants.romAddresses.angelFirstWord, "Azure Dreams Randomizer\\nby pro_grammar\\p\\c")
    let optionString = util.optionsToString(options)
    nextAddress = writeTextToFile(data, nextAddress, "Seed:\\nhttps://adrando.com/?" + optionString + "," + seed.toString())
    fillTextToNextPrompt(data, nextAddress)
    writeTextToFile(data, constants.romAddresses.balloonDescription, "It's a suspicious elevator.\\p\\nWanna go up?\\n\\0")
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

