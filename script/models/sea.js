
class Sea extends Drawable {

  constructor() {
    super();
    this.seaLOD = 1;
    this.seaSize = 40;
    this.buffers = null;
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
    let seaPositions = [], i = 0, j = 0, offset = 0, offsetX = 0, offsetY = 0, offsetZ = 0, one = 0, k = 0;
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
    // Set up the normals for the vertices, so that we can compute lighting.

    const seaNormalBuffer = gl.createBuffer();
    const corners = 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, seaNormalBuffer);

    let seaVertexNormals = [];
    offset = 0;

    for (i = 0; i < this.seaLOD; i++) {
      for (j = 0; j < this.seaLOD; j++) {
        for (k = 0; k < corners; k++) {
          seaVertexNormals[offset++] = 0;
          seaVertexNormals[offset++] = 0;
          seaVertexNormals[offset++] = 1;
        }
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seaVertexNormals),
                  gl.STATIC_DRAW);
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
        seaIndices[offset++] = start + 1;
        seaIndices[offset++] = start + 2;

        seaIndices[offset++] = start;
        seaIndices[offset++] = start + 2;
        seaIndices[offset++] = start + 3;
        start += 4;
      }
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(seaIndices), gl.STATIC_DRAW);

    this.buffers = {
      position: seaPositionBuffer,
      normal: seaNormalBuffer,
      textureCoord: seaTextureCoordBuffer,
      indices: seaIndexBuffer,
    };
    return this.buffers;
  }

  /**
   * animateTextureCoordinates
   * Make ripples and waves by adjusting the texture coordinates with a sine wave.
   *
   * @param gl
   * @param textureCoordBuffer
   * @param deltaTime
   */
  animateTextureCoordinates(gl, textureCoordBuffer, deltaTime) {
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const loopDelay = 0.1;
    const loopDelay2 = 0.2;

    const animation = (Math.sin(deltaTime * loopDelay) + 1) / 8;
    const animation2 = (Math.sin(deltaTime * loopDelay2) + 1) / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    let seaTextureCoordinates = [];
    let offset = 0;
    let i = 0, j = 0;

    for (i = 0; i < this.seaLOD; i++) {
      for (j = 0; j < this.seaLOD; j++) {
        seaTextureCoordinates[offset++] = animation; // X
        seaTextureCoordinates[offset++] = animation; // Y

        seaTextureCoordinates[offset++] = 0.5 + animation + animation2; // X
        seaTextureCoordinates[offset++] = animation; // Y

        seaTextureCoordinates[offset++] = 0.5 + animation; // X
        seaTextureCoordinates[offset++] = 0.5 + animation - animation2; // Y

        seaTextureCoordinates[offset++] = animation + animation2; // X
        seaTextureCoordinates[offset++] = 0.5 + animation + animation2; // Y
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seaTextureCoordinates),
                  gl.STATIC_DRAW);
  }

  /**
   * draw
   * Draw the sea.
   * @param gl
   * @param programInfo
   * @param texture
   * @param deltaTime
   * @param absTime
   */
  draw(gl, programInfo, texture, deltaTime, absTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, -1.0, -6.0]);  // amount to translate

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;

      // Animate the texture coordinates.
      this.animateTextureCoordinates(gl, this.buffers.textureCoord, absTime);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
      gl.vertexAttribPointer(
          programInfo.attribLocations.textureCoord,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.textureCoord);
    }

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexNormal,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexNormal);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);

    // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
      const vertexCount = 6 * (this.seaLOD * this.seaLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

