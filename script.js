let flagExecutando = false;
let flagDesenhar = true;

let dadosModelo3D = null;

let matrizDoObjeto = [];
let faces = [];

let plano = [];
let vetorNormalAoPlano = [];
let pontoDeVista = [];

let d; // Variável utilizada na fórmula, tem esse nome mesmo
let d0;

let rotX = 0;
let rotY = 0;

let dragStartX = 0;
let dragStartY = 0;
let translateX = 0;
let translateY = 0;

let matrizPerspectiva = [];
let matrizFinal = [];

let tipoDesenho = 2;

function atualizarDadosSim()
{
    document.getElementById("ponto-de-vista").innerHTML = "Ponto de vista: " + pontoDeVista.toString();
    document.getElementById("plano").innerHTML = "Plano: " + plano.toString();
    document.getElementById("valores-d").innerHTML = "D: " + d.toString() + " D0: " + d0.toString();
    document.getElementById("vetor-normal").innerHTML = "Vetor normal: " + vetorNormalAoPlano.toString();
    document.getElementById("matriz-perspectiva").innerHTML = "Matriz perspectiva: " + matrizPerspectiva.toString();
}

function buscarTipoDesenho()
{
    tipoDesenho = document.getElementById("tipo-desenho").value;
}

function carregarPontoDeVista()
{
    let pov_x = parseFloat(document.getElementById("viewpoint-x").value);
    let pov_y = parseFloat(document.getElementById("viewpoint-y").value);
    let pov_z = parseFloat(document.getElementById("viewpoint-z").value);

    if (isNaN(pov_x) || isNaN(pov_y) || isNaN(pov_z))
    {
        alert("Ponto de vista inválido");
        throw "Ponto de vista inválido";
    }

    pontoDeVista = [pov_x, pov_y, pov_z];
}

function carregarDadosDoPlano()
{
    let string_u = document.getElementById("plano-u").value;
    let string_v = document.getElementById("plano-v").value;
    let string_w = document.getElementById("plano-w").value;

    let u = string_u.split(",");
    let v = string_v.split(",");
    let w = string_w.split(",");

    if (u.length != 3 || v.length != 3 || w.length != 3)
    {
        alert("Número de argumentos do plano inválidos, tente novamente");
        throw "Número de argumentos do plano inválidos, tente novamente";
            
    }

    u = u.map((valor) => {
        let t = parseFloat(valor);
        if (isNaN(t))
        {
            alert("Argumentos do plano inválidos, tente novamente");
            throw "Argumentos do plano inválidos, tente novamente";
        }
        return parseFloat(valor);
    })

    v = v.map((valor) => {
        let t = parseFloat(valor);
        if (isNaN(t))
        {
            alert("Argumentos do plano inválidos, tente novamente");
            throw "Argumentos do plano inválidos, tente novamente";
        }
        return parseInt(valor);
    })

    w = w.map((valor) => {
        let t = parseFloat(valor);
        if (isNaN(t))
        {
            alert("Argumentos do plano inválidos, tente novamente");
            throw "Argumentos do plano inválidos, tente novamente";
        }
        return parseFloat(valor);
    })

    plano = [u, v, w];
}

function calcularVetorNormalAoPlano() {
    let p1 = plano[0];
    let p2 = plano[1];
    let p3 = plano[2];

    let x1x2 = p1[0] - p2[0];
    let y1y2 = p1[1] - p2[1];
    let z1z2 = p1[2] - p2[2];

    let x3x2 = p3[0] - p2[0];
    let y3y2 = p3[1] - p2[1];
    let z3z2 = p3[2] - p2[2];

    let nx = (y1y2 * z3z2) - (y3y2 * z1z2);
    let ny = -((x1x2 * z3z2) - (x3x2 * z1z2));
    let nz = (x1x2 * y3y2) - (x3x2 * y1y2);

    vetorNormalAoPlano = [nx, ny, nz];

    if (nx === 0 && ny === 0 && nz === 0) {
        alert("Erro: O plano não é válido (vetor normal nulo).");
        throw "Erro: Vetor normal ao plano é nulo.";
    }
}

function calcularD() {
    if (plano.length === 0 || vetorNormalAoPlano.length === 0 || pontoDeVista.length === 0) {
        alert("Erro: Dados insuficientes para calcular D.");
        throw "Erro: Dados insuficientes para calcular D.";
    }

    let pontoPertencenteAoPlano = plano[0];
    let [nx, ny, nz] = vetorNormalAoPlano;
    let [px, py, pz] = pontoPertencenteAoPlano;
    let [vx, vy, vz] = pontoDeVista;

    d0 = nx * px + ny * py + nz * pz;

    let d1 = nx * vx + ny * vy + nz * vz;

    d = d0 - d1;

    // Validate values
    if (isNaN(d0) || isNaN(d)) {
        alert("Erro: Valores de D inválidos.");
        throw "Erro: Falha no cálculo de D.";
    }
}

