const { defaultOptions } = require('./defaults')
const { segmentation } = require('./preProcessImg')

class ShapeWordle {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }

  generate(text, image) {
    segmentation(image, this.options)

  }

}

module.exports = ShapeWordle

// const cv = require('opencv');
// cv.readImage("./mona.png", function (err, im) {
//   im.detectObject(cv.FACE_CASCADE, {}, function (err, faces) {
//     for (var i = 0; i < faces.length; i++) {
//       var x = faces[i]
//       im.ellipse(x.x + x.width / 2, x.y + x.height / 2, x.width / 2, x.height / 2);
//     }
//     im.save('./out.jpg');
//   });
// })