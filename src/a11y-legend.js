(function () {
	class A11yLegend extends HTMLElement {
		getHTML() {
			const domparser = new DOMParser();
			const content = `
            <style>
            :host {
                border: 2px solid black;
                cursor: grab;
                position: fixed;
                background: #fff;
                overflow: hidden;
				min-width: 145px;
				filter: drop-shadow(rgba(50, 50, 0, 0.5) -1px 6px 3px);
                z-index: 2147483647;
            }
            :host(.resize) {
                cursor: nwse-resize;
			}
			h1 {
				user-select: none;
				font-size: 24px !important;
				font-family: system !important;
			}
            dl {
                display: flex;
                flex-flow: row wrap;
            }
            ::slotted(dt) {
                flex-basis: 20% !important;
                text-align: right !important;
                padding: 2px 4px !important;
				margin: 0 !important;
				font-size: 16px !important;
				line-height: 1.5 !important;
				font-family: system !important;
            }
            ::slotted(dd) {
                flex-basis: 70% !important;
                flex-grow: 1 !important;
                padding: 2px 4px !important;
				margin: 0 !important;
				font-size: 16px !important;
				line-height: 1.5 !important;
				font-family: system !important;
            }
            ::slotted(dt[data-tip])::before {
                content: '▾' / '';
				margin-right: 3px;
            }
            ::slotted(dt[data-tip="none"])::before {
                content: '■' / '';
            }
            ::slotted(dt[data-tip="circle"])::before {
                content: '●' / '';
            }
            ::slotted(dt[data-color="blue"])::before {
                color: #005e88;
            }
            ::slotted(dt[data-color="green"])::before {
                color: #34641c;
            }
            ::slotted(dt[data-color="purple"])::before {
                color: #702cd2;
            }
            </style>
            <article>
                <h1>Annotations</h1>
                <dl role="status"><slot></slot></dl>
            </article>`;
			const doc = domparser.parseFromString(content, 'text/html');
			return doc.firstChild;
		}
		getDefaults() {
			return {
				right: 0,
				bottom: 0,
				width: 200,
			};
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
		handled(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		changeMode(mouseEvent) {
			this.classList[mouseEvent.shiftKey ? 'add' : 'remove']('resize');
		}
		updateContent(keyboardEvent) {
			if (!(keyboardEvent instanceof KeyboardEvent)) return;
			const { key, shiftKey, target } = keyboardEvent;
			if (this.classList.contains('editing')) {
				return this.handleEdit(keyboardEvent);
			}
			let { right, bottom, width } = this.style;
			switch (key) {
				// keys that will change host style
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
					if (target !== this) return;
					bottom = parseFloat(bottom) + (shiftKey ? 10 : 1);
					break;
				case 'ArrowDown':
					if (target !== this) return;
					bottom = Math.max(parseFloat(bottom) - (shiftKey ? 10 : 1), 0);
					break;
				case 'ArrowLeft':
					if (target !== this) return;
					right = parseFloat(right) + (shiftKey ? 10 : 1);
					break;
				case 'ArrowRight':
					if (target !== this) return;
					right = Math.max(parseFloat(right) - (shiftKey ? 10 : 1), 0);
					break;
				default:
					// allow default and bubble
					return;
			}
			this.updateStyle({ bottom, right, width });
			this.handled(keyboardEvent);
		}
		drag(mouseEvent) {
			this.changeMode(mouseEvent);
			if (!this.classList.contains('grabbed')) return;
			const { right, bottom, width } = this.style;
			if (this.classList.contains('resize')) {
				const { movementX, movementY } = mouseEvent;
				return this.updateStyle({
					right,
					bottom,
					width: parseFloat(width) + movementX + movementY,
				});
			}
			let { x, y } = mouseEvent;
			if (this.dataset.handleX) {
				x -= this.dataset.handleX;
				y -= this.dataset.handleY;
			}
			const {
				width: viewportWidth,
				height: viewportHeight,
			} = window.visualViewport;
			this.updateStyle({
				right: Math.max(viewportWidth - (x + this.offsetWidth), 0),
				bottom: Math.max(viewportHeight - (y + this.offsetHeight), 0),
				width,
			});
		}
		startDrag(mouseEvent) {
			const { endDrag, drag, options } = this.listeners;
			this.classList.add('grabbed');
			const { left, top } = this.getBoundingClientRect();
			const { x, y } = mouseEvent;
			this.dataset.handleX = x - left;
			this.dataset.handleY = y - top;
			// it's easy to move the mouse outside of its box model (especially when small)
			// adding events to the document should remove unintented ending drag with mouse
			// we only have one object being dragged at a time and we always clean up these events
			this.ownerDocument.addEventListener('mouseup', endDrag, options);
			this.ownerDocument.addEventListener('mousemove', drag, options);
		}
		endDrag() {
			const { endDrag, drag, options } = this.listeners;
			this.classList.remove('grabbed');
			delete this.dataset.handleX;
			delete this.dataset.handleY;
			this.ownerDocument.removeEventListener('mouseup', endDrag, options);
			this.ownerDocument.removeEventListener('mousemove', drag, options);
		}
		handleMessage({ data }) {
			const {
				text,
				id,
				color,
				tip = 'none',
				symbol = '',
				isVisible = true,
			} = data;
			const dt = this.querySelector(`#${id}-dt`);
			const dd = this.querySelector(`#${id}-dd`);
			const numeric = text.match(/^\d+$/);
			const arrow = symbol.includes('arrow');
			const hidden = !isVisible || !numeric || arrow;
			if (dt && dd) {
				dt.hidden = hidden;
				dd.hidden = hidden;
				dt.innerText = text;
				Object.assign(dt.dataset, { color, tip });
			} else {
				if (hidden) return;
				this.insertAdjacentHTML(
					'beforeend',
					`<dt id="${id}-dt" data-color="${color}" data-tip="${tip}">${text}</dt>` +
						`<dd id="${id}-dd" contenteditable="true">comment</dd>`
				);
			}
			// resort numeric keys
			const dts = Array.from(this.children).filter((el) =>
				el.matches('[id$="-dt"')
			);
			dts.sort((a, b) => Number(a.firstChild.data) - Number(b.firstChild.data));
			dts.forEach((dt) => {
				this.appendChild(dt);
				this.appendChild(
					this.querySelector(`[id="${dt.id.replace(/-dt$/, '-dd')}"]`)
				);
			});
		}
		connectedCallback() {
			const html = this.getHTML();
			this.attachShadow({ mode: 'open' }).appendChild(html);
			if (!this.style.cssText) {
				this.updateStyle(this.getDefaults());
			}
			this.tabIndex = 0;
			const options = { capture: true };
			const updateContent = this.updateContent.bind(this);
			const startDrag = this.startDrag.bind(this);
			const drag = this.drag.bind(this);
			const endDrag = this.endDrag.bind(this);
			const changeMode = this.changeMode.bind(this);
			const handleMessage = this.handleMessage.bind(this);
			this.listeners = {
				options,
				changeMode,
				updateContent,
				startDrag,
				drag,
				endDrag,
				handleMessage,
			};
			this.addEventListener('mousedown', startDrag, options);
			this.addEventListener('mouseenter', changeMode, options);
			this.addEventListener('touchstart', startDrag, options);
			this.addEventListener('touchmove', drag, options);
			this.addEventListener('touchend', endDrag, options);
			this.addEventListener('touchleave', endDrag, options);
			this.addEventListener('touchcancel', endDrag, options);
			this.addEventListener('keydown', changeMode, options);
			this.addEventListener('keyup', changeMode, options);
			this.addEventListener('keydown', updateContent, options);

			// handle communications from a11y-annotations
			this.channel = new BroadcastChannel('a11y-annotation');
			this.channel.onmessage = handleMessage;
		}
	}
	if (!customElements.get('a11y-legend')) {
		customElements.define('a11y-legend', A11yLegend);
	}
	if (!document.querySelector('a11y-legend')) {
		document.lastElementChild.insertAdjacentHTML(
			'beforeend',
			'<a11y-legend hidden></a11y-legend>'
		);
	}
	const el = document.querySelector('a11y-legend');
	el.hidden = true;
})();
