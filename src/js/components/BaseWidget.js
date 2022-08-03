// klasa BaseWidget nie może korzystać z metod AmountWidget, dlatego wszystkie niezbęde dane do metod muszą być w klasnie bazowej

class BaseWidget {
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    
    thisWidget.correctValue = initialValue;
  }

  // getter - metoda wykonywana przy każdej próbie odczytania wartości właściwości value
  get value(){
    const thisWidget = this;
   
    return thisWidget.correctValue;
  }

  // setter - metoda wykonywana przy każej próbie ustawienia nowej wartości właściwości value 
  set value(value) {
    const thisWidget = this;
    
    const newValue = thisWidget.parseValue(value);

    if (
      thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;
    
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;    
  }

  announce() {
    const thisWidget = this;

    // 1. Jeśli jest zmiana w inpucie ilości to odpalana jest metoda announce()
    // 2. Metoda announce() ma stworzony nasz własny customowy event o nazwie 'update'
    // 3. Dzięki addEventListener możemy nasłuchiwać na dowolny obiekt, w naszym wypadku div z widgetem ilości w klasie Product ( thisProduct.amountWidgetElem.addEventListener('update', funtion{procesOrder();}) )który jak wychwyci event 'update' czyli przy zmianie warości inputa widgetu, to odpali ponownie metodę przeliczającą cenę produktu processOrer()
    // 4. metoda processOrder w żade sposób nie sprawdza wybranej liczby sztuk, ani tym bardziej nie mnoży przez nią ceny końcowej, dlatego musimy jeszcze przemnożyć cenę przez liczbę sztuk z input.value w processOrder przed wstawieniem nowej ceny do szablonu HTML

    /*const event = new CustomEvent('update');*/

    const event = new CustomEvent('update', {
      bubbles: true,
    });

    thisWidget.dom.wrapper.dispatchEvent(event);

    // 1. Używam teraz innego rodzaju eventu którego właściwości można kontrolować. W tym wypadk włączam jego właściwość bubbles.
    // 2. Bez bubbles event jest emitowany tylko na jednym elemencie, na tym, na którym odpaliliśmy dispatchEvent
    // 3. Z opcją bubbles , ten event będzie nadal emitowany na tym elemencie, ale również na jego rodzicu, oraz dziadku, i tak dalej – aż do samego <body> , document i window
    // 4. W przypadku customowych eventów bąbelkowanie musimywłączyć sami
  }

}

export default BaseWidget;