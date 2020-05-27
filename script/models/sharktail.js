
class SharkTail extends ProjectedModel {

  constructor() {
    super();
    this.size = 4;
    this.LOD = 63;
    this.fat = 0.8;
    this.pivotOffset = -2.5;
    this.clipLimit = 0.2;
    this.clampLimit = 0.4;
    this.centerOffset = -4;
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
    this.loadTexture(gl, 'script/models/shark/members/tail/texture.png');

    this.loadShape(gl, 'script/models/shark/members/tail/volume.png');
    return this.buffers;
  }

  setWaveRotation(gl, offset) {

    let angle = Math.sin(offset * 0.2) / 7;
    
    this.setPositionRotation(gl, this.x, this.y, this.z, angle);
  }
  

  /**
   * draw
   * Draw the terrain.
   * @param gl
   * @param programInfo
   * @param deltaTime
   * @param absTime
   * @param matrices
   */
  draw(gl, camera, shadow, deltaTime, absTime) {
    // Call the parent.
    ProjectedModel.prototype.draw.call(this, gl, camera, shadow, deltaTime, absTime);

    this.setWaveRotation(gl, absTime);
  }
}

