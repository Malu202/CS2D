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
let currentTick = 64;
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

function drawHtmlThenContinueWith(functionToDoAfterWards) {
    setTimeout(functionToDoAfterWards, 10);
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
    changeMap(mapDropdown.value);
});
function changeMap(mapName) {
    mapDropdown.value = mapName;
    adjustDrawScaling();
    loadBackgroundImage(mapName);
}
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
    } else if (mapDropdown.value == "de_mirage") {
        //Semi 
        scale = 5085.83690987124;
        xOffset = -3218.88412017167;
        yOffset = -3424.89270386266;
    }
}
let mapSpawns = {
    de_ancientC: {
        x: -400,
        y: 1702
    },
    de_ancientT: {
        x: -450,
        y: -2262,
    },
    de_anubisT: {
        x: -289,
        y: -1643
    },
    de_anubisC: {
        x: -492,
        y: 2168
    },
    de_nukeC: {
        x: 2562,
        y: -395
    },
    de_nukeT: {
        x: -1887,
        y: -1042
    },
    de_infernoC: {
        x: 2398,
        y: 2065
    },
    de_infernoT: {
        x: -1639,
        y: 459
    },
    de_vertigoC: {
        x: -979,
        y: 803
    },
    de_vertigoT: {
        x: -1359,
        y: -1411.4
    },
    de_mirageC: {
        x: -1816,
        y: -1912
    },
    de_mirageT: {
        x: 1264,
        y: -142
    },
    de_overpassC: {
        x: -2283,
        y: 819
    },
    de_overpassT: {
        x: -1400,
        y: -3264
    }
};
function estimateMap() {
    let randomRoundStart = roundStartEvents[0].get("tick") * 10 + 128;
    for (let i = 0; i < 10; i++) {
        let x = resultTicks.get("X")[randomRoundStart + i];
        let y = resultTicks.get("Y")[randomRoundStart + i];

        let minimumDistance = Infinity;
        for (const [map, coords] of Object.entries(mapSpawns)) {
            let dist = distance2D(x, y, coords.x, coords.y);
            if (dist < minimumDistance) {
                minimumDistance = dist;
                mapSpawns[map].distance = dist;
            }
        }
    }

    let minDist = Infinity;
    let estimatedMap = "";
    for (const [map, coords] of Object.entries(mapSpawns)) {
        if (mapSpawns[map].distance < minDist) {
            minDist = mapSpawns[map].distance;
            estimatedMap = map;
        }
    }
    for (const [map, coords] of Object.entries(mapSpawns)) { map.distance = null }
    estimatedMap = estimatedMap.slice(0, estimateMap.length - 1);
    console.log(estimatedMap);
    changeMap(estimatedMap);
}
function distance2D(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}


function printScale() {
    console.log("scale=" + document.getElementById("scale").value + ';');
    console.log("xOffset=" + document.getElementById("xOffset").value + ';');
    console.log("yOffset=" + document.getElementById("yOffset").value + ';');
}

function printSpawnAvg() {
    let randomRoundStart = roundStartEvents[0].get("tick") * 10 + 128;
    minY = Infinity;
    maxY = -Infinity;
    minX = Infinity;
    maxX = -Infinity;
    let x = [];
    let y = [];
    for (let i = 0; i < 10; i++) {
        let newX = Math.round(resultTicks.get("X")[randomRoundStart + i]);
        let newY = Math.round(resultTicks.get("Y")[randomRoundStart + i]);
        if (newX > maxX) maxX = newX;
        if (newX < minX) minX = newX;
        if (newY > maxY) maxY = newY;
        if (newY < minY) minY = newY;
        x.push(newX);
        y.push(newY);
    }
    let XborderBetweenCtAndT = (maxX + minX) / 2;
    let YborderBetweenCtAndT = (maxY + minY) / 2;
    let xHighAvg = 0;
    let yHighAvg = 0;
    let xLowAvg = 0;
    let yLowAvg = 0;
    for (let i = 0; i < 10; i++) {
        if (x[i] > XborderBetweenCtAndT) xHighAvg += x[i];
        else xLowAvg += x[i];
        if (y[i] > YborderBetweenCtAndT) yHighAvg += y[i];
        else yLowAvg += y[i];
    }
    console.log("evaluating at tick " + randomRoundStart);
    console.log("x: ", x);
    console.log("y: ", y);
    console.log("xHighAvg: ", xHighAvg / 5);
    console.log("yHighAvg: ", yHighAvg / 5);
    console.log("xLowAvg: ", xLowAvg / 5);
    console.log("yLowAvg: ", yLowAvg / 5);


}