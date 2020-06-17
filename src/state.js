(function () {
	const channel = new BroadcastChannel('a11y-annotations-bus');
	const legendEl = document.querySelector('a11y-legend');
	const legend = !!legendEl;
	const { hidden } = legendEl || {};
	const started = !!customElements.get('a11y-annotation');
	channel.postMessage({ started, legend, hidden });
})();
