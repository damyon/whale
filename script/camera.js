'use strict';

class Camera {
  constructor() {
    this.shadowDepthTextureSize = 1024;
    // We create a vertex shader from the light's point of view. You never see this in the
    // demo. It is used behind the scenes to create a texture that we can use to test testing whether
    // or not a point is inside of our outside of the shadow
    this.lightVertexGLSL = `
      attribute vec3 aVertexPosition;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;

      void main (void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      }
    `;
    this.lightFragmentGLSL = `
      precision mediump float;

      vec4 encodeFloat (float depth) {
        const vec4 bitShift = vec4(
          256 * 256 * 256,
          256 * 256,
          256,
          1.0
        );
        const vec4 bitMask = vec4(
          0,
          1.0 / 256.0,
          1.0 / 256.0,
          1.0 / 256.0
        );
        vec4 comp = fract(depth * bitShift);
        comp -= comp.xxyz * bitMask;
        return comp;
      }

      void main (void) {
        // Encode the distance into the scene of this fragment.
        // We'll later decode this when rendering from our camera's
        // perspective and use this number to know whether the fragment
        // that our camera is seeing is inside of our outside of the shadow
        gl_FragColor = encodeFloat(gl_FragCoord.z);
      }
    `;

    // We create a vertex shader that renders the scene from the camera's point of view.
    // This is what you see when you view the demo
    this.cameraVertexGLSL = `
      attribute vec3 aVertexPosition;
      attribute vec2 aTextureCoord;

      uniform mat4 uPMatrix;
      uniform mat4 uMVMatrix;
      uniform mat4 lightMViewMatrix;
      uniform mat4 lightProjectionMatrix;
      varying highp vec2 vTextureCoord;

      // Used to normalize our coordinates from clip space to (0 - 1)
      // so that we can access the corresponding point in our depth color texture
      const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

      varying vec2 vDepthUv;
      varying vec4 shadowPos;

      void main (void) {
        highp vec3 directionalVector = normalize(vec3(0, 1, 2));
        highp vec3 ambientLight = vec3(0.4, 0.4, 0.4);
        highp vec3 directionalLightColor = vec3(0.1, 0.1, 0.3);

        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

        shadowPos = texUnitConverter * lightProjectionMatrix * lightMViewMatrix * vec4(aVertexPosition, 1.0);

        vTextureCoord = aTextureCoord;
      }
    `;
    this.cameraFragmentGLSL = `
      precision mediump float;

      varying vec2 vDepthUv;
      varying vec4 shadowPos;
      varying highp vec2 vTextureCoord;

      uniform sampler2D depthColorTexture;
      uniform sampler2D uSampler;
      uniform vec3 uColor;
      uniform bool isWater;

      float decodeFloat (vec4 color) {
        const vec4 bitShift = vec4(
          1.0 / (256.0 * 256.0 * 256.0),
          1.0 / (256.0 * 256.0),
          1.0 / 256.0,
          1
        );
        return dot(color, bitShift);
      }

      void main(void) {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
        highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
        highp vec3 directionalLightColor = vec3(0.2, 0.2, 0.2);
        vec3 fragmentDepth = shadowPos.xyz;
        float shadowAcneRemover = 0.005;
        fragmentDepth.z -= shadowAcneRemover;

        float texelSize = 1.0 / ${this.shadowDepthTextureSize}.0;
        float amountInLight = 0.0;

        // Check whether or not the current fragment and the 8 fragments surrounding
        // the current fragment are in the shadow. We then average out whether or not
        // all of these fragments are in the shadow to determine the shadow contribution
        // of the current fragment.
        // So if 4 out of 9 fragments that we check are in the shadow then we'll say that
        // this fragment is 4/9ths in the shadow so it'll be a little brighter than something
        // that is 9/9ths in the shadow.
        for (int x = -3; x <= 3; x++) {
          for (int y = -3; y <= 3; y++) {
            float texelDepth = decodeFloat(texture2D(depthColorTexture, fragmentDepth.xy + vec2(x, y) * texelSize));
            if (fragmentDepth.z < texelDepth) {
              amountInLight += 1.0;
            }
          }
        }
        amountInLight /= 49.0;

        if (isWater) {
          amountInLight = 0.5;
        }

        // gl_FragColor = vec4((amountInLight * uColor) + vLighting, 1.0);
        gl_FragColor = vec4(ambientLight * texelColor.rgb + directionalLightColor * amountInLight * uColor, texelColor.a);
      }
    `;
    this.cameraVertexShader = null;
    this.cameraFragmentShader = null;
    this.cameraShaderProgram = null;
    this.lightVertexShader = null;
    this.lightFragmentShader = null;
    this.lightShaderProgram = null;
    this.shadowDepthTexture = null;
    this.shadowFrameBuffer = null;
    this.lightProjectionMatrix = null;
    this.lightModelViewMatrix = null;
    this.shadowProjectionMatrix = null;
    this.shadowModelViewMatrix = null;
    this.samplerUniform = null;
    this.uMVMatrix = null;
    this.uPMatrix = null;
    this.uLightMatrix = null;
    this.uLightProjection = null;
    this.uColor = null;
    this.isWater = null;
    this.cameraMatrix = null;
    this.cameraNormalMatrix = null;
  }

