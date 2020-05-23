'use strict';

class Character extends Drawable {
  constructor() {
    // Allow passing configuration data to the constructor.
    super();
    // this.main = new Main();
    // this.members = [new Member()];
    this.members = [];
  }

  /**
   * Apply an offset to the position of all the vertices.
   *
   */
  setPosition(gl, x, y, z) {
    this.main.setPosition(gl, x, y, z);
    let element = null;

    for (element of this.members) {
      element.setPosition(gl, x, y, z)
    }
  }

  setGlobalRotation(gl, angle) {
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
