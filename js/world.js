// world.js
// Defines all objects in the scene

let vertexBuffer, indexBuffer;
let indexCount;

export function initWorld(gl) {
  const vertices = new Float32Array([
    -5, 0, -5,
     5, 0, -5,
     5, 0,  5,
    -5, 0,  5
  ]);

  const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3
  ]);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  indexCount = indices.length;
}

export function drawWorld(gl, aPosition, uModel, uColor) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const modelMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);

  gl.uniformMatrix4fv(uModel, false, modelMatrix);
  gl.uniform4fv(uColor, [0.2, 0.8, 0.2, 1.0]);

  gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
}
