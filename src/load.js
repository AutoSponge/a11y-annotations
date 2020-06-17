(function () {
	const revive = [
		['a11y-annotation', /\$aa/gm],
		['a11y-legend', /\$al/gm],
		[' contenteditable="true" ', /\$ce/gm],
	];
	let payload = localStorage.getItem('a11y-annotation');
	if (!payload) return;
	revive.forEach(([r, f]) => (payload = payload.replace(f, r)));
	document.body.insertAdjacentHTML('afterend', payload);
})();
