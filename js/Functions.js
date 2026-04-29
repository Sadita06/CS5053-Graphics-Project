function CalculateTangents(vertices, indices, textureCoords, normals) {
  var tangents = new Array(vertices.length).fill(0.0);
  var bitangents = new Array(vertices.length).fill(0.0);

  for (var i = 0; i < indices.length; i += 3) {
    var i0 = indices[i];
    var i1 = indices[i + 1];
    var i2 = indices[i + 2];

    var p0 = i0 * 3;
    var p1 = i1 * 3;
    var p2 = i2 * 3;
    var uv0 = i0 * 2;
    var uv1 = i1 * 2;
    var uv2 = i2 * 2;

    var x1 = vertices[p1] - vertices[p0];
    var y1 = vertices[p1 + 1] - vertices[p0 + 1];
    var z1 = vertices[p1 + 2] - vertices[p0 + 2];
    var x2 = vertices[p2] - vertices[p0];
    var y2 = vertices[p2 + 1] - vertices[p0 + 1];
    var z2 = vertices[p2 + 2] - vertices[p0 + 2];

    var s1 = textureCoords[uv1] - textureCoords[uv0];
    var t1 = textureCoords[uv1 + 1] - textureCoords[uv0 + 1];
    var s2 = textureCoords[uv2] - textureCoords[uv0];
    var t2 = textureCoords[uv2 + 1] - textureCoords[uv0 + 1];

    var denom = s1 * t2 - s2 * t1;
    if (Math.abs(denom) < 1e-6)
      continue;

    var r = 1.0 / denom;
    var tangent = [
      (x1 * t2 - x2 * t1) * r,
      (y1 * t2 - y2 * t1) * r,
      (z1 * t2 - z2 * t1) * r
    ];
    var bitangent = [
      (x2 * s1 - x1 * s2) * r,
      (y2 * s1 - y1 * s2) * r,
      (z2 * s1 - z1 * s2) * r
    ];

    for (var j = 0; j < 3; j++) {
      tangents[p0 + j] += tangent[j];
      tangents[p1 + j] += tangent[j];
      tangents[p2 + j] += tangent[j];
      bitangents[p0 + j] += bitangent[j];
      bitangents[p1 + j] += bitangent[j];
      bitangents[p2 + j] += bitangent[j];
    }
  }

  for (var k = 0; k < vertices.length; k += 3) {
    var nx = normals[k];
    var ny = normals[k + 1];
    var nz = normals[k + 2];

    var tx = tangents[k];
    var ty = tangents[k + 1];
    var tz = tangents[k + 2];
    var tDotN = tx * nx + ty * ny + tz * nz;
    tx -= nx * tDotN;
    ty -= ny * tDotN;
    tz -= nz * tDotN;
    var tLen = Math.hypot(tx, ty, tz);
    if (tLen > 1e-6) {
      tangents[k] = tx / tLen;
      tangents[k + 1] = ty / tLen;
      tangents[k + 2] = tz / tLen;
    } else {
      tangents[k] = 1.0;
      tangents[k + 1] = 0.0;
      tangents[k + 2] = 0.0;
    }

    var bx = bitangents[k];
    var by = bitangents[k + 1];
    var bz = bitangents[k + 2];
    var bDotN = bx * nx + by * ny + bz * nz;
    bx -= nx * bDotN;
    by -= ny * bDotN;
    bz -= nz * bDotN;
    var bLen = Math.hypot(bx, by, bz);
    if (bLen > 1e-6) {
      bitangents[k] = bx / bLen;
      bitangents[k + 1] = by / bLen;
      bitangents[k + 2] = bz / bLen;
    } else {
      bitangents[k] = 0.0;
      bitangents[k + 1] = 1.0;
      bitangents[k + 2] = 0.0;
    }
  }

  return { tangents: tangents, bitangents: bitangents };
}

function CreateImageTexture(_source, _wrap, _minFilter, _magFilter, _placeholder = null) { // Load a 2D texture from an image file
	var texture = gl.createTexture(); // Create the texture object
	gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture for setup
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _wrap); // Horizontal wrap mode
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _wrap); // Vertical wrap mode
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _minFilter); // Minification filter
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, _magFilter); // Magnification filter
	var placeholder = _placeholder || new Uint8Array([128, 128, 128, 255]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholder);
	var image = new Image(); 
	image.onload = function(){ // Upload the image once it finishes loading
		gl.bindTexture(gl.TEXTURE_2D, texture); // Rebind the texture before upload
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // WebGL images load top-down, so flip them for standard UVs
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // Copy the image into GPU memory
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // Reset global unpack state so other uploads are unaffected
		if (UsesMipmaps(_minFilter))
			gl.generateMipmap(gl.TEXTURE_2D); // Build mipmaps only when the chosen filter needs them
	}; 
	image.onerror = function() {
		console.error("Failed to load image texture:", _source);
	};
	image.src = _source; // Start loading the requested file
	return texture; 
} 