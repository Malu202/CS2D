let progressBar = document.getElementById("progressBar");
let statusOutput = document.getElementById("statusOutput");
let matchHistoryButton = document.getElementById("matchHistoryButton");
let loadMatchButton = document.getElementById("loadMatchButton");
let matchHistoryUrlInput = document.getElementById("matchHistoryUrlInput");
let input = document.getElementById("demoInput");
let roundTickMarks = document.getElementById("roundTicks");
let mapDropdown = document.getElementById("mapDropdown");

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

let minX;
let maxX;
let minY;
let maxY;
let scale;
let xOffset;
let yOffset;


mapDropdown.addEventListener("change", function () {
    adjustDrawScaling();
    loadBackgroundImage(mapDropdown.value);
});
adjustDrawScaling();
function adjustDrawScaling() {
    if (mapDropdown.value == "de_nuke") {
        minX = -1968.706298828125;
        maxX = 2706.302490234375;
        minY = -2479.96875;
        maxY = 932.2528076171875;
        scale = (maxX - minX + 2300);
        xOffset = minX - 1350;
        yOffset = minY - 1700;
    } else if (mapDropdown.value == "de_inferno") {
        scale = 5085.83690987124;
        xOffset = -2137.33905579399;
        yOffset = -1158.7982832618;
    } else if (mapDropdown.value == "de_vertigo") {
        scale = 4107.29613733906;
        xOffset = -3167.38197424893;
        yOffset = -2343.34763948498;
    } else if (mapDropdown.value == "de_anubis") {
        scale = 5343.34763948498;
        xOffset = -2806.8669527897;
        yOffset = -2034.3347639485;
    } else if (mapDropdown.value == "de_ancient") {
        //Semi
        scale = 5137.33905579399;
        xOffset = -2961.37339055794;
        yOffset = -2961.37339055794;
    } else if (mapDropdown.value == "de_overpass") {
        //Semi 
        scale = 5420.6008583691;
        xOffset = -4866.95278969957;
        yOffset = -3579.3991416309;
    }
}


function printScale() {
    console.log("scale=" + document.getElementById("scale").value + ';');
    console.log("xOffset=" + document.getElementById("xOffset").value + ';');
    console.log("yOffset=" + document.getElementById("yOffset").value + ';');
}