function calcularMatrizPerspectiva() {
    if (d === undefined || vetorNormalAoPlano.length === 0 || pontoDeVista.length === 0) {
        alert("Erro: Dados insuficientes para calcular a matriz de perspectiva.");
        throw "Erro: Dados insuficientes para a matriz de perspectiva.";
    }

    let [a, b, c] = pontoDeVista;
    let [nx, ny, nz] = vetorNormalAoPlano;

    matrizPerspectiva = [
        [d + a * nx, a * ny, a * nz, -a * d0],
        [b * nx, d + b * ny, b * nz, -b * d0],
        [c * nx, c * ny, d + c * nz, -c * d0],
        [nx, ny, nz, d],
    ];
}

function calcularTransformacaoViewport() {
    const larguraViewport = width;
    const alturaViewport = height;

    const uMin = -1;
    const uMax = 1;
    const vMin = -1;
    const vMax = 1;

    const scaleX = larguraViewport / (uMax - uMin);
    const scaleY = alturaViewport / (vMax - vMin);

    for (let col = 0; col < matrizFinal.size()[1]; col++) {
        const xNDC = matrizFinal.get([0, col]);
        const yNDC = matrizFinal.get([1, col]);

        const xScreen = scaleX * (xNDC - uMin);
        const yScreen = alturaViewport - scaleY * (yNDC - vMin);

        matrizFinal.set([0, col], xScreen);
        matrizFinal.set([1, col], yScreen);
    }
}


// Função do p5.js
function setup() {
    let canvas = createCanvas(windowWidth * 0.67, windowHeight * 0.9);
    canvas.parent("canvas-container");
    frameRate(60);
}

// Função do p5.js
function mouseMoved() {
    
    // movedX e Y são do p5.js

    // Apenas alterar o ponto de vista se o espaço estiver apertado
    if (keyIsDown(32) === true)
    {
        rotX += movedY * 0.01;
        rotY += movedX * 0.01;
        flagDesenhar = true;
    }

}

// Função do p5.js
function mousePressed() {
    if (mouseButton === LEFT) {
        dragStartX = mouseX;
        dragStartY = mouseY;
    }
}

// Função do p5.js
function mouseDragged() {
    if (mouseButton === LEFT) {
        let dragDeltaX = mouseX - dragStartX;
        let dragDeltaY = mouseY - dragStartY;

        translateX += dragDeltaX * 0.01;
        translateY -= dragDeltaY * 0.01;

        dragStartX = mouseX;
        dragStartY = mouseY;

        flagDesenhar = true;
    }
}

// Função do p5.js
function mouseWheel(event) {
    let velocidadeZoom = 0.05;
    let newX;
    let newY;
    let newZ;

    if (event.delta > 0)
    {
        newX = pontoDeVista[0] - velocidadeZoom;
        newY = pontoDeVista[1] - velocidadeZoom;
        newZ = pontoDeVista[2] - velocidadeZoom;
    }
    else
    {
        newX = pontoDeVista[0] + velocidadeZoom;
        newY = pontoDeVista[1] + velocidadeZoom;
        newZ = pontoDeVista[2] + velocidadeZoom;
    }
    
    pontoDeVista[0] = newX;
    pontoDeVista[1] = newY;
    pontoDeVista[2] = newZ;
    flagDesenhar = true;
}

