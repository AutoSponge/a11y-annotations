(function () {
	const annotations = document.querySelectorAll('a11y-annotation');
	if (annotations.length) {
		annotations.forEach((el) => el.parentElement.removeChild(el));
	}
	const legend = document.querySelector('a11y-legend');
	if (legend) {
		legend.parentElement.removeChild(legend);
	}
})();
