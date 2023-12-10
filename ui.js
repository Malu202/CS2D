let progressBar = document.getElementById("progressBar");
let statusOutput = document.getElementById("statusOutput");
let matchHistoryButton = document.getElementById("matchHistoryButton");
let loadMatchButton = document.getElementById("loadMatchButton");
let matchHistoryUrlInput = document.getElementById("matchHistoryUrlInput");
let input = document.getElementById("demoInput");

const proxyUrl = "https://proxy.aschwm.workers.dev/?apiurl=";



let resultTicks;
let currentTick = 100 * 64;
let resultEvents;
let firstParsedTick;
let lastParsedTick;


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


document.addEventListener('keypress', (event) => {
    let timestep = 64;
    if (event.shiftKey) timestep = 16;
    if (event.code == "KeyL") {
        currentTick += timestep;
    } else if (event.code == "KeyJ") {
        currentTick -= timestep;
        if (currentTick < 0) currentTick = 0;
    }
    drawFrame(currentTick, resultTicks);
}, false);


progressBar.addEventListener("input", function (event) {
    if (!resultTicks) return;
    currentTick = Math.round((progressBar.value / 100) * (resultTicks.length / 10)) + 1;
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