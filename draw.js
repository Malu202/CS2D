let background = new Image();
// background.src = "MapImages/Nuuke.png";
let imagePre = "MapImages/";
let imagePost = "_radar_psd.png"
background.src = imagePre + "de_nuke" + imagePost;

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 512;
background.onload = function () {
    setupCanvas()
};
window.addEventListener("resize", () => {
    setupCanvas()
});
function setupCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawFrame(currentTick, resultTicks);
}

function drawFrame(currentTick, resultTicks) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (background.complete && background.naturalHeight !== 0) {
        fillCanvasWithImage(canvas, context, background)
    }


    if (!resultTicks) return;

    let startIndex = Math.min(currentTick * 10 - 1, resultTicks.get("tick").length - 1);
    while (true) {
        if (startIndex == 0) break;
        let tick = resultTicks.get("tick")[startIndex];
        let previousTick = resultTicks.get("tick")[startIndex - 1];
        if (tick >= currentTick && previousTick < currentTick) {
            if (tick != currentTick) {
                console.log("Requested tick does not exist (" + currentTick + "), skipping to " + tick + " instead");
                currentTick = tick;
            }
            break;
        }
        else if (previousTick >= currentTick) startIndex--;
        else if (tick < currentTick) startIndex++;
    }
    let resolutionScaling = Math.min(canvas.width, canvas.height) / 1080;
    let playersize = Math.round(5 * resolutionScaling);
    let textSize = Math.round(8 * resolutionScaling)
    context.font = `${textSize}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = "center";
    // context.fillText(Math.round((currentTick - 1) / 64), 100, 20);
    context.fillText(currentTick, 100 * resolutionScaling, 20 * resolutionScaling);

    progressBar.value = 100 * (currentTick - firstParsedTick()) / (lastParsedTick() - firstParsedTick());

    for (let i = startIndex; i < startIndex + 10; i++) {
        drawPlayer(resultTicks, i, playersize, textSize);
        if (resultTicks.get("tick")[i] != currentTick) break;
    }
}
function inDegrees(radians) {
    return 360 * radians / (2 * Math.PI)
}

function drawPlayer(data, index, size, textSize) {
    if (!data.get("is_alive")[index]) return;
    let worldX = data.get("X")[index];
    let worldY = data.get("Y")[index];
    let yaw = data.get("yaw")[index] * 2 * Math.PI / 360;
    let drawX = clampPosition(worldX, true);
    let drawY = clampPosition(worldY, false);
    let name = data.get("name")[index];

    drawX = Math.round(drawX);
    drawY = Math.round(drawY);


    context.beginPath();
    context.moveTo(drawX + size * Math.cos(yaw + Math.PI / 2), drawY - size * Math.sin(yaw + Math.PI / 2));
    context.lineTo(drawX + 1.5 * size * Math.cos(yaw), drawY - 1.5 * size * Math.sin(yaw));
    context.lineTo(drawX + size * Math.cos(yaw - Math.PI / 2), drawY - size * Math.sin(yaw - Math.PI / 2));
    context.fillStyle = "white";
    //context.fill();

    //context.beginPath();
    context.moveTo(drawX, drawY);
    context.arc(drawX, drawY, size, -yaw + (Math.PI / 2), -yaw - (Math.PI / 2));
    context.fillStyle = "white";
    context.fill();

    context.font = `${textSize}px Arial`;;
    context.fillStyle = 'white';
    context.textAlign = "center";
    context.fillText(name, drawX, drawY - size * 2);
    let a = 0;
}

function fillCanvasWithImage(canv, ctx, img) {
    let imgScale = Math.min(canv.width / img.naturalWidth, canv.height / img.naturalHeight);
    let x = (canv.width / 2) - (img.naturalWidth / 2) * imgScale;
    let y = (canv.height / 2) - (img.naturalHeight / 2) * imgScale;
    context.drawImage(img, x, y, img.naturalWidth * imgScale, img.naturalHeight * imgScale);
}


let minX = -1968.706298828125;
let maxX = 2706.302490234375;
let minY = -2479.96875;
let maxY = 932.2528076171875;
let scale = (maxX - minX + 2300);
let xOffset = minX - 1350;
let yOffset = minY - 1700;

function clampPosition(position, isX) {
    let landscape = canvas.width > canvas.height;
    let mapHeight = canvas.height;
    let mapWidth = canvas.width;
    if (landscape) mapWidth = canvas.height;
    else mapHeight = canvas.width;
    let mapTopLeftCornerX = 0;
    let mapTopLeftCornerY = 0;
    if (landscape) mapTopLeftCornerX = (canvas.width - canvas.height) / 2;
    else mapTopLeftCornerY = (canvas.height - canvas.width) / 2;

    if (isX) return mapWidth * (position - xOffset) / (scale) + mapTopLeftCornerX;
    else return mapHeight * (-(position - yOffset) / (scale) + 1) + mapTopLeftCornerY;
}