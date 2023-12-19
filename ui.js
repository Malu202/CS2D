let progressBar = document.getElementById("progressBar");
let statusOutput = document.getElementById("statusOutput");
let matchHistoryButton = document.getElementById("matchHistoryButton");
let loadMatchButton = document.getElementById("loadMatchButton");
let matchHistoryUrlInput = document.getElementById("matchHistoryUrlInput");
let input = document.getElementById("demoInput");
let roundTickMarks = document.getElementById("roundTicks");

const proxyUrl = "https://proxy.aschwm.workers.dev/?apiurl=";



let resultTicks;
let currentTick = 1 * 64 + 1;
let allEvents;
let roundStartEvents;
let roundEndEvents;
let roundsTotal;


function setStatus(status, progress) {
    if (progress) {
        statusOutput.innerText = status + " (" + progress + "%)";
        document.title = "CS2D " + status + " " + progress + '%';
    } else {
        statusOutput.innerText = status + "...";
        document.title = "CS2D " + status + "...";
    }
    document.body.style.cursor = "progress";
}
function clearStatus() {
    statusOutput.innerText = "done!"
    document.title = "CS2D";
    document.body.style.cursor = "";
}


matchHistoryButton.addEventListener("click", function () {
    window.open("https://steamcommunity.com/my/gcpd/730?tab=matchhistorypremier", "_blank");
});

function firstParsedTick() {
    return resultTicks.get("tick")[0];
}
function lastParsedTick() {
    return resultTicks.get("tick")[resultTicks.get("tick").length - 1];
}

document.addEventListener('keypress', (event) => {
    let timestep = 64;
    if (event.shiftKey) timestep = 16;
    if (event.code == "KeyL") currentTick += timestep;
    if (event.code == "KeyJ") currentTick -= timestep;

    let lastTick = lastParsedTick();
    if (currentTick > lastTick) currentTick = lastTick;
    let firstTick = firstParsedTick();
    if (currentTick < firstTick) currentTick = firstTick;
    drawFrame(currentTick, resultTicks);
}, false);


progressBar.addEventListener("input", function (event) {
    if (!resultTicks) return;
    let firstTick = firstParsedTick();
    currentTick = Math.round((progressBar.value / 100) * (lastParsedTick() - firstTick) + 1) + firstTick;
    drawFrame(currentTick, resultTicks);
});



input.addEventListener("change", async function (evt) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const uint8Array = new Uint8Array(event.target.result);
        parseDemo(uint8Array);
    };
    setStatus("loading demo");
    drawHtmlThenContinueWith(() => reader.readAsArrayBuffer(evt.target.files[0]));
});

function addRoundTicks(events) {
    roundTickMarks.innerHTML = "";
    for (let i = 0; i < events.length; i++) {
        let option = document.createElement("option");
        option.value = 100 * events[i].get("tick") / lastParsedTick();
        roundTickMarks.appendChild(option);
    }
}