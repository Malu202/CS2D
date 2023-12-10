let background = new Image();
background.src = "MapImages/Nuuke.png";
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 512;
background.onload = function () {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawFrame();
};

function drawFrame(currentTick, resultTicks) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (background.complete && background.naturalHeight !== 0) {
        fillCanvasWithImage(canvas, context, background)
    }


    if (!resultTicks) return;
    context.font = "12px Arial";
    context.fillStyle = 'white';
    context.textAlign = "center";
    context.fillText(Math.round((currentTick - 1) / 64), 100, 20);
    progressBar.value = 100 * currentTick / (resultTicks.length / 10);
    for (let i = 0; i < 10; i++) {
        drawPlayer(resultTicks, (currentTick - 1) * 10 + i);
    }

}

function drawPlayer(data, index) {
    let worldX = data[index].get("X");
    let worldY = data[index].get("Y");
    let drawX = clampPosition(worldX, true);
    let drawY = clampPosition(worldY, false);
    let name = data[index].get("name");
    context.beginPath();
    context.arc(drawX, drawY, 4, 0, Math.PI * 2);
    context.lineWidth = 3;
    context.strokeStyle = 'white';
    context.stroke();
    context.font = "12px Arial";
    context.fillStyle = 'white';
    context.textAlign = "center";
    context.fillText(name, drawX, drawY - 8);
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