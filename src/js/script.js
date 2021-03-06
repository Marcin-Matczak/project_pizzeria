/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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

        accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable), // nag????wek produktu
        form: thisProduct.element.querySelector(select.menuProduct.form), // lewa kolumna z wyborem dodatk??w                
        cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton), //href="#add-to-cart" - ADD TO CARD 
        priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem), // cena pod widget-ilo??ci??: TOTAL PRICE
        imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper), // div gdzie znajduj?? si?? img
        amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget) // div z widgetem " + [1] - "

      };

      thisProduct.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs); // opcje wyboru dodatk??w, oraz ilo????
    }

    initAccordion() {
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      });
    }

    initOrderForm() {
      // ka??da wychwycona przez addEventListener zmiana w formularzu odpala od nowa metod?? processOrder
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
         
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

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

          const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if(optionImage){
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);

            } else {

              if(!optionSelected){
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

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
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
          options: {}
        };
        // params[paramId] - do obiektu params dodaje klucz obiektu [paramId] np. crust, sauce, topping w kt??rych s?? klucze label i options
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          // do obiektu options w obiekcie params[paramId] dodaje klucz [optionId] w kt??rym znajdzie si?? klucz option.label
          }
        }
      }
      return params;
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        // obiekt b??d??cy podsumowaniem produktu kt??ry trafi do koszyka. Tylko niezb??dne informacje jak nazwa, sk??adniki, cena etc.
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams()
      };

      return productSummary;
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }
   
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element); // dla czytelno???? przekazujemy raz jeszcze referencje do metody getElements i tam tworzymy sta??e
      thisWidget.initActions();
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element; // pod thisWidget.element b??dzie przekazany wigdet np. z produktu div z widgetem " + [1] - "
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); // input z widgetu ilo??ci      
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); // "-" z widgetu ilo??ci
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); // "+" z widgetu ilo????i
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


      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      }

      thisWidget.input.value = thisWidget.value;  
      thisWidget.announce();
    }

    announce() {
      const thisWidget = this;

      // 1. Je??li jest zmiana w inpucie ilo??ci to odpalana jest metoda announce()
      // 2. Metoda announce() ma stworzony nasz w??asny customowy event o nazwie 'update'
      // 3. Dzi??ki addEventListener mo??emy nas??uchiwa?? na dowolny obiekt, w naszym wypadku div z widgetem ilo??ci w klasie Product ( thisProduct.amountWidgetElem.addEventListener('update', funtion{procesOrder();}) )kt??ry jak wychwyci event 'update' czyli przy zmianie waro??ci inputa widgetu, to odpali ponownie metod?? przeliczaj??c?? cen?? produktu processOrer()
      // 4. metoda processOrder w ??ade spos??b nie sprawdza wybranej liczby sztuk, ani tym bardziej nie mno??y przez ni?? ceny ko??cowej, dlatego musimy jeszcze przemno??y?? cen?? przez liczb?? sztuk z input.value w processOrder przed wstawieniem nowej ceny do szablonu HTML
      
      /*const event = new CustomEvent('update');*/      

      const event = new CustomEvent('update', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);

      // 1. U??ywam teraz innego rodzaju eventu kt??rego w??a??ciwo??ci mo??na kontrolowa??. W tym wypadk w????czam jego w??a??ciwo???? bubbles.
      // 2. Bez bubbles event jest emitowany tylko na jednym elemencie, na tym, na kt??rym odpalili??my dispatchEvent
      // 3. Z opcj?? bubbles , ten event b??dzie nadal emitowany na tym elemencie, ale r??wnie?? na jego rodzicu, oraz dziadku, i tak dalej ??? a?? do samego <body> , document i window
      // 4. W przypadku customowych event??w b??belkowanie musimyw????czy?? sami
    }

  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      // tablica jest podsumowaniem zawarto??ci koszyka i to ona trafi jako zam??wienia na serwer

      thisCart.getElements(element);
      thisCart.initActions();   
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger); 
      thisCart.dom.productList = element.querySelector(select.cart.productList);  
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);      
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.form = element.querySelector(select.cart.form); 
      thisCart.dom.address = element.querySelector(select.cart.address);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
       
    }

    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      // Nas??uchujemy tutaj na list?? produkt??w, w kt??rej umieszczamy produkty, w kt??rych znajduje si?? widget liczby sztuk, kt??ry generuje ten event. Dzi??ki w??a??ciwo??ci bubbles "us??yszymy" go na tej li??cie.
      thisCart.dom.productList.addEventListener('update', function(){
        thisCart.update();          
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });    

      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault(); 
        thisCart.sendOrder();       
      });  
    }

    add(menuProduct) {
      const thisCart = this;
      
      const gneratedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(gneratedHTML);      
      thisCart.dom.productList.appendChild(generatedDOM);        
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));    

      thisCart.update();      

    }

    update() {

      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      
      for (let product of thisCart.products) {

        if (product) {

          thisCart.totalNumber = thisCart.totalNumber + product.amount;          
          thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
          
        }
      }
      
      thisCart.totalPrice = thisCart.subtotalPrice;
 
      if (thisCart.totalNumber != 0) {
        thisCart.totalPrice += thisCart.deliveryFee;

      } else {
        thisCart.deliveryFee = 0;
      }

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

      for (let price of thisCart.dom.totalPrice) {

        price.innerHTML = thisCart.totalPrice;
      }
    }  
    
    remove(productToremove){
      const thisCart = this;

      productToremove.dom.wrapper.remove();    
   
      thisCart.products.splice(thisCart.products.indexOf(productToremove), 1);          

      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {

        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: []

      };
      console.log('PAYLOAD:', payload);

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      };

      fetch(url, options);      
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
      // menuProduct - przyjmuje referencj?? do obiektu podsumowania productSummary z prepareCartProduct()
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
    
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);      
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price); 
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);      
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
             
      thisCartProduct.dom.amountWidgetElem.addEventListener('update', function(){
        
        thisCartProduct.amount = thisCartProduct.amountWidget.value;

        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        
      });
      
    } 

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
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

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(rawResponse => rawResponse.json())
        .then(parsedResponse => {          

          /* save parsedResponse as thisApp.data.product */
          thisApp.data.products = parsedResponse;

          /* execute initManu method */
          thisApp.initMenu();
        });
   
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;

      thisApp.initData();      
      thisApp.initCart();
    },
  }; 

  app.init();
}

