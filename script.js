// DOM REFERENCES
const timerDisplay = document.querySelector('.timer-display');
const sessionForm = document.querySelector('.session-form');
const sessionInput = document.querySelector('.session-input');
const startSessionButton = document.querySelector('.start-timer');
const resetSessionButton = document.querySelector('.reset-timer');
const completedSessionSound = document.querySelector('.completed-session-sound')


// VARIABLES
let chosenTimerCount = null;
let timeInSeconds;
let hasOneMinutePassed = 0;
let interval;


// FUNCTIONS
startSessionButton.addEventListener('click', timer);
function timer(e) {
  e.preventDefault();
  
  e.currentTarget.dataset.started =
    e.currentTarget.dataset.started === 'false'? true : false;
  
  if (chosenTimerCount === null) {
    chosenTimerCount = sessionInput.value;
    timeInSeconds = chosenTimerCount * 60;
    
    if (e.currentTarget.dataset.started === 'true') {
      interval = setInterval(count, 400);
    }
    else {
      clearInterval(interval);
    }
    
  } else {
    if (e.currentTarget.dataset.started === 'true') {
      interval = setInterval(count, 400);
    } else {
      clearInterval(interval);
    }
  }

  function count() {
    timeInSeconds--;
    console.log(timeInSeconds);
    hasOneMinutePassed++;
    timerDisplay.innerText = `${chosenTimerCount} min`;

    if (hasOneMinutePassed > 59) {
      hasOneMinutePassed = 0;
      chosenTimerCount--;
    }

    if (timeInSeconds < 60) {
      timerDisplay.innerText = `${timeInSeconds} sec`;
    }

    if (timeInSeconds < 1) {
      completedSessionSound.currentTime = 0;
      completedSessionSound.play();
      clearInterval(interval);
    }  
  }
}


resetSessionButton.addEventListener('click', resetTimer)
function resetTimer(e) {
  e.preventDefault();
  clearInterval(interval);
  timerDisplay.innerText = `${sessionInput.value} min`;
  chosenTimerCount = null;
  startSessionButton.dataset.started = false;
}