(function(self) {

  const defaultOptions = 'P:safe'

  const romAddresses = {
    globalGbcChecksum:      0x014e,  
    derandomizingCode:      0x3d42,  //RAM 0x3d42
    firstRngCallStoryFloor: 0x18512, //Bank 6, RAM 0x4511
    toOverwrite:            0x7b552, //
    beforeFirstRngCall:     0xff663, //Bank 63, RAM 0x7663
  }
  const lcgConstants = {modulus: 0x1fffFFFFffff, multiplier: 0x5DEECE66D, increment: 11,}

  const exports = {
    defaultOptions: defaultOptions,
    romAddresses: romAddresses,
    lcgConstants: lcgConstants,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      constants: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
