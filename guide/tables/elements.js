(function(self) {

  const elementTable = [
    {elementId: 0, name: "None"},
    {elementId: 1, name: "Fire"},
    {elementId: 2, name: "Water"},
    {elementId: 4, name: "Wind"},
  ]

  function getElementNameByElementId(elementId) {
    return elementTable.filter(elementEntry => {if (elementEntry.elementId === elementId) return elementEntry})[0].name;
  }

  const exports = {
    elementTable: elementTable,
    getElementNameByElementId: getElementNameByElementId,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      elements: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
