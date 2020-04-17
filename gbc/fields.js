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

  const derandomizeTooltip = 'Makes the floor layout, initial monsters, traps, and items be determined by the seed, floor number, and number of visits to the tower. ' +
   'This is recommended for races to ensure all players have the same tower, but not recommended for casual play as the tower will be the same each seed.';

  const allOptions = {
    derandomize:          new CheckOption('derandomize',          'derandomize',              'd', null, false, derandomizeTooltip),
    //preset:             new DropdownOption('preset',            'preset',                   'P', null, ),
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