// Função do p5.js
function draw() {
    if (!flagExecutando || !flagDesenhar) return;

    background(0);
    stroke(255);
    fill(100);

    const matrizTranslacao = [
        [1, 0, 0, translateX],
        [0, 1, 0, translateY],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    const matrizRotacaoX = [
        [1, 0, 0, 0],
        [0, Math.cos(rotX), -Math.sin(rotX), 0],
        [0, Math.sin(rotX), Math.cos(rotX), 0],
        [0, 0, 0, 1],
    ];

    const matrizRotacaoY = [
        [Math.cos(rotY), 0, Math.sin(rotY), 0],
        [0, 1, 0, 0],
        [-Math.sin(rotY), 0, Math.cos(rotY), 0],
        [0, 0, 0, 1],
    ];

    // Combine transformations: translation -> rotation -> object
    let matrizTransformada = math.matrix(matrizDoObjeto);
    matrizTransformada = math.transpose(matrizTransformada); // Ensure correct orientation
    matrizTransformada = math.multiply(matrizTranslacao, math.multiply(matrizRotacaoY, math.multiply(matrizRotacaoX, matrizTransformada)));

    calcularVetorNormalAoPlano();
    calcularD();
    calcularMatrizPerspectiva();

    matrizFinal = math.multiply(math.matrix(matrizPerspectiva), matrizTransformada);

    for (let col = 0; col < matrizFinal.size()[1]; col++) {
        const w = matrizFinal.get([3, col]);
        if (w !== 0) {
            for (let row = 0; row < matrizFinal.size()[0]; row++) {
                matrizFinal.set([row, col], matrizFinal.get([row, col]) / w);
            }
        }
    }

    calcularTransformacaoViewport();

    atualizarDadosSim();

    if (tipoDesenho == 0)
    {
        // Pontos

        for (let i = 0; i < matrizDoObjeto.length; i++)
        {
            const x = matrizFinal.get([0,i]);
            const y = matrizFinal.get([1,i]);

            if (x < 0 || x > windowWidth || y < 0 || y > windowHeight)
            {
                continue;
            }

            point(x,y);
        }
        
    }
    else if (tipoDesenho == 1)
    {
        // Linhas
        // Apenas triângulos por hora

        const linhasDesenhadas = new Map();


        for (let i = 0; i < faces.length; i++)
        {
            const idx_pt1 = faces[i][0] - 1;
            const idx_pt2 = faces[i][1] - 1;
            const idx_pt3 = faces[i][2] - 1;

            const [x1, y1, z1] = [matrizFinal.get([0,idx_pt1]), matrizFinal.get([1,idx_pt1]), matrizFinal.get([2,idx_pt1])];
            const [x2, y2, z2] = [matrizFinal.get([0,idx_pt2]), matrizFinal.get([1,idx_pt2]), matrizFinal.get([2,idx_pt2])];
            const [x3, y3, z3] = [matrizFinal.get([0,idx_pt3]), matrizFinal.get([1,idx_pt3]), matrizFinal.get([2,idx_pt3])];
            
           
            const criarChaveLinha = (idx1, idx2) => {
                return [Math.min(idx1, idx2), Math.max(idx1, idx2)].join("-");
            };

            const chave12 = criarChaveLinha(idx_pt1, idx_pt2);
            if (!linhasDesenhadas.has(chave12)) {
                line(x1, y1, x2, y2);
                linhasDesenhadas.set(chave12, true);
            }

            const chave13 = criarChaveLinha(idx_pt1, idx_pt3);
            if (!linhasDesenhadas.has(chave13)) {
                line(x1, y1, x3, y3);
                linhasDesenhadas.set(chave13, true);
            }

            const chave23 = criarChaveLinha(idx_pt2, idx_pt3);
            if (!linhasDesenhadas.has(chave23)) {
                line(x2, y2, x3, y3);
                linhasDesenhadas.set(chave23, true);
            }
            // line(x1, y1, x2, y2);
            // line(x1, y1, x3, y3);
            // line(x2, y2, x3, y3);

        }        
    }
    else {
        // Formas com preechimento
        for (let face of faces) {
            beginShape();
            for (let idx of face) {
                const x = matrizFinal.get([0, idx - 1]);
                const y = matrizFinal.get([1, idx - 1]);

                // if (x < 0 || x > windowWidth || y < 0 || y > windowHeight)
                // {
                //     continue;
                // }
                vertex(x, y);
            }
            endShape(CLOSE);
        }
    }

    flagDesenhar = false;
}

// Handlers 

document.getElementById("executar").addEventListener("click", () => {
    calcularVetorNormalAoPlano();
    if (matrizDoObjeto == [])
    {
        alert("Faça o upload de um arquivo .obj primeiro!");
        return;
    }
    flagExecutando = true;
    flagDesenhar = true;
});

document.getElementById("carregar").addEventListener("click", () => {
    // carregar pré-processamento aqui
    
    buscarTipoDesenho();
    carregarPontoDeVista();
    carregarDadosDoPlano();
    

    document.getElementById("executar").disabled = false;
    document.getElementById("pausar").disabled = false;
});

document.getElementById("pausar").addEventListener("click", () => {
    flagExecutando = false;
});

document.getElementById("normalizar-objeto").addEventListener("click", () => {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < matrizDoObjeto.length; i++) {
        let x = matrizDoObjeto[i][0];
        let y = matrizDoObjeto[i][1];
        let z = matrizDoObjeto[i][2];

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);

        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
    }
    
    let width = maxX - minX;
    let height = maxY - minY;
    let depth = maxZ - minZ;

    let maxDimension = Math.max(width, height, depth);
    
    for (let i = 0; i < matrizDoObjeto.length; i++) {
        let x = matrizDoObjeto[i][0];
        let y = matrizDoObjeto[i][1];
        let z = matrizDoObjeto[i][2];

        let normalizedX = (x - minX) / maxDimension;
        let normalizedY = (y - minY) / maxDimension;
        let normalizedZ = (z - minZ) / maxDimension;

        matrizDoObjeto[i][0] = normalizedX;
        matrizDoObjeto[i][1] = normalizedY;
        matrizDoObjeto[i][2] = normalizedZ;
    }
});


// Entrada de arquivo 3D
document.getElementById("file-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".obj")) {
        const data = await file.text();
        parseObjFile(data);
    } else {
        alert("Arquivo .obj inválido!");
    }
});

// Parse do arquivo
function parseObjFile(data) {
    const lines = data.split('\n');
    // const vertices = []; 
    // const faces = []; 

    lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') {
            // se for um vértice
            let vertex = parts.slice(1).map(Number);
            vertex.push(1);
            matrizDoObjeto.push(vertex);
        } 
        else if (parts[0] === 'f') {
            // se for uma face
            const face = parts.slice(1).map(triade => {
                return parseInt(triade.split('/')[0], 10); // dependendo do arquivo, as faces são definidas como 'f 1/2/3', em que 2 representa a textura e 1 é o índice do vetor normal
            });
            faces.push(face);
        }
    });

    // console.log("Vertices:", matrizDoObjeto);
    // console.log("Faces:", faces);

    // return {vertices, faces}
}

