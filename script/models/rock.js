
class Rock extends Drawable {

  constructor(x, y, z) {
    super();
    this.LOD = 8;
    this.size = 1;
    this.offset = 5;
    this.buffers = null;
    this.x = x;
    this.y = y;
    this.z = z;

    this.vertexCount = this.LOD * 3 * 4;
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
    const unit = this.size / this.LOD;
    let positions = [], i = 0, offset = 0, offsetX = 0, offsetY = this.size, offsetZ = 0, one = 0, k = 0,
    skew = 2;
    one = (2 * Math.PI) / this.LOD;
    // Top
    for (i = 0; i < this.LOD; i++) {
      offsetX = Math.sin(i * one) * this.size + skew + this.x;
      offsetZ = Math.cos(i * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.size + skew + this.x;
      offsetZ = Math.cos((i + 1) * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = 0 + skew + this.x;
      offsetZ = 0 - skew + this.z;
      offsetY = this.offset + this.size / 2 + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;
    }
    // Side 1
    for (i = 0; i < this.LOD; i++) {
      offsetX = Math.sin(i * one) * this.size + skew + this.x;
      offsetZ = Math.cos(i * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y - this.size;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.size + skew + this.x;
      offsetZ = Math.cos((i + 1) * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y - this.size;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = Math.sin(i * one) * this.size + skew + this.x;
      offsetZ = Math.cos(i * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;
    }
    // Side 2
    for (i = 0; i < this.LOD; i++) {
      offsetX = Math.sin(i * one) * this.size + skew + this.x;
      offsetZ = Math.cos(i * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.size + skew + this.x;
      offsetZ = Math.cos((i + 1) * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.size + skew + this.x;
      offsetZ = Math.cos((i + 1) * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y - this.size;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;
    }

    // Bottom
    for (i = 0; i < this.LOD; i++) {
      offsetX = Math.sin(i * one) * this.size + skew + this.x;
      offsetZ = Math.cos(i * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y - this.size;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = Math.sin((i + 1) * one) * this.size + skew + this.x;
      offsetZ = Math.cos((i + 1) * one) * this.size - skew + this.z;
      offsetY = this.offset + this.y - this.size;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;

      offsetX = 0 + skew + this.x;
      offsetZ = 0 - skew + this.z;
      offsetY = this.offset - this.size*2 + this.y;
      positions[offset++] = offsetX;
      positions[offset++] = offsetY;
      positions[offset++] = offsetZ;
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    let textureCoordinates = [];
    offset = 0;
    for (i = 0; i < this.vertexCount / 3; i++) {
      textureCoordinates[offset++] = 0; // X
      textureCoordinates[offset++] = 0; // Y

      textureCoordinates[offset++] = 1 / this.size; // X
      textureCoordinates[offset++] = 0; // Y

      textureCoordinates[offset++] = 2 / this.size; // X
      textureCoordinates[offset++] = this.size; // Y
    }

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
    this.loadTexture(gl, 'texture/rock.jpg');

    return this.buffers;
  }

  /**
   * draw
   * Draw the rock.
   * @param gl
   * @param camera
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

