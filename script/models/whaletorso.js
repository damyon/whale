
class WhaleTorso extends ProjectedModel {

  constructor() {
    super();
    this.size = 32;
    this.fat = 4;
    this.LOD = 128;
    
    
    this.clipLimit = 150;
    this.clampLimit = 0;
   // this.pivotOffset = -2.5;
   // this.centerOffset = -1;
    //this.vertexCount = 6 * (this.LOD * this.LOD) * 2;
  }

  moveForward(gl, deltaTime, absTime) {
    return;
  }

  /**
   * initBuffers
   *
   * Initialize the buffers we'll need.
   */
  initBuffers(gl) {
    // Call the parent.
    ProjectedModel.prototype.initBuffers.call(this, gl);
    // Load the texture.
    this.loadTextureElement(gl, 'preview-texture-img');

    this.loadShapeElement(gl, 'preview-volume-img');
    
    return this.buffers;
  }
}

