import { lemmatizer } from "lemmatizer"
import { WordTokenizer, stopwords } from "natural"
import nodejieba from "nodejieba"
import { Options, WordCounter, Word } from "./interface"
import path from "path"

export function splitText(text: string, options: Options) {
  const chinesePattern = new RegExp("[\u4E00-\u9FA5]+") // 监测到任意中文则返回true
  const numberPattern = new RegExp("[0-9]+")
  let words: string[] = []
  if (chinesePattern.test(text)) {
    // 中文分词
    options.language = "cn"
    const tokens = nodejieba.cutAll(text.replace(/\n/g, ""))
    const fs = require("fs")
    const stopwordsCN = fs
      .readFileSync(path.resolve(__dirname, "../assets/", "demo_text_ch.txt"), "utf8")
      .split("\n")
    tokens.forEach((word) => {
      if (
        word.length < 2 ||
        (options.stopwords && stopwordsCN.includes(word)) ||
        (options.filterNumber && numberPattern.test(word))
      ) {
        return
      } else {
        words.push(word)
      }
    })
  } else {
    // 英语分词
    options.language = "en"
    const tokenizer = new WordTokenizer()
    const tokens = tokenizer.tokenize(text)
    tokens.forEach((word) => {
      if (
        word.length < 2 ||
        (options.stopwords && stopwords.includes(word)) ||
        (options.filterNumber && numberPattern.test(word))
      ) {
        return
      } else {
        words.push(options.lemmatization ? lemmatizer(word) : word)
      }
    })
  }
  // 计算频率

  const counter: WordCounter = words.reduce((counter, word) => {
    if (word in counter) {
      counter[word]++
    } else {
      counter[word] = 1
    }
    return counter
  }, {} as WordCounter)

  let wordCounts: Word[] = []
  for (let key of Object.keys(counter)) {
    wordCounts.push({ name: key, weight: counter[key] })
  }
  wordCounts.sort((a, b) => b.weight - a.weight)

  // 处理所有单词权重为 count/max_count
  const max_count = wordCounts[0].weight
  for (let word of wordCounts) {
    word.weight = word.weight / max_count
  }
  return wordCounts
}
