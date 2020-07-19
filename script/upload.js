'use strict';

class Upload {

  constructor() {
  }

  loadVolumeImage(fileInput, previewImage) {

    if (fileInput.files && fileInput.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          previewImage.src =  e.target.result;
        }

        reader.readAsDataURL(fileInput.files[0]);
    }



    /*
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    */
  }

  loadTextureImage(fileInput, previewImage) {
    this.loadVolumeImage(fileInput, previewImage);
  }
}