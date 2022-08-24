import { templates } from '../settings.js';

class HomePage{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.flickity();
  }

  render(element){
    const thisHome = this;    

    const generatedHTML = templates.homePage(element);
    thisHome.dom = {
      wrapper: element
    };

    thisHome.dom.wrapper.innerHTML = generatedHTML;
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
}

export default HomePage;



