
class Sea extends Drawable {

  constructor(scale, yoffset, blend) {
    super();
    this.seaLOD = 1;
    this.seaSize = scale;
    this.yoffset = yoffset;
    this.buffers = null;
    this.blend = blend;
  }

  /**
   * initBuffers
   *
   * Initialize the buffers we'll need.
   */
  initBuffers(gl) {
    // Create a buffer for the sea's vertex positions.
    const seaPositionBuffer = gl.createBuffer();

    // Select the seaPositionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, seaPositionBuffer);

    // Now create an array of positions for the sea.
    const unit = this.seaSize / this.seaLOD;
    let seaPositions = [], i = 0, j = 0, offset = 0, offsetX = 0, offsetY = this.yoffset, offsetZ = 0, one = 0, k = 0;
    one = - this.seaSize/2;
    for (i = 0; i < this.seaLOD; i++) {
      for (j = 0; j < this.seaLOD; j++) {
        offsetX = one + i * unit;
        offsetZ = one + j * unit;

        seaPositions[offset++] = offsetX;
        seaPositions[offset++] = offsetY;
        seaPositions[offset++] = offsetZ;

        seaPositions[offset++] = offsetX + unit;
        seaPositions[offset++] = offsetY;
        seaPositions[offset++] = offsetZ;

        seaPositions[offset++] = offsetX + unit;
        seaPositions[offset++] = offsetY;
        seaPositions[offset++] = offsetZ + unit;

        seaPositions[offset++] = offsetX;
        seaPositions[offset++] = offsetY;
        seaPositions[offset++] = offsetZ + unit;
      }
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seaPositions), gl.STATIC_DRAW);
    const seaTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seaTextureCoordBuffer);

    let seaTextureCoordinates = [];
    offset = 0;

    for (i = 0; i < this.seaLOD; i++) {
      for (j = 0; j < this.seaLOD; j++) {
        seaTextureCoordinates[offset++] = 0; // X
        seaTextureCoordinates[offset++] = 0; // Y

        seaTextureCoordinates[offset++] = 1; // X
        seaTextureCoordinates[offset++] = 0; // Y

        seaTextureCoordinates[offset++] = 1; // X
        seaTextureCoordinates[offset++] = 1; // Y

        seaTextureCoordinates[offset++] = 0; // X
        seaTextureCoordinates[offset++] = 1; // Y
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seaTextureCoordinates),
                  gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const seaIndexBuffer = gl.createBuffer();
    let start = 0, seaIndices = [];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, seaIndexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    offset = 0;
    start = 0;
    for (i = 0; i < this.seaLOD; i++) {
      for (j = 0; j < this.seaLOD; j++) {
        seaIndices[offset++] = start;
        seaIndices[offset++] = start + 2;
        seaIndices[offset++] = start + 1;

        seaIndices[offset++] = start;
        seaIndices[offset++] = start + 3;
        seaIndices[offset++] = start + 2;
        start += 4;
      }
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(seaIndices), gl.STATIC_DRAW);

    this.buffers = {
      position: seaPositionBuffer,
      textureCoord: seaTextureCoordBuffer,
      indices: seaIndexBuffer,
    };

    // Load the texture.
    this.loadTexture(gl, 'texture/water.png');

    return this.buffers;
  }

  /**
   * animateTextureCoordinates
   * Make ripples and waves by adjusting the texture coordinates with a sine wave.
   *
   * @param gl
   * @param textureCoordBuffer
   * @param absTime
   */
  animateTextureCoordinates(gl, textureCoordBuffer, absTime) {
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const loopDelay = 0.1;
    const loopDelay2 = 0.5;
    const loopDelay3 = 0.3;
    absTime /= 30;

    const animation = (Math.sin(absTime * loopDelay) + 1) / 48;
    const animation2 = (Math.sin(absTime * loopDelay2) + 1) / 38;
    const animation3 = (Math.sin(absTime * loopDelay3) + 1) / 28;
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    let seaTextureCoordinates = [];
    let offset = 0;
    let i = 0, j = 0;

    for (i = 0; i < this.seaLOD; i++) {
      for (j = 0; j < this.seaLOD; j++) {
        seaTextureCoordinates[offset++] = animation; // X
        seaTextureCoordinates[offset++] = animation; // Y

        seaTextureCoordinates[offset++] = 0.5 + animation + animation2 + animation3; // X
        seaTextureCoordinates[offset++] = animation; // Y

        seaTextureCoordinates[offset++] = 0.5 + animation; // X
        seaTextureCoordinates[offset++] = 0.5 + animation - animation2 + animation3; // Y

        seaTextureCoordinates[offset++] = animation + animation2 + animation3; // X
        seaTextureCoordinates[offset++] = 0.5 + animation + animation2 + animation3; // Y
      }
    }
    for (i = 0; i < seaTextureCoordinates.length; i++) {
      seaTextureCoordinates[i] *= 6;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seaTextureCoordinates),
                  gl.STATIC_DRAW);
  }

  /**
   * draw
   * Draw the sea.
   * @param gl
   * @param camera
   * @param deltaTime
   * @param absTime
   */
  draw(gl, camera, shadow, deltaTime, absTime) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    if (shadow) {
      gl.uniform1i(camera.isWater, 1);
    }

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

      // Animate the texture coordinates.
      this.animateTextureCoordinates(gl, this.buffers.textureCoord, absTime);

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

    // Set the shader uniforms

/*
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        matrices.projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        matrices.modelViewMatrix);
*/
    // Specify the texture to map onto the faces.
    if (shadow) {
      var uSampler = gl.getUniformLocation(camera.cameraShaderProgram, 'uSampler');
      gl.activeTexture(gl.TEXTURE1);

      // Bind the texture to texture unit 1
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // Tell the shader we bound the texture to texture unit 0
      gl.uniform1i(uSampler, 1);
    }


    {
      const vertexCount = 6 * (this.seaLOD * this.seaLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

