// Basic consent mode: no Google tag or measurement requests before opt-in.
const measurementId = 'G-J0ZJ9KL7QJ';
const containerId = 'GTM-WZ6D4F74';
const preferenceKey = 'cup-analytics-consent-v1';
let allowed = false;
let loaded = false;
function readChoice() {
  try { return localStorage.getItem(preferenceKey); } catch { return null; }
}
function saveChoice(choice) {
  try { localStorage.setItem(preferenceKey, choice); } catch { /* Session choice still works. */ }
}
function enable() {
  allowed = true;
  window['ga-disable-' + measurementId] = false;
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  window.gtag('consent', 'update', {analytics_storage: 'granted'});
  window.gtag('js', new Date());
  // Omit URL queries and fragments; inputs are never part of event parameters.
  const pageLocation = location.origin + location.pathname;
  let referrer = '';
  try { const url = new URL(document.referrer); referrer = url.origin + url.pathname; } catch {}
  window.gtag('config', measurementId, {
    allow_google_signals: false, allow_ad_personalization_signals: false,
    page_location: pageLocation, page_referrer: referrer,
    cookie_expires: 60 * 60 * 24 * 90
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.append(script);
  // The supplied container shares the dataLayer and gtag initialization above.
  // Emit the standard container-start event so All Pages triggers can run.
  window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
  const container = document.createElement('script');
  container.async = true;
  container.src = 'https://www.googletagmanager.com/gtm.js?id=' + containerId;
  document.head.append(container);
}
export function track(eventName, mode = 'own_inputs') {
  if (!allowed || !['calculator_start', 'comparison_complete', 'result_print'].includes(eventName)) return;
  window.gtag('event', eventName, {
    send_to: measurementId,
    input_mode: mode === 'example' ? 'example' : 'own_inputs'
  });
}
function clearAnalyticsCookies() {
  for (const item of document.cookie.split(';')) {
    const name = item.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of ['', location.hostname, '.' + location.hostname]) {
      document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
    }
  }
}
function showChoices() {
  if (document.querySelector('#analytics-choice')) return;
  const panel = document.createElement('section');
  panel.id = 'analytics-choice';
  panel.className = 'analytics-choice';
  panel.setAttribute('aria-label', 'Analytics preference');
  const choiceButton = allowed
    ? '<button class="button secondary button-md" type="button" data-analytics="deny">Turn off analytics</button>'
    : '<button class="button button-md" type="button" data-analytics="allow">Allow analytics</button>';
  panel.innerHTML = `<p>Analytics is ${allowed ? 'on' : 'off'}. Google Analytics cookies help us understand visits and calculator use. Your entered costs and dates are never sent to Analytics. <a href="/privacy/">Privacy details</a></p><div class="resource-actions">${choiceButton}<button class="button secondary button-md" type="button" data-analytics="close">Close</button></div>`;
  for (const button of panel.querySelectorAll('[data-analytics]')) {
    button.addEventListener('click', () => {
      const choice = button.dataset.analytics;
      panel.remove();
      settings.setAttribute('aria-expanded', 'false');
      settings.focus();
      if (choice === 'close') return;
      saveChoice(choice);
      if (choice === 'allow') enable();
      else {
        allowed = false;
        window['ga-disable-' + measurementId] = true;
        window.gtag?.('consent', 'update', {analytics_storage: 'denied'});
        clearAnalyticsCookies();
        // Reload to stop the loaded tag and its automatic engagement listeners.
        if (loaded) location.reload();
      }
    });
  }
  document.body.append(panel);
  settings.setAttribute('aria-expanded', 'true');
  panel.querySelector('[data-analytics="close"]').focus();
}
const settings = document.createElement('button');
settings.className = 'text-button button-sm analytics-settings';
settings.type = 'button';
settings.textContent = 'Analytics settings';
settings.setAttribute('aria-expanded', 'false');
settings.addEventListener('click', showChoices);
document.querySelector('footer nav')?.append(settings);
if (readChoice() === 'allow') enable();
