(function(self) {

  let exports
  if (self) {
    exports = self.adRando.presets
  } else {
    exports = [
      require('./safe'),
      require('./secondTower'),
      require('./secondTowerRun'),
      require('./tournament'),
    ]
  }
  exports.sort(function(a, b) {
    const weight = a.weight - b.weight
    if (weight === 0) {
      if (a.id < b.id) {
        return -1
      } else if (a.id > b.id) {
        return 1
      }
    }
    return weight
  })

  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      presets: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
