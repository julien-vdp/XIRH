// XIRH integration: GNU GPL v3 or later. Bundled libraries retain their own licences.
import Modeler from 'bpmn-js/lib/Modeler';
import Viewer from 'bpmn-js/lib/NavigatedViewer';
import {Writer} from 'moddle-xml';
import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

const BLANK = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'targetNamespace="https://www.xirh.fr/bpmn" id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false"/>' +
    '<bpmndi:BPMNDiagram id="Diagram_1"><bpmndi:BPMNPlane id="Plane_1" bpmnElement="Process_1"/>' +
    '</bpmndi:BPMNDiagram></bpmn:definitions>';

const SHAPES = [
    ['start', 'bpmn:StartEvent', 'bpmn-icon-start-event-none'],
    ['task', 'bpmn:Task', 'bpmn-icon-task'],
    ['gateway', 'bpmn:ExclusiveGateway', 'bpmn-icon-gateway-xor'],
    ['end', 'bpmn:EndEvent', 'bpmn-icon-end-event-none'],
];

const stylesheets = new Map();
function loadStyle(href) {
    if (!stylesheets.has(href)) {
        stylesheets.set(href, new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.append(link);
        }));
    }
    return stylesheets.get(href);
}

/** Keep the modeler's mature BPMN rules, but omit advanced modelling menus. */
function SimpleTools(palette, contextPad, connect, modeling, directEditing, eventBus, elementRegistry) {
    palette.registerProvider(500, {getPaletteEntries: () => () => ({})});
    contextPad.registerProvider(500, {
        getMultiElementContextPadEntries: () => () => ({}),
        getContextPadEntries: element => () => {
            if (element.type === 'label') {
                element = element.labelTarget;
            }
            const entries = {
                'edit-label': {group: 'edit', className: 'bpmn-icon-text-annotation', title: this.labels.label,
                    action: {click: () => directEditing.activate(element)}},
                'delete': {group: 'edit', className: 'bpmn-icon-trash', title: this.labels.delete,
                    action: {click: () => modeling.removeElements([element])}},
            };
            if (element.type !== 'bpmn:SequenceFlow' && element.type !== 'bpmn:EndEvent') {
                entries.connect = {group: 'connect', className: 'bpmn-icon-connection-multi',
                    title: this.labels.connect, action: {click: event => connect.start(event, element)}};
            }
            return entries;
        },
    });
    // Shortcuts/paste cannot introduce advanced BPMN elements via the full modeler.
    const allowed = new Set(SHAPES.map(shape => shape[1]));
    this.count = () => {
        const elements = elementRegistry.getAll();
        return {
            shapes: elements.filter(element => allowed.has(element.type)).length,
            flows: elements.filter(element => element.type === 'bpmn:SequenceFlow').length,
        };
    };
    // Higher priority than default rules; undefined allows normal BPMN checks to continue.
    const guard = new RuleProvider(eventBus);
    guard.addRule(['shape.create', 'shape.append'], 2500, context => {
        if (!allowed.has(context.shape.type) || this.count().shapes >= 150) {
            return false;
        }
    });
    guard.addRule('connection.create', 2500, () => {
        if (this.count().flows >= 300) {
            return false;
        }
    });
    guard.addRule('elements.create', 2500, context => {
        const incoming = context.elements || [];
        if (incoming.some(element => !allowed.has(element.type) &&
                element.type !== 'bpmn:SequenceFlow' && element.type !== 'label') ||
                this.count().shapes + incoming.filter(element => allowed.has(element.type)).length > 150 ||
                this.count().flows + incoming.filter(element => element.type === 'bpmn:SequenceFlow').length > 300) {
            return false;
        }
    });
}
SimpleTools.$inject = ['palette', 'contextPad', 'connect', 'modeling', 'directEditing', 'eventBus', 'elementRegistry'];

function node(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text) {
        element.textContent = text;
    }
    return element;
}

