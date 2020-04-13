'use strict';

class Tree extends Drawable {
  constructor() {
    super();
    this.trunk = new Trunk();
  }

  /**
   * Apply an offset to the position of all the vertices.
   *
   */
  setPosition(gl, x, y, z) {
    this.trunk.setPosition(gl, x, y, z);
  }

  initBuffers(gl) {
    this.trunk.initBuffers(gl);
  }

  draw(gl, camera, shadow) {
    this.trunk.draw(gl, camera, shadow);
  }

}
