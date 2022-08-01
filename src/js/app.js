import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then((rawResponse) => rawResponse.json())
      .then((parsedResponse) => {
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

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();