var cubeRotation = 0.0;

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }


  gl.enable(gl.DEPTH_TEST);

  const controls = new Controls(canvas);
  const camera = new Camera();

  /**
   * Section 2 - Shaders
   */

  camera.buildShaders(gl);
  camera.useCameraShader(gl);

  const drawables = [
    new Terrain(),
    new Trunk(),
    new Leaves(),
    new Leaves2(),
    new Sea(),
    new Star(false),
    new Star(true)
  ];

  for (model of drawables) {
    model.initBuffers(gl);
  }

  /**
   * Setting up our buffered data
   */
/*
  // Set up the four corners of our floor quad so that
  // we can draw the floor
  var floorPositions = [
    // Bottom Left (0)
    -30.0, 0.0, 30.0,
    // Bottom Right (1)
    30.0, 0.0, 30.0,
    // Top Right (2)
    30.0, 0.0, -30.0,
    // Top Left (3)
    -30.0, 0.0, -30.0
  ];
  var floorIndices = [
    // Front face
    0, 1, 2, 0, 2, 3
  ];
*/

  /**
   * Camera shader setup
   */

  // We enable our vertex attributes for our camera's shader.
  var vertexPositionAttrib = camera.getVertexPositionAttrib(gl);

  /*
  var floorPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floorPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorPositions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0);

  var floorIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);
  */

  /**
   * Light shader setup
   */

  camera.useLightShader(gl);

  camera.createShadowDepthTexture(gl);

  // We create an orthographic projection and view matrix from which our light
  // will view the scene
  camera.createLightViewMatrices(gl);

  // gl.bindBuffer(gl.ARRAY_BUFFER, floorPositionBuffer);
  // gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0);

  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBuffer);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorIndices), gl.STATIC_DRAW);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /**
   * Scene uniforms
   */
  camera.bindCameraUniforms(gl);

  // Draw our model onto the shadow map
  function drawShadowMap(sceneCamera, sceneControls, sceneDrawables, deltaTime, absTime) {

    sceneCamera.prepareShadowFrame(gl, sceneControls);

    var modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, sceneCamera.lightModelViewMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(sceneCamera.shadowModelViewMatrix, false, modelViewMatrix);
    
    for (model of sceneDrawables) {
      model.draw(gl, sceneCamera, false, deltaTime, absTime);
    }

    sceneCamera.finishShadowFrame(gl);
  }

  // Draw our model and floor onto the scene
  function drawModels(sceneCamera, sceneControls, sceneDrawables, deltaTime, absTime) {
    sceneCamera.prepareCameraFrame(gl, sceneControls);

    var modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, sceneCamera.cameraMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(sceneCamera.uMVMatrix, false, modelViewMatrix);

    /*
    gl.bindBuffer(gl.ARRAY_BUFFER, floorPositionBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIndexBuffer);
    gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, floorIndices.length, gl.UNSIGNED_SHORT, 0);
    */

    gl.uniform3fv(sceneCamera.uColor, [1.0, 1.0, 0.8]);
    for (model of sceneDrawables) {
      model.draw(gl, sceneCamera, true, deltaTime, absTime);
    }

    sceneCamera.finishCameraFrame(gl);
  }

  var then = 0;
  var absTime = 0;

  // Draw our shadow map and light map every request animation frame
  function draw(sceneCamera, sceneControls, sceneDrawables, now) {
    now *= 0.01;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    sceneControls.yRotation += 0.01 * deltaTime;
    drawShadowMap(sceneCamera, sceneControls, sceneDrawables, deltaTime, absTime);
    drawModels(sceneCamera, sceneControls, sceneDrawables, deltaTime, absTime);

    absTime += deltaTime;
    window.requestAnimationFrame(draw.bind(this, sceneCamera, sceneControls, sceneDrawables));
  }
  draw(camera, controls, drawables, 0);
}
