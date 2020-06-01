
class FishTorso extends ProjectedModel {

    constructor() {
      super();
      this.size = 3.5;
      this.LOD = 32;
      this.fat = 0.6;
      this.clipLimit = 0.2;
      this.clampLimit = 0.3;
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
      this.loadTexture(gl, 'script/models/dhufish/main/texture.png');
  
      this.loadShape(gl, 'script/models/dhufish/main/volume.png');
      
      return this.buffers;
    }
  }
  
  