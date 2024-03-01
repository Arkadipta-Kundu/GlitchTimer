let timer;
let stopwatchTimer;
let currentTime = 0;
let originalTime = 0;
let st = 0;
let isPaused = false;
let hasStarted = false;
let hasCompleted = false;
let audioContext;
let stopwatchTime = 0;
let stopwatchPaused = false;
let stm = 0;
let tstm = 0;

function preloadAudio() {
    const audio = new Audio('sound.mp3');
    audio.preload = 'auto';
    audio.load();
}

function setTimer() {
    const userInput = prompt("Enter time in minutes:");
    const minutes = parseInt(userInput);
    st = minutes;

    if (!isNaN(minutes) && minutes > 0) {
        currentTime = minutes * 60;
        originalTime = currentTime;
        stopwatchTime = 0;
        stopwatchPaused = false;
        updateDisplay();
        startCountdown();
        startStopwatch();
    } else {
        alert("Please enter a valid positive number.");
    }
}

function startCountdown() {
    document.getElementById('logs-container').style.display = 'block';
    if (!hasStarted) {
        document.getElementById('q').style.display = 'none';
        const startTime = new Date().toLocaleTimeString();
        logToScreen(`Timer started at ${startTime}`);
        hasStarted = true;
        preloadAudio();
    }

    clearInterval(timer);
    timer = setInterval(function () {
        if (!isPaused) {
            if (currentTime > 0) {
                currentTime--;
                updateDisplay();
            } else {
                clearInterval(timer);
                currentTime = 0;
                updateDisplay();
                if (!hasCompleted) {
                    playTimerSound();
                    const endTime = new Date().toLocaleTimeString();
                    if (tstm > 60) {
                        const twt = Math.floor(tstm / 60);
                        logToScreen(`Timer completed at ${endTime} for ${st} minutes with total ${twt} minutes of distraction time `);
                    } else {
                        logToScreen(`Timer completed at ${endTime} for ${st} minutes without any distraction`);
                    }
                    hasCompleted = true;
                    alert("Timer completed!");
                    st = 0;
                    tstm = 0;
                }
            }
        }
    }, 1000);
}

function startStopwatch() {
    clearInterval(stopwatchTimer);
    stopwatchTimer = setInterval(function () {
        if (isPaused && !stopwatchPaused) {
            stopwatchTime++;
            updateDisplay();
        }
    }, 1000);
}

function togglePause() {
    if (hasStarted && !hasCompleted) {
        isPaused = !isPaused;
        const timestamp = new Date().toLocaleTimeString();

        if (isPaused) {
            logToScreen(`Distracted at ${timestamp}`);
            if (!stopwatchPaused) {
                startStopwatch();
                document.getElementById('smallTimer').style.color = 'brown';
            }
        } else {
            document.getElementById('smallTimer').style.color = '#070000';
            if (stopwatchTime > 61) {
                logToScreen(`Back to work at ${timestamp} after distracted for ${stm} minutes`);
            } else {
                logToScreen(`Back to work at ${timestamp}`);
            }
            tstm = tstm + stopwatchTime;
            stopwatchTime = 0;
            stm = 0;
        }
    }
}


function restartTimer() {
    const timestamp = new Date().toLocaleTimeString();
    logToScreen(`Timer started at ${timestamp}`);
    hasCompleted = false;
    setTimer();
    startCountdown();
}


function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;

    const stopwatchMinutes = Math.floor(stopwatchTime / 60);
    stm = stopwatchMinutes;
    const stopwatchSeconds = stopwatchTime % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const formattedStopwatch = `${String(stopwatchMinutes).padStart(2, '0')}:${String(stopwatchSeconds).padStart(2, '0')}`;

    document.getElementById('timer').innerText = formattedTime;
    document.getElementById('smallTimer').innerText = formattedStopwatch;

    document.title = `GlitchTimer - ${formattedTime}`;
}

function logToScreen(message) {
    const logsDiv = document.getElementById('logs');
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logsDiv.appendChild(logEntry);
    scrollToBottom();
}

document.addEventListener('keydown', function (e) {
    if (hasStarted && !hasCompleted && (e.key === ' ' || e.key === 'Spacebar')) {
        togglePause();
    } else if (e.key === 'Backspace') {
        if (hasCompleted) {
            restartTimer();
        }
    }
});


function scrollToBottom() {
    var logsContainer = $("#logs-container");
    logsContainer.scrollTop(logsContainer[0].scrollHeight);
}

window.addEventListener('beforeunload', function (e) {
    const confirmationMessage = 'Are you sure you want to leave? Your timer will be lost.';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
});

async function playTimerSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioSource = audioContext.createBufferSource();

    try {
        const response = await fetch('sound.mp3');
        const data = await response.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(data);

        audioSource.buffer = buffer;
        audioSource.connect(audioContext.destination);

        // Play the sound
        audioSource.start(0);

        // Wait for the sound to finish playing before resolving the Promise
        await new Promise(resolve => (audioSource.onended = resolve));
    } catch (error) {
        console.error('Error loading or playing audio:', error);
    } finally {
        // Clean up the audio source after the sound is played
        audioSource.disconnect();
    }
}
