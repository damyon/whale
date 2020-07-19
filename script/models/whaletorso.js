
class WhaleTorso extends ProjectedModel {

  constructor() {
    super();
    this.size = 4;
    this.fat = 0.5;
    this.LOD = 32;
    
    
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

