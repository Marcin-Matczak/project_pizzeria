import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';


const app = {
  initPages: function(){
    const thisApp = this;
 
    // dzięki właściwości children we właściwości pages obiektu thisApp znajdą się wszystkie "dzieci" kontenera stron  (select.containerOf.pages) jak <sekcje> "order" oraz "booking", querySelector a nie all poniewaz wyszukujemy 1 kontener zawierający wszystkie strony

    thisApp.pages = document.querySelector(select.containerOf.pages).children;    
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    // aktywacja pierwszej z podstron, przekazujemy metodzie, id jednej z podstron zapisanych w thisApp.pages pierwsza strona jest na pozycji [0] ( bo thisdApp.pages to HTML collection - obiekt tablico podobny), dalej przekazujemy id i wywołujemy metodę w thisApp.init

    const idFromHash = window.location.hash.replace('#/', '');
    
    // w momencie gdy adres hash nie pasuje do żadej podstrony to aktywuje się pierwsza podstrona #booking
    let pageMatchingHash = thisApp.pages[0].id;   

    for(let page of thisApp.pages){
      if(page.id == idFromHash){     
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);    

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash - do adresu strony zostanie dodany #-id np. #booking lub #order*/
        // dzięki "/" przed #, strona nam się nie przwija do pierwszego znalezionego elementu na stronie równym "order"
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class 'active' to matching pages, remove form non-matching*/
    for(let page of thisApp.pages){
      
      // w klasie toggle możemy użyć drugiego arkumentu, w tym przypadku warunku z bloku if
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    // powyższy zapis będzie dokładnie tym co poniżej :

    /*if(page.id == pageId){
        page.classList.add(classNames.pages.active);
      } else {
        page.classList.remove(classNames.pages.active);
      }*/
    

    /* add class 'active' to matching links, remove form non-matching*/

    // dla każdego z linków zapisanych w thisApp.navLinks, dodajemy lub usuwamy za pomocą toggle, klasę active w zależności od tego czy atrybut 'href' tego linka jest równy '#' + oraz id ( np. #order lub #booking z htmla )podstrony podany jako argument metodzie activatePage()

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active , link.getAttribute('href') == '#' + pageId);
    }    
  },

  initMenu: function() {
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

  initHomePage: function(){
    const thisApp = this;

    const homeWrapper = document.querySelector(select.containerOf.homepage);
    thisApp.homePage = new HomePage(homeWrapper);
    
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

  initBooking: function(){
    const thisApp = this;

    const bookingWrapper = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWrapper);

  },

  init: function () {
    const thisApp = this;

    thisApp.initPages();
    thisApp.initHomePage();    
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    
  },
};

app.init();