const saveSrc = chrome.runtime.getURL('save.js');
const legendSrc = chrome.runtime.getURL('a11y-legend.js');
const channel = new BroadcastChannel('a11y-annotations-bus');
channel.onmessage = function (e) {
	const { data } = e;
	let src;
	switch (data.action) {
		case 'save':
			src = saveSrc;
			break;
		case 'legend':
			console.log('legend');
			const el = document.querySelector('a11y-legend');
			if (!el) {
				src = legendSrc;
				break;
			}
			el.hidden = !el.hidden;
			if (!el.hidden) {
				el.scrollIntoView({ block: 'center' });
				el.focus();
			}
			return;
		default:
			chrome.runtime.sendMessage(data);
			return;
	}
	var script = document.createElement('script');
	script.src = src;
	script.onload = function () {
		this.parentElement.removeChild(this);
	};
	document.body.appendChild(script);
};
