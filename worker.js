importScripts('https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.1/seedrandom.min.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.8/sjcl.min.js')
importScripts("constants.js")
importScripts("items.js")
importScripts("util.js")
importScripts("presets/safe.js")
importScripts("ecc-edc-recalc-js/index.js")

const VER_ERROR = 'Seed generated by a different version of the randomizer.'

self.addEventListener('message', function(message) {
  try {
    const data = message.data
    const reader = new FileReaderSync()
    const fileData = reader.readAsArrayBuffer(data.file)
    const array = new Uint8Array(fileData)
    const check = new adRando.util.checked(array)
    Math.seedrandom(adRando.util.saltSeed(
      data.version,
      data.options,
      data.seed,
    ))
    const options = self.adRando.util.Preset.options(data.options)
    //adRando.randomizeItems(check, options, data.info)
    adRando.util.setSeedAzureDreams(check, data.seed)
    const checksum = check.sum()
    if (data.checksum && data.checksum !== checksum) {
      throw new Error(VER_ERROR)
    }
    eccEdcCalc(array)
    self.postMessage({
      seed: data.seed,
      data: fileData,
      checksum: checksum,
      info: data.info,
    }, [fileData])
  } catch (e) {
    self.postMessage({error: e.message})
  }
})
