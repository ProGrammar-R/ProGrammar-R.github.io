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
      tooltip,
    ) {
      this.properName = properName;
      this.elementName = elementName;
      this.shortName = shortName;
      this.values = values;
      this.defaultValue = defaultValue;
      this.currentValue = this.defaultValue;
      this.type = type;
      this.tooltip = tooltip;
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

    getDefault() {
      return this.defaultValue;
    }

    initialize(document) {
      this.elem = document.getElementById(this.elementName);
      // bring element state in line with current value
      this.set(this.currentValue);
      let lastElem = this.elem.nextElementSibling;
      if (this.tooltip) {
        if (!lastElem) {
          lastElem = this.elem
        }
        this.createTooltip(document, lastElem)
      }
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

    createTooltip(document, lastElem) {
      const tooltipWrapper = document.createElement('span');
      tooltipWrapper.className = 'tooltip-wrapper';
      const tooltipIndicator = document.createElement('span');
      tooltipIndicator.className = 'tooltip-indicator';
      tooltipIndicator.innerText = ' ?'
      tooltipWrapper.insertAdjacentElement('afterbegin', tooltipIndicator)
      const tooltipHidden = document.createElement('span');
      tooltipHidden.className = 'tooltip hidden';
      const tooltipText = document.createElement('span');
      tooltipText.innerText = this.tooltip;
      tooltipHidden.insertAdjacentElement('afterbegin', tooltipText);
      tooltipWrapper.insertAdjacentElement('beforeend', tooltipHidden);
      lastElem.insertAdjacentElement('afterend', tooltipWrapper);
    } 
  }


  class CheckOption extends Option {
    constructor(
      properName,
      elementName,
      shortName,
      values,
      defaultValue,
      tooltip,
    ) {
      super(properName, elementName, shortName, values, defaultValue, TYPE.check, tooltip);
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
      tooltip,
    ) {
      super(properName, elementName, shortName, values, defaultValue, TYPE.dropdown, tooltip);
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
          const option = document.createElement('option');
          option.value = self.values[valueName];
          option.innerText = valueName;
          self.elem.appendChild(option);
        })
      }
      this.set(this.getDefault());
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

  const altTrapAlgorithmTooltip = 'Recommended if customizing individual traps. The original game chooses traps with nearly equal weighting (except monster dens), ' +
   'so changing the trap likelihoods doesn\'t work as most people would expect. This option makes the game\'s trap selection closely reflect the options chosen.'

  const barongsTooltip = 'Barongs normally appear on all two digit floors ending with 6 (i.e. 16, 26, 36). This option randomizes that digit (e.g. 12, 22, 32).'
  
  const ballElementsTooltip = 'Spell balls will have an random element. If the new element is not their native element, they will be named by the equivalent spell.';

  const secondTowerTooltip = 'Enables the second tower from the start, which was postgame content present in the original game but inaccessible by normal means. ' +
   'To access it, go to the second floor where Ghosh and Selfi appear. ' + 'After dealing with Ghosh, go to the top-left of the map and a new elevator will be present.';

  const itemCapTooltip = 'It is not possible to bring more than 5 items into the tower by normal means. This option removes that restriction.';

  const derandomizeTooltip = 'Makes the floor layout, initial monsters, traps, and items be determined by the seed, floor number, and number of visits to the tower. ' +
   'This is recommended for races to ensure all players have the same tower, but not recommended for casual play as the tower will loop after 32 visits.';

  const enemizerTooltip = 'Randomizes what enemy types appear on what floors, with the exception Barongs and the tutorial floor. Monsters that can heal themselves ' +
   'will not appear below floor 6, and certain major threats will not appear below floor 4. Monster levels are scaled by floor number based on threat level.';

  const starterElementTooltip = 'Set or randomize your starting familiar\'s element. Atypical means one of the two non-native elements for that monster will be chosen at random.';

  const fastTutorialTooltip = 'All items on the tutorial floor will be moved to directly in front of where Koh enters. The elevator will be one tile beyond the items, ' +
   'so there isn\'t any need to go through the whole floor. The tile where the elevator originally was still looks like an elevator, but does nothing.'

  const tutorialBarongTooltip = 'Replace the Pulunpa on the tutorial floor (the first floor of the tower on your first visit) with a Barong. ' +
   'With "Fast tutorial floor" enabled, the Barong is moved closer, just up the first set of stairs.';

  const eggomizerTooltip = 'Randomize the types of monsters that can be found in eggs on a given floor, excluding the Pulunpa egg on the tutorial floor. ' +
   'Note that eggs may be of evolved monsters or Kewne, in which case they will not have a name.';

  const introSkipTooltip = 'Skip most of the otherwise non-skippable intro cutscenes. After the angel and the skippable intro movie, you will appear outside of Koh\s house ' +
   'with the Pita fruit you would have received from your mother in your inventory. Highly recommended for races.';

  const startingItemsTooltip = 'Replaces the items on the tutorial floor with a random weapon, shield, spell ball, egg, and the usual medicinal herb. ' +
   'Note that the egg may be that of an evolved monster or Kewne, in which case it will not have a name.';

  const kohElementTooltip = 'Set or randomize Koh\'s element. When using a mix magic attack that applies an element (e.g. Flame Sword), the resulting attack will ' +
  'have Koh\'s element, the mix magic element, and any element from Koh\'s weapon.'

  const superKohTooltip = 'Koh is normally only able to push and/or attempt to pick up some monster types. This option enables Koh to do this for all monsters, ' +
  'although picking up a monster may still fail (the monster "doesn\'t like being picked up") with the usual 3 in 8 odds.'

  const monsterElementsTooltip = 'Depending on your selection, monster elements will either be randomized by type (e.g. all Trolls are wind) or will have a random ' +
  'element each time they spawn, in which case you can choose whether they have spells that match their default element or a random element by monster type. ' + 
  'Monsters will have the color palette that corresponds to their new element, like familiars do, to make it easier to tell what element they are. ' +
  'As some users may have difficulty determining the element based on color, custom palettes can be specified to suit each user\'s individual needs- see Customizations.';

  const enduranceTooltip = 'Moves the top of the tower from floor 40 to floor 99. Floor 41 will have the egg and monster types of floor 1, but scaled up ' +
   'by 30, 40, or 50 levels depending on the difficulty level chosen; floor 42 will be like floor 2, and so on. Since there is no floor 0, a surprise waits on floors 40 and 80.';

  const bossTooltip = 'SPOILERS: Changes the mechanics of the final boss fight to remove the condition where you must lose to win. Changes the final boss\'s stats and more.';

  const portableElevatorsTooltip = 'New items called "Elevators" will spawn in the first tower. They can be picked up like ordinary items, and placed down and stepped on ' +
   'to act like elevators. The elevator can be directly triggered by the "Use" command or giving them to, or throwing them at, a monster. ' +
   'Be aware that this will cause Wind Crystals to spawn much less often, and portable elevators will not spawn if you already have two in your inventory.';

  const barongItemsTooltip = 'The herbs that can ordinarily only be found from a Barong or in the second tower will spawn like normal.';

  const survivalTooltip = 'The tutorial floor has been replaced with a large room filled with an assortment of useful items, but no items will ever spawn in the tower. ' +
  'For technical reasons, the elevator will not be visible, but it is present along the row of items, as seen on your minimap. Options that affect item spawns have no effect';

  const newBallsTooltip = 'Spawns three new spell balls that function like their respective spells: DeForth, LeoGrave, and LoGrave.';

  const fixCrashesTooltip = 'Fix some crashes that were present in the original game. Presently this includes the crash when gaining too much EXP from a single monster ' +
   'and the crashes that occur when trying to spawn a monster will a level > 99 (such as when egg-bombing with Koh\'s level is 50+).';

   const fixBugsTooltip = 'Restores behavior that was clearly intended by the developers but doesn\'t function due to a bug. ' +
   'Currently this only includes restoring the particles that the salamander should spawn when attacking.';

   const animationsTooltip = 'Randomize monster appearances and animations by type. This option is highly experimental, ' +
   'will result in some bizarre looking effects, and may even crash your emulator. The randomization process will also take much longer to complete.';

  const kohElementOptions =
  {
    Randomized: -1,
    Default: 0,
    Fire: 1,
    Water: 2,
    Wind: 4
  }

  const allOptions = {
    altTrapAlgorithm:     new CheckOption('altTrapAlgorithm',     'alt-trap-algorithm',       'a', null, false, altTrapAlgorithmTooltip),
    animations:           new CheckOption('animations',           'animations',               'A', null, false, animationsTooltip),
    barongs:              new CheckOption('barongs',              'barongs',                  'b', null, false, barongsTooltip),
    ballElements:         new CheckOption('ballElements',         'ball-elements',            'B', null, false, ballElementsTooltip),
    secondTower:          new CheckOption('secondTower',          'second-tower',             'c', null, false, secondTowerTooltip),
    itemCap:              new CheckOption('itemCap',              'item-cap',                 'C', null, false, itemCapTooltip),
    derandomize:          new CheckOption('derandomize',          'derandomize',              'd', null, false, derandomizeTooltip),
    goDownTraps:          new CheckOption('goDownTraps',          'go-down-traps',            'D', null, false, null),
    enemizer:             new CheckOption('enemizer',             'enemizer',                 'e', null, false, enemizerTooltip),
    starterElement:       new DropdownOption('starterElement',    'starter-element',          'E', null, -3,    starterElementTooltip),
    fastTutorial:         new CheckOption('fastTutorial',         'fast-tutorial',            'f', null, false, fastTutorialTooltip),
    floor2:               new CheckOption('floor2',               'floor2',                   'F', null, false, null),
    eggomizer:            new CheckOption('eggomizer',            'eggomizer',                'g', null, false, eggomizerTooltip),
    hiddenSpells:         new DropdownOption('hiddenSpells',      'hidden-spells',            'h', null, 0,     null),
    themes:               new CheckOption('themes',               'themes',                   'H', null, false, null),
    introSkip:            new CheckOption('introSkip',            'intro-skip',               'i', null, false, introSkipTooltip),
    startingItems:        new CheckOption('startingItems',        'starting-items',           'I', null, false, startingItemsTooltip),
    kohElement:           new DropdownOption('kohElement',        'koh-element',              'k', kohElementOptions, 0, kohElementTooltip),
    superKoh:             new CheckOption('superKoh',             'super-koh',                'K', null, false, superKohTooltip),
    blueCollar:           new CheckOption('blueCollar',           'blue-collar',              'l', null, false, null),
    elevatorSpawns:       new DropdownOption('elevatorSpawns',    'elevator-spawns',          'L', null, 63,    null),
    monsterElements:      new DropdownOption('monsterElements',   'monster-elements',         'm', null, 0,     monsterElementsTooltip),
    monsterSpawns:        new DropdownOption('monsterSpawns',     'monster-spawns',           'M', null, 3,     null),
    nonnativeSpellsLevel: new CheckOption('nonnativeSpellsLevel', 'non-native-spells-level',  'n', null, false, null),
    endurance:            new DropdownOption('endurance',         'endurance',                'N', null, 0,     enduranceTooltip),
    boss:                 new CheckOption('boss',                 'boss',                     'o', null, false, bossTooltip),
    portableElevators:    new CheckOption('portableElevators',    'portable-elevators',       'p', null, false, portableElevatorsTooltip),
    //preset:             new DropdownOption('preset',            'preset',                   'P', null, ),
    questReload:          new CheckOption('questReload',          'quest-reload',             'q', null, false, null),
    //traps:              new TrapsOption('traps',                'traps',                    'r', null, false, null),
    spells:               new CheckOption('spells',               'spells',                   'R', null, false, null),
    singleRoom:           new CheckOption('singleRoom',           'single-room',              's', null, false, null),
    starter:              new DropdownOption('starter',           'starter',                  'S', null, 2,     null),
    tutorialSkip:         new CheckOption('tutorialSkip',         'tutorial-skip',            't', null, false, null),
    timeDifficulty:       new DropdownOption('timeDifficulty',    'time-difficulty',          'T', null, 0,     null),
    tutorialBarong:       new CheckOption('tutorialBarong',       'tutorial-barong',          'u', null, false, tutorialBarongTooltip),
    barongItems:          new CheckOption('barongItems',          'barong-items',             'U', null, false, barongItemsTooltip),
    survival:             new CheckOption('survival',             'survival',                 'v', null, false, survivalTooltip),
    newBalls:             new CheckOption('newBalls',             'new-balls',                'w', null, false, newBallsTooltip),
    fixCrashes:           new CheckOption('fixCrashes',           'fix-crashes',              'x', null, false, fixCrashesTooltip),
    fixBugs:              new CheckOption('fixBugs',              'fix-bugs',                 'X', null, false, fixBugsTooltip),
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

