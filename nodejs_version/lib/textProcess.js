const { lemmatizer } = require("lemmatizer");
const { WordTokenizer, stopwords } = require("natural")
const nodejieba = require("nodejieba");


function splitText(text, option) {
  const chinesePattern = new RegExp("[\u4E00-\u9FA5]+") // 监测到任意中文则返回true
  const numberPattern = new RegExp("[0-9]+");
  let words = []
  if (chinesePattern.test(text)) {
    // 中文分词
    option.language = 'cn'
    const tokens = nodejieba.cutAll(text.replace(/\n/g, ''))
    const fs = require('fs')
    const stopwordsCN = fs.readFileSync('stopword_zh.txt', 'utf8').split('\n')
    tokens.forEach(word => {
      if (word.length < 2 || (option.stopwords && stopwordsCN.includes(word)) || (option.filterNumber && numberPattern.test(word))) { return }
      else {
        words.push(word)
      }
    })
  } else {
    // 英语分词
    option.language = 'en'
    const tokenizer = new WordTokenizer()
    const tokens = tokenizer.tokenize(text)
    tokens.forEach(word => {
      if (word.length < 2 || (option.stopwords && stopwords.includes(word)) || (option.filterNumber && numberPattern.test(word))) { return }
      else {
        words.push(option.lemmatization ? lemmatizer(word) : word)
      }
    });
  }
  const count = words.reduce((counter, word) => {
    if (word in counter) {
      counter[word]++
    } else {
      counter[word] = 1
    }
    return counter
  }, {})
  words = []
  for (let key of Object.keys(count)) {
    words.push({ name: key, weight: count[key] })
  }
  words.sort((a, b) => b.weight - a.weight)

  // 处理所有单词权重为 count/max_count
  const max_count = words[0].weight
  for (let word of words) {
    word.weight = word.weight / max_count
  }
  return words
}

module.exports = {
  splitText
}
