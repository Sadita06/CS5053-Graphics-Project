// Defines all objects in the scene

let vertexBuffer, indexBuffer;
let indexCount;



// =======================
// GROUND PLANE
// =======================
export function initWorld(gl) {
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

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    indexCount = indices.length;

}
