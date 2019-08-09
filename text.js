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
    {symbol: "\\3", code: 0x03,},
    {symbol: "\\c", code: 0x08,},
    {symbol: "\\n", code: 0x0a,},
    {symbol: "\\p", code: 0x11,},
    {symbol: " ", code: 0x8140,},
    {symbol: ",", code: 0x8143,},
    {symbol: ".", code: 0x8144,},
    {symbol: "♥", code: 0x8145,},
    {symbol: ":", code: 0x8146,},
    {symbol: ";", code: 0x8147,},
    {symbol: "?", code: 0x8148,},
    {symbol: "!", code: 0x8149,},
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
    {symbol: "'", code: 0x8166,},
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
    {symbol: "-", code: 0x817C,},
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
    {symbol: "1", code: 0x8250,},
    {symbol: "2", code: 0x8251,},
    {symbol: "3", code: 0x8252,},
    {symbol: "4", code: 0x8253,},
    {symbol: "5", code: 0x8254,},
    {symbol: "6", code: 0x8255,},
    {symbol: "7", code: 0x8256,},
    {symbol: "8", code: 0x8257,},
    {symbol: "9", code: 0x8258,},
    {symbol: "A", code: 0x8260,},
    {symbol: "B", code: 0x8261,},
    {symbol: "C", code: 0x8262,},
    {symbol: "D", code: 0x8263,},
    {symbol: "E", code: 0x8264,},
    {symbol: "F", code: 0x8265,},
    {symbol: "G", code: 0x8266,},
    {symbol: "H", code: 0x8267,},
    {symbol: "I", code: 0x8268,},
    {symbol: "J", code: 0x8269,},
    {symbol: "K", code: 0x826A,},
    {symbol: "L", code: 0x826B,},
    {symbol: "M", code: 0x826C,},
    {symbol: "N", code: 0x826D,},
    {symbol: "O", code: 0x826E,},
    {symbol: "P", code: 0x826F,},
    {symbol: "Q", code: 0x8270,},
    {symbol: "R", code: 0x8271,},
    {symbol: "S", code: 0x8272,},
    {symbol: "T", code: 0x8273,},
    {symbol: "U", code: 0x8274,},
    {symbol: "V", code: 0x8275,},
    {symbol: "W", code: 0x8276,},
    {symbol: "X", code: 0x8277,},
    {symbol: "Y", code: 0x8278,},
    {symbol: "Z", code: 0x8279,},
    {symbol: "a", code: 0x8281,},
    {symbol: "b", code: 0x8282,},
    {symbol: "c", code: 0x8283,},
    {symbol: "d", code: 0x8284,},
    {symbol: "e", code: 0x8285,},
    {symbol: "f", code: 0x8286,},
    {symbol: "g", code: 0x8287,},
    {symbol: "h", code: 0x8288,},
    {symbol: "i", code: 0x8289,},
    {symbol: "j", code: 0x828A,},
    {symbol: "k", code: 0x828B,},
    {symbol: "l", code: 0x828C,},
    {symbol: "m", code: 0x828D,},
    {symbol: "n", code: 0x828E,},
    {symbol: "o", code: 0x828F,},
    {symbol: "p", code: 0x8290,},
    {symbol: "q", code: 0x8291,},
    {symbol: "r", code: 0x8292,},
    {symbol: "s", code: 0x8293,},
    {symbol: "t", code: 0x8294,},
    {symbol: "u", code: 0x8295,},
    {symbol: "v", code: 0x8296,},
    {symbol: "w", code: 0x8297,},
    {symbol: "x", code: 0x8298,},
    {symbol: "y", code: 0x8299,},
    {symbol: "z", code: 0x829A,},
  ]

  const validTextBytes = [0x08, 0x0a, 0x11, 0x81, 0x82]

  function codeFromSymbol(someSymbol) {
    return symbols.filter(function(symbol) {
      return symbol.symbol === someSymbol
    })[0].code
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
    //attempt to fix some slight offset issues
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
    return offset
  }

  const exports = {
    writeTextToFile: writeTextToFile,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      text: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)

