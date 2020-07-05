'use strict';

class Character extends Drawable {
  constructor() {
    // Allow passing configuration data to the constructor.
    super();
    this.main = null;
    this.members = [];
    this.lastPath = 0;
    this.targetAngle = 0;
    this.targetSpeed = 0;
    this.targetVerticleAngle = 0;
    this.pathThrottle = 10;
    this.globalRotation = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  updatePathThrottle(elapsed) {
    if ((elapsed - this.lastPath) / 10 > this.pathThrottle) {
      this.updatePath();
      this.lastPath = elapsed;
    }
  }

  updatePath() {
    let randomScale = 5;
    // Rotate a random little bit.
    let skewAngle = (-0.5 + Math.random()) * randomScale;
    let skewVerticleAngle = (-0.5 + Math.random()) * randomScale;
    let skewSpeed = (-0.5 + Math.random());
    let minSpeed = 30;

    skewAngle += this.globalRotation;
    skewSpeed *=  minSpeed / 2;
    skewSpeed += minSpeed;
    
    this.targetAngle = skewAngle;
    this.targetSpeed = skewSpeed;
    this.targetVerticleAngle = skewVerticleAngle;
  }

  moveForward(gl, deltaTime, absTime) {
    let stepTime = Math.max(absTime - this.lastPath, 0) / 10;
    let step = {
      x: -deltaTime / 1000 * this.targetSpeed,
      y: 0,
      z: 0
    };
    let q = stepTime / (this.pathThrottle*20);

    if (stepTime > this.pathThrottle*20) {
      q = 1;
    }
    if (this.lastPath == 0) {
      q = 0;
    }

    let smoothAngle = this.globalRotation + ((this.targetAngle - this.globalRotation) * q);

    // Now global rotation.
    let c = Math.cos(smoothAngle);
    let s = Math.sin(smoothAngle);

    // Global rotate
    let targetX = step.x * c - step.z * s;
    let targetZ = step.x * s + step.z * c;
    let targetY = 0;

    targetX += this.x;
    targetY += this.y;
    targetZ += this.z;

    // Apply changes to model.
    this.setGlobalRotation(gl, smoothAngle);
    this.setPosition(gl, targetX, targetY, targetZ);
  }

  /**
   * Apply an offset to the position of all the vertices.
   *
   */
  setPosition(gl, x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.main.setPosition(gl, x, y, z);
    let element = null;

    for (element of this.members) {
      element.setPosition(gl, x, y, z)
    }
  }

  evaluateLOD(gl, x, y, z) {
    this.main.evaluateLOD(gl, x, y, z);
    let element = null;

    for (element of this.members) {
      element.evaluateLOD(gl, x, y, z);
    }
  }

  setGlobalRotation(gl, angle) {
    this.globalRotation = angle;
    this.main.setGlobalRotation(gl, angle);
    let element = null;

    for (element of this.members) {
      element.setGlobalRotation(gl, angle);
    }
  }

  initBuffers(gl) {
    this.main.initBuffers(gl);
    let element = null;

    for (element of this.members) {
      element.initBuffers(gl);
    }
  }

  draw(gl, camera, shadow, deltaTime, absTime) {
    let element = null;
    gl.uniform1i(camera.isSand, 0);
    this.updatePathThrottle(absTime);

    this.moveForward(gl, deltaTime, absTime);

    if (shadow) {
      this.main.predraw(gl);
      for (element of this.members) {
        element.predraw(gl);
      }
      
    }
    this.main.draw(gl, camera, shadow, deltaTime, absTime);
    for (element of this.members) {
      element.draw(gl, camera, shadow, deltaTime, absTime);
    };
    if (shadow) {
      this.main.postdraw(gl);
      for (element of this.members) {
        element.postdraw(gl);
      }
    }
  }

}
