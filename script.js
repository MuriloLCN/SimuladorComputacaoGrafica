let executando = false;

let dadosModelo3D = null;

function setup() {
    let canvas = createCanvas(windowWidth * 0.67, windowHeight * 0.9);
    canvas.parent("canvas-container");
}

function draw() {
    if (!executando)
    {
        return;
    }
    
    background(200);
    // TODO: Colocar uma lógica de verificar se foi realizado o upload de um objeto válido

    // Lógica de desenho vem aqui...
}

// Handlers 

document.getElementById("executar").addEventListener("click", () => {
    executando = true;
});

document.getElementById("pausar").addEventListener("click", () => {
    executando = false;
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
    // Fazer o parse do arquivo aqui e montar a matriz de pontos pra gente poder começar a executar
}

