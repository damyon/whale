
class Cloud extends Drawable {

    constructor(index) {
      super();
      this.size = 512;
      this.offset = 1;
      this.buffers = null;
      this.x = 0;
      this.y = 0;
      this.z = 0;
  
      this.blend = 1;
      this.vertexCount = 3 * 2;
      this.sourcePositions = [];
      this.index = index + 1;
    }
  
    /**
     * Apply an offset to the position of all the vertices.
     *
     */
    setPosition(gl, x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
  
      let translatedPositions = [];
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      translatedPositions = this.sourcePositions.slice();
      let i = 0;
      for (i = 0; i < this.vertexCount; i++) {
        translatedPositions[i * 3] += this.x;
        translatedPositions[i * 3 + 1] += this.y;
        translatedPositions[i * 3 + 2] += this.z;
      }
  
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(translatedPositions), gl.STATIC_DRAW);
      
    }
  
    /**
     * initBuffers
     *
     * Initialize the buffers we'll need.
     */
    initBuffers(gl) {
      // Create a buffer for the vertex positions.
      const positionBuffer = gl.createBuffer();
  
      // Select the positionBuffer as the one to apply buffer
      // operations to from here out.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
      // Now create an array of positions.
      const unit = this.size;
      let i = 0, offset = 0, offsetX = 0, offsetY = this.size, offsetZ = 0, one = 0, k = 0;
      
      // Front 1
      offsetX = - unit;
      offsetZ = 0;
      offsetY = - unit;

      this.sourcePositions[offset++] = offsetX;
      this.sourcePositions[offset++] = offsetY;
      this.sourcePositions[offset++] = offsetZ;

      offsetX = unit;
      offsetZ = 0;
      offsetY = - unit;

      this.sourcePositions[offset++] = offsetX;
      this.sourcePositions[offset++] = offsetY;
      this.sourcePositions[offset++] = offsetZ;

      offsetX = unit;
      offsetZ = 0;
      offsetY = unit;

      this.sourcePositions[offset++] = offsetX;
      this.sourcePositions[offset++] = offsetY;
      this.sourcePositions[offset++] = offsetZ;

      // Front 2
      offsetX = - unit;
      offsetZ = 0;
      offsetY = - unit;

      this.sourcePositions[offset++] = offsetX;
      this.sourcePositions[offset++] = offsetY;
      this.sourcePositions[offset++] = offsetZ;

      offsetX = unit;
      offsetZ = 0;
      offsetY = unit;

      this.sourcePositions[offset++] = offsetX;
      this.sourcePositions[offset++] = offsetY;
      this.sourcePositions[offset++] = offsetZ;

      offsetX = - unit;
      offsetZ = 0;
      offsetY = unit;

      this.sourcePositions[offset++] = offsetX;
      this.sourcePositions[offset++] = offsetY;
      this.sourcePositions[offset++] = offsetZ;

      // Now pass the list of positions into WebGL to build the
      // shape. We do this by creating a Float32Array from the
      // JavaScript array, then use it to fill the current buffer.
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sourcePositions), gl.STATIC_DRAW);
      
      // Set the texture coordinates.
      const textureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  
      let textureCoordinates = [];
      offset = 0;
    
      textureCoordinates[offset++] = 0; // X
      textureCoordinates[offset++] = 0; // Z
      
      textureCoordinates[offset++] = 1; // X
      textureCoordinates[offset++] = 0; // Z
      
      textureCoordinates[offset++] = 1; // X
      textureCoordinates[offset++] = 1; // Z
      
      textureCoordinates[offset++] = 0; // X
      textureCoordinates[offset++] = 0; // Z
      
      textureCoordinates[offset++] = 1; // X
      textureCoordinates[offset++] = 1; // Z
      
      textureCoordinates[offset++] = 0; // X
      textureCoordinates[offset++] = 1; // Z
      
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                    gl.STATIC_DRAW);
  
      // Build the element array buffer; this specifies the indices
      // into the vertex arrays for each face's vertices.
  
      const indexBuffer = gl.createBuffer();
      let start = 0, indices = [];
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
      // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.
      for (i = 0; i < this.vertexCount; i++) {
        indices[i] = i;
      }
  
      // Now send the element array to GL
  
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indices), gl.STATIC_DRAW);
  
      this.buffers = {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
      };
  
      // Load the texture.
      this.loadTexture(gl, 'texture/cloud.png');
  
      return this.buffers;
    }
  
    /**
     * Draw the thing.
     * @param gl
     * @param camera
     */
    draw(gl, camera, shadow) {
      // Tell WebGL how to pull out the positions from the position
      // buffer into the vertexPosition attribute
      if (shadow) {
        gl.uniform1i(camera.isWater, 0);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord);
        gl.vertexAttribPointer(
            textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(textureCoord);
      }
  
      // Tell WebGL which indices to use to index the vertices
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
  
      // Tell WebGL we want to affect texture unit 1
      if (shadow) {
        var uSampler = gl.getUniformLocation(camera.cameraShaderProgram, 'uSampler');
        gl.activeTexture(gl.TEXTURE1);
  
        // Bind the texture to texture unit 1
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
  
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(uSampler, 1);
      }
  
      {
        const vertexCount = this.vertexCount;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }
  
    }
  }
  
  