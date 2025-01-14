let flagExecutando = false;
let flagDesenhar = true;

let dadosModelo3D = null;

let matrizDoObjeto = [];
let faces = [];

let plano = [];
let vetorNormalAoPlano = [];
let pontoDeVista = [];

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
        let t = parseInt(valor);
        if (isNaN(t))
        {
            alert("Argumentos do plano inválidos, tente novamente");
            throw "Argumentos do plano inválidos, tente novamente";
        }
        return parseInt(valor);
    })

    v = v.map((valor) => {
        let t = parseInt(valor);
        if (isNaN(t))
        {
            alert("Argumentos do plano inválidos, tente novamente");
            throw "Argumentos do plano inválidos, tente novamente";
        }
        return parseInt(valor);
    })

    w = w.map((valor) => {
        let t = parseInt(valor);
        if (isNaN(t))
        {
            alert("Argumentos do plano inválidos, tente novamente");
            throw "Argumentos do plano inválidos, tente novamente";
        }
        return parseInt(valor);
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
        print(movedX);
        print(movedY);

        // alterar o plano com base no moved x e y
        flagDesenhar = true;
    }

}

// Função do p5.js
function draw() {
    if (!flagExecutando)
    {
        return;
    }

    // se alguma delas mexer, re-desenhar
    if (keyIsDown(LEFT_ARROW) === true) {
        // mexer no ponto de vista
        flagDesenhar = true;
    }

    if (keyIsDown(RIGHT_ARROW) === true) {
        // mexer no ponto de vista
        flagDesenhar = true;
    }

    if (keyIsDown(UP_ARROW) === true) {
        // mexer no ponto de vista
        flagDesenhar = true;
    }

    if (keyIsDown(DOWN_ARROW) === true) {
        // mexer no ponto de vista
        flagDesenhar = true;
    }

    if (!flagDesenhar)
    {
        return;
    }

    background(0);
    stroke(0,150,0);
    fill(0,150,0);

    circle(mouseX, mouseY, 20);

    calcularVetorNormalAoPlano();
    
    // calcular 'd'
    
    // calcular matriz perspectiva
    
    // multiplicar objeto pela matriz perspectiva

    // normalizar objeto

    // jogar para o viewport (obs: o canva do p5.js começa em 0,0 no canto superior esquerdo, u_min e v_min são 0 eu acho)
    
    // Lógica de desenho vem aqui...

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
            const vertex = parts.slice(1).map(Number);
            matrizDoObjeto.push(vertex);
        } else if (parts[0] === 'f') {
            // se for uma face
            const face = parts.slice(1).map(triade => {
                return parseInt(triade.split('/')[0], 10); // dependendo do arquivo, as faces são definidas como 'f 1/2/3', em que 2 representa a textura e 1 é o índice do vetor normal
            });
            faces.push(face);
        }
    });

    console.log("Vertices:", vertices);
    console.log("Faces:", faces);

    // return {vertices, faces}
}

