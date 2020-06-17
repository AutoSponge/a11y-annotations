(function () {
	const replace = [
		['a11y-annotation', '$aa'],
		['a11y-legend', '$al'],
		[/\s?contenteditable="true"\s?/gm, '$ce'],
		[/\s?role="img"\s?/gm, ' '],
		[/\s?tabindex="0"\s?/gm, ' '],
		[/\s?data-font="monospace"\s?/gm, ' '],
		[/\s?class="\s?/gm, ' '],
		[/\s?aria-label="[^"]+"\s?/gm, ' '],
	];
	const annotations = document.querySelectorAll('a11y-annotation');
	const legend = document.querySelector('a11y-legend');
	if (!annotations.length) return;
	let payload = '';
	payload += Array.from(annotations, (el) => el.outerHTML).join('');
	if (legend) payload += legend.outerHTML;
	replace.forEach(([f, r]) => (payload = payload.replace(f, r)));
	localStorage.setItem('a11y-annotation', payload);
})();
