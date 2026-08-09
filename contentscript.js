'use strict';

(() => {
	const SPEEDS = ['0.5', '0.75', '1', '1.1', '1.2', '1.5', '2'];
	const PLAYER_ID = 'wolplayer';
	const STORAGE_KEY = 'speed';
	const COLLAPSIBLE_SELECTOR = '.group.index.collapsible';

	// Events after which MediaElement.js may have reset playbackRate.
	const RATE_EVENTS = [
		'loadedmetadata', 'canplay', 'play', 'playing',
		'durationchange', 'emptied', 'ratechange'
	];

	let currentSpeed = 1;
	let selector = null;

	// ---------- UI ----------

	function buildUI() {
		if (document.getElementById('speedControlContainer')) return;

		const container = document.createElement('div');
		container.id = 'speedControlContainer';
		container.style.cssText =
			'position: fixed; bottom: 20px; right: 20px; z-index: 10000;';

		selector = document.createElement('select');
		selector.id = 'speedSelector';

		for (const speed of SPEEDS) {
			const option = document.createElement('option');
			option.value = speed;
			option.textContent = `${speed}x`;
			selector.appendChild(option);
		}

		selector.value = String(currentSpeed);
		selector.addEventListener('change', onUserChange);

		container.appendChild(selector);
		document.body.appendChild(container);
	}

	function onUserChange() {
		currentSpeed = parseFloat(selector.value);
		browser.storage.local.set({ [STORAGE_KEY]: selector.value });
		applySpeed();
	}

	// ---------- playback rate ----------

	function applySpeed() {
		const player = document.getElementById(PLAYER_ID);
		if (!player) return;

		if (player.playbackRate !== currentSpeed) {
			player.playbackRate = currentSpeed;
		}
		guard(player);
	}

	// Re-assert our rate whenever the player fires an event that might
	// have clobbered it. The equality check stops ratechange recursing.
	function guard(player) {
		if (player.dataset.wolSpeedGuarded) return;
		player.dataset.wolSpeedGuarded = '1';

		for (const event of RATE_EVENTS) {
			player.addEventListener(event, () => {
				if (player.playbackRate !== currentSpeed) {
					player.playbackRate = currentSpeed;
				}
			});
		}
	}

	// ---------- collapsibles ----------

	// Expand each section once only, so a section you deliberately
	// re-collapse stays collapsed.
	function expandCollapsibles() {
		for (const el of document.querySelectorAll(COLLAPSIBLE_SELECTOR)) {
			if (el.dataset.wolExpanded) continue;
			el.dataset.wolExpanded = '1';
			el.classList.remove('collapsed');
		}
	}

	// ---------- observer ----------

	let queued = false;

	function schedule() {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			applySpeed();
			expandCollapsibles();
		});
	}

	// childList only: our own class and dataset writes are attribute
	// changes, so they can't retrigger this and loop.
	const observer = new MutationObserver(schedule);

	// ---------- init ----------

	async function init() {
		const stored = await browser.storage.local.get(STORAGE_KEY);
		currentSpeed = parseFloat(stored[STORAGE_KEY]) || 1;

		buildUI();
		applySpeed();
		expandCollapsibles();

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true
		});

		// Keep other open WOL tabs in sync.
		browser.storage.onChanged.addListener((changes, area) => {
			if (area !== 'local' || !changes[STORAGE_KEY]) return;

			const next = parseFloat(changes[STORAGE_KEY].newValue);
			if (!next || next === currentSpeed) return;

			currentSpeed = next;
			if (selector) selector.value = String(next);
			applySpeed();
		});
	}

	init();
})();
