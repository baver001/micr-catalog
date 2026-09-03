const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync('cells/tools/mask-clock/index.html', 'utf8');
const script = html.match(/<script id="clock-core">([\s\S]*?)<\/script>/)[1];
const context = { window: {}, console, Math, Date };
vm.createContext(context);
vm.runInContext(script, context);
const core = context.window.maskClockCore;

function evaluate(expression) {
  const parts = expression.text.split(' ');
  const left = Number(parts[0]);
  const right = Number(parts[2]);
  if (parts[1] === '+') return left + right;
  if (parts[1] === '−') return left - right;
  if (parts[1] === '×') return left * right;
  return left / right;
}

for (const target of [0, 1, 7, 12, 23, 42, 59]) {
  for (const mode of ['add', 'subtract', 'multiply', 'divide', 'random']) {
    const expression = core.generateExpression(target, mode);
    assert.strictEqual(evaluate(expression), target, `${mode} failed for ${target}`);
    assert.ok(expression.text.length > 0);
  }
}

const date = new Date(2026, 8, 3, 0, 7);
assert.strictEqual(JSON.stringify(core.timeTargets(date, true)), JSON.stringify({
  hours: 0, minutes: 7, actualHours: 0, actualMinutes: 7, period: 'AM'
}));
assert.strictEqual(JSON.stringify(core.timeTargets(new Date(2026, 8, 3, 23, 7), false)), JSON.stringify({
  hours: 11, minutes: 7, actualHours: 23, actualMinutes: 7, period: 'PM'
}));
assert.strictEqual(JSON.stringify(core.factors(12)), '[1,2,3,4,6,12]');
assert.ok(core.factors(0).every(value => value > 0));
console.log('mask-clock: arithmetic expressions and time formatting passed');
