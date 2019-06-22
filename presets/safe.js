(function(self) {

  // Logic metadata.
  const metadata = {
    id: 'safe',
    name: 'Safe',
    description: 'No randomizations, with tutorial skip.',
    author: 'pro_grammar',
    weight: -100,
  }

  // Boilerplate.
  let constants
  let util
  if (self) {
    constants = self.adRando.constants
    util = self.adRando.util
  } else {
    constants = require('../constants')
    util = require('../util')
  }
  const PresetBuilder = util.PresetBuilder

  // Create PresetBuilder.
  const builder = new PresetBuilder(metadata)

  builder.tutorialSkip = true
  builder.singleRoom = false

  // Export.
  const preset = builder.build()
  if (self) {
    const presets = (self.adRando || {}).presets || []
    presets.push(preset)
    self.adRando = Object.assign(self.adRando || {}, {
      presets: presets,
    })
  } else if (!module.parent) {
    console.log(preset.toString())
  } else {
    module.exports = preset
  }
})(typeof(self) !== 'undefined' ? self : null)
