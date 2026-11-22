// CD ExamFocus © 2026 Carlos Díaz Bueno; XIRH Academy extension. GNU GPL v3 or later.
define(['core/ajax'], function(Ajax) {
    'use strict';

    /** Browser-only exam supervision. All counters and deductions come from Moodle. */
    function createMonitor(config) {
        const strings = config.strings;
        const simulation = config.simulation === true;
        const simulatedEvents = new Map();
        const pageId = window.crypto.randomUUID();
        const queueKey = 'xirh-examfocus-v2-' + config.attemptId;
        const method = 'quizaccess_cdexamsave_record_signal';
        let queue = [];
        try {
            queue = simulation ? [] : JSON.parse(localStorage.getItem(queueKey) || '[]');
            if (!Array.isArray(queue)) { queue = []; }
        } catch (error) { queue = []; }
        let active = false;
        let navigating = false;
        let submitting = false;
        let pumping = null;
        let loss = null;
        let warningId = '';
        let picker = false;
        let heartbeat = null;
        let count = config.incidentcount || 0;
        let penalty = config.penalty || 0;
        let storageFailed = false;
        let gateStarted = false;

        const text = (key, values) => Object.entries(values || {}).reduce(
            (value, entry) => value.replaceAll('{' + entry[0] + '}', String(entry[1])), strings[key] || key);
        const number = value => new Intl.NumberFormat(document.documentElement.lang || 'fr',
            {maximumFractionDigits: 2}).format(value);
        const rate = value => value === 0 ? strings.warningRate : '−' + number(value);
        const node = (tag, cls, content) => {
            const element = document.createElement(tag);
            element.className = cls || '';
            if (content !== undefined) { element.textContent = content; }
            return element;
        };
        const badge = node('section', 'cdexamsave-monitor-badge xa-exam-bar');
        badge.setAttribute('aria-label', strings.statusActive);
        const status = node('span', 'xa-exam-status', strings.statusPending);
        status.setAttribute('role', 'status');
        const counters = node('span', 'xa-exam-counters');
        badge.append(status, counters);
        let simulateButton = null;
        if (simulation) {
            badge.prepend(node('strong', 'xa-exam-simulation-label', strings.mode));
            simulateButton = node('button', 'btn btn-secondary btn-sm', strings.simulateLoss);
            simulateButton.type = 'button';
            simulateButton.disabled = true;
            simulateButton.addEventListener('click', function() { loseFocus('simulation'); commitLoss(); settle(); });
            badge.append(simulateButton);
        }
        document.body.append(badge);

        function makeDialog(title, description, buttonText) {
            const dialog = node('dialog', 'xa-exam-dialog');
            const card = node('div', 'xa-exam-dialog-card');
            const eyebrow = node('p', 'xa-exam-eyebrow', 'XIRH ACADEMY · ÉVALUATION');
            const heading = node('h2', '', title);
            heading.id = 'xa-exam-title-' + window.crypto.randomUUID();
            dialog.setAttribute('aria-labelledby', heading.id);
            const paragraph = node('p', 'xa-exam-description', description);
            const policy = node('div', 'xa-exam-policy', config.penaltiesEnabled ? text('policy', {
                first: rate(config.rates[0]), second: rate(config.rates[1]), later: rate(config.rates[2]),
                max: number(config.gradeMax)
            }) : strings.noPenalty);
            const detail = node('p', 'xa-exam-detail');
            detail.setAttribute('role', 'status');
            const button = node('button', 'btn btn-primary xa-exam-action', buttonText);
            button.type = 'button';
            card.append(eyebrow, heading, paragraph, policy, detail, button);
            dialog.append(card);
            dialog.addEventListener('cancel', event => event.preventDefault());
            document.body.append(dialog);
            return {dialog, card, detail, button, paragraph};
        }
        const gate = makeDialog(strings.gateTitle, strings.gateText, strings.start);
        const warning = makeDialog(strings.warningTitle, strings.warningText, strings.resume);
        if (simulation && config.requireFullscreen && config.withoutFullscreenUrl) {
            const fallback = node('a', 'xa-exam-simulation-fallback', strings.withoutFullscreen);
            fallback.href = config.withoutFullscreenUrl;
            gate.card.append(fallback);
        }

        function persist() {
            if (simulation) { return; }
            try { localStorage.setItem(queueKey, JSON.stringify(queue)); }
            catch (error) { storageFailed = true; }
        }
        function render() {
            const online = simulation || navigator.onLine;
            counters.textContent = text('counter', {count}) + ' · ' + text('totalPenalty', {
                points: penalty === 0 ? '0' : '−' + number(penalty)
            });
            status.textContent = !online ? strings.statusOffline :
                (queue.length ? strings.statusSending : (!active ? strings.statusPending :
                    (storageFailed ? strings.technicalError : strings.statusActive)));
            badge.classList.toggle('xa-exam-offline', !online || queue.length > 0 || storageFailed);
            if (simulateButton) { simulateButton.disabled = !active; }
        }
        function acknowledge(data, payload) {
            count = data.incidentcount;
            penalty = data.penalty;
            if (payload.eventuuid && payload.eventuuid === warningId) {
                warning.detail.textContent = text(data.eventpenalty === 0 ? 'warningOnly' : 'deductionNotice', {
                    count: data.eventordinal, points: number(data.eventpenalty), total: number(penalty)
                });
            }
            render();
        }

        /** Keep messages until the server explicitly acknowledges them. UUIDs make retries harmless. */
        function flush() {
            if (pumping) { return pumping; }
            pumping = (async function() {
                while (queue.length) {
                    const item = queue[0];
                    const data = await Ajax.call([{methodname: method, args: item.payload}])[0];
                    if (!data || !data.accepted) { throw new Error('Signal not acknowledged'); }
                    queue = queue.filter(entry => entry.id !== item.id);
                    persist();
                    acknowledge(data, item.payload);
                }
            })().catch(error => {
                render();
                throw error;
            }).finally(() => { pumping = null; render(); });
            return pumping;
        }
        function signal(action, values) {
            const payload = Object.assign({attemptid: config.attemptId, cmid: config.cmId,
                pagesessionid: pageId, action, clienttime: Math.floor(Date.now() / 1000)}, values || {});
            if (simulation) {
                if (action === 'lost' && !simulatedEvents.has(payload.eventuuid)) {
                    const ordinal = simulatedEvents.size + 1;
                    simulatedEvents.set(payload.eventuuid, {ordinal,
                        penalty: config.penaltiesEnabled ? config.rates[Math.min(ordinal - 1, 2)] : 0});
                }
                const event = simulatedEvents.get(payload.eventuuid);
                acknowledge({incidentcount: simulatedEvents.size,
                    penalty: Array.from(simulatedEvents.values()).reduce((sum, item) => sum + item.penalty, 0),
                    eventordinal: event ? event.ordinal : 0, eventpenalty: event ? event.penalty : 0}, payload);
                return;
            }
            queue.push({id: window.crypto.randomUUID(), payload});
            persist();
            render();
            flush().catch(() => {});
        }
        function fullscreen() {
            return !!(document.fullscreenElement || document.webkitFullscreenElement);
        }
        function enterFullscreen() {
            if (!config.requireFullscreen || fullscreen()) { return Promise.resolve(); }
            const root = document.documentElement;
            const fn = root.requestFullscreen || root.webkitRequestFullscreen;
            if (!fn) { return Promise.reject(new Error('Fullscreen unavailable')); }
            try { return Promise.resolve(fn.call(root)); }
            catch (error) { return Promise.reject(error); }
        }
        function inside() {
            return document.visibilityState === 'visible' && document.hasFocus() &&
                (!config.requireFullscreen || fullscreen());
        }
        function commitLoss() {
            if (!loss || loss.sent || navigating || !active) { return; }
            loss.sent = true;
            warningId = loss.id;
            warning.detail.textContent = strings.statusSending;
            if ((config.warnStudent || config.penaltiesEnabled || config.requireFullscreen) && !warning.dialog.open) {
                warning.dialog.showModal();
            }
            signal('lost', {eventuuid: loss.id, reason: loss.reason,
                clienttime: Math.floor(loss.started / 1000)});
        }
        function loseFocus(reason) {
            if (!active || navigating || loss || (picker && reason === 'window_blur')) { return; }
            loss = {id: window.crypto.randomUUID(), started: Date.now(), reason, sent: false, timer: null};
            if (config.gracePeriodMs > 0) {
                loss.timer = window.setTimeout(commitLoss, config.gracePeriodMs);
            } else { commitLoss(); }
        }
        function settle() {
            if (!active || !loss || !inside()) { return; }
            const episode = loss;
            clearTimeout(episode.timer);
            // Background timers can be throttled; elapsed time still determines the grace period.
            if (!episode.sent && Date.now() - episode.started >= config.gracePeriodMs) { commitLoss(); }
            loss = null;
            if (episode.sent) {
                signal('returned', {eventuuid: episode.id, reason: episode.reason,
                    duration: Math.max(0, Math.round((Date.now() - episode.started) / 1000))});
            }
        }
        gate.button.addEventListener('click', function() {
            gate.button.disabled = true;
            gate.detail.textContent = '';
            // Fullscreen must be requested directly in the user's click handler.
            enterFullscreen().then(async function() {
                if (!gateStarted) { gateStarted = true; signal('init'); }
                await flush();
                active = true;
                document.body.classList.remove('xa-exam-loading');
                gate.dialog.close();
                render();
                if (!inside()) { loseFocus('window_blur'); }
                if (!heartbeat && !simulation) {
                    heartbeat = window.setInterval(function() {
                        if (!active || navigating) { return; }
                        if (queue.length) { flush().catch(() => {}); }
                        else { signal('heartbeat'); }
                    }, config.heartbeatMs);
                }
            }).catch(function() {
                gate.detail.textContent = !config.requireFullscreen || fullscreen() ? strings.syncRequired : strings.fullscreenUnavailable;
            }).finally(() => { gate.button.disabled = false; });
        });
        warning.button.addEventListener('click', function() {
            warning.button.disabled = true;
            enterFullscreen().then(async function() {
                settle();
                await flush();
                if (inside() && !loss) { warning.dialog.close(); }
            }).catch(function() {
                warning.detail.textContent = !config.requireFullscreen || fullscreen() ? strings.syncRequired : strings.fullscreenUnavailable;
            }).finally(() => { warning.button.disabled = false; });
        });
        window.addEventListener('blur', () => loseFocus('window_blur'));
        window.addEventListener('focus', function() { picker = false; settle(); });
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') { loseFocus('visibility_hidden'); }
            else { picker = false; settle(); }
        });
        ['fullscreenchange', 'webkitfullscreenchange'].forEach(event => document.addEventListener(event, function() {
            if (!config.requireFullscreen) { return; }
            if (!fullscreen()) { loseFocus('fullscreen_exit'); }
            else { settle(); }
        }));
        document.addEventListener('pointerdown', function(event) {
            // An authorised attachment chooser is part of answering an essay question.
            picker = event.target instanceof HTMLInputElement && event.target.type === 'file';
        }, true);
        function internalLink(href) {
            const url = new URL(href, window.location.href);
            return url.origin === window.location.origin &&
                /\/mod\/quiz\/(attempt|summary)\.php$/.test(url.pathname) &&
                Number(url.searchParams.get('attempt')) === config.attemptId;
        }
        function markNavigation(event) {
            navigating = true;
            // Other Moodle listeners can cancel a navigation (for example an in-page confirmation).
            // A real navigation remains exempt even if the server takes several seconds to respond.
            window.setTimeout(() => { if (event.defaultPrevented) { navigating = false; } }, 0);
        }
        document.addEventListener('click', function(event) {
            if (event.target instanceof HTMLInputElement && event.target.type === 'file') { picker = true; }
            const link = event.target.closest('a[href]');
            if (link && internalLink(link.href) && !event.ctrlKey && !event.metaKey && !event.shiftKey &&
                    (!link.target || link.target === '_self')) {
                if (queue.length) {
                    event.preventDefault();
                    flush().then(() => { navigating = true; window.location.assign(link.href); })
                        .catch(() => { warning.detail.textContent = strings.syncRequired; warning.dialog.showModal(); });
                } else { markNavigation(event); }
            }
        }, true);
        document.addEventListener('submit', function(event) {
            const form = event.target;
            const url = new URL(form.action, window.location.href);
            if (url.origin !== window.location.origin || !/\/mod\/quiz\/processattempt\.php$/.test(url.pathname)) { return; }
            if (queue.length && !submitting) {
                event.preventDefault();
                event.stopImmediatePropagation();
                const submitter = event.submitter;
                flush().then(function() {
                    submitting = true;
                    if (submitter) { form.requestSubmit(submitter); } else { form.requestSubmit(); }
                    submitting = false;
                }).catch(function() {
                    warning.detail.textContent = strings.syncRequired;
                    if (!warning.dialog.open) { warning.dialog.showModal(); }
                });
                return;
            }
            markNavigation(event);
        }, true);
        window.addEventListener('online', () => { render(); flush().catch(() => {}); });
        window.addEventListener('offline', render);
        window.addEventListener('pageshow', () => { navigating = false; });
        window.addEventListener('pagehide', function() {
            if (active && !navigating) { loseFocus('pagehide'); commitLoss(); }
            // Beacon is best effort. Messages remain queued until a real acknowledgement.
            if (!simulation && queue.length && navigator.sendBeacon) {
                const url = M.cfg.wwwroot + '/lib/ajax/service.php?sesskey=' + encodeURIComponent(M.cfg.sesskey);
                queue.forEach(item => navigator.sendBeacon(url, new Blob([JSON.stringify([
                    {index: 0, methodname: method, args: item.payload}
                ])], {type: 'application/json'})));
            }
        });
        render();
        gate.dialog.showModal();
        return {flush, getState: () => ({active, outside: !!loss, count, penalty, pending: queue.length})};
    }
    return {preview: function(url, message, label) {
        const parent = document.querySelector('#region-main');
        if (!parent || parent.querySelector('.xa-exam-preview')) { return; }
        const notice = document.createElement('div');
        notice.className = 'xa-exam-preview';
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        const link = document.createElement('a');
        link.href = url;
        link.textContent = label;
        link.className = 'btn btn-secondary btn-sm';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        notice.append(paragraph, link);
        parent.prepend(notice);
    }, init: function(config) {
        config = config || M.quizaccess_cdexamsaveConfig;
        if (document.querySelector('.xa-exam-bar')) { return; }
        return createMonitor(config);
    }};
});
