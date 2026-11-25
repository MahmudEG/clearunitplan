const DAY = 86400000;

export function readDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a complete date.');
  const [year, month, day] = value.split('-').map(Number);
  if (year < 2000 || year > 2100) throw new Error('Use a year between 2000 and 2100.');
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.toISOString().slice(0, 10) !== value) throw new Error('Enter a valid calendar date.');
  return date;
}

export function money(value, name) {
  if (String(value).trim() === '') throw new Error('Enter ' + name + '.');
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1000000) {
    throw new Error(name + ' must be between $0 and $1,000,000.');
  }
  return Math.round((number + Number.EPSILON) * 100);
}

export function billingDate(anchor, offset) {
  const first = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + offset, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(anchor.getUTCDate(), lastDay));
  return first;
}

export function calculate(input) {
  const today = readDate(input.today);
  const renewal = readDate(input.renewal);
  const noticeDate = readDate(input.noticeDate);
  const monthlyCents = money(input.monthly, 'monthly rent and mandatory fees');
  const noticeDays = Number(input.noticeDays);
  if (!Number.isInteger(noticeDays) || noticeDays < 0 || noticeDays > 365) {
    throw new Error('Notice must be a whole number from 0 to 365 days.');
  }
  if (renewal < today || renewal > new Date(today.getTime() + 366 * DAY)) {
    throw new Error('The next unpaid renewal must be today or within the next year.');
  }
  const earliestRelease = new Date(noticeDate.getTime() + noticeDays * DAY);
  const horizon = new Date(today.getTime() + 730 * DAY);
  const options = input.options.map(option => {
    const finish = readDate(option.finish);
    if (finish < today || finish > horizon) throw new Error('Moving dates must be today or within two years.');
    const release = new Date(Math.max(finish.getTime(), earliestRelease.getTime()));
    if (release > horizon) throw new Error('The notice end date must be within two years.');
    const transportCents = money(option.transport, option.name + ' moving cost');
    const otherCents = money(option.other, option.name + ' extra charges');
    let renewals = 0;
    while (billingDate(renewal, renewals) <= release) renewals++;
    let rentCents = renewals * monthlyCents;
    if (option.rentOverride !== '') rentCents = money(option.rentOverride, option.name + ' confirmed additional rent');
    return {
      name: option.name, finish: option.finish,
      release: release.toISOString().slice(0, 10),
      noticeExtended: release > finish, renewals,
      override: option.rentOverride !== '',
      rentCents, transportCents, otherCents,
      totalCents: rentCents + transportCents + otherCents
    };
  });
  if (options.length < 2) throw new Error('Compare at least two moving plans.');
  const best = Math.min(...options.map(option => option.totalCents));
  return {options, best, winners: options.filter(option => option.totalCents === best).map(option => option.name)};
}
