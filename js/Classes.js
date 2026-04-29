class ReflectiveShape
{
    constructor(vertices, indices, textureCoords, normals, colorTexture=null, normalTexture = null) // Accept an optional color and normal map texture
    {
        this.vertices = vertices;
        this.indices = indices;
        this.textureCoords = textureCoords;
        this.normals = normals;
        var tangentFrame = CalculateTangents(this.vertices, this.indices, this.textureCoords, this.normals);
        this.cubeMapTexture; //cubeMapTexture;
        this.colorTexture = colorTexture || CreateEmptyTexture(gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR, gl.RGBA, 1, 1, new Uint8Array([255, 255, 255, 255]));
        this.normalTexture = normalTexture || CreateEmptyTexture(gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR, gl.RGBA, 1, 1, new Uint8Array([128, 128, 255, 255])); // Fall back to a flat normal map
        this.size = [1.0, 1.0, 1.0];
        this.position = [0.0, 0.0, 0.0];
        this.rotation = [0.0, 0.0, 0.0];
        this.blendFactor = 1.0;
        this.bumpStrength = 2.0; // Control how strongly the normal map perturbs the surface

        //Material Properties
        this.AmbientMaterial=[1.0, 1.0, 1.0, 1.0];
        this.DiffuseMaterial=[1.0, 1.0, 1.0, 1.0];
        this.SpecularMaterial=[1.0,1.0,1.0,1.0];
        this.Shininess=200.0;

        this.vao = setVAO();

        this.vertexBuffer = SetBufferAndAttribute(myWebGL, "coordinates", this.vertices, 3, 0, 0);
        this.textureBuffer = SetBufferAndAttribute(myWebGL, "textureCoordinates", this.textureCoords, 2, 0, 0);
        this.normalBuffer = SetBufferAndAttribute(myWebGL, "normal", this.normals, 3, 0, 0);
        this.tangentBuffer = SetBufferAndAttribute(myWebGL, "tangent", tangentFrame.tangents, 3, 0, 0);
        this.bitangentBuffer = SetBufferAndAttribute(myWebGL, "bitangent", tangentFrame.bitangents, 3, 0, 0);
        SetIndexBuffer(this.indices);

        unbindVAO();
    }

    render()
    {
        Scale(myWebGL, this.size[0], this.size[1], this.size[2]);
        Translate(myWebGL, this.position[0], this.position[1], this.position[2]);
        Rotate(myWebGL, this.rotation[0], 'x');
        Rotate(myWebGL, this.rotation[1], 'y');
        Rotate(myWebGL, this.rotation[2], 'z');

        bindVAO(this.vao);

        //Send information to the shader to be used
        setUniform4f(myWebGL, "ambientMat",
            this.AmbientMaterial[0], this.AmbientMaterial[1], this.AmbientMaterial[2], this.AmbientMaterial[3]);
        setUniform4f(myWebGL, "diffuseMat",
            this.DiffuseMaterial[0], this.DiffuseMaterial[1], this.DiffuseMaterial[2], this.DiffuseMaterial[3]);
        setUniform4f(myWebGL, "specularMat",
            this.SpecularMaterial[0], this.SpecularMaterial[1], this.SpecularMaterial[2], this.SpecularMaterial[3]);
        setUniform1f(myWebGL, "shininess", this.Shininess);

        ActivateTexture(gl.TEXTURE0, gl.TEXTURE_2D, this.colorTexture); // Bind 2D texture
        ActivateTexture(gl.TEXTURE1, gl.TEXTURE_CUBE_MAP, this.cubeMapTexture); // Bind cubemap texture
        ActivateTexture(gl.TEXTURE2, gl.TEXTURE_2D, this.normalTexture); // Bind the normal map texture

        setUniform1i(myWebGL, "uTexture", 0); // 2D texture sampler unit - This value needs to match the Texture unit in TEXTURE0
        setUniform1i(myWebGL, "uCubeMap", 1); // Cubemap sampler unit - This value needs to match the Texture unit in TEXTURE1
        setUniform1i(myWebGL, "uNormalMap", 2); // Normal-map sampler unit - This value needs to match the Texture unit in TEXTURE2
        setUniform1i(myWebGL, "uUseSkybox", 0); // Disable skybox
        setUniform1f(myWebGL, "uBumpStrength", this.bumpStrength); // Send the bump intensity to the shader
        setUniform1f(myWebGL, "uBlendFactor", this.blendFactor); // Blend factor

        if(this.blendFactor >= 1.0)
        {
            setUniform1i(myWebGL, "uUseReflectionMap", 1);
            setUniform1i(myWebGL, "uUseBlendMap", 0);
        }
        else if(this.blendFactor > 0.0)
        {
            setUniform1i(myWebGL, "uUseReflectionMap", 0);
            setUniform1i(myWebGL, "uUseBlendMap", 1);
        }
        else
        {
            setUniform1i(myWebGL, "uUseReflectionMap", 0);
            setUniform1i(myWebGL, "uUseBlendMap", 0);
        }

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        setUniform1i(myWebGL, "uUseReflectionMap", 0);
        setUniform1i(myWebGL, "uUseBlendMap", 0);
        setUniform1f(myWebGL, "uBumpStrength", 0.0); // Reset bump strength after drawing
        setUniform1f(myWebGL, "uBlendFactor", 0.0);

        unbindVAO();
    }
}