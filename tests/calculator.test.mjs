import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate, readDate, billingDate, money} from '../site/calculator.js';

const option = (name, finish, transport, rentOverride = '') => ({name, finish, transport, other:'0', rentOverride});
const base = () => ({today:'2026-11-25', renewal:'2026-12-01', monthly:'145', noticeDays:'0', noticeDate:'2026-11-25', options:[option('Car trips','2026-12-05','48'), option('Rental truck','2026-11-28','95'), option('Move later','2027-01-05','48')]});

test('worked example totals include the eventual delayed transport', () => {
  const result = calculate(base());
  assert.deepEqual(result.options.map(item => item.totalCents), [19300,9500,33800]);
  assert.deepEqual(result.winners, ['Rental truck']);
});
test('all car trips before renewal reverse the decision', () => {
  const input = base(); input.options[0].finish = '2026-11-30';
  assert.equal(calculate(input).best, 4800);
});
test('the renewal date itself counts as a full new bill', () => {
  const input = base(); input.options[1].finish = '2026-12-01';
  assert.equal(calculate(input).options[1].rentCents, 14500);
});
test('notice can extend charges even when moving finishes first', () => {
  const input = base(); input.noticeDays = '7';
  const truck = calculate(input).options[1];
  assert.equal(truck.release, '2026-12-02');
  assert.equal(truck.rentCents, 14500);
  assert.equal(truck.noticeExtended, true);
});
test('confirmed rent replaces the default including a zero override', () => {
  const input = base(); input.options[0].rentOverride = '10.50'; input.options[2].rentOverride = '0';
  assert.equal(calculate(input).options[0].totalCents, 5850);
  assert.equal(calculate(input).options[2].totalCents, 4800);
});
test('month end keeps the original billing anniversary', () => {
  const anchor = readDate('2028-01-31');
  assert.equal(billingDate(anchor, 1).toISOString().slice(0,10), '2028-02-29');
  assert.equal(billingDate(anchor, 2).toISOString().slice(0,10), '2028-03-31');
  assert.equal(billingDate(readDate('2027-01-31'), 1).getUTCDate(), 28);
});
test('a shortened first renewal uses the regular billing day for subsequent bills', () => {
  const input = base();
  input.today = input.noticeDate = '2027-02-25';
  input.renewal = '2027-02-28';
  input.options = [option('On the next bill','2027-02-28','0'), option('Before March renewal','2027-03-30','0'), option('On March renewal','2027-03-31','0')];
  assert.deepEqual(calculate({...input, billingDay:'31'}).options.map(item => item.rentCents), [14500,14500,29000]);
  assert.deepEqual(calculate({...input, billingDay:''}).options.map(item => item.rentCents), [14500,29000,29000]);
  assert.throws(() => calculate({...input, billingDay:'27'}), /must match the next unpaid renewal/);
  assert.throws(() => calculate({...input, billingDay:'32'}), /from 1 to 31/);
});
test('ties and free options are retained', () => {
  const input = base(); input.monthly = '0'; input.options = [option('A','2026-11-28','0'),option('B','2026-11-29','0')];
  assert.deepEqual(calculate(input).winners, ['A','B']);
});
test('money uses cents', () => { assert.equal(money('19.99','cost'), 1999); assert.equal(money('0','cost'), 0); });
test('invalid inputs are rejected rather than silently normalized', () => {
  assert.throws(() => readDate('2027-02-29'));
  assert.throws(() => money('','cost'));
  assert.throws(() => money('-1','cost'));
  const input = base(); input.options[0].finish = '2026-11-24';
  assert.throws(() => calculate(input));
  input.options[0].finish = '2029-01-01'; assert.throws(() => calculate(input));
});
