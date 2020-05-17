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
    this.main.setPosition(gl, x, y + 5, z);
    this.members.forEach(function(element, index, source) {
      element.setPosition(gl, x, y + 5, z)
    });
  }

  initBuffers(gl) {
    this.main.initBuffers(gl);
    for (element of this.members) {
      element.initBuffers(gl);
    }
  }

  draw(gl, camera, shadow) {
    if (shadow) {
      this.main.predraw(gl);
      for (element of this.members) {
        element.predraw(gl);
      }
      
    }
    this.main.draw(gl, camera, shadow);
    for (element of this.members) {
      element.draw(gl, camera, shadow);
    };
    if (shadow) {
      this.main.postdraw(gl);
      for (element of this.members) {
        element.postdraw(gl);
      }
    }
  }

}
