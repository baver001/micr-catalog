const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function loadCore(file) {
  const html = fs.readFileSync(file, 'utf8');
  const script = html.match(/<script id="life-core">([\s\S]*?)<\/script>/)[1];
  const context = { window: {}, console, Math, Uint8Array, Uint8ClampedArray };
  vm.createContext(context);
  vm.runInContext(script, context);
  return context.window.lifeGameCore;
}

for (const file of ['cells/games/color-life/index.html', 'cells/games/life-3d/index.html']) {
  const core = loadCore(file);
  assert.strictEqual(core.nextGeneration([[0,0,0,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,0,0,0]]).map(r => r.join('')).join('|'), '00000|00000|01110|00000|00000');
  assert.strictEqual(core.nextGeneration([[0,0,0,0,0], [0,0,1,1,0], [0,0,1,1,0], [0,0,0,0,0], [0,0,0,0,0]]).map(r => r.join('')).join('|'), '00000|00110|00110|00000|00000');
  assert.strictEqual(JSON.stringify(core.averageColors([[255, 0, 0], [0, 255, 0], [0, 0, 255]])), '[85,85,85]');
  assert.strictEqual(JSON.stringify(core.averageColors([])), '[128,128,128]');
  assert.strictEqual(core.worldKey(-2, 7), '-2,7');
  assert.strictEqual(core.mixColors([[255,0,0],[0,255,0]]).saturation > 0.7, true);
  assert.strictEqual(core.mixColors([[255,0,0],[0,255,0]]).value > 0.8, true);
  const sparse = new Map([['0,0',[255,0,0]], ['1,0',[255,0,0]], ['2,0',[255,0,0]]]);
  assert.strictEqual(core.stepSparse(sparse).has('1,-1'), true);
  if (file.endsWith('life-3d/index.html')) {
    const original = new Map([['2,3', [255, 0, 0]]]);
    const added = core.addCell(original, '4,5', [0, 255, 0]);
    assert.strictEqual(added.has('4,5'), true);
    assert.strictEqual(original.has('4,5'), false);
    const recolored = core.addCell(original, '2,3', [0, 0, 255]);
    assert.strictEqual(JSON.stringify(recolored.get('2,3')), '[0,0,255]');
    assert.strictEqual(JSON.stringify(original.get('2,3')), '[255,0,0]');
    assert.strictEqual(core.gridKeyFromPoint(2.6, -1.4), '3,-1');
    assert.strictEqual(core.speedToDelay(1), 1000);
    assert.strictEqual(core.speedToDelay(10), 100);
    assert.strictEqual(core.speedToDelay(25), 40);
    const snapshot = core.createHistorySnapshot(new Map([['0,0', [1,0,0]]]), 7);
    assert.strictEqual(snapshot.generation, 7);
    assert.strictEqual(snapshot.cells.get('0,0')[0], 1);
  }
}
console.log('life-games: base assertions plus life-3d drawing assertions passed');
