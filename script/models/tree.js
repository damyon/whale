'use strict';

class Tree extends Drawable {
  constructor() {
    super();
    this.trunk = new Trunk();
    this.leaves = new Leaves(4 * Math.random());
  }

  /**
   * Apply an offset to the position of all the vertices.
   *
   */
  setPosition(gl, x, y, z) {
    this.trunk.setPosition(gl, x, y, z);
    this.leaves.setPosition(gl, x, y + 5, z);
  }

  initBuffers(gl) {
    this.trunk.initBuffers(gl);
    this.leaves.initBuffers(gl);
  }

  draw(gl, camera, shadow) {
    this.trunk.draw(gl, camera, shadow);
    if (shadow) {
      this.leaves.predraw(gl);
    }
    this.leaves.draw(gl, camera, shadow);
    if (shadow) {
      this.leaves.postdraw(gl);
    }
  }

}
