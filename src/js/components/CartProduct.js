import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    // menuProduct - przyjmuje referencję do obiektu podsumowania productSummary z prepareCartProduct()
    // element - przyjmuje referencje do do utworzonego dla tego produktu elementu HTML-u ( generatedDOM ).

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidgetElem = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
  }

  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidgetElem
    );

    thisCartProduct.dom.amountWidgetElem.addEventListener(
      'update',
      function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;

        thisCartProduct.price =
          thisCartProduct.amount * thisCartProduct.priceSingle;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      }
    );
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  getData() {
    const thisCartProduct = this;

    const orderData = {};

    orderData.id = thisCartProduct.id;
    orderData.name = thisCartProduct.name;
    orderData.amount = thisCartProduct.amount;
    orderData.priceSingle = thisCartProduct.priceSingle;
    orderData.price = thisCartProduct.price;
    orderData.params = thisCartProduct.params;

    return orderData;
  }
}

export default CartProduct;