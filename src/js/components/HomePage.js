import { templates } from '../settings.js';

class HomePage{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
  }

  render(element){
    const thisHome = this;
    console.log(thisHome);

    const generatedHTML = templates.homePage(element);
    element.innerHTML = generatedHTML;
  }
}

export default HomePage;



