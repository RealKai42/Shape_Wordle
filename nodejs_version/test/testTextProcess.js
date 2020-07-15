const { defaultOptions } = require('../lib/defaults')
const { splitText } = require('../lib/textProcess')

const fs = require('fs')
const text_filename = 'complex_text_en.txt'
const text = fs.readFileSync(text_filename, 'utf-8')

console.log(splitText(text, defaultOptions))