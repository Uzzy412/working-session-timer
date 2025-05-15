// DOM REFERENCES
const timerDisplay = document.querySelector('.timer-display');
const sessionForm = document.querySelector('.session-form');
const sessionInput = document.querySelector('.session-input');
const startSessionButton = document.querySelector('.start-timer');
const resetSessionButton = document.querySelector('.reset-timer');
const completedSessionSound = document.querySelector('.completed-session-sound');
const completedText = document.querySelector('.completed');
const completedYesterdayText = document.querySelector('.previous-progress');
const dailyStreak = document.querySelector('.daily-streak');
const nextDayBtn = document.querySelector('.next-day');


// VARIABLES
let chosenTimerCount = null;
let completedToday = 0;
let timeInSeconds;
let hasOneMinutePassed = 0;
let interval;
let dailyObjective = 10;
let database;



// FUNCTIONS
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('timerDatabase')) {
    console.log('Update database...');
    database = JSON.parse(localStorage.getItem('timerDatabase'));
    isObjectiveCompleted();
    hasDayPassed();
    return;
  }
  console.log('Create database...');
  setDatabase();
});



startSessionButton.addEventListener('click', timer);
function timer(e) {
  e.preventDefault();
  e.currentTarget.dataset.started =
    e.currentTarget.dataset.started === 'false'? true : false;
  
  if (chosenTimerCount === null) {
    chosenTimerCount = sessionInput.value;
    timeInSeconds = chosenTimerCount * 60;
    
    if (e.currentTarget.dataset.started === 'true') {
      interval = setInterval(count, 500);
    }
    else {
      clearInterval(interval);
      displayCompleted(completedToday, completedText, 'Completed');
      keepStreak();
    }
    
  } else {
    if (e.currentTarget.dataset.started === 'true') {
      interval = setInterval(count, 500);
    } else {
      clearInterval(interval);
      displayCompleted(completedToday, completedText, 'Completed');
      keepStreak();
    }
  }
}



function count() {
  const database = JSON.parse(localStorage.getItem('timerDatabase'));
  timeInSeconds--;
  hasOneMinutePassed++;
  completedToday++;

  setDatabase({
    lastSession: database.lastSession,
    completedToday,
    streak: database.streak,
    lastActive: database.lastActive,
    canUpdateStreak: database.canUpdateStreak
  });
  timerDisplay.innerText = `${chosenTimerCount} min`;

  if (hasOneMinutePassed > 59) {
    hasOneMinutePassed = 0;
    chosenTimerCount--;
  }

  if (timeInSeconds < 60) timerDisplay.innerText = `${timeInSeconds} sec`;

  if (timeInSeconds < 1) {
    completedSessionSound.currentTime = 0;
    completedSessionSound.play();
    clearInterval(interval);

    timerDisplay.innerText = `${sessionInput.value} min`;
    chosenTimerCount = null;
    startSessionButton.dataset.started = false;
    displayCompleted(completedToday, completedText, 'Completed');
  } 
}



resetSessionButton.addEventListener('click', resetTimer)
function resetTimer(e) {
  e.preventDefault();
  clearInterval(interval);

  timerDisplay.innerText = `${sessionInput.value} min`;
  chosenTimerCount = null;
  startSessionButton.dataset.started = false;

  keepStreak();
}



function displayCompleted(count, textinner, text) {
  if (count == null || count === 0) {
    textinner.innerText = `${text}: 0`;
    return;
  }
  if (count < 60) {
    textinner.innerText = `${text}: ${count} sec`;
  } else {
    const minutes = count / 60;
    textinner.innerText = `${text}: ${Math.floor(minutes)} min`;
  }
}



function setDatabase({
  lastSession = new Date().toString(), completedToday = 0,
  streak = 0, lastActive = new Date().toString(), canUpdateStreak = true,
  completedYesterday = 0
} = {}) {

  const data = {
    lastSession,
    completedToday,
    completedYesterday,
    streak,
    lastActive,
    canUpdateStreak
  };

  const dataJSON = JSON.stringify(data);
  localStorage.setItem('timerDatabase', dataJSON);
}



function keepStreak() {
  if (localStorage.getItem('timerDatabase')) {
    const database = JSON.parse(localStorage.getItem('timerDatabase'));
    completedToday = database.completedToday;
    let { streak: streakDB } = database;
  
    if (
      completedToday >= dailyObjective &&
      database.canUpdateStreak === true
    ) {
      streakDB++;

      setDatabase({
        completedToday: database.completedToday,
        streak: streakDB,
        canUpdateStreak: false 
      });
      dailyStreak.innerText = `Daily streak: ${streakDB}`;
      return;
    }

    // setDatabase({
    //   completedToday: database.completedToday,
    //   completedYesterday: database.completedYesterday,
    //   streak: streakDB,
    //   canUpdateStreak: true 
    // });
  }
  return;
}



function hasDayPassed() {
  database = JSON.parse(localStorage.getItem('timerDatabase'));
  const today = new Date();
  const lastActive = new Date(database.lastActive);
  
  lastActive.setHours(0);
  lastActive.setMinutes(0);
  const elapsedHours =
    Math.floor((today.getTime() - lastActive.getTime()) / 1000 / 3600);

  if (elapsedHours >= 24) {
    const completedYesterday = database.completedToday;
    const completedToday = database.completedToday;
    setDatabase({ 
      completedYesterday: completedToday,
      streak: database.streak,
    });

    // displayCompleted(completedToday, completedText, 'Completed');
    displayCompleted(completedYesterday, completedYesterdayText, 'Yesterday');
    dailyStreak.innerText = `Daily streak: ${database.streak}`;
    return;
  } 

  completedToday = database.completedToday;
  completedYesterday = database.completedYesterday;
  displayCompleted(completedToday, completedText, 'Completed');
  dailyStreak.innerText = `Daily streak: ${database.streak}`;
}



function isObjectiveCompleted() {
  database = JSON.parse(localStorage.getItem('timerDatabase'));
  const lastActive = new Date();
  lastActive.setHours(0);
  lastActive.setMinutes(0);  
  const currentTime = new Date();

  const elapsedHours =
    Math.floor((currentTime.getTime() - lastActive.getTime()) / 1000 / 3600);

  if (elapsedHours < 24 && database.completedToday < dailyObjective) {
    console.log('You still have time to finish your objective');
    return;
  }

  if (elapsedHours < 24 && database.completedToday >= dailyObjective) {
    console.log('Congratulations! You already finish your objective');
    return;
  }

  if (elapsedHours > 24 && database.completedToday < dailyObjective) {
    console.log('I am reseting your streak... Reason: objective not completed');
    setDatabase({
      streak: 0,
      lastSession: database.lastSession,
      lastActive: database.lastActive,
      completedToday: database.completedToday,
      completedYesterday: database.completedYesterday,
      canUpdateStreak: database.canUpdateStreak
    });
    return;
  }
}




