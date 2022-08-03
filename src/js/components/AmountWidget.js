import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

// klasa AmountWidget staje się teraz rozszerzeniem klasy bazowej BaseWidget - dlatego dodajemy " extends BaseWidged " oraz wywołanie konstruktora klasy nadrzędnej za pomcą wyrażenia super(); które oznacza constructor klasy BaseWidget

// super(element = wrapperElement, settings.amountWidget.defaultValue = initialValue)
class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element); // dla czytelność przekazujemy raz jeszcze referencje do metody getElements i tam tworzymy stałe
    thisWidget.setValue(thisWidget.dom.input.value);
    thisWidget.initActions();     
  }

  getElements() {
    const thisWidget = this;  
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);  
  }

  // nadpisana domyślba metoda isValid z klasy nadrzędnej BaseWidget
  isValid(value){
    return !isNaN(value) 
    && value >= settings.amountWidget.defaultMin  
    && value <= settings.amountWidget.defaultMax;
  }

  // nadpisana domyślba metoda
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;    
  }

  initActions() {
    const thisWidget = this;   

    thisWidget.dom.input.addEventListener('change', function () {
      // thisWidget.setValue(thisWidget.dom.input.value) - zmieniliśmy ze względu na settera i gettera
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
