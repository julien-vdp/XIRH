// Deterministic regression tests of the actual AMD monitor. No real browser or network.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = fs.readFileSync(path.join(__dirname, process.argv.includes('--built') ?
    '../amd/build/monitor.min.js' : '../amd/src/monitor.js'), 'utf8');
async function flush() { for (let i = 0; i < 40; i++) { await Promise.resolve(); } }
class Element {
    constructor(tag) {
        this.tagName = tag; this.listeners = {}; this.children = []; this.attributes = {}; this.open = false;
        this.classList = {toggle() {}, add() {}, remove() {}};
    }
    append(...children) { this.children.push(...children); }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    showModal() { this.open = true; }
    close() { this.open = false; }
    closest() { return null; }
    emit(name, event = {}) { (this.listeners[name] || []).forEach(fn => fn(event)); }
}
function create(options = {}) {
    const events = {}, calls = [], server = new Map(), storage = options.storage || new Map();
    const timers = new Map(); let seq = 0, network = true, loseAcknowledgement = false;
    let focused = true, visible = 'visible', full = false;
    const document = new Element('document'); document.body = new Element('body');
    document.documentElement = {lang: 'fr', requestFullscreen() {
        if (options.fullscreenDenied) { return Promise.reject(new Error('Denied')); }
        full = true; document.emit('fullscreenchange'); return Promise.resolve();
    }};
    Object.defineProperties(document, {visibilityState: {get: () => visible}, fullscreenElement: {get: () => full ? {} : null}});
    document.hasFocus = () => focused; document.querySelector = () => null;
    document.createElement = tag => new Element(tag);
    const window = {crypto, location: {href: 'http://moodle.test/mod/quiz/attempt.php?attempt=7',
        origin: 'http://moodle.test', assign() {}},
        addEventListener(name, fn) { (events[name] ||= []).push(fn); },
        setTimeout(fn) { timers.set(++seq, fn); return seq; },
        setInterval(fn) { timers.set(++seq, fn); return seq; }};
    const strings = Object.fromEntries(['gateTitle','gateText','start','resume','warningTitle','warningText',
        'statusActive','statusOffline','statusPending','policy','fullscreenUnavailable','syncRequired','technicalError',
        'noPenalty','close','statusSending'].map(key => [key, key]));
    Object.assign(strings, {counter: 'Sorties {count}', totalPenalty: '−{points}',
        deductionNotice: '{count}: −{points}; total {total}'});
    const ajax = {call(requests) { return requests.map(({args}) => {
        calls.push(args);
        if (!network) { return Promise.reject(new Error('Offline')); }
        if (['lost', 'returned'].includes(args.action) && !server.has(args.eventuuid)) {
            const ordinal = server.size + 1;
            server.set(args.eventuuid, {ordinal, penalty: ordinal === 1 ? 0 : ordinal === 2 ? 2 : 3});
        }
        const event = server.get(args.eventuuid);
        const response = {accepted: true, incidentcount: server.size,
            penalty: [...server.values()].reduce((sum, e) => sum + e.penalty, 0),
            eventordinal: event?.ordinal || 0, eventpenalty: event?.penalty || 0};
        if (loseAcknowledgement && args.action === 'lost') {
            loseAcknowledgement = false; return Promise.reject(new Error('Lost acknowledgement'));
        }
        return Promise.resolve(response);
    }); }};
    let module;
    const sandbox = {window, document, navigator: {onLine: true, sendBeacon() { return true; }},
        localStorage: {getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v)},
        HTMLInputElement: Element, Blob, URL, Intl, Date,
        M: {cfg: {wwwroot: 'http://moodle.test', sesskey: 'test'}},
        clearTimeout: id => timers.delete(id), define: (...args) => { module = args.at(-1)(ajax); }};
    vm.runInNewContext(source, sandbox);
    const monitor = module.init({attemptId: 7, cmId: 9, rates: [0,2,3], gradeMax: 20,
        requireFullscreen: true, penaltiesEnabled: true, gracePeriodMs: options.grace || 0, heartbeatMs: 10000, strings});
    const dialogs = document.body.children.filter(el => el.tagName === 'dialog');
    const button = dialog => dialog.children[0].children.at(-1);
    return {monitor, calls, server, dialogs, document, storage, timers,
        async start() { button(dialogs[0]).emit('click'); await flush(); },
        async resume() { button(dialogs[1]).emit('click'); await flush(); },
        emit(name, event = {}) { (events[name] || []).forEach(fn => fn(event)); },
        focus(value) { focused = value; this.emit(value ? 'focus' : 'blur'); },
        visibility(value) { visible = value; document.emit('visibilitychange'); },
        fullscreen(value) { full = value; document.emit('fullscreenchange'); },
        network(value) { network = value; sandbox.navigator.onLine = value; this.emit(value ? 'online' : 'offline'); },
        dropAck() { loseAcknowledgement = true; }};
}
(async function() {
    let tests = 0;
    let t = create(); assert(t.dialogs[0].open); assert(!t.monitor.getState().active); tests++;
    await t.start(); assert(t.monitor.getState().active); assert(!t.dialogs[0].open); tests++;
    t.focus(false); t.visibility('hidden'); t.fullscreen(false); await flush();
    assert.equal(t.server.size, 1); assert.equal(t.monitor.getState().penalty, 0); tests++;
    t.visibility('visible'); t.focus(true); await t.resume();
    t.focus(false); await flush(); assert.equal(t.monitor.getState().penalty, 2); tests++;
    t.focus(true); await t.resume(); t.focus(false); await flush(); assert.equal(t.monitor.getState().penalty, 5); tests++;
    t = create(); await t.start(); t.network(false); t.focus(false); t.focus(true); await flush();
    assert.equal(t.monitor.getState().pending, 2); t.network(true); await flush();
    assert.equal(t.monitor.getState().pending, 0); assert.equal(t.server.size, 1); tests++;
    t = create(); await t.start(); t.dropAck(); t.focus(false); await flush();
    assert.equal(t.server.size, 1); assert.equal(t.monitor.getState().pending, 1);
    await t.monitor.flush(); assert.equal(t.server.size, 1); assert.equal(t.monitor.getState().pending, 0); tests++;
    t = create({fullscreenDenied: true}); await t.start(); assert(!t.monitor.getState().active);
    assert(t.dialogs[0].open); assert.equal(t.server.size, 0); tests++;
    t = create({grace: 1000}); await t.start(); t.focus(false); t.focus(true); await flush();
    assert.equal(t.server.size, 0); tests++;
    t = create(); await t.start();
    const input = new Element('input'); input.type = 'file'; t.document.emit('pointerdown', {target: input});
    t.focus(false); t.focus(true); await flush(); assert.equal(t.server.size, 0); tests++;
    t = create(); await t.start();
    const link = {href: 'http://moodle.test/mod/quiz/summary.php?attempt=7', target: ''};
    t.document.emit('click', {target: {closest: () => link}}); t.emit('pagehide'); await flush();
    assert.equal(t.server.size, 0); tests++;
    t = create(); await t.start(); t.emit('pagehide'); await flush();
    assert.equal(t.server.size, 1); tests++;
    console.log('PASS: ' + tests + ' browser monitor scenarios (actual AMD source, simulated DOM/network).');
})().catch(error => { console.error(error); process.exitCode = 1; });
