(function(self) {

  const spellTable = [
    { spellId: 0x00, name: "None", element: "None" },
    { spellId: 0x01, name: "Breath", element: "Fire" },
    { spellId: 0x02, name: "NeaBreath", element: "Water" },
    { spellId: 0x03, name: "NoaBreath", element: "Wind" },
    { spellId: 0x04, name: "Sled", element: "Fire" },
    { spellId: 0x05, name: "NeaSled", element: "Water" },
    { spellId: 0x06, name: "NoaSled", element: "Wind" },
    { spellId: 0x07, name: "Brid", element: "Fire" },
    { spellId: 0x08, name: "NeaBrid", element: "Water" },
    { spellId: 0x09, name: "NoaBrid", element: "Wind" },
    { spellId: 0x0A , name: "Rise", element: "Fire" },
    { spellId: 0x0B , name: "NeaRise", element: "Water" },
    { spellId: 0x0C , name: "NoaRise", element: "Wind" },
    { spellId: 0x0D , name: "Poison", element: "Fire" },
    { spellId: 0x0E , name: "NeaPoison", element: "Water" },
    { spellId: 0x0F , name: "NoaPoison", element: "Wind" },
    { spellId: 0x10, name: "DeaWall", element: "Fire" },
    { spellId: 0x11, name: "DeWall", element: "Water" },
    { spellId: 0x12, name: "DeoWall", element: "Wind" },
    { spellId: 0x13, name: "DeaMirror", element: "Fire" },
    { spellId: 0x14, name: "DeMirror", element: "Water" },
    { spellId: 0x15, name: "DeoMirror", element: "Wind" },
    { spellId: 0x16, name: "DeaRock", element: "Fire" },
    { spellId: 0x17, name: "DeRock", element: "Water" },
    { spellId: 0x18, name: "DeoRock", element: "Wind" },
    { spellId: 0x19, name: "DeaHeal", element: "Fire" },
    { spellId: 0x1A , name: "DeHeal", element: "Water" },
    { spellId: 0x1B , name: "DeoHeal", element: "Wind" },
    { spellId: 0x1C , name: "DeaForth", element: "Fire" },
    { spellId: 0x1D , name: "DeForth", element: "Water" },
    { spellId: 0x1E , name: "DeoForth", element: "Wind" },
    { spellId: 0x1F , name: "LaBlind", element: "Fire" },
    { spellId: 0x20, name: "LeBlind", element: "Water" },
    { spellId: 0x21, name: "LoBlind", element: "Wind" },
    { spellId: 0x22, name: "LaBind", element: "Fire" },
    { spellId: 0x23, name: "LeBind", element: "Water" },
    { spellId: 0x24, name: "LoBind", element: "Wind" },
    { spellId: 0x25, name: "LaSleep", element: "Fire" },
    { spellId: 0x26, name: "LeSleep", element: "Water" },
    { spellId: 0x27, name: "LoSleep", element: "Wind" },
    { spellId: 0x28, name: "LaDown", element: "Fire" },
    { spellId: 0x29, name: "LeDown", element: "Water" },
    { spellId: 0x2A , name: "LoDown", element: "Wind" },
    { spellId: 0x2B , name: "LaGrave", element: "Fire" },
    { spellId: 0x2C , name: "LeoGrave", element: "Water" },
    { spellId: 0x2D , name: "LoGrave", element: "Wind" },
    { spellId: 0x2E, name: "Dark Wave", element: "None" },
    { spellId: 0x2F, name: "Dark Wave", element: "None" },
    { spellId: 0x30, name: "Dark Wave", element: "None" },
    { spellId: 0x31, name: "Acid Rain", element: "Water" },
  ]

  function getSpellBySpellId(spellId) {
    return spellTable.filter(spellEntry => {if (spellEntry.spellId === spellId) return spellEntry})[0];
  }

  const exports = {
    spellTable: spellTable,
    getSpellBySpellId: getSpellBySpellId,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      spells: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
