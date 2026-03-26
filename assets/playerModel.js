export function drawPlayer(gl, programInfo, position, rotation) {
  // create model matrix
  let model = Identity();

  model = Multiply(model, Translate(position.x, position.y, position.z));
  model = Multiply(model, RotateY(rotation.y));

  setUniformMatrix4fv(programInfo, "uModel", model);

  // draw a cube placeholder figure for now
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
