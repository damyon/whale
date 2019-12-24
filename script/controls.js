
class Controls {

  constructor(canvas) {
    // We set up controls so that we can drag our mouse or finger to adjust the rotation of
    // the camera about the X and Y axes
    this.canvasIsPressed = false;
    this.xRotation = Math.PI / 20;
    this.yRotation = 0;
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
        this.xRotation += (e.pageY - this.lastPressY) / 50;
        this.yRotation -= (e.pageX - this.lastPressX) / 50;

        this.xRotation = Math.min(this.xRotation, Math.PI / 2.5);
        this.xRotation = Math.max(this.xRotation, 0.1);

        this.lastPressX = e.pageX;
        this.lastPressY = e.pageY;
      }
    }.bind(this);

    // As you drag your finger we move the camera
    canvas.addEventListener('touchstart', function (e) {
      this.lastPressX = e.touches[0].clientX;
      this.lastPressY = e.touches[0].clientY;
    }.bind(this));
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      this.xRotation += (e.touches[0].clientY - this.lastPressY) / 50;
      this.yRotation -= (e.touches[0].clientX - this.lastPressX) / 50;

      this.xRotation = Math.min(this.xRotation, Math.PI / 2.5);
      this.xRotation = Math.max(this.xRotation, 0.1);

      this.lastPressX = e.touches[0].clientX;
      this.lastPressY = e.touches[0].clientY;
    }.bind(this));
  }

}
