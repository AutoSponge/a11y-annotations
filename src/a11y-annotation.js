(function () {
	class A11yAnnotation extends HTMLElement {
		get eTips() {
			return ['none', 'bottom', 'left', 'top', 'right', 'callout', 'circle'];
		}
		get eColors() {
			return ['blue', 'green', 'purple'];
		}
		get eSymbols() {
			return [
				'none',
				'tab-arrow',
				'ring',
				'arrow-horizontal',
				'arrow-vertical',
				'arrow-any',
			];
		}
		sendMessage(data = {}) {
			const text = this.firstChild.data;
			const { id, symbol, color, tip } = this.dataset;
			this.channel.postMessage({ ...data, text, id, symbol, color, tip });
		}
		setLabel() {
			const label = ['tip', 'color', 'symbol'].flatMap((data) =>
				this.dataset[data] ? [this.dataset[data], data] : []
			);
			label.unshift(`annotation ${this.firstChild.data} with`);
			this.setAttribute('aria-label', `${label.join(' ')}.`);
			this.sendMessage();
		}
		getId() {
			if (this.dataset.id) return;
			this.dataset.id =
				'_' +
				`${Date.now()}`.slice(-5) +
				((Math.random() * 36) | 0).toString(36);
			this.setAttribute('aria-describedby', `${this.dataset.id}-dd`);
		}
		getDefaults() {
			return {
				left: visualViewport.width / 2 + window.scrollX,
				top: visualViewport.height / 2 + window.scrollY,
				width: 100,
			};
		}
		getStyle() {
			const pad3 = ' '.repeat(12);
			const pad4 = ' '.repeat(16);
			return `
            :host {
                --fill-blue: #005e88;
                --fill-green: #34641c;
                --fill-purple: #702cd2;
                --stroke: #fff;
                --font: #fff;

                ${this.eTips
									.map((tip) => `--tip-${tip}-display: none;`)
									.join(`\n${pad4}`)}
                ${this.eSymbols
									.map((symbol) => `--symbol-${symbol}-display: none;`)
									.join(`\n${pad4}`)}

                --object-padding-top: 1px;
                --content-transform: unset;
                --content-font-family: monospace;
                --content-width: 6px;
                --box-display: inline;
                --symbol-ring2-display: none;
                cursor: grab;
                position: absolute;
                z-index: 2147483647;
                filter: drop-shadow(rgba(50, 50, 0, 0.5) -1px 6px 3px);
                opacity: 0.9;
                outline: none !important;
                font-size: 3px;
            }
            ${this.eColors
							.map((color) => {
								// Sets the --fill to --fill-<selected color>
								return [
									`:host([data-color="${color}"]) {`,
									`${pad4}--fill: var(--fill-${color});`,
									`${pad3}}`,
								].join('\n');
							})
							.join(`\n${pad3}`)}

            ${this.eTips
							.map((tip) => {
								// Set the --tip-<selected tip>-display
								return [
									`:host([data-tip="${tip}"]) {`,
									`${pad4}--tip-${tip}-display: inline;`,
									`${pad3}}`,
								].join('\n');
							})
							.join(`\n${pad3}`)}

            ${this.eTips
							.map((tip) => {
								// Set fill and display by tip
								return [
									`#tip-${tip} {`,
									`${pad4}fill: var(--fill);`,
									`${pad4}display: var(--tip-${tip}-display);`,
									`${pad4}stroke: var(--fill);`,
									`${pad4}stroke-width: ${tip === 'callout' ? 0 : 0.1};`,
									`${pad3}}`,
								].join('\n');
							})
							.join(`\n${pad3}`)}

            ${this.eSymbols
							.map((symbol) => {
								// Set --symbol-<selected symbol>-display
								return [
									`:host([data-symbol="${symbol}"]) {`,
									`${pad4}--symbol-${symbol}-display: inline;`,
									`${pad3}--content-transform: ${
										symbol.startsWith('arrow-')
											? 'scale(.6) translate(5.5px, 0)'
											: symbol === 'tab-arrow'
											? 'translate(0, -1px)'
											: 'unset'
									};`,
									`${pad3}}`,
								].join('\n');
							})
							.join(`\n${pad3}`)} 

            ${this.eSymbols
							.map((symbol) => {
								// Set --symbol-<selected symbol>-display
								return [
									`#symbol-${symbol} {`,
									`${pad4}display: var(--symbol-${symbol}-display);`,
									`${pad4}stroke: var(--stroke);`,
									`${pad4}stroke-width: 0.3px;`,
									`${pad4}fill: var(--stroke);`,
									`${pad3}}`,
								].join('\n');
							})
							.join(`\n${pad3}`)} 

            #symbol-ring, #symbol-ring2 {
                fill: transparent;
                stroke: var(--stroke);
                stroke-width: 0.2;
                transform: scale(0.9) translate(5%, 5%);
                width: var(--content-width);
            }
            #symbol-ring2 {
                display: var(--symbol-ring2-display);
            }

            ${Array.from(Array(14), (_, i) => {
							return [
								`:host([data-width="${i + 7}"]) {`,
								`${pad4}--content-width: ${i + 7}px;`,
								`${pad3}}`,
							].join('\n');
						}).join(`\n${pad3}`)}

            :host([data-font="sans-serif"]) {
                --content-font-family: sans-serif;
            }

            /* overrides */
            :host([data-symbol="arrow-any"]) {
                --symbol-arrow-horizontal-display: inline;
                --symbol-arrow-vertical-display: inline;
            }
            #tip-circle {
                width: var(--content-width);
            }
            :host([data-tip="circle"]) {
                --box-display: none;
            }
            :host([data-tip="circle"][data-symbol="ring"]) {
                --symbol-ring-display: none;
                --symbol-ring2-display: inline;
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            :host(.grabbed) {
                cursor: grabbing;
                filter: drop-shadow(rgba(50, 50, 0, 0.5) -1px 15px 10px);
                transform: scale(1.05);
            }
            :host(.resize) {
                cursor: nwse-resize;
			}
			:host(:focus) {
				animation: pulse 0.8s ease;
            }
            :host(.editing) foreignobject {
                color: #000;
                background-color: #fff;
            }
            :host(.editing) foreignobject::after {
                opacity: 1;
			}
            svg {
                overflow: visible;
            }
            #box{
                fill: var(--fill);
                width: var(--content-width);
                display: var(--box-display);
            }
            marker, marker {
                stroke: var(--stroke);
                fill: var(--stroke);
            }
            foreignobject {
                color: var(--font);
                font-family: var(--content-font-family);
                text-align: center;
                user-select: none;
                padding-top: .5px;
                transform: var(--content-transform);
				width: var(--content-width);
				line-height: 1;
            }
            foreignobject::after {
                content: '';
                position: absolute;
                top: 2%;
                left: 2%;
                height: 96%;
                width: 96%;
                opacity: 0;
                box-shadow: 0 0 0 1px #000;
            }`;
		}
		measureText() {
			this.dataset.font = this.firstChild.data.match(/\D/)
				? 'sans-serif'
				: 'monospace';
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			context.font = `3px ${this.dataset.font}`;
			const width = Math.ceil(
				context.measureText(this.firstChild.data).width + 2
			);
			this.dataset.width = Math.max(width, 6);
		}
		updateStyle(style) {
			const { cssText } = this.style;
			const update = Object.keys(style)
				.sort()
				.reduce((str, key) => {
					return (str += `${key}: ${parseFloat(style[key])}px;`);
				}, '');
			if (update === cssText) return;
			this.style.cssText = update;
		}
		getHTML() {
			const domparser = new DOMParser();
			const content = `
			<style>${this.getStyle()}</style>
            <svg viewBox="0 0 8 9" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <marker id="arrow-stop" markerWidth="4" markerHeight="4" refX="0" refY="1" orient="auto" markerUnits="strokeWidth" viewBox="0 0 2 2">
                        <path stroke-width="0" d="M 0 0 L 0 2 L 1.5 1 Z"/>
                        <path stroke-width="1" d="M 2 0 L 2 2 Z" />
                    </marker>
                    <marker id="arrow-right" markerWidth="4" markerHeight="4" refX="0" refY="1" orient="auto" markerUnits="strokeWidth" viewBox="0 0 2 2">
                        <path stroke-width="0" d="M 0 0 L 0 2 L 1.5 1 Z"/>
                    </marker>
                    <marker id="arrow-left" markerWidth="4" markerHeight="4" refX="2" refY="1" orient="auto" markerUnits="strokeWidth" viewBox="0 0 2 2">
                        <path stroke-width="0" d="M 2 0 L 2 2 L 0.5 1 Z"/>
                    </marker>
                </defs>
                <rect id="box" x="1" y="1" height="6" rx="1" ry="1" />
                <path id="tip-top" d="M 3 1 L 4 0 L 5 1 Z" />
                <path id="tip-right" d="M 7 3 L 8 4 L 7 5 Z" />
                <path id="tip-bottom" d="M 5 7 L 4 8 L 3 7 Z" />
                <path id="tip-left" d="M 1 5 L 0 4 L 1 3 Z" />
                <path id="tip-callout" d="M 1.25 6.7 L 4 9 L 4 7 Z"/>
                <rect id="tip-circle" x="1" y="1" height="6" rx="3" ry="3" />
                <rect id="symbol-ring" x="1" y="1" height="6" rx="1" ry="1" />
                <rect id="symbol-ring2" x="1" y="1" height="6" rx="3" ry="3" />
                <line id="symbol-tab-arrow" x1="2" y1="5.5" x2="4.75" y2="5.5" marker-end="url(#arrow-stop)" />
                <line id="symbol-arrow-horizontal" x1="2.5" y1="4" x2="5.5" y2="4" marker-start="url(#arrow-left)" marker-end="url(#arrow-right)" />
                <line id="symbol-arrow-vertical" x1="4" y1="2.5" x2="4" y2="5.5" marker-start="url(#arrow-left)" marker-end="url(#arrow-right)" />
                <foreignobject height="4" x="1" y="2"><slot></slot></foreignobject>
            </svg>`;
			const doc = domparser.parseFromString(content, 'text/html');
			return doc.firstChild;
		}
		cycle(positions, dataProp, event) {
			const currentPosition = positions.indexOf(
				this.dataset[dataProp] || 'none'
			);
			const nextPosition = positions[(currentPosition + 1) % positions.length];
			this.dataset[dataProp] = nextPosition;
			this.handled(event);
		}
		changeTip(event) {
			this.cycle(this.eTips, 'tip', event);
			this.setLabel();
		}
		changeColors(event) {
			this.cycle(this.eColors, 'color', event);
			this.setLabel();
		}
		changeSymbols(event) {
			this.cycle(this.eSymbols, 'symbol', event);
			this.setLabel();
		}
		clone(event) {
			const { symbol = '' } = this.dataset;
			const tag = this.tagName.toLowerCase();
			const n =
				this.firstChild.data.match(/\D/) || symbol.startsWith('arrow-')
					? this.firstChild.data
					: 1 + +this.firstChild.data;
			const data = Object.entries(this.dataset)
				.flatMap(([k, v]) => (k === 'id' ? [] : [`data-${k}="${v}"`]))
				.join(' ');
			const clone = `<${tag} style="${this.style.cssText}" ${data}>${n}</${tag}>`;
			this.insertAdjacentHTML('afterend', clone);
			this.nextSibling.focus();
			this.handled(event);
		}
		toggleEditMode(event) {
			this.classList.toggle('editing');
			this.handled(event);
		}
		delete(event) {
			this.remove();
			this.handled(event);
		}
		handleEdit(keyboardEvent) {
			// TODO change to a contenteditable that forwards value?
			const { key } = keyboardEvent;
			if (['Escape', 'Enter'].includes(key)) {
				this.classList.remove('editing');
				this.setLabel();
			}
			if (key === 'Backspace') {
				this.firstChild.data = this.firstChild.data.slice(0, -1);
			}
			if (key.length === 1) {
				this.firstChild.data += key;
			}
			this.measureText();
			this.handled(event);
		}
		handled(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		changeMode(mouseEvent) {
			if (!(mouseEvent instanceof MouseEvent)) return;
			this.classList[mouseEvent.shiftKey ? 'add' : 'remove']('resize');
		}
		updateContent(keyboardEvent) {
			if (!(keyboardEvent instanceof KeyboardEvent)) return;
			const { key, metaKey, shiftKey, ctrlKey } = keyboardEvent;
			if (this.classList.contains('editing')) {
				return this.handleEdit(keyboardEvent);
			}
			let { left, top, width } = this.style;
			switch (key) {
				// keys that will change mode
				case 'Enter':
					return this.toggleEditMode(keyboardEvent);
				// keys that will change host style
				// TODO update after sibling indicies when in edit mode
				case '+':
				case '=':
					width = parseFloat(width) + 5;
					break;
				case '_':
				case '-':
					width = parseFloat(width) - 5;
					break;
				// arrows should move faster with ShiftKey
				case 'ArrowUp':
					top = parseFloat(top) - (shiftKey ? 10 : 1);
					break;
				case 'ArrowDown':
					top = parseFloat(top) + (shiftKey ? 10 : 1);
					break;
				case 'ArrowLeft':
					left = parseFloat(left) - (shiftKey ? 10 : 1);
					break;
				case 'ArrowRight':
					left = parseFloat(left) + (shiftKey ? 10 : 1);
					break;
				// keys that will change dom
				case ' ':
					if (ctrlKey && shiftKey) return this.changeSymbols(keyboardEvent);
					if (shiftKey) return this.changeColors(keyboardEvent);
					return this.changeTip(keyboardEvent);
				case 'Backspace':
					return this.delete(keyboardEvent);
				case 'v':
					if (metaKey || ctrlKey) return this.clone(keyboardEvent);
				default:
					// allow default and bubble
					return;
			}
			this.updateStyle({ left, top, width });
			this.handled(keyboardEvent);
		}
		drag(mouseEvent) {
			this.changeMode(mouseEvent);
			if (!this.classList.contains('grabbed')) return;
			const { left, top, width } = this.style;
			if (this.classList.contains('resize')) {
				const { movementX, movementY } = mouseEvent;
				return this.updateStyle({
					left,
					top,
					width: parseFloat(width) + movementX + movementY,
				});
			}
			const { clientX, clientY } = mouseEvent;
			this.updateStyle({
				left: clientX - this.offsetWidth / 2 + window.scrollX,
				top: clientY - this.offsetHeight / 2 + window.scrollY,
				width,
			});
		}
		startDrag() {
			const { endDrag, drag, options } = this.listeners;
			this.classList.add('grabbed');
			// it's easy to move the mouse outside of its box model (especially when small)
			// adding events to the document should remove unintented ending drag with mouse
			// we only have one object being dragged at a time and we always clean up these events
			this.ownerDocument.addEventListener('mouseup', endDrag, options);
			this.ownerDocument.addEventListener('mousemove', drag, options);
		}
		endDrag() {
			const { endDrag, drag, options } = this.listeners;
			this.classList.remove('grabbed');
			this.ownerDocument.removeEventListener('mouseup', endDrag, options);
			this.ownerDocument.removeEventListener('mousemove', drag, options);
		}
		isVisible([{ intersectionRatio }]) {
			const isVisible = intersectionRatio === 1;
			this.sendMessage({ isVisible });
		}
		sendAction(keyboardEvent) {
			if (!(keyboardEvent instanceof KeyboardEvent)) return;
			const { key, shiftKey, ctrlKey } = keyboardEvent;
			if (!ctrlKey || !shiftKey) return;
			let action;
			switch (key.toLowerCase()) {
				case 's':
					action = 'save';
					break;
				case 'l':
					action = 'legend';
					break;
				default:
					return;
			}
			this.busChannel.postMessage({ action });
		}
		createObserver() {
			const options = {
				root: null,
				rootMargin: '0px',
				threshold: 1,
			};
			const observer = new IntersectionObserver(
				this.listeners.isVisible,
				options
			);
			observer.observe(this);
		}
		connectedCallback() {
			this.getId();
			this.setAttribute('role', 'img');
			this.dataset.color = this.dataset.color || this.eColors[0];
			this.measureText();
			var html = this.getHTML();
			this.attachShadow({ mode: 'open' }).appendChild(html);
			if (!this.style.cssText) {
				this.updateStyle(this.getDefaults());
			}
			this.tabIndex = 0;
			const options = { capture: true };
			const changeMode = this.changeMode.bind(this);
			const updateContent = this.updateContent.bind(this);
			const startDrag = this.startDrag.bind(this);
			const drag = this.drag.bind(this);
			const endDrag = this.endDrag.bind(this);
			const isVisible = this.isVisible.bind(this);
			const sendAction = this.sendAction.bind(this);
			this.listeners = {
				options,
				changeMode,
				updateContent,
				startDrag,
				drag,
				endDrag,
				isVisible,
				sendAction,
			};
			this.addEventListener('mousedown', changeMode, options);
			this.addEventListener('mousedown', startDrag, options);
			this.addEventListener('mouseenter', changeMode, options);
			this.addEventListener('touchstart', startDrag, options);
			this.addEventListener('touchmove', drag, options);
			this.addEventListener('touchend', endDrag, options);
			this.addEventListener('touchleave', endDrag, options);
			this.addEventListener('touchcancel', endDrag, options);
			this.addEventListener('keydown', changeMode, options);
			this.addEventListener('keydown', updateContent, options);
			this.addEventListener('keyup', sendAction, options);

			this.channel = new BroadcastChannel('a11y-annotation');
			// communicate with content script
			this.busChannel = new BroadcastChannel('a11y-annotations-bus');
			this.createObserver();
			this.setLabel({ isVisible: true });
		}
	}
	if (!customElements.get('a11y-annotation')) {
		customElements.define('a11y-annotation', A11yAnnotation);
	}
	if (!document.querySelector('a11y-annotation')) {
		document.body.insertAdjacentHTML(
			'afterend',
			'<a11y-annotation>1</a11y-annotation>'
		);
	}
	const el = document.querySelector('a11y-annotation');
	el.scrollIntoView({ block: 'center' });
	el.focus();
})();
