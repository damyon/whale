
class FishTorso extends ProjectedModel {

    constructor() {
      super();
      this.size = 3.5;
      this.LOD = 24;
      this.fat = 0.4;
      this.clipLimit = 150;
      this.clampLimit = 0;
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
  
  
