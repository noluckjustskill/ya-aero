'use strict'

const typeDict = {
  arrival: "Arrival",
  departure: "Departure",
};

const statusDict = {
  landed: "Landed",
  active: "Landing",
  cancelled: "Cancelled",
  scheduled: "Scheduled",
};

const minTimeDelayed = 15 * 60 * 1000; // If more than 15 minutes whait - delayed
const table = $('#schedule, .pager');

let type = 'arrival';
let onlyDelayed = false;
let data;

const show = (data, filter) => {
  $('#schedule tbody').empty();
  $('.loader').hide();

  data.result.forEach((flight) => {
    if ((flight.type === 'arrival' && type === 'arrival') || filter) {
      const { estimatedTime, scheduledTime } = flight.arrival;
      const [date, time] = (new Date(estimatedTime)).toLocaleString().split(', ');
      const [dDate, dTime] = (new Date(scheduledTime)).toLocaleString().split(', ');

      const delayed = estimatedTime && (new Date(scheduledTime)).getTime() - (new Date(estimatedTime)).getTime() > minTimeDelayed;

      if (!delayed && onlyDelayed) { return; }

      $('#schedule tbody').append(`<tr class="${flight.status === 'cancelled' ? 'red' : ''} ${delayed ? 'delayed' : ''}">
        <td><h2>${time}</h2><h3>${date}</h3></td>
        <td>${delayed ? `<h2>${dTime}</h2><h3>${dDate}</h3>` : ''}</td>
        <td>${typeDict[flight.type] || flight.type}</td>
        <td>${data.cities[flight.departure.iataCode] || flight.departure.iataCode}</td>
        <td><h2>${flight.flight.iataNumber}</h2><h3>${flight.airline.name}</h3></td>
        <td>${(flight.arrival.terminal || '') + (flight.arrival.gate ? ' (gate ' + flight.arrival.gate + ')' : '')}</td>
        <td>${statusDict[flight.status]}</td>
      </tr>`);
    }
    
    if ((flight.type === 'departure' && type === 'departure') || filter) {
      const { scheduledTime } = flight.departure;
      const [date, time] = (new Date(scheduledTime)).toLocaleString().split(', ');

      $('#schedule tbody').append(`<tr class="${flight.status === 'cancelled' ? 'red' : ''}">
        <td><h2>${time}</h2><h3>${date}</h3></td>
        <td></td>
        <td>${typeDict[flight.type] || flight.type}</td>
        <td>${data.cities[flight.arrival.iataCode] || flight.arrival.iataCode}</td>
        <td><h2>${flight.flight.iataNumber}</h2><h3>${flight.airline.name}</h3></td>
        <td>${(flight.departure.terminal || '') + (flight.departure.gate ? ' (gate ' + flight.departure.gate + ')' : '')}</td>
        <td>${statusDict[flight.status]}</td>
      </tr>`);
    }
  });

  table.fadeIn(300);
  $('#schedule').trigger("updateAll", [true]);
};

$.get('/api/get', (response) => {
  data = response;
  show(response);
});

$('#control-bar .type').click(function () {
  $('#control-bar .type').removeClass('pure-button-active');
  $(this).addClass('pure-button-active');

  type = $(this).data('type');
  show(data);
});

$('#control-bar .delayed').click(() => {
  onlyDelayed = !onlyDelayed;
  show(data);
});

$('#search').click(() => {
  if (!$('#flight').val().length) { return; }

  const toShow = {...data};
  toShow.result = data.result.filter((f) => f.flight.iataNumber === $('#flight').val());

  $('#reset').removeClass('pure-button-disabled');
  show(toShow, true);
});

$('#reset').click(function () {
  if ($(this).hasClass('pure-button-disabled')) { return; }

  $(this).addClass('pure-button-disabled');
  show(data);
});

$('#reload').click(() => {
  table.hide();
  $('.loader').show();

  $.get('/api/get?renew=yes', (response) => {
    data = response;
    show(response);
  });
});

$('#schedule').tablesorter().tablesorterPager({
  container: $(".pager"),
  output: '{startRow} to {endRow} ({totalRows})',
  updateArrows: true,
  page: 0,
  size: 10, 
  fixedHeight: true,
  removeRows: false,
  cssNext: '.next',
  cssPrev: '.prev',
  cssFirst: '.first',
  cssLast: '.last',
  cssPageDisplay: '.pagedisplay',
  cssPageSize: '.pagesize',
  cssDisabled: 'disabled'
});