var theme = (function() {
	var STORAGE_KEY = 'theme';
	var PREFS = { system: true, light: true, dark: true };
	var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
	var listeners = [];

	function normalizePref(pref) {
		return PREFS[pref] ? pref : 'system';
	}

	function getPreference() {
		try {
			return normalizePref(window.localStorage.getItem(STORAGE_KEY));
		} catch (e) {
			return 'system';
		}
	}

	function resolve(pref) {
		pref = normalizePref(pref);
		if (pref === 'light' || pref === 'dark') {
			return pref;
		}
		return (mediaQuery && mediaQuery.matches) ? 'dark' : 'light';
	}

	function apply(pref) {
		pref = normalizePref(pref);
		var resolved = resolve(pref);
		document.documentElement.setAttribute('data-theme', resolved);
		document.documentElement.setAttribute('data-theme-pref', pref);
		return resolved;
	}

	function setPreference(pref) {
		pref = normalizePref(pref);
		try {
			window.localStorage.setItem(STORAGE_KEY, pref);
		} catch (e) {}
		var resolved = apply(pref);
		for (var i = 0; i < listeners.length; i++) {
			listeners[i](pref, resolved);
		}
		return resolved;
	}

	function onChange(callback) {
		listeners.push(callback);
	}

	function handleSystemChange() {
		if (getPreference() === 'system') {
			apply('system');
			for (var i = 0; i < listeners.length; i++) {
				listeners[i]('system', resolve('system'));
			}
		}
	}

	apply(getPreference());

	if (mediaQuery) {
		if (typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', handleSystemChange);
		} else if (typeof mediaQuery.addListener === 'function') {
			mediaQuery.addListener(handleSystemChange);
		}
	}

	return {
		getPreference: getPreference,
		setPreference: setPreference,
		resolve: resolve,
		apply: apply,
		onChange: onChange
	};
})();
