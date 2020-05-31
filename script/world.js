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
  
  let terrain = new Terrain();
  let rocks = terrain.createRocks();
  let bushes = terrain.createBushes();
  let trees = terrain.createTrees();
  let foam = terrain.createFoam();
  let boat = new Boat();
  let cloud1 = new Cloud(false);
  let cloud2 = new Cloud(false);
  let cloud3 = new Cloud(true);
  let cloud4 = new Cloud(true);
  let shark = new Shark();
  let dhufish = new Dhufish();
  let throttleLOD = 10.0;
  let lastLOD = 0;
  let targetFPS = 10;
  
  let drawables = [
    terrain,
    dhufish,
    shark,
    new Sea(1000, 0, 1),
    cloud1,
    cloud2,
    cloud3,
    cloud4,
    boat
  ];
  
  drawables = drawables.concat(rocks);
  drawables = drawables.concat(bushes);
  drawables = drawables.concat(trees);
  drawables = drawables.concat(foam);
  
  for (model of drawables) {
    model.initBuffers(gl);
  }
  shark.initBuffers(gl);
  
  cloud1.setPosition(gl, 100, 400, -1280);
  cloud2.setPosition(gl, -100, 400, 1280);
  cloud3.setPosition(gl, -1280, 400, 100);
  cloud4.setPosition(gl, 1280, 400, -100);
  shark.setPosition(gl, 5, -0.5, 76);
  dhufish.setPosition(gl, 10, -1.8, 78);

  boat.setPositionRotation(gl, 0, 12, 70, 0);
  // Move the rock.
  terrain.afterHeightsLoaded(function(gl, terrain, rocks) {
    terrain.setRockPositions(gl, rocks);
    terrain.setBushPositions(gl, bushes);
    terrain.setTreePositions(gl, trees);
    terrain.setFoamPositions(gl, foam);
  }.bind(this, gl, terrain, rocks))

  /**
   * Camera shader setup
   */

  // We enable our vertex attributes for our camera's shader.
  var vertexPositionAttrib = camera.getVertexPositionAttrib(gl);

  /**
   * Light shader setup
   */

  camera.useLightShader(gl);

  camera.createShadowDepthTexture(gl);

  // We create an orthographic projection and view matrix from which our light
  // will view the scene
  camera.createLightViewMatrices(gl);

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

    gl.uniform3fv(sceneCamera.uColor, [1.0, 1.0, 0.8]);

    if ((absTime - lastLOD) / 10 > throttleLOD) {
      for (model of sceneDrawables) {
        model.evaluateLOD(gl, sceneControls.x, sceneControls.y, sceneControls.z);
      }
      
      lastLOD = absTime;
    }

    for (model of sceneDrawables) {
      model.predraw(gl);
      model.draw(gl, sceneCamera, true, deltaTime, absTime);
      model.postdraw(gl);
    }

    sceneCamera.finishCameraFrame(gl);
  }

  var then = 0;
  var absTime = 0;

  function resize() {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {
   
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
  }

  // Draw our shadow map and light map every request animation frame
  function draw(sceneCamera, sceneControls, sceneDrawables, now) {
    now *= 0.01;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    resize();
   
    terrain.setFoamPositions(gl, foam);
    sceneCamera.setRock(-(Math.sin((now / 10) - 0.2) / 6));
    sceneControls.processKeys(terrain, boat.boatWidth, boat.boatLength);
    boat.setPositionRotation(gl, -sceneControls.x - 0.8, 6 + (Math.sin(now / 10) / 10), -sceneControls.z, sceneControls.boatY);
    
    drawShadowMap(sceneCamera, sceneControls, sceneDrawables, deltaTime, absTime);
    drawModels(sceneCamera, sceneControls, sceneDrawables, deltaTime, absTime);

    absTime += deltaTime;

    // We don't want full throttle.
    let delay = 1000 / targetFPS;
    window.setTimeout(function() {
      window.requestAnimationFrame(draw.bind(this, sceneCamera, sceneControls, sceneDrawables));
    }, delay);
  }
  draw(camera, controls, drawables, 0);
}
