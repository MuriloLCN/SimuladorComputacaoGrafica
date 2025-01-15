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

let matrizPerspectiva = [];
let matrizFinal = [];


function carregarPontoDeVista()
{
    let pov_x = document.getElementById("viewpoint-x").value;
    let pov_y = document.getElementById("viewpoint-y").value;
    let pov_z = document.getElementById("viewpoint-z").value;

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

function calcularVetorNormalAoPlano()
{
    let u = plano[0];
    let v = plano[1];
    let w = plano[2];
    
    let x_12 = u[0] - u[1];
    let y_12 = v[0] - v[1];
    let z_12 = w[0] - w[1];
    
    let x_32 = u[2] - u[1];
    let y_32 = v[2] - v[1];
    let z_32 = w[2] - w[1];
    
    let nx = y_12 * z_32 - y_32 * z_12;
    let ny = -(x_12 * z_32 - x_32 * z_12);
    let nz = x_12 * y_32 - x_32 * y_12;

    vetorNormalAoPlano = [nx, ny, nz];
}

function calcularD()
{
    let pontoPertencenteAoPlano = plano[0];

    d0 = pontoPertencenteAoPlano[0] * vetorNormalAoPlano[0] + pontoPertencenteAoPlano[1] * vetorNormalAoPlano[1] + pontoPertencenteAoPlano[2] * vetorNormalAoPlano[2]

    let d1 = pontoDeVista[0] * vetorNormalAoPlano[0] + pontoDeVista[1] * vetorNormalAoPlano[1] + pontoDeVista[2] * vetorNormalAoPlano[2];

    d = d0 - d1;
}

function calcularMatrizPerspectiva()
{
    let a = pontoDeVista[0];
    let b = pontoDeVista[1];
    let c = pontoDeVista[2];

    let nx = vetorNormalAoPlano[0];
    let ny = vetorNormalAoPlano[1];
    let nz = vetorNormalAoPlano[2];

    matrizPerspectiva = [
        [d + a * nx,   a * ny    ,   a * nz    ,   -a * d0],
        [b * nx    ,   d + b * ny,   b * nz    ,   -b * d0],
        [c * nx    ,   c * ny    ,   d + c * nz,   -c * d0],
        [nx        ,   ny        ,   nz        ,   1      ]
    ]
}

function calcularTransformacaoViewport() {
    const larguraViewport = width;  // p5.js canvas width
    const alturaViewport = height; // p5.js canvas height

    const uMin = -1; // NDC min X
    const uMax = 1;  // NDC max X
    const vMin = -1; // NDC min Y
    const vMax = 1;  // NDC max Y

    const aspectRatioViewport = larguraViewport / alturaViewport;
    const aspectRatioNDC = (uMax - uMin) / (vMax - vMin);

    let scaleX, scaleY, offsetX, offsetY;

    // Adjust the scale and offsets based on aspect ratios
    if (aspectRatioViewport > aspectRatioNDC) {
        scaleY = alturaViewport / (vMax - vMin);
        scaleX = scaleY;
        offsetX = (larguraViewport - (uMax - uMin) * scaleX) / 2;
        offsetY = 0;
    } else {
        scaleX = larguraViewport / (uMax - uMin);
        scaleY = scaleX;
        offsetX = 0;
        offsetY = (alturaViewport - (vMax - vMin) * scaleY) / 2;
    }

    const cols = matrizFinal.size()[1];

    // Iterate through the columns of the transformed matrix
    for (let col = 0; col < cols; col++) {
        const xNDC = matrizFinal.get([0, col]);
        const yNDC = matrizFinal.get([1, col]);

        // Convert NDC to screen space
        const xScreen = scaleX * (xNDC - uMin) + offsetX;
        // Invert Y-axis (p5.js has the Y-axis increasing downwards)
        const yScreen = offsetY + scaleY * (yNDC - vMin);

        matrizFinal.set([0, col], xScreen);
        matrizFinal.set([1, col], yScreen);
    }
}



// function calcularTransformacaoViewport() {
//     const larguraViewport = width;
//     const alturaViewport = height;
    
//     const cols = matrizFinal.size()[1];

//     for (let col = 0; col < cols; col++) {
//         let xNDC = matrizFinal.get([0, col]);
//         let yNDC = matrizFinal.get([1, col]);

//         let xScreen = ((xNDC + 1) / 2) * larguraViewport;
//         let yScreen = ((1 - yNDC) / 2) * alturaViewport;

//         // Update the matrix with screen coordinates
//         matrizFinal.set([0, col], xScreen);
//         matrizFinal.set([1, col], yScreen);
//     }
// }

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
        // print(movedX);
        // print(movedY);

        // alterar o plano com base no moved x e y
        flagDesenhar = true;
    }

}

let flagPermiteMover = true;

// Função do p5.js
function draw() {
    if (!flagExecutando)
    {
        return;
    }

    // se alguma delas mexer, re-desenhar
    if (keyIsDown(LEFT_ARROW)) {
        // pontoDeVista[0] -= 0.0005;
        flagDesenhar = true;
    }
    
    if (keyIsDown(RIGHT_ARROW)) {
        // pontoDeVista[0] += 0.0005;
        flagDesenhar = true;
    }
    
    if (keyIsDown(UP_ARROW)) {
        // pontoDeVista[1] -= 0.0005;
        flagDesenhar = true;
    }
    
    if (keyIsDown(DOWN_ARROW)) {
        // pontoDeVista[1] += 0.0005;
        flagDesenhar = true;
    }

    if (!flagDesenhar)
    {
        return;
    }

    background(0);
    stroke(0,150,0);
    fill(0,150,0);

    calcularVetorNormalAoPlano();

    console.log(vetorNormalAoPlano);
    
    calcularD();

    calcularMatrizPerspectiva();

    // matrizPerspectiva = math.transpose(matrizPerspectiva);
    matrizPerspectiva = math.matrix(matrizPerspectiva);
    
    matrizFinal = math.matrix(matrizDoObjeto);
    matrizFinal = math.transpose(matrizFinal);

    matrizFinal = math.multiply(matrizPerspectiva, matrizFinal);

    const rows = matrizFinal.size()[0];
    const cols = matrizFinal.size()[1];

    // Normalizando os valores

    for (let col = 0; col < cols; col++) {
        const w = matrizFinal.get([3, col]);

        if (w !== 0) {
            for (let row = 0; row < rows; row++) {
                const val = matrizFinal.get([row, col]);
                matrizFinal.set([row, col], val / w);
            }
        }
    }

    calcularTransformacaoViewport();

    console.log(matrizFinal);
    // Draw points

    stroke(255, 255, 255);
    for (let i = 0; i < matrizDoObjeto.length; i++) {
        point(matrizFinal.get([0, i]), matrizFinal.get([1, i]));
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
    
    carregarPontoDeVista();
    carregarDadosDoPlano();
    

    document.getElementById("executar").disabled = false;
    document.getElementById("pausar").disabled = false;
});

document.getElementById("pausar").addEventListener("click", () => {
    flagExecutando = false;
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

