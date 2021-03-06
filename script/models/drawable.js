'use strict';

class Drawable {
  constructor() {
    this.currentLOD = 3;
    this.lowestLOD = 3;
    this.highestLOD = 3;
    this.texture = null;
    this.rotateY = 0;
    this.positionX = 0;
    this.positionY = 0;
    this.positionZ = 0;
    this.blend = 0;
    this.textureLoadedOnce = false;
  }

  evaluateLOD(gl, cameraX, cameraY, cameraZ) {
    return;
  }

  initBuffers(gl) {
  }

  animateTextureCoordinates(gl, textureCoordBuffer, deltaTime) {
  }

  predraw(gl) {
    if (this.blend) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);  
    }
  }

  postdraw(gl) {
    if (this.blend) {
      gl.disable(gl.BLEND);
    }
  }

  draw(gl) {
    gl.uniform1i(camera.isSand, 0);
    var modelViewMatrix = mat4.create();

    mat4.rotateY(modelViewMatrix, modelViewMatrix, this.rorateY);
    mat4.translate(modelViewMatrix, modelViewMatrix, [this.positionX, this.positionY, this.positionZ]);

    var lightModelViewMatrix = mat4.create();
    mat4.multiply(lightModelViewMatrix, lightViewMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(uLightMatrix, false, lightModelViewMatrix);
  }

  isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

  loadTexture(gl, url) {
    if (this.textureLoadedOnce) {
      return;
    }

    this.textureLoadedOnce = true;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 0, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);

    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn of mips and set
         // wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    }.bind(this);
    image.src = url;

    this.texture = texture;
    return this.texture;
  }
}
