
class Star extends Drawable {

  constructor(invert) {
    super();
    this.starLOD = 16;
    this.invert = invert?-1:1;
    this.starSize = 3;
    this.buffers = null;
  }

  /**
   * initBuffers
   *
   * Initialize the buffers we'll need.
   */
  initBuffers(gl) {
    // Create a buffer for the star's vertex positions.
    const starPositionBuffer = gl.createBuffer();

    // Select the starPositionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, starPositionBuffer);

    // Now create an array of positions for the star.
    const unit = this.starSize / this.starLOD;
    let starPositions = [], i = 0, offset = 0, offsetX = 0, offsetY = this.starSize, offsetZ = 0, one = 0, k = 0,
    skew = 2;
    one = (2 * Math.PI) / this.starLOD;
    for (i = 0; i < this.starLOD; i++) {
      offsetX = Math.sin(i * one) * this.starSize / 15 + skew;
      offsetZ = Math.cos(i * one) * this.starSize / 15 - skew;
      offsetY = this.starSize + (this.invert * 0.1);
      starPositions[offset++] = offsetX;
      starPositions[offset++] = offsetY;
      starPositions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.starSize / 15 + skew;
      offsetZ = Math.cos((i + 1) * one) * this.starSize / 15 - skew;
      offsetY = this.starSize + (this.invert * 0.1);
      starPositions[offset++] = offsetX;
      starPositions[offset++] = offsetY;
      starPositions[offset++] = offsetZ;

      offsetX = 0 + skew;
      offsetZ = 0 - skew;
      offsetY = this.starSize + (this.invert * -0.3);
      starPositions[offset++] = offsetX;
      starPositions[offset++] = offsetY;
      starPositions[offset++] = offsetZ;
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starPositions), gl.STATIC_DRAW);


    const starTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starTextureCoordBuffer);

    let starTextureCoordinates = [];
    offset = 0;

    for (i = 0; i < this.starLOD; i++) {
      starTextureCoordinates[offset++] = 0; // X
      starTextureCoordinates[offset++] = 0; // Y

      starTextureCoordinates[offset++] = 1; // X
      starTextureCoordinates[offset++] = 0; // Y

      starTextureCoordinates[offset++] = 0.5; // X
      starTextureCoordinates[offset++] = 5; // Y
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starTextureCoordinates),
                  gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const starIndexBuffer = gl.createBuffer();
    let start = 0, starIndices = [];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, starIndexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    for (i = 0; i < this.starLOD * 3; i++) {
      starIndices[i] = i;
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(starIndices), gl.STATIC_DRAW);

    this.buffers = {
      position: starPositionBuffer,
      textureCoord: starTextureCoordBuffer,
      indices: starIndexBuffer,
    };

    // Load the texture.
    this.loadTexture(gl, 'texture/star.jpg');

    return this.buffers;
  }

  /**
   * draw
   * Draw the star.
   * @param gl
   * @param camera
   */
  draw(gl, camera) {
    //gl.uniform3fv(camera.uColor, [0.8, 0.8, 0.2]);
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    gl.uniform1i(camera.isWater, 0);
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      const vertexPosition = gl.getAttribLocation(camera.lightShaderProgram, 'aVertexPosition')

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
      const textureCoord = gl.getAttribLocation(camera.cameraShaderProgram, 'aTextureCoord')

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

    // gl.useProgram(programInfo.program);

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

    // Tell WebGL we want to affect texture unit 0

    /*
    // Tell WebGL we want to affect texture unit 1
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    // Tell the shader we bound the depth texture to texture unit 1
    gl.uniform1i(programInfo.uniformLocations.uDepthTexture, 1);
    */
    // Tell WebGL we want to affect texture unit 1
    var uSampler = gl.getUniformLocation(camera.lightShaderProgram, 'uSampler');
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture to texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(uSampler, 1);

    {
      const vertexCount = 3 * this.starLOD; //(this.starLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

