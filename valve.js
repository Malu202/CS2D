import init, { parseEvent, parseTicks } from './pkg/demoparser2.js';
import SevenZip from "./node_modules/7z-wasm/7zz.es6.js";
const sevenZip = await SevenZip();

await init();


// const demoUrlNuke = "http://replay274.valve.net/730/003651092318259249263_0079792640.dem.bz2";
const demoUrlNuke = "http://replay192.valve.net/730/003654981245789536562_0585339076.dem.bz2";
const demoUrl = "http://replay191.valve.net/730/003651100064232767503_1150096705.dem.bz2";
const proxyUrl = "https://proxy.aschwm.workers.dev/?apiurl="
const demoList = "https://steamcommunity.com/profiles/76561198029871964/gcpd/730?tab=matchhistorypremier";

async function downloadDemo(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', proxyUrl + url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    xhr.onprogress = function (evt) {
        let progress = Math.round((evt.loaded / evt.total) * 100);
        statusOutput.innerText = "downloading demo (" + progress + "%)";
        document.title = "CS2D " + progress + '%';
        if (evt.loaded == evt.total) statusOutput.innerText = "unzipping demo..."
    };
    xhr.onload = function () {
        statusOutput.innerText = "unzipping demo...";
        document.title = "CS2D unzipping...";
        var archiveData = new Uint8Array(xhr.response);
        const archiveName = "newDemo.dem.bz2";
        const stream = sevenZip.FS.open(archiveName, "w+");
        sevenZip.FS.write(stream, archiveData, 0, archiveData.length);
        sevenZip.FS.close(stream);
        const filesToExtract = ["newDemo.dem"];

        let cpuCores = Math.round(navigator.hardwareConcurrency / 2);
        // sevenZip.callMain(["e", archiveName, "-bb1", ...filesToExtract]);
        sevenZip.callMain(["x", archiveName, ...filesToExtract]);

        let unzippedFile = sevenZip.FS.readFile(filesToExtract[0]);
        parseDemo(unzippedFile);
    }
}

downloadDemo(demoUrlNuke);


download(unzippedFile, 'unzippedDemo.dem', 'application/octet-stream');
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

