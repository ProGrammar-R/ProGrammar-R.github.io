(function(window) {
  const releaseBaseUrl = 'https://adrando.com/'
  const devBaseUrl = 'https://adrando.com/'

  let version
  let constants
  let util
  let text
  let presets
  let items
  let monsters

  let info
  let lastSeed
  let checksum
  let expectChecksum
  let haveChecksum

  let downloadReady
  let selectedFile

  const MAX_VERBOSITY = 5

  let worker
  if (window) {
    worker = new Worker('worker.js')
    worker.addEventListener('message', workerMessage);
    constants = adRando.constants
    fields = adRando.fields
    util = adRando.util
    text = adRando.text
    presets = adRando.presets
    items = adRando.items
    monsters = adRando.monsters
  } else {
    version = require('./package').version
    constants = require('./constants')
    fields = require('./fields')
    util = require('./util')
    text = require('./text')
    presets = require('./presets')
    items = require('./items')
    monsters = require('./monsters')
  }

  function isRunningLocally() {
    if (window) {
      const url = new URL(window.location.href)
      return url.hostname === 'localhost'
        || url.hostname.match(/^dev\./)
        || url.protocol === 'file:'
    }
    return false
  }

  function loadOption(name, changeHandler, defaultValue) {
    const value = localStorage.getItem(name)
    if (typeof(value) === 'string') {
      if (value === 'true' || value === 'false') {
        elems[name].checked = value === 'true'
      } else {
        elems[name].value = value
      }
    } else {
      elems[name].checked = defaultValue
    }
    changeHandler()
  }

  function loadFieldOption(name, changeHandler, defaultValue) {
    const value = localStorage.getItem(name)
    if (typeof(value) === 'string') {
      if (value === 'true' || value === 'false') {
        fields.allOptions[name].set(value === 'true')
      } else {
        fields.allOptions[name].set(value)
      }
    } else {
      fields.allOptions[name].set(defaultValue)
    }
    changeHandler()
  }

  function optionsToUrl(options, checksum, seed, baseUrl) {
    options = util.optionsToString(options)
    const args = []
    if (options !== constants.defaultOptions) {
      args.push(options)
    }
    args.push(checksum.toString(16))
    args.push(encodeURIComponent(seed))
    let versionBaseUrl
    if (version.match(/-/)) {
      versionBaseUrl = devBaseUrl
    } else {
      versionBaseUrl = releaseBaseUrl
    }
    return (baseUrl || versionBaseUrl) + '?' + args.join(',')
  }

  function newInfo() {
    return Array(MAX_VERBOSITY + 1).fill(null).map(function() {
      return {}
    })
  }

  function disableDownload() {
    downloadReady = false
    delete elems.download.download
    delete elems.download.href
    delete elems.downloadCue.download
    delete elems.downloadCue.href
  }

  function hideLoader() {
    elems.loader.classList.add('hide')
  }

  function showLoader() {
    elems.loader.classList.remove('hide')
  }

  function resetState() {
    selectedFile = undefined
    resetTarget()
    elems.randomize.disabled = true
    elems.makeCue.disabled = true
    disableDownload()
    hideLoader()
  }

  function resetTarget(showFileName) {
    if (selectedFile) {
      let status = 'Ready to randomize'
      if (showFileName) {
        status += ' ' + selectedFile.name
      }
      elems.target.classList.add('active')
      elems.status.innerText = status
      elems.randomize.disabled = false
    } else {
      elems.target.classList.remove('active')
      elems.status.innerText = 'Drop .bin file here or'
    }
  }

  function resetCopy() {
    if (elems.seed.value.length || (lastSeed && lastSeed.length)) {
      elems.copy.disabled = false
      elems.makeCue.disabled = false
    } else {
      elems.copy.disabled = true
      elems.makeCue.disabled = false
    }
  }

  function seedChange() {
    disableDownload()
    elems.copy.disabled = true
    elems.makeCue.disabled = true
    haveChecksum = false
  }

  function presetChange() {
    localStorage.setItem('preset', elems.preset.checked)
    if (elems.preset.checked) {
      elems.presetId.classList.remove('hide')
      Object.getOwnPropertyNames(fields.allOptions).forEach(function(optionName) {
        fields.allOptions[optionName].elem.disabled = true
      })
      presetIdChange()
    } else {
      elems.presetId.classList.add('hide')
      fields.forEachField(function(field, fieldName) {
        field.elem.disabled = (fieldName === 'barongs' ? !fields.allOptions.enemizer.elem.checked : false)
      })
    }
  }

  function presetIdChange() {
    const preset = presets[elems.presetId.selectedIndex]
    elems.presetDescription.innerText = preset.description
    elems.presetAuthor.innerText = 'by ' + preset.author
    localStorage.setItem('presetId', preset.id)
    if (elems.preset.checked) {
      const options = preset.options()
      fields.forEachField(function(field, fieldName) {
        field.set(field.type === fields.TYPE.check ? !!options[fieldName] : options[fieldName])
      })
    }
  }

  function genericChangeHandler(field) {
    //set value from elem
    field.setValue(field.get())
    localStorage.setItem(field.properName, field.get())
  }

  function enemizerChange() {
    genericChangeHandler(fields.get('enemizer'))
    setBarongsBasedOnEnemizer()
  }

  function setBarongsBasedOnEnemizer() {
    const barongs = fields.get('barongs')
    if (!fields.get('enemizer').get()) {
      barongs.set(false)
      barongs.elem.disabled = true
      elems.barongsContainer.setAttribute("hidden", "")
      barongs.changeHandler()
    } else {
      barongs.elem.disabled = elems.preset.checked || elems.seed.disabled
      elems.barongsContainer.removeAttribute("hidden")
    }
  }

  function bossChange() {
    genericChangeHandler(fields.get('boss'))
    let hikewneOption = fields.get('starter').elem.options.namedItem('starterHikewne')
    if (!!hikewneOption) {
      //hikewne is not allowed in boss mode
      if (fields.get('boss').get()) {
        hikewneOption.setAttribute("disabled", "")
      } else {
        hikewneOption.removeAttribute("disabled", "")
      }
    }
  }

  function appendSeedChange() {
    localStorage.setItem('appendSeed', elems.appendSeed.checked)
  }

  function fileChange(event) {
    if (elems.file.files[0]) {
      resetState()
      selectedFile = elems.file.files[0]
      resetTarget()
    }
  }

  function experimentalChangesChange() {
    localStorage.setItem('experimentalChanges', elems.experimentalChanges.checked)
  }

  function dragLeaveListener(event) {
    elems.target.classList.remove('active')
  }

  function dragOverListener(event) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
    elems.target.classList.add('active')
  }

  function dropListener(event) {
    event.preventDefault()
    event.stopPropagation()
    resetState()
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const file = event.dataTransfer.files[i]
      selectedFile = file
    }
    resetTarget(true)
    elems.file.style.display = 'none'
  }

  function randomizedFilename(filename, seed) {
    const lastPeriodIdx = filename.lastIndexOf('.')
    const insertIdx = lastPeriodIdx === -1 ? filename.length : lastPeriodIdx
    return [
      filename.slice(0, insertIdx),
      ' (' + seed + ')',
      filename.slice(insertIdx),
    ].join('')
  }

  function getFormOptions() {
    if (elems.preset.checked) {
      return {preset: presets[elems.presetId.selectedIndex].id}
    }    
    let options = {}
    Object.getOwnPropertyNames(fields.allOptions).forEach(function(fieldName) {
      options[fieldName] = fields.allOptions[fieldName].get()
    })
    return options
  }

  function submitListener(event) {
    event.preventDefault()
    event.stopPropagation()
    disableDownload()
    showLoader()
    info = newInfo()
    const options = getFormOptions()
    let seed = (new Date()).getTime().toString()
    if (elems.seed.value.length) {
      seed = elems.seed.value
    }
    lastSeed = seed
    info[1]['Seed'] = seed
    worker.postMessage({
      version: version,
      file: selectedFile,
      checksum: expectChecksum,
      options: options,
      seed: seed,
      info: info,
    })
  }

  function workerMessage(message) {
    const data = message.data
    if (data.error) {
      elems.target.classList.remove('active')
      elems.target.classList.add('error')
      elems.status.innerText = data.error
      return
    }
    const seed = data.seed
    checksum = data.checksum
    info = data.info
    const url = URL.createObjectURL(new Blob([data.data], {
      type: 'application/octet-binary',
    }))
    if (elems.appendSeed.checked) {
      elems.download.download = randomizedFilename(
        selectedFile.name,
        seed,
      )
    } else {
      elems.download.download = selectedFile.name
    }
    const urlCue = URL.createObjectURL(new Blob(['FILE "',elems.download.download,'" BINARY\r\n','  TRACK 01 MODE2/2352\r\n','    INDEX 01 00:00:00\r\n'], {
      type: 'application/octet-binary',
    }))
    elems.downloadCue.download = [elems.download.download.slice(0, -3), 'cue'].join('')
    elems.download.href = url
    elems.downloadCue.href = urlCue
    elems.download.click()
    URL.revokeObjectURL(url)
    resetCopy()
    hideLoader()
  }

  function clearHandler(event) {
    expectChecksum = undefined
    event.preventDefault()
    event.stopPropagation()
    elems.seed.value = ''
    elems.seed.disabled = false
    elems.preset.disabled = false
    elems.presetId.disabled = false
    fields.forEachField(function(field, fieldName) {
      if (fieldName !== "barongs") {
        field.elem.disabled = false
      }
    })
    setBarongsBasedOnEnemizer()
    elems.clear.classList.add('hidden')
    presetChange()
  }

  let animationDone = true

  function copyHandler(event) {
    event.preventDefault()
    event.stopPropagation()
    elems.seed.value = elems.seed.value || lastSeed || ''
    const url = util.optionsToUrl(
      getFormOptions(),
      checksum,
      elems.seed.value,
      window.location.href,
    )
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.type = 'text'
    input.value = url.toString()
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    if (animationDone) {
      animationDone = false
      elems.notification.classList.add('success')
      elems.notification.classList.remove('hide')
      setTimeout(function() {
        elems.notification.classList.add('hide')
      }, 250)
      setTimeout(function() {
        elems.notification.classList.remove('success')
        animationDone = true
      }, 2250)
    }
  }

  function makeCueHandler(event) {
    event.preventDefault()
    event.stopPropagation()
    elems.downloadCue.click()
  }

  function formatInfo(info, verbosity) {
    if (!info) {
      return ''
    }
    const props = []
    for (let level = 0; level <= verbosity; level++) {
      Object.getOwnPropertyNames(info[level]).forEach(function(prop) {
        if (props.indexOf(prop) === -1) {
          props.push(prop)
        }
      })
    }
    const lines = []
    props.forEach(function(prop) {
      for (let level = 0; level <= verbosity; level++) {
        if (info[level][prop]) {
          let text = prop + ':'
          if (Array.isArray(info[level][prop])) {
            text += '\n' + info[level][prop].map(function(item) {
              return '  ' + item
            }).join('\n')
          } else {
            text += ' ' + info[level][prop]
          }
          lines.push(text)
        }
      }
    })
    return lines.join('\n')
  }

  let elems

  const optionsHelp = [
    'The options string may contain any of the following:',
    '  "P" for preset (`--help preset`)',
    '',
    'The default randomization mode is "'
      +  constants.defaultOptions
      + '", which randomizes everything.',
  ].join('\n')

  const presetHelp = [
    'This randomizer has several built-in presets:',
  ].concat(presets.map(function(meta) {
    return '  ' + meta.id + (meta.id === 'safe' ? ' (default)' : '')
  })).concat([
    '',
    'Use `--help <preset>` for information on a specific scheme.',
  ]).join('\n')

  function presetMetaHelp(preset) {
    const options = preset.options()
    return [
      preset.name + ' by ' + preset.author,
      preset.description,
      '',
    ].join('\n')
  }

  function main() {
    const fs = require('fs')
    const constants = require('./constants')
    const path = require('path')
    let eccEdcCalc
    const yargs = require('yargs')
      .strict()
      .usage('$0 [options] [url]')
      .option('bin', {
        alias: 'b',
        describe: 'Path to .bin file',
        type: 'string',
        requiresArg: true,
      })
      .option('seed', {
        alias: 's',
        describe: 'Seed',
        type: 'string',
        requiresArg: true,
      })
      .option('options', {
        alias: 'o',
        describe: 'Randomizations (`--help options`)',
        type: 'string',
      })
      .option('check-vanilla', {
        alias: 'c',
        describe: 'Check .bin file (does not modify image)',
        type: 'boolean',
      })
      .option('expect-checksum', {
        alias: 'e',
        describe: 'Verify checksum',
        type: 'string',
        requiresArg: true,
      })
      .option('url', {
        alias: 'u',
        description: 'Print seed url using optional base',
        type: 'string',
      })
      .option('race', {
        alias: 'r',
        describe: 'Same as -uvv',
        type: 'boolean',
      })
      .option('verbose', {
        alias: 'v',
        describe: 'Verbosity level',
        type: 'count',
      })
      .help(false)
      .option('help', {
        alias: 'h',
        describe: 'Show help',
        type: 'string',
      })
      .demandCommand(0, 1)
    const argv = yargs.argv
    let options
    let seed
    let baseUrl
    let expectChecksum
    let haveChecksum
    // Check for help.
    if ('help' in argv) {
      if (!argv.help) {
        yargs.showHelp()
        process.exit()
      }
      const topics = {
        options: optionsHelp,
      }
      const script = path.basename(process.argv[1])
      Object.getOwnPropertyNames(topics).forEach(function(topic) {
        topics[topic] = topics[topic].replace(/\$0/g, script)
      }, {})
      presets.forEach(function(meta) {
        topics[meta.id] = presetMetaHelp(meta)
      })
      if (argv.help in topics) {
        console.log(topics[argv.help])
        process.exit()
      } else {
        yargs.showHelp()
        console.error('\nUnknown help topic: ' + argv.help)
        process.exit(1)
      }
    }
    // Check for seed string.
    if ('seed' in argv) {
      seed = argv.seed.toString()
    }
    // Check for base url.
    if (argv.url) {
      baseUrl = argv.url
    }
    // Check for expected checksum.
    if ('expectChecksum' in argv) {
      if (!argv.expectChecksum.match(/^[0-9a-f]{1,3}$/)) {
        yargs.showHelp()
        console.error('\nInvalid checksum string')
        process.exit(1)
      }
      expectChecksum = parseInt(argv.expectChecksum, 16)
      haveChecksum = true
    }
    // Check for randomization string.
    if ('options' in argv) {
      try {
        options = util.optionsFromString(argv.options)
      } catch (e) {
        yargs.showHelp()
        console.error('\n' + e.message)
        process.exit(1)
      }
    }
    // Check for seed url.
    if (argv._[0]) {
      try {
        const url = util.optionsFromUrl(argv._[0])
        options = url.options
        seed = url.seed
        expectChecksum = url.checksum
        haveChecksum = true
      } catch (e) {
        yargs.showHelp()
        console.error('\nInvalid url')
        process.exit(1)
      }
      if (seed === null) {
        yargs.showHelp()
        console.error('\nUrl does not contain seed')
        process.exit(1)
      }
      // Ensure seeds match if given using --seed.
      if ('seed' in argv && argv.seed.toString() !== seed) {
        yargs.showHelp()
        console.error('\nArgument seed is not url seed')
        process.exit(1)
      }
      // Ensure checksum match if given using --expect-checksum.
      if ('expectChecksum' in argv && argv.expectCheckSum != expectChecksum) {
        yargs.showHelp()
        console.error('\nArgument checksum is not url checksum')
        process.exit(1)
      }
    }
    // Set options for --race.
    if (argv.race) {
      argv.url = ''
      if (argv.verbose === 0) {
        argv.verbose = 2
      }
    }
    // Create default options if none provided.
    if (typeof(seed) === 'undefined') {
      seed = (new Date()).getTime().toString()
    }
    if (!options) {
      options = util.optionsFromString(constants.defaultOptions)
    }
    // Set misc options.
    if ('checkVanilla' in argv) {
      options.checkVanilla = argv.checkVanilla
    }
    if ('verbose' in argv) {
      options.verbose = argv.verbose
    }
    info = newInfo()
    // Set seed if not running a sanity check.
    if (!argv.checkVanilla) {
      require('seedrandom')(util.saltSeed(
        version,
        options,
        seed,
      ), {global: true})
      // Add seed to log info if not provided through command line.
      if (!('seed' in argv) && (!('url' in argv) || argv._[0])) {
        info[1]['Seed'] = seed
      }
    }
    let data
    // If checking a vanilla .bin file, the path to the file must be given.
    if (options.checkVanilla && !('bin' in argv)) {
      yargs.showHelp()
      console.error('\nDid not specify path to .bin file')
      process.exit(1)
    }
    if ('bin' in argv) {
      eccEdcCalc = require('./ecc-edc-recalc-js')
      data = fs.readFileSync(argv.bin)
    }
    const check = new util.checked(data)
    let returnVal = true
    let applied
    try {
      applied = util.Preset.options(options)
    } catch (err) {
      yargs.showHelp()
      console.error('\n' + err.message)
      process.exit(1)
    }
    let hex = util.setSeedAzureDreams(check, applied, seed)
    text.embedSeedAndFlagsInAngelText(check, applied, seed)
    //text.writeBattleTextToFile(check, constants.romAddresses.isExhaustedBattleText, "collapsed.\\p\\0")
    //util.pauseAfterDeath(check)
    //also applies several other options due to difficulties when calling from here
    monsters.setEnemizer(applied, check, hex)
    adRando.items.setStartingItems(applied, check, hex)
    util.setAppliedOptions(applied, check)

    const checksum = check.sum()
    // Verify expected checksum matches actual checksum.
    if (haveChecksum && expectChecksum !== checksum) {
      console.error('Checksum mismatch.')
      process.exit(1)
    }
    // Show url if not provided as arg.
    if ('url' in argv && !argv._[0]) {
      console.log(optionsToUrl(
        options,
        checksum,
        seed,
        baseUrl,
      ).toString())
    }
    if (argv.verbose >= 1) {
      const text = formatInfo(info, argv.verbose)
      if (text.length) {
        console.log(text)
      }
    }
    if (argv.checkVanilla || !('bin' in argv)) {
      process.exit(returnVal ? 0 : 1)
    }
    eccEdcCalc(data)
    fs.writeFileSync(argv.bin, data)
  }

  if (window) {
    const body = document.getElementsByTagName('body')[0]
    body.addEventListener('dragover', dragOverListener)
    body.addEventListener('dragleave', dragLeaveListener)
    body.addEventListener('drop', dropListener)
    elems = {
      target: document.getElementById('target'),
      status: document.getElementById('status'),
      file: document.getElementById('file'),
      form: document.getElementById('form'),
      randomize: document.getElementById('randomize'),
      seed: document.getElementById('seed'),
      preset: document.getElementById('preset'),
      //presetSelect: document.getElementById('preset-select'),
      presetId: document.getElementById('preset-id'),
      presetDescription: document.getElementById('preset-description'),
      presetAuthor: document.getElementById('preset-author'),
      clear: document.getElementById('clear'),
      appendSeed: document.getElementById('append-seed'),
      experimentalChanges: document.getElementById('experimental-changes'),
      barongsContainer: document.getElementById('barongs-container'),
      download: document.getElementById('download'),
      downloadCue: document.getElementById('downloadCue'),
      loader: document.getElementById('loader'),
      copy: document.getElementById('copy'),
      makeCue: document.getElementById('makeCue'),
      notification: document.getElementById('notification'),
      seedUrl: document.getElementById('seed-url'),
    }
    fields.forEachField(function(field, _fieldName) {
      field.initialize(document)
    })
    resetState()
    elems.file.addEventListener('change', fileChange)
    elems.form.addEventListener('submit', submitListener)
    elems.seed.addEventListener('change', seedChange)
    elems.preset.addEventListener('change', presetChange)
    elems.presetId.addEventListener('change', presetIdChange)
    elems.clear.addEventListener('click', clearHandler)
    elems.appendSeed.addEventListener('change', appendSeedChange)
    elems.experimentalChanges.addEventListener('change', experimentalChangesChange)
    fields.forEachField(function(field, fieldName) {
      switch (fieldName) {
        case 'enemizer':
          field.changeHandler = enemizerChange
          break
        case 'boss':
          field.changeHandler = bossChange
          break
        default:
          field.changeHandler = function(){ genericChangeHandler(field) }
      }
      field.elem.addEventListener('change', field.changeHandler)
    })
    elems.copy.addEventListener('click', copyHandler)
    elems.makeCue.addEventListener('click', makeCueHandler)
    // Load presets
    presets.forEach(function(preset) {
      const option = document.createElement('option')
      option.value = preset.id
      option.innerText = preset.name
      elems.presetId.appendChild(option)
    })
    // Load monsters
    const randomStarterOption = document.createElement('option')
    randomStarterOption.value = monsters.randomStarterOptionValue
    randomStarterOption.innerText = 'Randomize'
    fields.get('starter').elem.appendChild(randomStarterOption)
    monsters.allMonsters.forEach(function(monster) {
      const option = document.createElement('option')
      option.value = monster.ID
      option.id = 'starter' + monster.name
      option.innerText = monster.name
      fields.get('starter').elem.appendChild(option)
    })
    // Load elements
    monsters.allElements.forEach(function(element) {
      const option = document.createElement('option')
      option.value = element.ID
      option.innerText = element.name
      if (element.name === "Tri") {
        option.innerText += " (no spells)"
      }
      fields.get('starterElement').elem.appendChild(option)
    })
    // Load hidden spell options
    monsters.hiddenSpellOptions.forEach(function(spell) {
      const option = document.createElement('option')
      option.value = spell.ID
      option.innerText = spell.name
      fields.get('hiddenSpells').elem.appendChild(option)
    })

    const url = new URL(window.location.href)
    if (url.protocol !== 'file:') {
      fetch(new Request('package.json')).then(function(response) {
        if (response.ok) {
          response.json().then(function(json) {
            version = json.version
            document.getElementById('version').innerText = version
          })
        }
      }).catch(function(){})
    }
    let options
    let seed
    if (url.search.length) {
      const rs = util.optionsFromUrl(window.location.href)
      options = rs.options
      seed = rs.seed
      expectChecksum = rs.checksum
      if (typeof(seed) === 'string') {
        elems.seed.value = seed
        seedChange()
        haveChecksum = true
      }
      elems.seed.disabled = true
      if (options.preset) {
        elems.preset.checked = true
        for (let i = 0; i < presets.length; i++) {
          if (presets[i].id === options.preset) {
            elems.presetId.selectedIndex = i
            break
          }
        }
        presetIdChange()
      } else {
        elems.preset.checked = false
        elems.presetId.selectedIndex = 0
      }
      presetChange()
      elems.preset.disabled = true
      elems.presetId.disabled = true
      Object.getOwnPropertyNames(fields.allOptions).forEach(function(fieldName) {
        const field = fields.allOptions[fieldName]
        field.set(options[fieldName].get())
        field.elem.disabled = true
      })
      elems.clear.classList.remove('hidden')
      const baseUrl = url.origin + url.pathname
      window.history.replaceState({}, document.title, baseUrl)
    } else {
      let presetId = localStorage.getItem('presetId')
      if (typeof(presetId) !== 'string') {
        presetId = 'safe'
      }
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].id === presetId) {
          elems.presetId.selectedIndex = i
          break
        }
      }
      presetIdChange()
      loadOption('preset', presetChange, true)
    }
    let path = url.pathname
    if (path.match(/index\.html$/)) {
      path = path.slice(0, path.length - 10)
    }
    if (isRunningLocally()) {
      document.getElementById('dev-border').classList.add('dev')
    }
    if (!elems.preset.checked) {
      Object.getOwnPropertyNames(fields.allOptions).forEach(function(fieldName) {
        const field = fields.allOptions[fieldName]
        loadFieldOption(fieldName, field.changeHandler, field.defaultValue)
      })
    }
    loadOption('appendSeed', appendSeedChange, true)
    loadOption('experimentalChanges', experimentalChangesChange, false)
    setTimeout(function() {
      const els = document.getElementsByClassName('tooltip')
      Array.prototype.forEach.call(els, function(el) {
        el.classList.remove('hidden')
      })
    })
  } else {
    main()
  }
})(typeof(window) !== 'undefined' ? window : null)
