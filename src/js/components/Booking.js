import { select, settings, templates, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.bookedTable = {};    
    
    thisBooking.render(element);
    thisBooking.initWidgets();   
    thisBooking.getData();
  }

  // metoda pobiera dane z API urzywając adresów z parametrami filtrującymi wyniki (urls)
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = { 
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };    

    // adresy endpointów dzięki którym API przefiltruje wyniki rezerwacji
    const urls ={
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'), // zawiera adres endpointu API który zwraca listę rezerwacji
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'), // zwraca listę wydarzeń jednorazowych
      eventsRepeat:  settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'), // zwraca listę wydarzeń cyklicznych
    };

    // Są 3 zapytania pod 3 adresy i serwer może poświęcić inną ilość czasu na zwrócenie odpowiedzi, więc nie zamy dokadnej kolejności zwróconych odpowiedzi, a do dalszych operacji potrzebujemy kompletu informacji o rezerwacjach z serwera. Dlatego JS ma dotowe rozwiązanie, które pozwoli uruchomić kolejną metodę dopiero kiedy wszystkie 3 pytania zwrócą nam odpowiedzi --> metoda Promise

    // Promise działa podobnie do fetch, czyli wykona pewną operację, a kiedy zostanie zakończona wtedy zostanie wykonana np. zdefiniowana funkcja ( kolejna operacja ). W przypadku Promise.all jest zestaw operacji zawartych w tablicy i metody .then zaczną się uruchamiać dopiero wtedy kiedy wszystkie operacje fetch z tablizy zawartej w Promise.all zostaną wykonane ( czyli zostaną pobrane dane z serwera)
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventRepeatResponse = allResponse[2];
        // w tym miejscu również będzie więcej wyników, dlatego czekamy na nie i używamy Promise.all
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);     
      });   
      
  } 

  // przyjmuje informacje z API i sprawdza aktualne informacje o rezerwacjach, któe stoliki są wolne a które zajęte i pokazuje na mapie.
  // Tworzymy dodatkowy obiekt ponieważ sktypt musiałby przjeś po dużej ilości informacji, przez co działałby wolno, dlatego ułatwiamy zadanie i tworzymy obiekt z niezbędnymi danymi do filtrowania
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    // obiekt z zajętymi stolikami
    thisBooking.booked ={};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }        
      }
    }
    //console.log('thisBooking Booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  initTables(event){
    const thisBooking = this;
    
    const clickedTable = event.target; 
    //console.log('TARGET', clickedTable);    
    
    if(clickedTable.classList.contains('table')){   

      if(!clickedTable.classList.contains(classNames.booking.tableBooked)){
        
        if(clickedTable.classList.contains(classNames.booking.selectedTable)){
          thisBooking.resetBooking();
        } else {
          thisBooking.resetBooking();
          clickedTable.classList.add(classNames.booking.selectedTable);
          const tableId = clickedTable.getAttribute('data-table');
          thisBooking.bookedTable = Number(tableId); 
        }

      } else {
        alert('Table is already booked. Please, choose another one.');
      }     
    }
    //console.log('bookedTABLE:', thisBooking.bookedTable);
  } 

  resetBooking(){
    const thisBooking = this;

    for (const table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.selectedTable);
    }
    thisBooking.bookedTable = {};
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    
    const payload = {

      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.bookedTable,
      duration: thisBooking.amountHoursWidget.value, 
      ppl: thisBooking.amountPeopleWidget.value, 
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,

    };

    for(let starter of thisBooking.dom.starters){
      if(starter.checked){
        payload.starters.push(starter.value);
      }
    }
    console.log('PAYLOAD:', payload);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    fetch(url, options);    
  }

  // zapisuje informacje w thisBooking.booked
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
 
    // tworzymy pętlę dla dodawania zakresu rezerwacji, czyli półgodzinnych bloków
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop index', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
 
  // aktualizuje mapę reteuracji o zajęte stoliki na bazie obiektu thisBooking.booked
  updateDOM(){
    const thisBooking = this;

    // dane wybrane przez osobę składającą rezerwację na stronie 
    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined'  ||  typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    } 
    thisBooking.resetBooking(); 
    //console.log('bookedTABLE:', thisBooking.bookedTable);
  }  

  render(element){
    const thisBooking = this;
    
    const generatedHTML = templates.bookingWidget();
    element.innerHTML = generatedHTML;

    thisBooking.dom ={

      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
      datePicker: element.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: element.querySelector(select.widgets.hourPicker.wrapper),
      tables: element.querySelectorAll(select.booking.tables),
      
      floorPlan: element.querySelector(select.booking.floorPlan),
      form: element.querySelector(select.booking.form),
      phone: element.querySelector(select.booking.phone),
      address: element.querySelector(select.booking.address),
      starters: element.querySelectorAll(select.booking.starters),
      
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

    thisBooking.datePickerWidget = new DatePicker(
      thisBooking.dom.datePicker
    );

    thisBooking.hourPickerWidget = new HourPicker(
      thisBooking.dom.hourPicker
    );

    thisBooking.dom.wrapper.addEventListener('update', function (){
      thisBooking.updateDOM();
    });     
    
    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();      
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  
  }
}

export default Booking;