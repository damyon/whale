
class Terrain extends Drawable {

  constructor() {
    super();
    this.terrainSize = 40;
    this.terrainLOD = 48;
    this.buffers = null;
  }

  /**
   * initBuffers
   *
   * Initialize the buffers we'll need.
   */
  initBuffers(gl) {
    // Create a buffer for the terrain's vertex positions.
    const terrainPositionBuffer = gl.createBuffer();

    // Select the terrainPositionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainPositionBuffer);

    // Now create an array of positions for the terrain.
    const unit = this.terrainSize / this.terrainLOD;
    let terrainPositions = [], i = 0, j = 0, offset = 0, offsetX = 0, offsetY = 0, offsetZ = 0, one = 0, k = 0;
    one = - this.terrainSize/2;
    for (i = 0; i < this.terrainLOD; i++) {
      for (j = 0; j < this.terrainLOD; j++) {
        offsetX = one + i * unit;
        offsetZ = one + j * unit;

        terrainPositions[offset++] = offsetX;
        terrainPositions[offset++] = offsetY;
        terrainPositions[offset++] = offsetZ;

        terrainPositions[offset++] = offsetX + unit;
        terrainPositions[offset++] = offsetY;
        terrainPositions[offset++] = offsetZ;

        terrainPositions[offset++] = offsetX + unit;
        terrainPositions[offset++] = offsetY;
        terrainPositions[offset++] = offsetZ + unit;

        terrainPositions[offset++] = offsetX;
        terrainPositions[offset++] = offsetY;
        terrainPositions[offset++] = offsetZ + unit;
      }
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainPositions), gl.STATIC_DRAW);


    const terrainTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordBuffer);

    let terrainTextureCoordinates = [];
    offset = 0;

    one = 1 / this.terrainLOD;

    for (i = 0; i < this.terrainLOD; i++) {
      for (j = 0; j < this.terrainLOD; j++) {
        let left = i * one;
        let roof = j * one;
        terrainTextureCoordinates[offset++] = left + one; // X
        terrainTextureCoordinates[offset++] = roof + one; // Y

        terrainTextureCoordinates[offset++] = left; // X
        terrainTextureCoordinates[offset++] = roof + one; // Y

        terrainTextureCoordinates[offset++] = left; // X
        terrainTextureCoordinates[offset++] = roof; // Y

        terrainTextureCoordinates[offset++] = left + one; // X
        terrainTextureCoordinates[offset++] = roof; // Y
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainTextureCoordinates),
                  gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const terrainIndexBuffer = gl.createBuffer();
    let start = 0, terrainIndices = [];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    offset = 0;
    start = 0;
    for (i = 0; i < this.terrainLOD; i++) {
      for (j = 0; j < this.terrainLOD; j++) {
        terrainIndices[offset++] = start;
        terrainIndices[offset++] = start + 2;
        terrainIndices[offset++] = start + 1;

        terrainIndices[offset++] = start;
        terrainIndices[offset++] = start + 3;
        terrainIndices[offset++] = start + 2;
        start += 4;
      }
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(terrainIndices), gl.STATIC_DRAW);

    this.buffers = {
      position: terrainPositionBuffer,
      textureCoord: terrainTextureCoordBuffer,
      indices: terrainIndexBuffer,
    };

    
    // Load the texture.
    this.loadTexture(gl, 'texture/picquet.jpg');

    // Load the heightmap.
    this.loadHeightmap(gl, 'texture/picquet-heightmap.png');

    return this.buffers;
  }

  loadHeightmap(gl, filename) {
    const image = new Image();
    const canvas = document.createElement('canvas');
    image.onload = function() {
      canvas.width = this.terrainLOD + 1;
      canvas.height = this.terrainLOD + 1;
      canvas.getContext('2d').drawImage(image, 0, 0, this.terrainLOD + 1, this.terrainLOD + 1);

      let raw = canvas.getContext('2d').getImageData(0, 0, this.terrainLOD + 1, this.terrainLOD + 1).data;

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      // Now create an array of positions for the terrain.
      const unit = 2 * this.terrainSize / this.terrainLOD;
      let terrainPositions = [], i = 0, j = 0, offset = 0, offsetX = 0, offsetY1 = 0, offsetY2 = 0, offsetY3 = 0, offsetY4 = 0, offsetZ = 0, one = 0, index = 0;
      let terrainNormals = [];
      let lookupOffset = 0;
      let heightOffset = 4.0;
      let heightMapDimensions = 512;

      one = - this.terrainSize;
      // for (i = 0; i < this.terrainLOD; i++) {
      //   for (j = 0; j < this.terrainLOD; j++) {
      for (i = this.terrainLOD - 1; i >= 0; i--) {
        for (j = this.terrainLOD - 1; j >= 0; j--) {
          offsetX = one + i * unit;
          offsetZ = one + j * unit;

          // Consider the height map dimensions.
          index = ((i * (this.terrainLOD + 1)) + j) * 4;
          offsetY1 = (raw[index] / 255) * 1.5 - 0.1;
          index = (((i + 1) * (this.terrainLOD + 1)) + j) * 4;
          offsetY2 = (raw[index] / 255) * 1.5 - 0.1;
          index = (((i + 1) * (this.terrainLOD + 1)) + (j + 1)) * 4;
          offsetY3 = (raw[index] / 255) * 1.5 - 0.1;
          index = ((i * (this.terrainLOD + 1)) + (j + 1)) * 4;
          offsetY4 = (raw[index] / 255) * 1.5 - 0.1;

          lookupOffset = offset;
          terrainPositions[offset++] = offsetX - 6;
          terrainPositions[offset++] = offsetY1 * heightOffset;
          terrainPositions[offset++] = offsetZ;

          terrainPositions[offset++] = offsetX + unit - 6;
          terrainPositions[offset++] = offsetY2 * heightOffset;
          terrainPositions[offset++] = offsetZ;

          terrainPositions[offset++] = offsetX + unit - 6;
          terrainPositions[offset++] = offsetY3 * heightOffset;
          terrainPositions[offset++] = offsetZ + unit;

          terrainPositions[offset++] = offsetX - 6;
          terrainPositions[offset++] = offsetY4 * heightOffset;
          terrainPositions[offset++] = offsetZ + unit;

        }
      }

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainPositions),
                    gl.STATIC_DRAW);
      
    }.bind(this);
    image.src = filename;
  }

  /**
   * draw
   * Draw the terrain.
   * @param gl
   * @param programInfo
   * @param deltaTime
   * @param absTime
   * @param matrices
   */
  draw(gl, camera, shadow) {

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
 //   if (!shadow) {
      var uSampler = gl.getUniformLocation(shadow?camera.lightShaderProgram:camera.cameraShaderProgram, 'uSampler');
      gl.activeTexture(gl.TEXTURE1);

      // Bind the texture to texture unit 1
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // Tell the shader we bound the texture to texture unit 0
      gl.uniform1i(uSampler, 1);
   // }

    {
      const vertexCount = 6 * (this.terrainLOD * this.terrainLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

