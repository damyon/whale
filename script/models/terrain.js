
class Terrain extends Drawable {

  constructor() {
    super();
    this.terrainSize = 48;
    this.terrainLOD = 64;
    this.buffers = null;
    this.textureRepeat = 40;
    this.heightsLoaded = new Promise((resolve, reject) => {
      this.heightsResolver = resolve;
    });
    this.rockDensity = 64;
    this.rockSlope = 0.6;
    this.rockPositions = [];
    this.bushPositions = [];
    this.treePositions = [];
    this.bushDensity = 256;
    this.bushMinHeight = 0.2;
    this.bushSlope = 0.01;
    this.treeDensity = 24;
    this.treeMinHeight = 4;
    this.treeSlope = 0.3;
   
  }

  /**
   * Chain a block of code to execute when the heights are loaded.
   * 
   * @param {Function} callback 
   * @return {Promise}
   */
  afterHeightsLoaded(callback) {
    return this.heightsLoaded.then(callback);
  }

  /**
   * Create a list of rocks depending on the density of the terrain.
   */
  createRocks() {
    let rocks = [], i = 0;

    for (i = 0; i < this.rockDensity; i++) {
      rocks.push(new Rock(i));
    }

    return rocks;
  }

  /**
   * Create a list of trees depending on the density of the terrain.
   */
  createTrees() {
    let trees = [], i = 0;

    for (i = 0; i < this.treeDensity; i++) {
      trees.push(new Tree(i));
    }

    return trees;
  }

  setTreePositions(gl, trees) {
    let i = 0;

    for (i = 0; i < this.treeDensity && i < this.treePositions.length; i++) {
      let x = this.treePositions[i].x,
          y = this.treePositions[i].y,
          z = this.treePositions[i].z;

      trees[i].setPosition(gl, x, y, z);
    }
  }

  /**
   * Create a list of bushes depending on the density of the terrain.
   */
  createBushes() {
    let bushes = [], i = 0;

    for (i = 0; i < this.bushDensity; i++) {
      bushes.push(new Bush(i));
    }

    return bushes;
  }

  setRockPositions(gl, rocks) {
    let i = 0;

    for (i = 0; i < this.rockDensity && i < this.rockPositions.length; i++) {
      let x = this.rockPositions[i].x,
          y = this.rockPositions[i].y,
          z = this.rockPositions[i].z;

      rocks[i].setPosition(gl, x, y, z);
    }
  }

  setBushPositions(gl, bushes) {
    let i = 0;

    for (i = 0; i < this.bushDensity && i < this.bushPositions.length; i++) {
      let x = this.bushPositions[i].x,
          y = this.bushPositions[i].y,
          z = this.bushPositions[i].z;

      bushes[i].setPosition(gl, x, y, z);
    }
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
    one *= this.textureRepeat;

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
    this.loadTexture(gl, 'texture/sand.jpg');

    // Load the heightmap.
    this.loadHeightmap(gl, 'texture/island-height.png');

    return this.buffers;
  }

  spin(raw, size) {
    let result = [], x = 0, y = 0, index = 0, indexr = 0;

    for (x = 0; x < size; x++) {
      for (y = size - 1; y >= 0; y--) {
        index = (x + y * size) * 4;

        result[indexr] = raw[index];
        result[indexr + 1] = raw[index + 1];
        result[indexr + 2] = raw[index + 2];
        result[indexr + 3] = raw[index + 3];

        indexr += 4; 
      }
    }

    return result;
  }

  flip(raw, size) {
    let result = [], x = 0, y = 0, index = 0, indexr = 0;

    for (x = size - 1; x >= 0; x--) {
      for (y = 0; y < size; y++) {
        index = (x * size + y) * 4;

        result[indexr] = raw[index];
        result[indexr + 1] = raw[index + 1];
        result[indexr + 2] = raw[index + 2];
        result[indexr + 3] = raw[index + 3];

        indexr += 4; 
      }
    }

    return result;
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
      let lastTreePosition = 0;

      one = - this.terrainSize;
      raw = this.flip(raw, this.terrainLOD + 1);
      raw = this.spin(raw, this.terrainLOD + 1);
      for (i = this.terrainLOD - 1; i >= 0; i--) {
        for (j = this.terrainLOD - 1; j >= 0; j--) {
          offsetX = one + i * unit;
          offsetZ = one + j * unit;

          // Consider the height map dimensions.
          index = ((i * (this.terrainLOD + 1)) + (j + 1)) * 4;
          index = raw.length - index;
          offsetY1 = (raw[index] / 255) * 1.5 - 0.1;
          index = (((i + 1) * (this.terrainLOD + 1)) + (j + 1)) * 4;
          index = raw.length - index;
          offsetY2 = (raw[index] / 255) * 1.5 - 0.1;
          index = (((i + 1) * (this.terrainLOD + 1)) + (j + 2)) * 4;
          index = raw.length - index;
          offsetY3 = (raw[index] / 255) * 1.5 - 0.1;
          index = ((i * (this.terrainLOD + 1)) + (j + 2)) * 4;
          index = raw.length - index;
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

          // Simple slope.
          let aveOthers = (terrainPositions[lookupOffset + 4] + 
            terrainPositions[lookupOffset + 7] +
            terrainPositions[lookupOffset + 10]
          ) / 3;
          let slope = terrainPositions[lookupOffset + 1] - aveOthers;

          slope = Math.abs(slope);
          if (slope > this.rockSlope &&
              aveOthers > 1.5 && 
              this.rockPositions.length < this.rockDensity) {
            this.rockPositions.push({
              x: terrainPositions[lookupOffset],
              y: terrainPositions[lookupOffset + 1],
              z: terrainPositions[lookupOffset + 2]
            });
          }

          if (slope < this.bushSlope &&
            terrainPositions[lookupOffset + 1] > this.bushMinHeight &&
              this.bushPositions.length < this.bushDensity) {
              this.bushPositions.push({
              x: terrainPositions[lookupOffset],
              y: terrainPositions[lookupOffset + 1],
              z: terrainPositions[lookupOffset + 2]
            });
          }

          if (slope < this.treeSlope &&
            terrainPositions[lookupOffset + 1] > this.treeMinHeight &&
            this.treePositions.length < this.treeDensity && 
            lookupOffset - lastTreePosition > 100) {
          this.treePositions.push({
            x: terrainPositions[lookupOffset],
            y: terrainPositions[lookupOffset + 1],
            z: terrainPositions[lookupOffset + 2]
          });
          lastTreePosition = lookupOffset;
        }
        }
      }
      
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainPositions),
                    gl.STATIC_DRAW);
      this.heightsResolver(true);
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

    // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0

    var uSampler = gl.getUniformLocation(shadow?camera.lightShaderProgram:camera.cameraShaderProgram, 'uSampler');
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture to texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(uSampler, 1);
   

    {
      const vertexCount = 6 * (this.terrainLOD * this.terrainLOD);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
}

