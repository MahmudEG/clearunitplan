import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source = readFileSync(new URL('../site/analytics.js', import.meta.url), 'utf8').replace('export function track', 'function track');
function browser(choice) {
  const saved = new Map(choice ? [['cup-analytics-consent-v1', choice]] : []);
  const scripts = [];
  let panel;
  let settings;
  let reloads = 0;
  const makeButton = (value) => ({dataset:{analytics:value}, focus(){}, setAttribute(){}, addEventListener(_, fn) { this.click = fn; }});
  const context = {
    URL, Date,
    location:{origin:'https://clearunitplan.com',pathname:'/',hostname:'clearunitplan.com',reload(){ reloads++; }},
    localStorage:{getItem:key=>saved.get(key) ?? null,setItem:(key,value)=>saved.set(key,value)},
    window:{},
    document:{
      referrer:'https://example.org/post?private=value#secret',cookie:'',
      head:{append(script){scripts.push(script);}},
      body:{append(element){panel = element;}},
      querySelector(selector) { return selector === '#analytics-choice' ? panel : {append(element){settings=element;}}; },
      createElement(tag) {
        if (tag === 'section') {
          const buttons = [makeButton('deny'),makeButton('allow'),makeButton('close')];
          return {buttons,setAttribute(){},querySelector(){return buttons[2];},querySelectorAll(){return buttons.filter(button => this.innerHTML.includes('data-analytics="' + button.dataset.analytics + '"'));},remove(){panel=undefined;}};
        }
        return {focus(){},setAttribute(){},addEventListener(_,fn){this.click=fn;}};
      }
    }
  };
  runInNewContext(source, context);
  return {context,scripts,saved,get panel(){return panel;},get settings(){return settings;},get reloads(){return reloads;}};
}
test('analytics makes no tag requests or events before opt-in or after rejection', () => {
  const b=browser();
  assert.equal(b.scripts.length,0);
  b.context.track('comparison_complete');
  assert.equal(b.context.window.dataLayer,undefined);
  assert.equal(b.panel,undefined);
  b.settings.click();
  assert.equal(b.panel.buttons[0].click,undefined);
  b.panel.buttons[2].click();
  assert.equal(b.saved.has('cup-analytics-consent-v1'),false);
  assert.equal(b.scripts.length,0);
  assert.equal(browser('deny').scripts.length,0);
  b.settings.click(); b.panel.buttons[1].click();
  assert.equal(b.scripts.length,2);
  assert.equal(b.context.window['ga-disable-G-J0ZJ9KL7QJ'],false);
});
test('consent loads each Google tag once, sanitizes attribution and allowlists event data', () => {
  const b=browser();
  b.settings.click(); b.panel.buttons[1].click();
  assert.equal(b.scripts.length,2);
  assert.match(b.scripts[0].src,/G-J0ZJ9KL7QJ$/);
  assert.equal(b.scripts[1].src,'https://www.googletagmanager.com/gtm.js?id=GTM-WZ6D4F74');
  assert.equal(b.scripts[1].async,true);
  assert.equal(b.context.window.dataLayer.filter(item=>item.event==='gtm.js').length,1);
  const commands=b.context.window.dataLayer.map(args=>Array.from(args));
  const config=commands.find(args=>args[0]==='config')[2];
  assert.equal(config.page_referrer,'https://example.org/post');
  assert.equal(config.page_location,'https://clearunitplan.com/');
  assert.equal(config.allow_google_signals,false);
  b.context.track('comparison_complete','example');
  b.context.track('comparison_complete',{cost:145,date:'private'});
  b.context.track('unexpected_event');
  const events=b.context.window.dataLayer.map(args=>Array.from(args)).filter(args=>args[0]==='event');
  assert.equal(events.length,2);
  assert.equal(events[0][2].input_mode,'example');
  assert.equal(events[1][2].input_mode,'own_inputs');
  assert.deepEqual(Object.keys(events[1][2]).sort(),['input_mode','send_to']);
  b.settings.click(); b.panel.buttons[2].click();
  assert.equal(b.scripts.length,2);
});
test('withdrawing consent stops custom events and reloads to stop the active tag', () => {
  const b=browser('allow');
  b.settings.click(); b.panel.buttons[0].click();
  assert.equal(b.context.window['ga-disable-G-J0ZJ9KL7QJ'],true);
  assert.equal(b.reloads,1);
  const count=b.context.window.dataLayer.length;
  b.context.track('calculator_start');
  assert.equal(b.context.window.dataLayer.length,count);
});
