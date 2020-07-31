const fs = require('fs')
const cv = require('opencv4nodejs')
const ShapeWordle = require('../lib/index')
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// question方法
rl.question('Please input a word: ', function (answer) {
  console.log('You have entered {%s}', answer.toUpperCase());

  const dir = 'input/'
  const text_filename = dir + 'demo_text_en.txt'
  // const text_filename = dir + 'demo_text_ch.txt'
  const image_filename = dir + 'input.png'
  const text = fs.readFileSync(text_filename, 'utf-8')
  const image = cv.imread(image_filename);

  const shapeWordle = new ShapeWordle({ debug: true })
  const wordle = shapeWordle.generate(text, image)
  fs.writeFileSync('wordle.png', wordle)

  // 不加close，则不会结束
  rl.close();
});