function button(label, icon, action, className = '') {
    const element = node('button', 'xirhbpmn-button ' + className);
    element.type = 'button';
    element.title = label;
    element.setAttribute('aria-label', label);
    if (icon) {
        const image = node('span', icon);
        image.setAttribute('aria-hidden', 'true');
        element.append(image);
    }
    element.append(node('span', 'xirhbpmn-button-label', label));
    element.addEventListener('click', action);
    return element;
}

/** One instance per response field; native quiz serialization sees current XML synchronously. */
export async function init(fieldId, readonly) {
    const field = document.getElementById(fieldId);
    const root = field?.closest('.xirhbpmn-editor');
    if (!root || root.dataset.initialized) {
        return;
    }
    root.dataset.initialized = '1';
    const labels = root.dataset;
    const heading = node('div', 'xirhbpmn-heading');
    const titles = node('div', 'xirhbpmn-titles');
    titles.append(node('span', 'xirhbpmn-eyebrow', labels.title), node('h4', '', labels.subtitle));
    const status = node('span', 'xirhbpmn-status', labels.loading);
    status.setAttribute('role', 'status');
    heading.append(titles, status);
    const toolbar = node('div', 'xirhbpmn-toolbar');
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', labels.title);
    const workbench = node('div', 'xirhbpmn-workbench');
    const palette = node('div', 'xirhbpmn-palette');
    const canvas = node('div', 'xirhbpmn-canvas');
    canvas.setAttribute('aria-label', labels.title);
    const help = node('p', 'xirhbpmn-help', labels.help);
    const loading = root.querySelector('.xirhbpmn-loading');
    loading.remove();
    root.append(heading, toolbar, workbench);
    if (!readonly) {
        workbench.append(palette);
        root.append(help);
    }
    workbench.append(canvas);

    let modeler;
    let ready = false;
    let failed = false;
    let dirty = false;
    const fail = () => {
        failed = true;
        status.textContent = labels.failure;
        status.classList.add('xirhbpmn-error');
        root.setAttribute('data-error', '1');
    };

    try {
        // Quiz questions render after Moodle's <head>. Load vendor CSS here rather than
        // calling page->requires->css() too late. No remote CDN is used.
        await Promise.all(['diagram-js.css', 'bpmn-font/css/bpmn.css'].map(file => loadStyle(labels.assets + file)));
        modeler = new (readonly ? Viewer : Modeler)({
            container: canvas,
            additionalModules: readonly ? [] : [{
                __init__: ['xirhSimpleTools'],
                xirhSimpleTools: ['type', SimpleTools],
            }],
        });
        if (!readonly) {
            modeler.get('xirhSimpleTools').labels = labels;
        }
        await modeler.importXML(field.value || BLANK);
        ready = true;
        status.textContent = labels.ready;
        const diagramCanvas = modeler.get('canvas');
        if (field.value) {
            diagramCanvas.zoom('fit-viewport', 'auto');
        } else {
            diagramCanvas.viewbox({x: 0, y: 0, width: canvas.clientWidth, height: canvas.clientHeight});
        }
        const zoom = factor => diagramCanvas.zoom(Math.max(0.2, Math.min(3, diagramCanvas.zoom() * factor)));
        toolbar.append(
            button(labels.zoomout, '', () => zoom(1 / 1.2), 'xirhbpmn-zoomout'),
            button(labels.zoomin, '', () => zoom(1.2), 'xirhbpmn-zoomin'),
            button(labels.fit, 'bpmn-icon-space-tool', () => diagramCanvas.zoom('fit-viewport', 'auto')),
        );
        if (readonly) {
            status.textContent = field.value ? labels.title : labels.empty;
            return;
        }

        const selection = modeler.get('selection');
        const stack = modeler.get('commandStack');
        const directEditing = modeler.get('directEditing');
        const modeling = modeler.get('modeling');
        const selected = () => selection.get().map(element => element.labelTarget || element);
        let editingElement = null;

        const sync = () => {
            if (!ready || !dirty) {
                return !failed;
            }
            try {
                const count = modeler.get('xirhSimpleTools').count();
                // Writer is the same synchronous serializer used by bpmn-moddle.toXML.
                // Avoid a saveXML Promise race with Moodle's timer, autosave or native form.submit().
                let xml;
                const businessObject = editingElement?.businessObject;
                const oldName = businessObject?.name;
                try {
                    // Serialize the live text too, without committing a modelling command per keystroke.
                    // LabelEditingProvider cancels direct editing on commandStack.changed.
                    if (businessObject && directEditing.isActive()) {
                        businessObject.name = directEditing.getValue();
                    }
                    xml = count.shapes ? new Writer({format: false}).toXML(modeler.getDefinitions()) : '';
                } finally {
                    if (businessObject) {
                        businessObject.name = oldName;
                    }
                }
                if (xml.length > 1048576 || count.shapes > 150 || count.flows > 300) {
                    throw new Error('diagram limit');
                }
                field.value = xml;
                field.dispatchEvent(new Event('input', {bubbles: true}));
                field.dispatchEvent(new Event('change', {bubbles: true}));
                dirty = false;
                failed = false;
                status.classList.remove('xirhbpmn-error');
                root.removeAttribute('data-error');
                status.textContent = labels.ready;
                return true;
            } catch (error) {
                fail();
                return false;
            }
        };
        const flush = () => {
            directEditing.complete();
            return sync();
        };
        modeler.on('commandStack.changed', () => {
            dirty = true;
            sync();
            undo.disabled = !stack.canUndo();
            redo.disabled = !stack.canRedo();
        });
        const undo = button(labels.undo, 'bpmn-icon-undo', () => {directEditing.complete(); stack.undo();});
        const redo = button(labels.redo, 'bpmn-icon-redo', () => {directEditing.complete(); stack.redo();});
        undo.disabled = redo.disabled = true;
        const remove = button(labels.delete, 'bpmn-icon-trash', () => modeling.removeElements(selected()));
        const write = button(labels.label, 'bpmn-icon-text-annotation', () => {
            const element = selected()[0];
            if (element) {
                directEditing.activate(element);
            }
        });
        const connect = button(labels.connect, 'bpmn-icon-connection-multi', event => {
            const source = selected()[0];
            if (source && !source.waypoints) {
                modeler.get('connect').start(event, source);
            }
        });
        remove.disabled = write.disabled = connect.disabled = true;
        modeler.on('selection.changed', () => {
            const current = selected();
            remove.disabled = current.length === 0;
            write.disabled = current.length !== 1;
            connect.disabled = current.length !== 1 || !!current[0].waypoints || current[0].type === 'bpmn:EndEvent';
        });
        toolbar.prepend(undo, redo, write, connect, remove);

        SHAPES.forEach(([key, type, icon]) => {
            const start = event => {
                directEditing.complete();
                if (modeler.get('xirhSimpleTools').count().shapes >= 150) {
                    status.textContent = labels.limit;
                    return;
                }
                modeler.get('create').start(event, modeler.get('elementFactory').createShape({type}));
            };
            const tool = button(labels[key], icon, start, 'xirhbpmn-shape');
            tool.draggable = true;
            tool.addEventListener('dragstart', start);
            palette.append(tool);
        });

        // Preserve in-progress labels even on the quiz's automatic timed submission.
        // Include each input in the serialized response while keeping direct editing active.
        canvas.addEventListener('input', event => {
            if (!event.target.closest('.djs-direct-editing-content')) {
                return;
            }
            dirty = true;
            sync();
        });
        modeler.on('directEditing.activate', event => {editingElement = event.active.element;});
        modeler.on('directEditing.deactivate', () => {editingElement = null; dirty = true; sync();});
        const form = field.form;
        form?.addEventListener('submit', event => {
            if (!flush()) {
                event.preventDefault();
                event.stopImmediatePropagation();
                root.scrollIntoView({block: 'center'});
            }
        }, true);
        form?.addEventListener('formdata', event => {
            flush();
            event.formData.set(field.name, field.value);
        });
        document.addEventListener('visibilitychange', flush);
        window.addEventListener('pagehide', flush);
    } catch (error) {
        fail();
    }
}
