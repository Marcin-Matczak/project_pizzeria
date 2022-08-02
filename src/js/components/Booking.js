import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;
    
    const generatedHTML = templates.bookingWidget();
    element.innerHTML = generatedHTML;

    thisBooking.dom ={

      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount)
          
    };             
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.amountPeopleWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );

    thisBooking.amountHoursWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
  }
}

export default Booking;