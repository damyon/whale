
class SharkTorso extends ProjectedModel {

  constructor() {
    super();
    this.size = 4;
    this.LOD = 63;
    this.fat = 0.8;
    this.clipLimit = 0.2;
    this.clampLimit = 0.25;
    this.pivotOffset = -4;
    this.vertexCount = 6 * (this.LOD * this.LOD) * 2;
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

