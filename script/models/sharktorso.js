
class SharkTorso extends ProjectedModel {

  constructor() {
    super();
    this.size = 6;
    this.LOD = 32;
    this.fat = 0.4;
    this.clipLimit = 150;
    this.clampLimit = 45;
   // this.pivotOffset = -2.5;
   // this.centerOffset = -1;
    //this.vertexCount = 6 * (this.LOD * this.LOD) * 2;
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
    this.loadTexture(gl, 'script/models/shark/main/texture.png');

    this.loadShape(gl, 'script/models/shark/main/volume.png');
    
    return this.buffers;
  }
}

