(function(self) {

  const TYPE = {
    check: 'checkbox',
    dropdown: 'select',
  }

  class Option {
    constructor(
      properName,
      elementName,
      shortName,
      values,
      defaultValue,
      type,
    ) {
      this.properName = properName;
      this.elementName = elementName;
      this.shortName = shortName;
      this.values = values;
      this.defaultValue = defaultValue;
      this.currentValue = this.defaultValue;
      this.type = type;
      this.elem = null;
    }

    setValue(newValue) {
      this.currentValue = newValue;
    }

    set(newValue) {
      this.currentValue = newValue;
      this.changeHandler();
    }

    get() {
      return this.currentValue;
    }

    initialize(document) {
      this.elem = document.getElementById(this.elementName);
      // bring element state in line with current value
      this.set(this.currentValue)
    }

    setIfNext(_optionString, index) {
      return index;
    }

    toOptionValue() {
      return '';
    }

    changeHandler() {}

    setDisabled(isDisabled) {
      if (this.elem) {
        this.elem.disabled = isDisabled;
      }
    }
  }


  class CheckOption extends Option {
    constructor(
      properName,
      elementName,
      shortName,
      values,
      defaultValue,
    ) {
      super(properName, elementName, shortName, values, defaultValue, TYPE.check);
    }

    set(newValue) {
      if (this.elem) {
        this.elem.checked = newValue;
      }
      super.set(newValue);
    }

    get() {
      if (this.elem) {
        return this.elem.checked;
      }
      return super.get();
    }

    setIfNext(optionString, index) {
      if (optionString[index] === this.shortName) {
        this.set(true);
        index++;
      }
      return index;
    }

    toOptionValue() {
      return this.get() ? this.shortName : '';
    }
  }


  class DropdownOption extends Option {
    constructor(
      properName,
      elementName,
      shortName,
      values,
      defaultValue,
    ) {
      super(properName, elementName, shortName, values, defaultValue, TYPE.dropdown);
    }

    set(newValue) {
      if (this.elem) {
        this.elem.value = newValue;
      }
      super.set(newValue);
    }

    get() {
      if (this.elem) {
        return this.elem.value;
      }
      return super.get();
    }

    initialize(document) {
      super.initialize(document);
      if (this.values) {
        const self = this;
        Object.getOwnPropertyNames(this.values).forEach(function(valueName) {
          const option = document.createElement('option')
          option.value = self.values[valueName]
          option.innerText = valueName
          self.elem.appendChild(option)
        })
      }
    }

    setIfNext(optionString, index) {
      if (optionString[index] === this.shortName) {
        // Check for an argument.
        if (optionString[++index] !== ':') {
          throw new Error('Expected argument');
        }

        // Parse the arg name.
        let start = ++index;
        while (index < optionString.length
               && [',', ':'].indexOf(optionString[index]) === -1) {
          index++;
        }
        let arg = optionString.slice(start, index);
        if (!arg.length) {
          throw new Error('Expected argument');
        }
        this.set(arg);
        if (optionString[index] === ',') {
          index++;
        }
      }
      return index;
    }

    toOptionValue() {
      return this.shortName + ':' + this.get() + ',';
    }
  }


  const allOptions = {
    barongs:              new CheckOption('barongs',              'barongs',                  'b', null, false),
    ballElements:         new CheckOption('ballElements',         'ball-elements',            'B', null, false),
    secondTower:          new CheckOption('secondTower',          'second-tower',             'c', null, false),
    itemCap:              new CheckOption('itemCap',              'item-cap',                 'C', null, false),
    derandomize:          new CheckOption('derandomize',          'derandomize',              'd', null, true),
    goDownTraps:          new CheckOption('goDownTraps',          'go-down-traps',            'D', null, false),
    enemizer:             new CheckOption('enemizer',             'enemizer',                 'e', null, false),
    starterElement:       new DropdownOption('starterElement',    'starter-element',          'E', null, -3),
    fastTutorial:         new CheckOption('fastTutorial',         'fast-tutorial',            'f', null, false),
    floor2:               new CheckOption('floor2',               'floor2',                   'F', null, false),
    eggomizer:            new CheckOption('eggomizer',            'eggomizer',                'g', null, false),
    hiddenSpells:         new DropdownOption('hiddenSpells',      'hidden-spells',            'h', null, 0),
    themes:               new CheckOption('themes',               'themes',                   'H', null, false),
    introSkip:            new CheckOption('introSkip',            'intro-skip',               'i', null, true),
    startingItems:        new CheckOption('startingItems',        'starting-items',           'I', null, false),
    blueCollar:           new CheckOption('blueCollar',           'blue-collar',              'l', null, false),
    elevatorSpawns:       new DropdownOption('elevatorSpawns',    'elevator-spawns',          'L', null, 63),
    nonnativeSpellsLevel: new CheckOption('nonnativeSpellsLevel', 'non-native-spells-level',  'n', null, false),
    monsterElements:      new DropdownOption('monsterElements',   'monster-elements',         'm', null, 0),
    monsterSpawns:        new DropdownOption('monsterSpawns',     'monster-spawns',           'M', null, 3),
    endurance:            new DropdownOption('endurance',         'endurance',                'N', null, 0),
    boss:                 new CheckOption('boss',                 'boss',                     'o', null, false),
    portableElevators:    new CheckOption('portableElevators',    'portable-elevators',       'p', null, false),
    //preset:             new DropdownOption('preset',            'preset',                   'P', null, ),
    questReload:          new CheckOption('questReload',          'quest-reload',             'q', null, false),
    singleRoom:           new CheckOption('singleRoom',           'single-room',              's', null, false),
    starter:              new DropdownOption('starter',           'starter',                  'S', null, 2),
    tutorialSkip:         new CheckOption('tutorialSkip',         'tutorial-skip',            't', null, true),
    timeDifficulty:       new DropdownOption('timeDifficulty',    'time-difficulty',          'T', null, 0),
    tutorialBarong:       new CheckOption('tutorialBarong',       'tutorial-barong',          'u', null, false),
    barongItems:          new CheckOption('barongItems',          'barong-items',             'U', null, false),
    survival:             new CheckOption('survival',             'survival',                 'v', null, false),
    newBalls:             new CheckOption('newBalls',             'new-balls',                'w', null, false),
  }

  function get(properName) {
    return allOptions[properName];
  }

  /**
   * mapFunction should take 2 args: field and fieldName
   */
  function forEachField(mapFunction) {
    Object.getOwnPropertyNames(allOptions).forEach(function(fieldName) {
      mapFunction(allOptions[fieldName], fieldName)
    })
  }

  const exports = {
    TYPE: TYPE,
    Option: Option,
    CheckOption: CheckOption,
    DropdownOption: DropdownOption,
    allOptions: allOptions,
    get: get,
    forEachField: forEachField,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      fields: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)

