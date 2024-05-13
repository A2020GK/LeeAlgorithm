const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width=innerWidth/2;
canvas.height=canvas.width

let startPoint = null, endPoint = null, path = [[],[]];
let map = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => (0)));
// 0 - Empty
// 1 - Wall
// 2 - Start
// 3 - End

function relativeCords(mouseEvent) {
    let rect = mouseEvent.target.getBoundingClientRect();
    let x = mouseEvent.clientX - rect.left;
    let y = mouseEvent.clientY - rect.top;
    return { x: Math.floor(x), y: Math.floor(y) };
}

canvas.addEventListener("click", function (event) {
    const cords = relativeCords(event);
    let cellX = Math.floor(cords.x / (canvas.width / 10));
    let cellY = Math.floor(cords.y / (canvas.height / 10));
    map[cellY][cellX]++;
    if (map[cellY][cellX] >= 4) {
        map[cellY][cellX] = 0;
        endPoint = null;
        if (startPoint != null) if (startPoint.x == cellX && startPoint.y == cellY) startPoint = null;
    }
    if (map[cellY][cellX] == 2) startPoint = { x: cellX, y: cellY };
    if (map[cellY][cellX] == 3) endPoint = { x: cellX, y: cellY };
    app();
});

function solveMaze(maze, xStart, yStart, xEnd, yEnd) {

    let locMaze = [];

    for (let y = 0; y < maze.length; y++) {
        locMaze[y] = [];
        for (let x = 0; x < maze[0].length; x++) {
            let wall = maze[y][x];
            locMaze[y][x] = {
                x: x,
                y: y,
                isWall: wall == 1 ? true : false,
                marker: null
            }
        }
    }

    let currentCell = locMaze[yStart][xStart];

    function recursionMark(startCell) {
        let pointMarker = 0;
        let queue = [startCell];
        startCell.marker = pointMarker;

        while (queue.length > 0) {
            let currentCell = queue.shift();
            pointMarker++;

            let neighbors = [];
            if ((currentCell.x - 1) >= 0) if (!locMaze[currentCell.y][currentCell.x - 1].isWall && locMaze[currentCell.y][currentCell.x - 1].marker === null)
                neighbors.push(locMaze[currentCell.y][currentCell.x - 1]);
            if ((currentCell.x + 1) < locMaze[0].length) if (!locMaze[currentCell.y][currentCell.x + 1].isWall && locMaze[currentCell.y][currentCell.x + 1].marker === null)
                neighbors.push(locMaze[currentCell.y][currentCell.x + 1]);
            if (currentCell.y - 1 >= 0) if (!locMaze[currentCell.y - 1][currentCell.x].isWall && locMaze[currentCell.y - 1][currentCell.x].marker === null)
                neighbors.push(locMaze[currentCell.y - 1][currentCell.x]);
            if (currentCell.y + 1 < locMaze.length) if (!locMaze[currentCell.y + 1][currentCell.x].isWall && locMaze[currentCell.y + 1][currentCell.x].marker === null)
                neighbors.push(locMaze[currentCell.y + 1][currentCell.x]);

            for (let neighbor of neighbors) {
                neighbor.marker = pointMarker;
                queue.push(neighbor);
            }

            if (currentCell.x === xEnd && currentCell.y === yEnd) {
                break; // target reached
            }
        }

        return locMaze;
    }

    recursionMark(currentCell);

    currentCell = locMaze[yEnd][xEnd];

    let path = [];

    function backtrace(endCell) {
        let currentCell = endCell;
        let path = [currentCell];

        while (currentCell.marker !== 0) {
            let neighbors = [];
            if ((currentCell.x - 1) >= 0) if (!locMaze[currentCell.y][currentCell.x - 1].isWall && locMaze[currentCell.y][currentCell.x - 1].marker < currentCell.marker)
                neighbors.push(locMaze[currentCell.y][currentCell.x - 1]);
            if ((currentCell.x + 1) < locMaze[0].length) if (!locMaze[currentCell.y][currentCell.x + 1].isWall && locMaze[currentCell.y][currentCell.x + 1].marker < currentCell.marker)
                neighbors.push(locMaze[currentCell.y][currentCell.x + 1]);
            if (currentCell.y - 1 >= 0) if (!locMaze[currentCell.y - 1][currentCell.x].isWall && locMaze[currentCell.y - 1][currentCell.x].marker < currentCell.marker)
                neighbors.push(locMaze[currentCell.y - 1][currentCell.x]);
            if (currentCell.y + 1 < locMaze.length) if (!locMaze[currentCell.y + 1][currentCell.x].isWall && locMaze[currentCell.y + 1][currentCell.x].marker < currentCell.marker)
                neighbors.push(locMaze[currentCell.y + 1][currentCell.x]);

            if (neighbors.length > 0) {
                currentCell = neighbors[0];
                path.unshift(currentCell);
            } else {
                break;
            }
        }

        return path;
    }
    path = backtrace(currentCell);

    return [path,locMaze];

}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";

    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += canvas.width / 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Same for horizontal (grid)
    for (let y = 0; y < canvas.height; y += canvas.height / 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = "black";
    for (let y = 0; y < map.length; y++) for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] == 1) {
            ctx.fillRect(x * canvas.width / 10, y * canvas.height / 10, canvas.width / 10, canvas.height / 10);
        }
    }

    if (startPoint != null) {
        ctx.fillStyle = "blue";
        ctx.fillRect(startPoint.x * canvas.width / 10, startPoint.y * canvas.height / 10, canvas.width / 10, canvas.height / 10);
    }
    if (endPoint != null) {
        ctx.fillStyle = "green";
        ctx.fillRect(endPoint.x * canvas.width / 10, endPoint.y * canvas.height / 10, canvas.width / 10, canvas.height / 10);
    }

    ctx.strokeStyle = "purple";
    ctx.lineWidth = 5;
    if (path[0].length > 0) {
        ctx.font = "25px Arial monospace";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        let markers=path[1];
        markers.forEach(cell=>{
            cell.forEach(c=>ctx.fillText(c.marker==null?"?":c.marker,(c.x+0.5)*canvas.width/10,(c.y+0.5)*canvas.height/10));
        });


        ctx.beginPath();
        ctx.moveTo((path[0][0].x + 0.5) * canvas.width / 10, (path[0][0].y + 0.5) * canvas.height / 10);
        for (let i = 1; i < path[0].length; i++) {
            ctx.lineTo((path[0][i].x + 0.5) * canvas.width / 10, (path[0][i].y + 0.5) * canvas.height / 10);
        }
        ctx.stroke();
    }
}

function app() {
    if (startPoint != null && endPoint != null) path = solveMaze(map, startPoint.x, startPoint.y, endPoint.x, endPoint.y); else path = [[],[]];

    render();
}
app();