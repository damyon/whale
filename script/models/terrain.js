
class Terrain extends Drawable {

  constructor() {
    super();
    this.terrainSize = 20;
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
    // Set up the normals for the vertices, so that we can compute lighting.

    const terrainNormalBuffer = gl.createBuffer();
    const corners = 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);

    let terrainVertexNormals = [];
    offset = 0;

    for (i = 0; i < this.terrainLOD; i++) {
      for (j = 0; j < this.terrainLOD; j++) {
        for (k = 0; k < corners; k++) {
          terrainVertexNormals[offset++] = 0;
          terrainVertexNormals[offset++] = 0;
          terrainVertexNormals[offset++] = 1; // Needs work.
        }
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainVertexNormals),
                  gl.STATIC_DRAW);
    const terrainTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordBuffer);

    let terrainTextureCoordinates = [];
    offset = 0;

    for (i = 0; i < this.terrainLOD; i++) {
      for (j = 0; j < this.terrainLOD; j++) {
        terrainTextureCoordinates[offset++] = 0; // X
        terrainTextureCoordinates[offset++] = 0; // Y

        terrainTextureCoordinates[offset++] = 1; // X
        terrainTextureCoordinates[offset++] = 0; // Y

        terrainTextureCoordinates[offset++] = 1; // X
        terrainTextureCoordinates[offset++] = 1; // Y

        terrainTextureCoordinates[offset++] = 0; // X
        terrainTextureCoordinates[offset++] = 1; // Y
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
        terrainIndices[offset++] = start + 1;
        terrainIndices[offset++] = start + 2;

        terrainIndices[offset++] = start;
        terrainIndices[offset++] = start + 2;
        terrainIndices[offset++] = start + 3;
        start += 4;
      }
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(terrainIndices), gl.STATIC_DRAW);

    this.buffers = {
      position: terrainPositionBuffer,
      normal: terrainNormalBuffer,
      textureCoord: terrainTextureCoordBuffer,
      indices: terrainIndexBuffer,
    };

    // Load the texture.
    this.loadTexture(gl, 'texture/sand.jpg');

    // Load the heightmap.
    this.loadHeightmap(gl, 'texture/heightmap.png');

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
      let normalOffset = 0, k = 0, lookupOffset = 0;

      one = - this.terrainSize;
      let bad = 0;
      for (i = 0; i < this.terrainLOD; i++) {
        for (j = 0; j < this.terrainLOD; j++) {
          offsetX = one + i * unit;
          offsetZ = one + j * unit;

          index = ((i * this.terrainLOD) + j) * 4;
          offsetY1 = (raw[index] / 255) * 1.5 - 0.1;
          index = (((i + 1) * this.terrainLOD) + j) * 4;
          offsetY2 = (raw[index] / 255) * 1.5 - 0.1;
          index = (((i + 1) * this.terrainLOD) + (j + 1)) * 4;
          offsetY3 = (raw[index] / 255) * 1.5 - 0.1;
          index = ((i * this.terrainLOD) + (j + 1)) * 4;
          offsetY4 = (raw[index] / 255) * 1.5 - 0.1;

          lookupOffset = offset;
          terrainPositions[offset++] = offsetX - 6;
          terrainPositions[offset++] = offsetY1;
          terrainPositions[offset++] = offsetZ;

          terrainPositions[offset++] = offsetX + unit - 6;
          terrainPositions[offset++] = offsetY2;
          terrainPositions[offset++] = offsetZ;

          terrainPositions[offset++] = offsetX + unit - 6;
          terrainPositions[offset++] = offsetY3;
          terrainPositions[offset++] = offsetZ + unit;

          terrainPositions[offset++] = offsetX - 6;
          terrainPositions[offset++] = offsetY4;
          terrainPositions[offset++] = offsetZ + unit;

          let x1 = terrainPositions[lookupOffset + 3] - terrainPositions[lookupOffset]; 
          let y1 = terrainPositions[lookupOffset + 4] - terrainPositions[lookupOffset + 1]; 
          let z1 = terrainPositions[lookupOffset + 5] - terrainPositions[lookupOffset + 2]; 

          let x2 = terrainPositions[lookupOffset + 6] - terrainPositions[lookupOffset]; 
          let y2 = terrainPositions[lookupOffset + 7] - terrainPositions[lookupOffset + 1]; 
          let z2 = terrainPositions[lookupOffset + 8] - terrainPositions[lookupOffset + 2]; 

          for (k = 0; k < 4; k++) {
            // X:1 Y:2 Z:3 1:A 2:B
            let xN = y1 * z2 - z1 * y2;
            let yN = z1 * x2 - x1 * z2;
            let zN = x1 * y2 - y1 * x2;
            let c = vec3.create(), result = vec3.create();
            vec3.cross(result, vec3.fromValues(x1, y1, z1), vec3.fromValues(x2, y2, z2));
            vec3.normalize(c, result);
            vec3.negate(c, c);

            terrainNormals[normalOffset++] = c[0];
            terrainNormals[normalOffset++] = c[1];
            terrainNormals[normalOffset++] = c[2];

            
          }
        }
      }
      console.log(bad);
      normalOffset = 0;
      for (i = 0; i < this.terrainLOD; i++) {
        for (j = 0; j < this.terrainLOD; j++) {
          if (j == this.terrainLOD - 1 || i == this.terrainLOD - 1) {
            normalOffset += 12;
          } else {
            let row = this.terrainLOD * 12;
            lookupOffset = normalOffset;
            normalOffset += 3;

            // Top
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + row + 0];
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + row + 1];
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + row + 2];

            // Right
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + row + 12];
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + row + 13];
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + row + 14];
            
            // Bottom
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + 12];
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + 13];
            terrainNormals[normalOffset++] = terrainNormals[lookupOffset + 14];

          }
        }
      }

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainPositions),
                    gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainNormals),
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
  draw(gl, programInfo, deltaTime, absTime, matrices) {

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
        matrices.projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        matrices.modelViewMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        matrices.normalMatrix);

    // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
      const vertexCount = 6 * (this.terrainLOD * this.terrainLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

