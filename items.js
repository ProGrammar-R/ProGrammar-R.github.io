(function(self) {

  let constants
  if (self) {
    constants = self.sotnRando.constants
  } else {
    constants = require('./constants')
  }
  const ZONE = constants.ZONE
  const TYPE = constants.TYPE

  const items = [{
    name: 'Alucart Mail',
    type: TYPE.ARMOR,
    id: 258,
    blacklist: [ 0x000b6b3c, 0x000b6b3a ],
    tiles: [{
      zone: ZONE.NO0,
      addresses: [ 0x048fada4 ],
    }],
  }]

  const exports = items
  if (self) {
    self.sotnRando = Object.assign(self.sotnRando || {}, {
      items: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
