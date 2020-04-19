
class Controls {

  constructor(canvas) {
    // We set up controls so that we can drag our mouse or finger to adjust the rotation of
    // the camera about the X and Y axes
    this.canvasIsPressed = false;
    this.xRotation = -Math.PI / 5;
    this.yRotation = 0;
    this.xRotation = -Math.PI / 15;
    
    this.x = 0;
    this.y = -4;
    this.z = -70;
    this.lastPressX;
    this.lastPressY;

    canvas.onmousedown = function (e) {
      this.canvasIsPressed = true;
      this.lastPressX = e.pageX;
      this.lastPressY = e.pageY;
    }.bind(this);
    canvas.onmouseup = function () {
      this.canvasIsPressed = false;
    }.bind(this);
    canvas.onmouseout = function () {
      this.canvasIsPressed = false;
    }.bind(this);
    canvas.onmousemove = function (e) {
      if (this.canvasIsPressed) {
        this.xRotation += (e.pageY - this.lastPressY) / 550;
        this.yRotation -= (e.pageX - this.lastPressX) / 550;

        this.xRotation = Math.min(this.xRotation, Math.PI / 2.5);
        this.xRotation = Math.max(this.xRotation, -Math.PI / 2.5);

        this.lastPressX = e.pageX;
        this.lastPressY = e.pageY;
      }
    }.bind(this);

    window.addEventListener('keydown', function (e) {
      switch(e.keyCode) {
        case 38:
        case 87:
          var positionChange = this.moveForward();
          
          this.x -= positionChange[0];
          //this.y += positionChange[1];
          this.z += positionChange[2];
          
          break;
        case 83:
        case 40:
          var positionChange = this.moveForward();
          
          this.x += positionChange[0];
          //this.y += positionChange[1];
          this.z -= positionChange[2];
          break;
        case 65:
        case 37:
          var positionChange = this.moveForward();
          // Flip the axis to make sideways move.
          this.x += positionChange[2];
          //this.y += positionChange[1];
          this.z += positionChange[0];
          break;
        case 68:
        case 39:
          var positionChange = this.moveForward();
          // Flip the axis to make sideways move.
          this.x -= positionChange[2];
          //this.y += positionChange[1];
          this.z -= positionChange[0];
          break;
      }
    }.bind(this), false);

    // As you drag your finger we move the camera
    canvas.addEventListener('touchstart', function (e) {
      this.lastPressX = e.touches[0].clientX;
      this.lastPressY = e.touches[0].clientY;
    }.bind(this));
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      this.xRotation += (e.touches[0].clientY - this.lastPressY) / 50;
      this.yRotation += (e.touches[0].clientX - this.lastPressX) / 50;

      this.xRotation = Math.min(this.xRotation, Math.PI / 2.5);
      this.xRotation = Math.max(this.xRotation, 0.1);

      this.lastPressX = e.touches[0].clientX;
      this.lastPressY = e.touches[0].clientY;
    }.bind(this));
  }

  moveForward() {
    var cameraMatrix = mat4.create();
    var xRotMatrix = mat4.create();
    var yRotMatrix = mat4.create();
    
    mat4.rotateX(xRotMatrix, xRotMatrix, -this.xRotation);
    mat4.rotateY(yRotMatrix, yRotMatrix, this.yRotation);
    mat4.multiply(cameraMatrix, xRotMatrix, cameraMatrix);
    mat4.multiply(cameraMatrix, yRotMatrix, cameraMatrix);
    mat4.invert(cameraMatrix, cameraMatrix);

    return [cameraMatrix[2], cameraMatrix[6], cameraMatrix[10]];
  }

}
