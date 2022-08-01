import {templates, select, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to manu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.dom = {
      accordionTrigger: thisProduct.element.querySelector(
        select.menuProduct.clickable
      ), // nagłówek produktu
      form: thisProduct.element.querySelector(select.menuProduct.form), // lewa kolumna z wyborem dodatków
      cartButton: thisProduct.element.querySelector(
        select.menuProduct.cartButton
      ), //href='#add-to-cart' - ADD TO CARD
      priceElem: thisProduct.element.querySelector(
        select.menuProduct.priceElem
      ), // cena pod widget-ilością: TOTAL PRICE
      imageWrapper: thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      ), // div gdzie znajdują się img
      amountWidgetElem: thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      ), // div z widgetem ' + [1] - '
    };

    thisProduct.formInputs = thisProduct.dom.form.querySelectorAll(
      select.all.formInputs
    ); // opcje wyboru dodatków, oraz ilość
  }

  initAccordion() {
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener(
      'click',
      function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      }
    );
  }

  initOrderForm() {
    // każda wychwycona przez addEventListener zmiana w formularzu odpala od nowa metodę processOrder
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        // check if there is param with a name of paramId in formData and if it includes optionId
        if (optionSelected) {
          // check if the option is not default
          if (!option.default) {
            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (option.default) {
            // reduce price variable
            price -= option.price;
          }
        }

        const optionImage = thisProduct.dom.imageWrapper.querySelector(
          `.${paramId}-${optionId}`
        );

        if (optionImage) {
          if (optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            if (!optionSelected) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
    }

    thisProduct.priceSingle = price;

    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(
      thisProduct.dom.amountWidgetElem
    );
    thisProduct.dom.amountWidgetElem.addEventListener('update', function () {
      thisProduct.processOrder();
    });
  }

  prepareCartProductParams() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {},
      };
      // params[paramId] - do obiektu params dodaje klucz obiektu [paramId] np. crust, sauce, topping w których są klucze label i options
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
          // do obiektu options w obiekcie params[paramId] dodaje klucz [optionId] w którym znajdzie się klucz option.label
        }
      }
    }
    return params;
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      // obiekt będący podsumowaniem produktu który trafi do koszyka. Tylko niezbędne informacje jak nazwa, składniki, cena etc.
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  addToCart() {
    const thisProduct = this;
    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart',{
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
