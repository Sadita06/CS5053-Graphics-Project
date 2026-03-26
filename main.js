/*
Main entry point for WebGL application

Responsibilities:
- Get WebGL context from canvas
- Compile shaders (vertex + fragment)
- Create buffers (geometry data)
- Set up camera matrices (view + projection)
- Start render loop
- Call other modules (player, world, lighting, collision)
*/

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

// =======================
// SHADERS
// =======================

const vertexShaderSource = `
attribute vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
`;

const fragmentShaderSource = `

precision mediump float;

void main() {
    gl_FragColor = vec4(0.2, 0.8, 0.2, 1.0);
}
`;

// =======================
// SHADER SETUP
// =======================

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// =======================
// GROUND PLANE
// =======================

const vertices = new Float32Array([
    -5, 0, -5,   // bottom left
     5, 0, -5,   // bottom right
     5, 0,  5,   // top right
    -5, 0,  5    // top left
]);

const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3
]);

// =======================
// BUFFERS
// =======================

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// =======================
// ATTRIBUTES
// =======================

const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

// =======================
// MATRICES (simple versions)
// =======================

function getProjectionMatrix() {
    const fov = Math.PI / 8;
    const aspect = canvas.width / canvas.height;
    const near = 0.1;
    const far = 100;

    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near+far)*rangeInv, -1,
        0, 0, near*far*rangeInv*2, 0
    ]);
}

function getViewMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 0.9, 0.4, 0,
        0, -0.4, 0.9, 0,
        0, -2, -5, 1
    ]);
}

function getModelMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Float32Array([
        c,0,s,0,
        0,1,0,0,
       -s,0,c,0,
        0,0,0,1
    ]);
}

// =======================
// UNIFORMS
// =======================

const uModel = gl.getUniformLocation(program, "uModel");
const uView = gl.getUniformLocation(program, "uView");
const uProjection = gl.getUniformLocation(program, "uProjection");

gl.uniformMatrix4fv(uProjection, false, getProjectionMatrix());
gl.uniformMatrix4fv(uView, false, getViewMatrix());

// =======================
// RENDER LOOP
// =======================

gl.enable(gl.DEPTH_TEST);

let angle = 0;

function render() {
    //angle += 0.01;

    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(uModel, false, getModelMatrix(angle));

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
}

render();