  buildShaders(gl) {
    // Link our light and camera shader programs
    this.cameraVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(this.cameraVertexShader, this.cameraVertexGLSL);
    gl.compileShader(this.cameraVertexShader);

    this.cameraFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.cameraFragmentShader, this.cameraFragmentGLSL);
    gl.compileShader(this.cameraFragmentShader);

    this.cameraShaderProgram = gl.createProgram();
    gl.attachShader(this.cameraShaderProgram, this.cameraVertexShader);
    gl.attachShader(this.cameraShaderProgram, this.cameraFragmentShader);

    gl.linkProgram(this.cameraShaderProgram);

    gl.detachShader(this.cameraShaderProgram, this.cameraVertexShader);
    gl.deleteShader(this.cameraVertexShader);
    
    gl.detachShader(this.cameraShaderProgram, this.cameraFragmentShader);
    gl.deleteShader(this.cameraFragmentShader);
    
    this.lightVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(this.lightVertexShader, this.lightVertexGLSL);
    gl.compileShader(this.lightVertexShader);

    this.lightFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.lightFragmentShader, this.lightFragmentGLSL);
    gl.compileShader(this.lightFragmentShader);

    this.lightShaderProgram = gl.createProgram();
    gl.attachShader(this.lightShaderProgram, this.lightVertexShader);
    gl.attachShader(this.lightShaderProgram, this.lightFragmentShader);
    
    gl.linkProgram(this.lightShaderProgram);
    
    gl.detachShader(this.lightShaderProgram, this.lightVertexShader);
    gl.deleteShader(this.lightVertexShader);

    gl.detachShader(this.lightShaderProgram, this.lightFragmentShader);
    gl.deleteShader(this.lightFragmentShader);
  }

  getVertexPositionAttrib(gl) {
    let vertexPositionAttrib = gl.getAttribLocation(this.lightShaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttrib);
    return vertexPositionAttrib;
  }

  useLightShader(gl) {
    gl.useProgram(this.lightShaderProgram);
  }

  useCameraShader(gl) {
    gl.useProgram(this.cameraShaderProgram);
  }

  createShadowDepthTexture(gl) {
    // This section is the meat of things. We create an off screen frame buffer that we'll render
    // our scene onto from our light's viewpoint. We output that to a color texture `shadowDepthTexture`.
    // Then later our camera shader will use `shadowDepthTexture` to determine whether or not fragments
    // are in the shadow.
    this.shadowFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFramebuffer);

    this.shadowDepthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shadowDepthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.shadowDepthTextureSize, this.shadowDepthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    let renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.shadowDepthTextureSize, this.shadowDepthTextureSize);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.shadowDepthTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  createLightViewMatrices(gl) {
    this.lightProjectionMatrix = mat4.ortho([], -40, 40, -40, 40, -40.0, 80);
    this.lightModelViewMatrix = mat4.lookAt([], 
      [0, 20, 10], // Light position
      [0, 0, 0], // Light target
      [0, 1, 0]); // Up

    this.shadowProjectionMatrix = gl.getUniformLocation(this.lightShaderProgram, 'uPMatrix');
    this.shadowModelViewMatrix = gl.getUniformLocation(this.lightShaderProgram, 'uMVMatrix');

    gl.uniformMatrix4fv(this.shadowProjectionMatrix, false, this.lightProjectionMatrix);
    gl.uniformMatrix4fv(this.shadowModelViewMatrix, false, this.lightModelViewMatrix);
  }

  bindCameraUniforms(gl) {
    this.useCameraShader(gl);
    this.samplerUniform = gl.getUniformLocation(this.cameraShaderProgram, 'depthColorTexture');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowDepthTexture);
    gl.uniform1i(this.samplerUniform, 0);

    this.uMVMatrix = gl.getUniformLocation(this.cameraShaderProgram, 'uMVMatrix');
    this.uPMatrix = gl.getUniformLocation(this.cameraShaderProgram, 'uPMatrix');
    this.uLightMatrix = gl.getUniformLocation(this.cameraShaderProgram, 'lightMViewMatrix');
    this.uLightProjection = gl.getUniformLocation(this.cameraShaderProgram, 'lightProjectionMatrix');
    this.uColor = gl.getUniformLocation(this.cameraShaderProgram, 'uColor');
    this.isWater = gl.getUniformLocation(this.cameraShaderProgram, 'isWater');

    gl.uniformMatrix4fv(this.uLightMatrix, false, this.lightModelViewMatrix);
    gl.uniformMatrix4fv(this.uLightProjection, false, this.lightProjectionMatrix);
    gl.uniformMatrix4fv(this.uPMatrix, false, mat4.perspective([], Math.PI / 3, 1, 0.01, 900));
  }

  prepareShadowFrame(gl) {
    this.useLightShader(gl);

    // Draw to our off screen drawing buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFramebuffer);

    // Set the viewport to our shadow texture's size
    gl.viewport(0, 0, this.shadowDepthTextureSize, this.shadowDepthTextureSize);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  finishShadowFrame(gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  prepareCameraFrame(gl, controls) {
    this.useCameraShader(gl);
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.clearColor(0.48, 0.48, 0.98, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Create our camera view matrix
    this.cameraMatrix = mat4.create();
    mat4.translate(this.cameraMatrix, this.cameraMatrix, [0, 0, 20]);
    var xRotMatrix = mat4.create();
    var yRotMatrix = mat4.create();
    mat4.rotateX(xRotMatrix, xRotMatrix, -controls.xRotation);
    mat4.rotateY(yRotMatrix, yRotMatrix, controls.yRotation);
    mat4.multiply(this.cameraMatrix, xRotMatrix, this.cameraMatrix);
    mat4.multiply(this.cameraMatrix, yRotMatrix, this.cameraMatrix);
    this.cameraMatrix = mat4.lookAt(this.cameraMatrix, [this.cameraMatrix[12], this.cameraMatrix[13], this.cameraMatrix[14]], [0, 0, 0], [0, 1, 0]);

    gl.uniform3fv(this.uColor, [0.0, 0.0, 0.0]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowDepthTexture);
    gl.uniform1i(this.samplerUniform, 0);

    gl.uniformMatrix4fv(this.uLightMatrix, false, this.lightModelViewMatrix);
    gl.uniformMatrix4fv(this.uMVMatrix, false, this.cameraMatrix);

    this.cameraNormalMatrix = mat4.create();
    mat4.invert(this.cameraNormalMatrix, this.cameraMatrix);
    mat4.transpose(this.cameraNormalMatrix, this.cameraNormalMatrix);

    gl.uniform3fv(this.uColor, [0.2, 0.2, 0.2]);
    gl.uniform1i(this.isWater, 0);
  }

  finishCameraFrame(gl) {
    // Noop.
  }
}
