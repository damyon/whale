class ProjectedModel extends Drawable {
  constructor() {
    super();
    this.size = 3.5;
    this.LOD = 42;
    this.fat = 0.6;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.angle = 0;
    this.globalAngle = 0;
    this.pivotOffset = 0;
    this.centerOffset = 0;
    this.clipLimit = 0.1;
    this.clampLimit = 0.2;
    this.buffers = null;
    this.textureLoaded = new Promise((resolve, reject) => {
      this.textureResolver = resolve;
    });
    this.vertexCount = 0;
    this.positions = [];
    this.currentLOD = 3;
    this.lowestLOD = 1;
    this.highestLOD = 3;
    this.clipCount = 0;
  }

  evaluateLOD(gl, cameraX, cameraY, cameraZ) {
    // Based on the distance to the camera, tweak the LOD;
    let distance = Math.sqrt(Math.abs(this.x - cameraX) + 
      Math.abs(this.y - cameraY) + 
      Math.abs(this.z - cameraZ));
    let LODBoundary = 16;
  
    console.log('Distance: ' + distance + ' size:' + this.size);
    // Increase LOD?
    if ((distance < LODBoundary * 0.8) && (this.currentLOD < this.highestLOD)) {
      this.currentLOD++;
      console.log('Increase LOD (' + this.LOD + ')');
      this.initBuffers(gl);
    }

    // Decrease LOD?
    if ((distance > LODBoundary) && (this.currentLOD > this.lowestLOD)) {
      this.currentLOD--;
      console.log('Decrease LOD (' + this.LOD + ')');
      this.initBuffers(gl);
    }
  }
  
  /**
   * Chain a block of code to execute when the texture is loaded.
   * 
   * @param {Function} callback 
   * @return {Promise}
   */
  afterTextureLoaded(callback) {
    return this.textureLoaded.then(callback);
  }

   /**
   * Apply an offset to the position of all the vertices.
   *
   */
  setPosition(gl, x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    let translatedPositions = [], i = 0, c = 0, s = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    translatedPositions = this.positions.slice();

    // Now locally rotate.
    c = Math.cos(this.angle);
    s = Math.sin(this.angle);
    
    // Move - half
    for (i = 0; i < this.getVertexCount(); i++) {
      translatedPositions[i * 3] += 1.75*this.size + this.pivotOffset;
    }

    // Local rotate
    for (i = 0; i < this.getVertexCount(); i++) {
      let x = translatedPositions[i * 3];
      let z = translatedPositions[i * 3 + 2];

      translatedPositions[i * 3] = x * c - z * s;
      translatedPositions[i * 3 + 2] = x * s + z * c;
    }
    
    // Now global rotation.
    c = Math.cos(this.globalAngle);
    s = Math.sin(this.globalAngle);

    // Global rotate
    for (i = 0; i < this.getVertexCount(); i++) {
      let x = translatedPositions[i * 3];
      let z = translatedPositions[i * 3 + 2];

      translatedPositions[i * 3] = x * c - z * s;
      translatedPositions[i * 3 + 2] = x * s + z * c;
    }
    
    // Move + half
    for (i = 0; i < this.getVertexCount(); i++) {
      translatedPositions[i * 3] -= 1.75*this.size + this.pivotOffset;
    }

    
    // Now translate.
    for (i = 0; i < this.getVertexCount(); i++) {
      translatedPositions[i * 3] += this.x;
      translatedPositions[i * 3 + 1] += this.y;
      translatedPositions[i * 3 + 2] += this.z;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(translatedPositions), gl.STATIC_DRAW);
  }

  setPositionRotation(gl, x, y, z, angle) {
    this.angle = angle;
    this.setPosition(gl, x, y, z);
  }

  setGlobalRotation(gl, globalAngle) {
    this.globalAngle = globalAngle;
    this.setPosition(gl, this.x, this.y, this.z);
  }

  setWaveRotation(gl, offset) {

    let angle = Math.sin(offset * 0.2) / 6;
    
    this.setPositionRotation(gl, this.x, this.y, this.z, angle);
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

    // Now create an array of positions for the terrain.
    const unit = this.size / this.getLOD();
    let i = 0, j = 0, offset = 0, offsetX = 0, offsetY = 0, offsetZ = 0, one = 0, k = 0;

    one = - this.size/2;
    for (k = 0; k < 2; k++) {
      for (i = 0; i < this.getLOD(); i++) {
        for (j = 0; j < this.getLOD(); j++) {
          offsetX = one + i * unit;
          offsetZ = one + j * unit;

          this.positions[offset++] = offsetX;
          this.positions[offset++] = offsetY;
          this.positions[offset++] = offsetZ;

          this.positions[offset++] = offsetX + unit;
          this.positions[offset++] = offsetY;
          this.positions[offset++] = offsetZ;

          this.positions[offset++] = offsetX + unit;
          this.positions[offset++] = offsetY + unit;
          this.positions[offset++] = offsetZ;

          this.positions[offset++] = offsetX;
          this.positions[offset++] = offsetY + unit;
          this.positions[offset++] = offsetZ;
        }
      }
    }

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    let textureCoordinates = [];
    offset = 0;

    one = 1 / this.getLOD();
    
    for (k = 0; k < 2; k++) {
      for (i = 0; i < this.getLOD(); i++) {
        for (j = 0; j < this.getLOD(); j++) {
          
          let left = i * one;
          let roof = j * one;

          textureCoordinates[offset++] = left + one; // X
          textureCoordinates[offset++] = roof + one; // Y

          textureCoordinates[offset++] = left; // X
          textureCoordinates[offset++] = roof + one; // Y

          textureCoordinates[offset++] = left; // X
          textureCoordinates[offset++] = roof; // Y

          textureCoordinates[offset++] = left + one; // X
          textureCoordinates[offset++] = roof; // Y
        }
      }
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
    offset = 0;
    start = 0;
    for (k = 0; k < 2; k++) {
      for (i = 0; i < this.getLOD(); i++) {
        for (j = 0; j < this.getLOD(); j++) {
          indices[offset++] = start;
          indices[offset++] = start + 2;
          indices[offset++] = start + 1;
  
          indices[offset++] = start;
          indices[offset++] = start + 3;
          indices[offset++] = start + 2;
          start += 4;
        }
      }
    }

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.buffers = {
      position: positionBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer,
    };
    
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

  getLOD() {
    let LOD = this.LOD, reduce = this.currentLOD;

    while (reduce != this.highestLOD) {
      LOD /= 2;
      reduce += 1;
    }

    return LOD;
  }

  getVertexCount() {
    //return ((6 * (this.getLOD()) * (this.getLOD()) * 2) - (this.clipCount * 6));
    return this.vertexCount;
  }
  

  loadShape(gl, filename) {
    const image = new Image();
    const canvas = document.createElement('canvas');
    image.onload = function() {
      canvas.width = this.getLOD() + 1;
      canvas.height = this.getLOD() + 1;
      canvas.getContext('2d').drawImage(image, 0, 0, this.getLOD() + 1, this.getLOD() + 1);

      let raw = canvas.getContext('2d').getImageData(0, 0, this.getLOD() + 1, this.getLOD() + 1).data;

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      // Now create an array of positions for the terrain.
      const unit = 2 * this.size / this.getLOD();
      let i = 0, j = 0, k = 0, offset = 0, offsetX = 0, offsetZ1 = 0, offsetZ2 = 0, offsetZ3 = 0, offsetZ4 = 0, offsetY = 0, one = 0, index = 0;
      let row = 0, splat = 0;
      let heightOffset = this.fat, inverse = 1, clipList = [], clipOffset = 0, clampList = [];
      let clip1 = 0, clip2 = 0, clip3 = 0, clip4 = 0, hSkew = 0;
      
      one = - this.size;
      raw = this.flip(raw, this.getLOD() + 1);
      raw = this.spin(raw, this.getLOD() + 1);
      
      clipOffset = 0;

      let i2 = 0, j2 = 0;
      for (k = 0; k < 1; k++) {
        for (i = this.getLOD() - 1; i >= 0; i--) {
          for (j = this.getLOD() - 1; j >= 0; j--) {
            // Consider the map dimensions.
            
            index = ((i * (this.getLOD() + 1)) + (j + 1)) * 4;
            index = raw.length - index;
            clip1 = raw[index];
            index = (((i + 1) * (this.getLOD() + 1)) + (j + 1)) * 4;
            index = raw.length - index;
            clip2 = raw[index];
            index = (((i + 1) * (this.getLOD() + 1)) + (j + 2)) * 4;
            index = raw.length - index;
            clip3 = raw[index];
            index = ((i * (this.getLOD() + 1)) + (j + 2)) * 4;
            index = raw.length - index;
            clip4 = raw[index];
            
            if ((clip1 + clip2 + clip3 + clip4) < (this.clipLimit - 0.9)) {
              // This a clip candidate - we want to clamp all the neighbours.
              clampList.push({ i: i, j: j});
            }
          }
        }
      }

      let clamp = null;

      for (clamp of clampList) {
        if (j > 0) {
          i2 = clamp.i;
          j2 = clamp.j - 1;

          index = ((i2 * (this.getLOD() + 1)) + (j2 + 1)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
          index = (((i2 + 1) * (this.getLOD() + 1)) + (j2 + 1)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
        }
        
        // Right
        if (j < this.getLOD() - 1) {
          i2 = clamp.i;
          j2 = clamp.j + 1;

          index = (((i2 + 1) * (this.getLOD() + 1)) + (j2 + 2)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
          index = ((i2 * (this.getLOD() + 1)) + (j2 + 2)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
        }
        // Up
        if (i > 0) {
          i2 = clamp.i - 1;
          j2 = clamp.j;

          index = (((i2 + 1) * (this.getLOD() + 1)) + (j2 + 1)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
          index = (((i2 + 1) * (this.getLOD() + 1)) + (j2 + 2)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
        }

        // Down
        if (i < this.getLOD() - 1) {
          i2 = clamp.i + 1;
          j2 = clamp.j;

          index = ((i2 * (this.getLOD() + 1)) + (j2 + 1)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
          index = ((i2 * (this.getLOD() + 1)) + (j2 + 2)) * 4;
          index = raw.length - index;
          if (raw[index] > 1) {
            raw[index] = 1;
          }
        }
      }
      // HERE

      clipOffset = 0;
      offset = 0;
      for (k = 0; k < 2; k++) {
        for (i = this.getLOD() - 1; i >= 0; i--) {
          for (j = this.getLOD() - 1; j >= 0; j--) {
            // Shift every second row 1/2 a unit right.
            hSkew = j % 2;
            
            offsetX = one + i * unit;
            offsetY = one + j * unit;
            if (k) {
              inverse = -1;
            } else {
              inverse = 1;
            }
            
            // Consider the map dimensions.
            
            index = ((i * (this.getLOD() + 1)) + (j + 1)) * 4;
            index = raw.length - index;
            offsetZ1 = (raw[index] / 255) * 1.5;
            clip1 = raw[index];
            index = (((i + 1) * (this.getLOD() + 1)) + (j + 1)) * 4;
            index = raw.length - index;
            offsetZ2 = (raw[index] / 255) * 1.5;
            clip2 = raw[index];
            if (hSkew) {
              clip2 += raw[index + 4];
              clip2 /=2;
            }
            index = (((i + 1) * (this.getLOD() + 1)) + (j + 2)) * 4;
            index = raw.length - index;
            offsetZ3 = (raw[index] / 255) * 1.5;
            clip3 = raw[index];
            index = ((i * (this.getLOD() + 1)) + (j + 2)) * 4;
            index = raw.length - index;
            offsetZ4 = (raw[index] / 255) * 1.5;
            clip4 = raw[index];
            if (hSkew) {
              clip4 += raw[index + 4];
              clip4 /=2;
            }
            let nonZeroCandidate = 0, needsSplat = [];
            
            if (clip1 > this.clipLimit) {
              nonZeroCandidate = offset;
            } else {
              needsSplat.push(offset);
            }
            this.positions[offset++] = offsetX - 6 + (hSkew * (unit/2));
            this.positions[offset++] = offsetY;
            this.positions[offset++] = offsetZ1 * heightOffset * inverse; 
            if (clip1 < this.clampLimit) {
              this.positions[offset - 1] = 0;
            } 
        
            if (clip2  > this.clipLimit) {
              nonZeroCandidate = offset;
            } else {
              needsSplat.push(offset);
            }
            this.positions[offset++] = offsetX + unit - 6 + (hSkew * (unit/2));
            this.positions[offset++] = offsetY;
            this.positions[offset++] = offsetZ2 * heightOffset * inverse; 
            if (clip2 < this.clampLimit) {
              this.positions[offset - 1] = 0;
            } 
        
            if (clip3  > this.clipLimit) {
              nonZeroCandidate = offset;
            } else {
              needsSplat.push(offset);
            }
            this.positions[offset++] = offsetX + unit - 6;
            this.positions[offset++] = offsetY + unit;
            this.positions[offset++] = offsetZ3 * heightOffset * inverse; 
            if (clip3 < this.clampLimit) {
              this.positions[offset - 1] = 0;
            } 
        
            if (clip4  > this.clipLimit) {
              nonZeroCandidate = offset;
            } else {
              needsSplat.push(offset);
            }
            this.positions[offset++] = offsetX - 6;
            this.positions[offset++] = offsetY + unit;
            this.positions[offset++] = offsetZ4 * heightOffset * inverse;
            if (clip4 < this.clampLimit) {
              this.positions[offset - 1] = 0;
            }
        
            if ((clip1 + clip2 + clip3 + clip4) < (this.clipLimit - 0.9)
                && (clip1 != 1 && clip2 != 1 && clip3 != 1 && clip4 != 1)) {
              if (inverse == 1) {
                clipList.push(clipOffset);
              }
            }
            clipOffset++;
          }
        }
      }

      /*
      clipOffset = 0;
      offset = 0;
      let direction = 0;
      for (k = 0; k < 2; k++) {
        for (i = this.getLOD() - 1; i >= 0; i--) {
          for (j = this.getLOD() - 1; j >= 0; j--) {
            clipOffset = k * (this.getLOD() * this.getLOD())
               + (this.getLOD() - 1 - i) * (this.getLOD())
               + (this.getLOD() - 1 - j);
            if (clipList.includes(clipOffset)) {
              if (j > 0) {
                clipOffset = k * (this.getLOD() * this.getLOD())
                  + (this.getLOD() - 1 - i) * (this.getLOD())
                  + (this.getLOD() - 1 - (j-1));

                this.positions[clipOffset*12 + 3 + 2] = 0;
                this.positions[clipOffset*12 + 6 + 2] = 0;
              }

              if (j < this.getLOD() - 1) {
                clipOffset = k * (this.getLOD() * this.getLOD())
                  + (this.getLOD() - 1 - i) * (this.getLOD())
                  + (this.getLOD() - 1 - (j+1));

                this.positions[clipOffset*12 + 3 + 2] = 0;
                this.positions[clipOffset*12 + 6 + 2] = 0;
              }

              if (i > 0) {
                clipOffset = k * (this.getLOD() * this.getLOD())
                  + (this.getLOD() - 1 - i - 1) * (this.getLOD())
                  + (this.getLOD() - 1 - (j));

                this.positions[clipOffset*12 + 3 + 2] = 0;
                this.positions[clipOffset*12 + 6 + 2] = 0;
              }

              if (i < this.getLOD() - 1) {
                clipOffset = k * (this.getLOD() * this.getLOD())
                  + (this.getLOD() - 1 - i + 1) * (this.getLOD())
                  + (this.getLOD() - 1 - (j));

                this.positions[clipOffset*12 + 3 + 2] = 0;
                this.positions[clipOffset*12 + 6 + 2] = 0;
              }
              
            }
            offset += 12;
            clipOffset++;
          }
        }
        clipOffset = 0;
      }
      */

      let posIndex = 0;
      
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions),
                    gl.STATIC_DRAW);
      console.log('Positions:' + clipOffset);

      const indexBuffer = gl.createBuffer();
      let start = 0, indices = [];
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.
      offset = 0;
      start = 0;
      posIndex = 0;
      let skipN = 0, noSkipN = 0, skipNK = 0, noSkipNK = 0;
      for (k = 0; k < 2; k++) {
        for (i = this.getLOD() - 1; i >= 0; i--) {
          for (j = this.getLOD() - 1; j >= 0; j--) {
            if (!clipList.includes(posIndex)) {
              indices[offset++] = start;
              indices[offset++] = start + 2;
              indices[offset++] = start + 1;
            
              indices[offset++] = start;
              indices[offset++] = start + 3;
              indices[offset++] = start + 2;
              
            } else {
              indices[offset++] = 0;
              indices[offset++] = 0;
              indices[offset++] = 0;
              indices[offset++] = 0;
              indices[offset++] = 0;
              indices[offset++] = 0;
              
            }
            posIndex++;
            start += 4;
          }
        }
        posIndex = 0
      }
      // Now send the element array to GL

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      this.buffers.indices = indexBuffer;

      const textureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

      let textureCoordinates = [];
      offset = 0;

      one = 1 / this.getLOD();
      posIndex = 0;
      for (k = 0; k < 2; k++) {
        for (i = this.getLOD() - 1; i >= 0; i--) {
          for (j = this.getLOD() - 1; j >= 0; j--) {
            if (!clipList.includes(posIndex)) {
            
              let left = i * one;
              let roof = j * one;

              textureCoordinates[offset++] = left + one; // X
              textureCoordinates[offset++] = roof + one; // Y

              textureCoordinates[offset++] = left; // X
              textureCoordinates[offset++] = roof + one; // Y

              textureCoordinates[offset++] = left; // X
              textureCoordinates[offset++] = roof; // Y

              textureCoordinates[offset++] = left + one; // X
              textureCoordinates[offset++] = roof; // Y
            }
            posIndex++;
          }
        }
        posIndex = 0;
      }

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                    gl.STATIC_DRAW);
      this.buffers.texture = textureCoordBuffer;
  
      this.clipCount = clipList.length * 2;
      this.vertexCount = indices.length;
      console.log('Total clip: ' + this.clipCount);
      this.setPosition(gl, this.x, this.y, this.z);
      this.textureResolver(true);
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
    if (shadow) {
      gl.uniform1i(camera.isWater, 0);
    }

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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    
    // Tell WebGL we want to affect texture unit 0

    var uSampler = gl.getUniformLocation(shadow?camera.lightShaderProgram:camera.cameraShaderProgram, 'uSampler');
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture to texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    if (shadow) {
      gl.uniform1i(uSampler, 1);
    }

    {
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      
      gl.drawElements(gl.TRIANGLES, this.getVertexCount(), type, offset);
    }

  }
}