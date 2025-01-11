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
    const lines = data.split('\n');
    const vertices = []; 
    const faces = []; 

    lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') {
            // se for um vértice
            const vertex = parts.slice(1).map(Number);
            vertices.push(vertex);
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

    return {vertices, faces}
}

