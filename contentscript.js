// Inject speed control UI
const speedControlUI = document.createElement('div');
speedControlUI.innerHTML = `
	<div id="speedControlContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000;">
		<select id="speedSelector">
			<option value="0.5">0.5x</option>
			<option value="0.75">0.75x</option>
			<option value="1" selected>1x</option>
			<option value="1.1">1.1x</option>
			<option value="1.2">1.2x</option>
			<option value="1.5">1.5x</option>
			<option value="2">2x</option>
		</select>
	</div>`;
document.body.appendChild(speedControlUI);

function applySavedSpeed() {
	// Fetch the saved speed setting and apply it
	chrome.storage.local.get('speed', function(data) {
		if (data.speed && document.getElementById('wolplayer')) {
			changePlaybackSpeed(data.speed);
		} else {
			// If the audio player isn't ready, wait for it
			document.getElementById('wolplayer').addEventListener('loadedmetadata', () => {
				changePlaybackSpeed(data.speed);
			});
		}
	});
}

function changePlaybackSpeed(speed) {
	const audioPlayer = document.getElementById('wolplayer');
	if (audioPlayer) {
		audioPlayer.playbackRate = parseFloat(speed);
		// Update the UI to reflect the current speed
		document.getElementById('speedSelector').value = speed;
	}
}

// Set the speed when the script is executed and when the audio player is ready
applySavedSpeed();

// Save speed choice and apply
document.getElementById('speedSelector').addEventListener('change', function() {
	const newSpeed = this.value;
	chrome.storage.local.set({'speed': newSpeed}, function() {
		changePlaybackSpeed(newSpeed);
	});
});

// Expand all collapsible content
const collapsibles = document.querySelectorAll('.group.index.collapsible');
collapsibles.forEach(collapsible => {
	collapsible.classList.remove('collapsed');
});