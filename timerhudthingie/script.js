class HUD {
    constructor(strikes, modules, minutes, seconds) {
        this.totalStrikes = +strikes;
        this.totalModules = +modules;
        this.strikes = 0;
        this.modulesSolved = 0;
        this.minutes = +minutes;
        this.seconds = +seconds;
        this.startingTime = this.currentTimeInSeconds();
        this.rate = 1;
        this.pace = 0;
        this.timer = null;
    }
    wrapTimer() {
        if (this.seconds < 0)
        {
            this.seconds = 59;
            this.minutes -= 1;
        }
    }
    printTimer() {
        document.querySelector("#minutes").value = (this.minutes+"").padStart(2, '0');
        document.querySelector("#seconds").value = (this.seconds+"").padStart(2, '0');
    }
    updateTimer() {
        this.wrapTimer();
        this.printTimer();
    }
    startTimer() {
        this.timer = setInterval(() => {
            this.seconds -= 1;
            this.updateTimer();
            updatePaceMeter();
            if (!this.currentTimeInSeconds()) this.stopTimer();
        }, 1000*(2-this.rate));
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    currentTimeInSeconds() {
        return this.minutes*60+this.seconds;
    }
    calculatePace() {
        return this.modulesSolved / this.totalModules - (this.startingTime - this.currentTimeInSeconds() / this.rate) / this.startingTime;
    }
}

function generateHUD() {
    hud = new HUD(...Array.from(document.querySelectorAll("input")).map(i => i.value));
}

function updatePaceMeter() {
    document.querySelector("#pace").textContent = Math.round(hud.calculatePace()*100);
}

function putTempMessage(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2000);
}

let hud = null;

const areAllInputsFilled = () => Array.from(document.querySelectorAll("input")).every(i => i.value);
const areAllNumbers = () => Array.from(document.querySelectorAll("input")).every(i => !Number.isNaN(+i.value));

document.querySelector("#bStart").addEventListener("click", () => {
    if (hud) return;
    console.log(Array.from(document.querySelectorAll("input")).map(i => i.value));
    console.log(Array.from(document.querySelectorAll("input")).map(i => Boolean(i.value)));
    console.log(areAllInputsFilled());
    if (!areAllInputsFilled()) {
        putTempMessage("Not all inputs have been filled!");
        return;
    }
    if (!areAllNumbers()) {
        putTempMessage("Please, put numbers only");
        return;
    }
    generateHUD();
    hud.startTimer();
    hud.updateTimer();
    updatePaceMeter();
});

document.querySelector("#bSolve").addEventListener("click", () => {
    if (!hud) return;
    if (hud.modulesSolved >= hud.totalModules) return;
    hud.modulesSolved++;
    document.querySelector("#solves").textContent = hud.modulesSolved;
    if (hud.modulesSolved === hud.totalModules) hud.stopTimer();
    console.log(hud.modulesSolved, hud.totalModules);
    updatePaceMeter();
});

document.querySelector("#bStrike").addEventListener("click", () => {
    if (!hud) return;
    if (hud.strikes >= hud.totalStrikes) return;
    if (hud.modulesSolved >= hud.totalModules) return;
    hud.strikes++;
    document.querySelector("#strikes").textContent = hud.strikes;
    if (!hud.currentTimeInSeconds()) return;
    if (hud.rate <= 2) {
        hud.rate += 0.25;
        hud.stopTimer();
        hud.startTimer();
    }
    updatePaceMeter();
});

document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", e => {
        if (input.value.length > 2) input.value = input.value.slice(0,2);
        e.preventDefault();
    })
});