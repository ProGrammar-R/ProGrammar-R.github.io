(function(self) {

  // Logic metadata.
  const metadata = {
    id: 'tournament',
    name: 'Tournament',
    description: 'Seeded tower, all skips, nothing else.',
    author: 'pro_grammar',
    weight: -80,
  }

  // Boilerplate.
  let constants
  let fields
  let util
  if (self) {
    constants = self.adRando.constants
    fields = self.adRando.fields
    util = self.adRando.util
  } else {
    constants = require('../constants')
    fields = require('../fields')
    util = require('../util')
  }
  const PresetBuilder = util.PresetBuilder

  // Create PresetBuilder.
  const builder = new PresetBuilder(metadata)

  builder.tutorialSkip = true
  builder.introSkip = true
  builder.derandomize = true
  builder.fastTutorial = true

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
