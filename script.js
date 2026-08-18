let flagExecutando = false;

let matrizDoObjeto = [];
let faces = [];

let camPos = [0, 0, 5];
let camYaw = -Math.PI / 2;
let camPitch = 0;
let fov = Math.PI / 3;
let zNear = 0.1;
let zFar = 1000.0;

let mouseSensibilidade = 0.002;
let velocidadeMovimento = 0.1;

let tipoDesenho = 2;

function setup() {
    let canvas = createCanvas(windowWidth * 0.67, windowHeight * 0.9);
    canvas.parent("canvas-container");
    canvas.mousePressed(() => {
        if (flagExecutando) {
            requestPointerLock();
        }
    });
    frameRate(60);
}

function windowResized() {
    resizeCanvas(windowWidth * 0.67, windowHeight * 0.9);
}

function processarEntradaTeclado() {
    let cosYaw = Math.cos(camYaw);
    let sinYaw = Math.sin(camYaw);

    let frente = [cosYaw, 0, sinYaw];
    let direita = [-sinYaw, 0, cosYaw];

    if (keyIsDown(87)) { // W
        camPos[0] += frente[0] * velocidadeMovimento;
        camPos[2] += frente[2] * velocidadeMovimento;
    }
    if (keyIsDown(83)) { // S
        camPos[0] -= frente[0] * velocidadeMovimento;
        camPos[2] -= frente[2] * velocidadeMovimento;
    }
    if (keyIsDown(65)) { // A
        camPos[0] -= direita[0] * velocidadeMovimento;
        camPos[2] -= direita[2] * velocidadeMovimento;
    }
    if (keyIsDown(68)) { // D
        camPos[0] += direita[0] * velocidadeMovimento;
        camPos[2] += direita[2] * velocidadeMovimento;
    }
    if (keyIsDown(32)) { // Space
        camPos[1] += velocidadeMovimento;
    }
    if (keyIsDown(16)) { // Shift
        camPos[1] -= velocidadeMovimento;
    }
}

function mouseMoved(event) {
    if (document.pointerLockElement) {
        camYaw += event.movementX * mouseSensibilidade;
        camPitch -= event.movementY * mouseSensibilidade;

        const limitePitch = Math.PI / 2 - 0.01;
        if (camPitch > limitePitch) camPitch = limitePitch;
        if (camPitch < -limitePitch) camPitch = -limitePitch;
    }
}

function mouseWheel(event) {
    if (event.delta > 0) {
        velocidadeMovimento *= 1.1;
    } else {
        velocidadeMovimento *= 0.9;
    }
    return false;
}

function calcularMatrizVista() {
    let cosPitch = Math.cos(camPitch);
    let sinPitch = Math.sin(camPitch);
    let cosYaw = Math.cos(camYaw);
    let sinYaw = Math.sin(camYaw);

    let forward = [cosPitch * cosYaw, sinPitch, cosPitch * sinYaw];
    let upGlobal = [0, 1, 0];

    let right = [
        forward[1] * upGlobal[2] - forward[2] * upGlobal[1],
        forward[2] * upGlobal[0] - forward[0] * upGlobal[2],
        forward[0] * upGlobal[1] - forward[1] * upGlobal[0]
    ];
    let lenR = Math.hypot(right[0], right[1], right[2]);
    if (lenR > 0) {
        right = [right[0] / lenR, right[1] / lenR, right[2] / lenR];
    }

    let up = [
        right[1] * forward[2] - right[2] * forward[1],
        right[2] * forward[0] - right[0] * forward[2],
        right[0] * forward[1] - right[1] * forward[0]
    ];

    let rot = [
        [right[0], right[1], right[2], 0],
        [up[0], up[1], up[2], 0],
        [-forward[0], -forward[1], -forward[2], 0],
        [0, 0, 0, 1]
    ];

    let trans = [
        [1, 0, 0, -camPos[0]],
        [0, 1, 0, -camPos[1]],
        [0, 0, 1, -camPos[2]],
        [0, 0, 0, 1]
    ];

    return math.multiply(rot, trans);
}

function calcularMatrizProjecao(aspecto) {
    let tanHalfFov = Math.tan(fov / 2);
    return [
        [1 / (aspecto * tanHalfFov), 0, 0, 0],
        [0, 1 / tanHalfFov, 0, 0],
        [0, 0, -(zFar + zNear) / (zFar - zNear), -(2 * zFar * zNear) / (zFar - zNear)],
        [0, 0, -1, 0]
    ];
}

function atualizarDadosSim() {
    let elemPov = document.getElementById("ponto-de-vista");
    if (elemPov) elemPov.innerText = `Ponto de vista: [${camPos.map(v => v.toFixed(2)).join(", ")}]`;

    let elemMat = document.getElementById("matriz-perspectiva");
    if (elemMat) elemMat.innerText = `Orientação (Yaw/Pitch): ${camYaw.toFixed(2)} rad / ${camPitch.toFixed(2)} rad`;
}

