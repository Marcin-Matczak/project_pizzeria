import { templates } from '../settings.js';
import app from '../app.js';

class HomePage{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.flickity();
    thisHome.initAction();
  }

  render(element){
    const thisHome = this;    

    const generatedHTML = templates.homePage(element);
    thisHome.dom = {
      wrapper: element,      
    };

    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.boxLinksWrapper = element.querySelector('.image-links-wrapper').children;
  }

  flickity(){
    const thisHome = this;

    let elem = document.querySelector('.main-carousel');
    thisHome.flkty = new Flickity( elem, {  // eslint-disable-line
    // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true
    });
  }

  initAction(){
    const thisHome = this;

    for(let boxLink of thisHome.dom.boxLinksWrapper) {
      
      boxLink.addEventListener('click', function(event) {
        event.preventDefault();
        const boxLinkId = boxLink.getAttribute('data-link');
        app.activatePage(boxLinkId);
      });
    }
  }
}

export default HomePage;



