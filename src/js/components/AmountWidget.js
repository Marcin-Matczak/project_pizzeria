import { settings, select } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element); // dla czytelność przekazujemy raz jeszcze referencje do metody getElements i tam tworzymy stałe
    thisWidget.initActions();
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element; // pod thisWidget.element będzie przekazany wigdet np. z produktu div z widgetem ' + [1] - '
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    ); // input z widgetu ilości
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    ); // '-' z widgetu ilości
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    ); // '+' z widgetu ilośći
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    if (
      thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax
    ) {
      thisWidget.value = newValue;
    }

    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
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

    thisWidget.element.dispatchEvent(event);

    // 1. Używam teraz innego rodzaju eventu którego właściwości można kontrolować. W tym wypadk włączam jego właściwość bubbles.
    // 2. Bez bubbles event jest emitowany tylko na jednym elemencie, na tym, na którym odpaliliśmy dispatchEvent
    // 3. Z opcją bubbles , ten event będzie nadal emitowany na tym elemencie, ale również na jego rodzicu, oraz dziadku, i tak dalej – aż do samego <body> , document i window
    // 4. W przypadku customowych eventów bąbelkowanie musimywłączyć sami
  }
}

export default AmountWidget;
