
class Leaves extends Drawable {

  constructor() {
    super();
    this.treeLOD = 16;
    this.treeSize = 3;
    this.treeOffset = 2.3;
    this.buffers = null;
  }

  /**
   * initBuffers
   *
   * Initialize the buffers we'll need.
   */
  initBuffers(gl) {
    // Create a buffer for the tree's vertex positions.
    const treePositionBuffer = gl.createBuffer();

    // Select the treePositionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, treePositionBuffer);

    // Now create an array of positions for the tree.
    const unit = this.treeSize / this.treeLOD;
    let treePositions = [], i = 0, offset = 0, offsetX = 0, offsetY = this.treeSize, offsetZ = 0, one = 0, k = 0,
    skew = 2;
    one = (2 * Math.PI) / this.treeLOD;
    for (i = 0; i < this.treeLOD; i++) {
      offsetX = Math.sin(i * one) * this.treeSize / 4 + skew;
      offsetZ = Math.cos(i * one) * this.treeSize / 4 - skew;
      offsetY = 0.6 + this.treeOffset;
      treePositions[offset++] = offsetX;
      treePositions[offset++] = offsetY;
      treePositions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.treeSize / 4 + skew;
      offsetZ = Math.cos((i + 1) * one) * this.treeSize / 4 - skew;
      offsetY = 0.6 + this.treeOffset;
      treePositions[offset++] = offsetX;
      treePositions[offset++] = offsetY;
      treePositions[offset++] = offsetZ;

      offsetX = 0 + skew;
      offsetZ = 0 - skew;
      offsetY = this.treeSize + this.treeOffset;
      treePositions[offset++] = offsetX;
      treePositions[offset++] = offsetY;
      treePositions[offset++] = offsetZ;
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(treePositions), gl.STATIC_DRAW);

    const treeTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, treeTextureCoordBuffer);

    let treeTextureCoordinates = [];
    offset = 0;

    for (i = 0; i < this.treeLOD; i++) {
      treeTextureCoordinates[offset++] = 0; // X
      treeTextureCoordinates[offset++] = 0; // Y

      treeTextureCoordinates[offset++] = 1; // X
      treeTextureCoordinates[offset++] = 0; // Y

      treeTextureCoordinates[offset++] = 0.5; // X
      treeTextureCoordinates[offset++] = 5; // Y
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(treeTextureCoordinates),
                  gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const treeIndexBuffer = gl.createBuffer();
    let start = 0, treeIndices = [];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, treeIndexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    for (i = 0; i < this.treeLOD * 3; i++) {
    //for (i = 0; i < 3; i++) {
      treeIndices[i] = i;
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(treeIndices), gl.STATIC_DRAW);

    this.buffers = {
      position: treePositionBuffer,
      textureCoord: treeTextureCoordBuffer,
      indices: treeIndexBuffer,
    };

    // Load the texture.
    this.loadTexture(gl, 'texture/leaves.jpg');

    return this.buffers;
  }

  /**
   * draw
   * Draw the tree.
   * @param gl
   * @param camera
   */
  draw(gl, camera, shadow) {
    // gl.uniform3fv(camera.uColor, [0.2, 0.8, 0.2]);
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    gl.uniform1i(camera.isWater, 0);
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      const vertexPosition = gl.getAttribLocation(camera.lightShaderProgram, 'aVertexPosition');

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      gl.vertexAttribPointer(
          vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          vertexPosition);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      const textureCoord = gl.getAttribLocation(camera.cameraShaderProgram, 'aTextureCoord');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
      gl.vertexAttribPointer(
          textureCoord,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          textureCoord);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    // Tell WebGL to use our program when drawing

  /*
    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        matrices.projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        matrices.modelViewMatrix);
*/

/*

    // Tell WebGL we want to affect texture unit 1
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    // Tell the shader we bound the depth texture to texture unit 1
    gl.uniform1i(programInfo.uniformLocations.uDepthTexture, 1);
  */
    // Tell WebGL we want to affect texture unit 1
    // if (!shadow) {
      var uSampler = gl.getUniformLocation(shadow?camera.lightShaderProgram:camera.cameraShaderProgram, 'uSampler');
      gl.activeTexture(gl.TEXTURE1);

      // Bind the texture to texture unit 1
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // Tell the shader we bound the texture to texture unit 0
      gl.uniform1i(uSampler, 1);
   //  }

    {
      const vertexCount = 3 * this.treeLOD; //(this.treeLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

