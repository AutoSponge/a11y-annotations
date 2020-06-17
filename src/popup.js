document.addEventListener('DOMContentLoaded', async () => {
	const start = document.getElementById('start');
	const startSrc = chrome.runtime.getURL('a11y-annotation.js');

	const legend = document.getElementById('legend');
	const legendSrc = chrome.runtime.getURL('a11y-legend.js');

	const save = document.getElementById('save');
	const saveSrc = chrome.runtime.getURL('save.js');

	const load = document.getElementById('load');
	const loadSrc = chrome.runtime.getURL('load.js');

	const clear = document.getElementById('clear');
	const clearSrc = chrome.runtime.getURL('clear.js');

	const state = await new Promise((resolve) => {
		chrome.runtime.onMessage.addListener((message, sender) => {
			if (sender.id !== chrome.runtime.id) return;
			resolve(message);
		});
		const stateSrc = chrome.runtime.getURL('state.js');
		injectScript(stateSrc)();
	});

	start.dataset.started = state.started && state.legend;
	legend.setAttribute('aria-checked', state.legend ? !state.hidden : false);

	start.addEventListener('click', injectScript(startSrc, legendSrc));
	save.addEventListener('click', injectScript(saveSrc));
	load.addEventListener(
		'click',
		injectScript(startSrc, clearSrc, loadSrc, legendSrc)
	);
	clear.addEventListener('click', injectScript(clearSrc));

	legend.addEventListener('click', () => {
		const state = legend.getAttribute('aria-checked') === 'true';
		legend.setAttribute('aria-checked', !state);
		chrome.tabs.executeScript({
			code: `(function (el) {
				if (!el) return;
				el.hidden = !el.hidden;
				if (!el.hidden) {
					el.scrollIntoView({ block: 'center' });
					el.focus();
				}
			}(document.querySelector('a11y-legend')))`,
		});
	});
});

if (navigator.platform.startsWith('Mac')) {
	document.body.classList.add('os-mac');
}

if (navigator.platform.startsWith('Win')) {
	document.body.classList.add('os-win');
}

function injectScript(...sources) {
	return function () {
		if (['start', 'load'].includes(this.id)) {
			start.dataset.started = true;
		}
		if (this.id === 'clear') {
			start.dataset.started = false;
			legend.setAttribute('aria-checked', 'false');
		}
		sources.forEach((src) => {
			const code = `(function () {
				var script = document.createElement('script');
				script.src = '${src}';
				script.onload=function () {this.parentElement.removeChild(this)};
				document.body.appendChild(script);
			}());`;
			chrome.tabs.executeScript({ code });
		});
	};
}
