import {calculate} from './calculator.js';

const form = document.querySelector('#plan-form');
const results = document.querySelector('#results');
const error = document.querySelector('#error');
const cash = cents => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(cents / 100);
const dateLabel = value => new Intl.DateTimeFormat('en-US', {dateStyle:'medium', timeZone:'UTC'}).format(new Date(value + 'T00:00:00Z'));
const today = () => {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

function setInitialDates() {
  form.elements.today.value = today();
  form.elements.noticeDate.value = today();
}
setInitialDates();

form.addEventListener('submit', event => {
  event.preventDefault();
  error.textContent = '';
  try {
    const data = Object.fromEntries(new FormData(form));
    const comparison = calculate({
      ...data,
      options: [['car','Car trips'], ['truck','Rental truck'], ['later','Move later']].map(([key, name]) => ({
        name, finish: data[key + 'Date'], transport: data[key + 'Transport'], other: data[key + 'Other'], rentOverride: data[key + 'Rent']
      }))
    });
    const max = Math.max(1, ...comparison.options.map(option => option.totalCents));
    const names = comparison.winners.join(' and ');
    const heading = comparison.winners.length > 1 ? names + ' tie at ' + cash(comparison.best) : names + ' costs least at ' + cash(comparison.best);
    document.querySelector('#result-content').innerHTML = `
      <p class="eyebrow">Your comparison</p><h2 id="result-title">${heading}</h2>
      <p>Additional costs from ${dateLabel(data.today)} through each completed exit, under your entered billing and notice terms.</p>
      <div class="result-grid">${comparison.options.map(option => `
        <article class="result-card ${option.totalCents === comparison.best ? 'winner' : ''}">
          <h3>${option.name}</h3><p class="total">${cash(option.totalCents)}</p>
          <div class="bar-track" aria-hidden="true"><div class="bar" style="width:${option.totalCents / max * 100}%"></div></div>
          <p class="cost-line"><span>Transport and help</span><strong>${cash(option.transportCents)}</strong></p>
          <p class="cost-line"><span>Additional rent</span><strong>${cash(option.rentCents)}</strong></p>
          <p class="cost-line"><span>Other exit charges</span><strong>${cash(option.otherCents)}</strong></p>
          <p class="result-note">Finish moving by <strong>${dateLabel(option.finish)}</strong>.<br>Assumed billing release <strong>${dateLabel(option.release)}</strong>.</p>
          <p class="small">${option.override ? 'Your confirmed additional rent overrides the monthly estimate.' : option.renewals + ' full renewal charge' + (option.renewals === 1 ? '' : 's') + ' included.'}</p>
          ${option.noticeExtended ? '<p class="result-note">The entered notice period ends after your move. Confirm the charge with the facility.</p>' : ''}
          <p class="result-note">${option.totalCents === comparison.best ? 'Lowest entered cost.' : cash(option.totalCents - comparison.best) + ' more than the lowest option.'}</p>
        </article>`).join('')}</div>
      <h3>Before you commit</h3><ul class="checklist"><li>Confirm that notice given on ${dateLabel(data.noticeDate)} is accepted and ask for the final bill in writing.</li><li>Book the transport and help needed to finish your chosen plan on time.</li><li>Empty and clean the unit, remove your lock, and complete the facility's move-out confirmation.</li></ul>
      <p class="small">A full extra month is counted on a renewal date. Deposits, past-due balances, refunds larger than extra rent, future rate changes and unentered charges require a separate adjustment. Verify your final amount with the facility.</p>`;
    results.hidden = false;
    results.focus();
  } catch (exception) {
    results.hidden = true;
    error.textContent = exception.message;
  }
});

form.addEventListener('input', () => { results.hidden = true; error.textContent = ''; });
form.addEventListener('reset', () => { results.hidden = true; error.textContent = ''; setTimeout(setInitialDates, 0); });
document.querySelector('#print').addEventListener('click', () => window.print());
document.querySelector('#example').addEventListener('click', () => {
  const values = {
    today:'2026-11-25', renewal:'2026-12-01', monthly:'145', noticeDays:'0', noticeDate:'2026-11-25',
    carDate:'2026-12-05', carTransport:'48', carOther:'0', carRent:'',
    truckDate:'2026-11-28', truckTransport:'95', truckOther:'0', truckRent:'',
    laterDate:'2027-01-05', laterTransport:'48', laterOther:'0', laterRent:''
  };
  for (const [name, value] of Object.entries(values)) form.elements[name].value = value;
  form.elements.fullMonth.checked = true;
  form.requestSubmit();
});