function draw() {
    if (!flagExecutando) return;

    processarEntradaTeclado();

    background(0);
    stroke(255);
    fill(100);

    let aspecto = width / height;
    let matrizVista = calcularMatrizVista();
    let matrizProjecao = calcularMatrizProjecao(aspecto);
    let matrizPV = math.multiply(matrizProjecao, matrizVista);

    let pontosProjetados = [];
    let pontosValidos = [];

    for (let i = 0; i < matrizDoObjeto.length; i++) {
        let v = matrizDoObjeto[i];
        let pHomogeneo = [v[0], v[1], v[2], 1];

        let pClip = math.multiply(matrizPV, pHomogeneo);
        let w = pClip[3];

        if (w > zNear) {
            let xNDC = pClip[0] / w;
            let yNDC = pClip[1] / w;
            let xTela = (xNDC + 1) * 0.5 * width;
            let yTela = (1 - yNDC) * 0.5 * height;
            pontosProjetados.push([xTela, yTela, pClip[2] / w]);
            pontosValidos.push(true);
        } else {
            pontosProjetados.push([0, 0, 0]);
            pontosValidos.push(false);
        }
    }

    atualizarDadosSim();

    if (tipoDesenho == 0) {
        for (let i = 0; i < pontosProjetados.length; i++) {
            if (pontosValidos[i]) {
                let p = pontosProjetados[i];
                if (p[0] >= 0 && p[0] <= width && p[1] >= 0 && p[1] <= height) {
                    point(p[0], p[1]);
                }
            }
        }
    } else if (tipoDesenho == 1) {
        let linhasDesenhadas = new Set();
        for (let face of faces) {
            for (let i = 0; i < face.length; i++) {
                let idx1 = face[i] - 1;
                let idx2 = face[(i + 1) % face.length] - 1;

                if (pontosValidos[idx1] && pontosValidos[idx2]) {
                    let minIdx = Math.min(idx1, idx2);
                    let maxIdx = Math.max(idx1, idx2);
                    let chave = `${minIdx}-${maxIdx}`;

                    if (!linhasDesenhadas.has(chave)) {
                        linhasDesenhadas.add(chave);
                        line(pontosProjetados[idx1][0], pontosProjetados[idx1][1], pontosProjetados[idx2][0], pontosProjetados[idx2][1]);
                    }
                }
            }
        }
    } else {
        for (let face of faces) {
            let faceValida = true;
            for (let idx of face) {
                if (!pontosValidos[idx - 1]) {
                    faceValida = false;
                    break;
                }
            }
            if (faceValida) {
                beginShape();
                for (let idx of face) {
                    let p = pontosProjetados[idx - 1];
                    vertex(p[0], p[1]);
                }
                endShape(CLOSE);
            }
        }
    }
}

document.getElementById("executar").addEventListener("click", () => {
    if (matrizDoObjeto.length === 0) {
        alert("Carregue um arquivo .obj válido previamente.");
        return;
    }
    flagExecutando = true;
});

document.getElementById("carregar").addEventListener("click", () => {
    let elemTipo = document.getElementById("tipo-desenho");
    if (elemTipo) tipoDesenho = parseInt(elemTipo.value, 10);
    document.getElementById("executar").disabled = false;
    document.getElementById("pausar").disabled = false;
});

document.getElementById("pausar").addEventListener("click", () => {
    flagExecutando = false;
});

document.getElementById("normalizar-objeto").addEventListener("click", () => {
    if (matrizDoObjeto.length === 0) return;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < matrizDoObjeto.length; i++) {
        let [x, y, z] = matrizDoObjeto[i];
        minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
    }

    let centroX = (minX + maxX) / 2;
    let centroY = (minY + maxY) / 2;
    let centroZ = (minZ + maxZ) / 2;
    let escalaMax = Math.max(maxX - minX, maxY - minY, maxZ - minZ);

    if (escalaMax === 0) return;

    for (let i = 0; i < matrizDoObjeto.length; i++) {
        matrizDoObjeto[i][0] = (matrizDoObjeto[i][0] - centroX) / escalaMax;
        matrizDoObjeto[i][1] = (matrizDoObjeto[i][1] - centroY) / escalaMax;
        matrizDoObjeto[i][2] = (matrizDoObjeto[i][2] - centroZ) / escalaMax;
    }
});

document.getElementById("file-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".obj")) {
        const data = await file.text();
        parseObjFile(data);
    } else {
        alert("Arquivo .obj inválido.");
    }
});

function parseObjFile(data) {
    matrizDoObjeto = [];
    faces = [];
    const lines = data.split('\n');

    lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') {
            matrizDoObjeto.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } else if (parts[0] === 'f') {
            const face = parts.slice(1).map(triade => parseInt(triade.split('/')[0], 10));
            faces.push(face);
        }
    });
}