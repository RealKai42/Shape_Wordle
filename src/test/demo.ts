import cv from "opencv4nodejs"
import fs from "fs"
import path from "path"
import { ShapeWordle } from "../index"

const dir = path.resolve(__dirname, "../../assets/")
const image = cv.imread(path.resolve(dir, "input2.png"), cv.IMREAD_UNCHANGED)
const text = fs.readFileSync(path.resolve(dir, "demo_text_en.txt"), "utf-8")
// const text = fs.readFileSync(path.resolve(dir, "demo_text_ch.txt"), "utf-8")

const demo = new ShapeWordle({})
const wordle = demo.generate(text, image)
fs.writeFileSync(path.resolve(__dirname, "wordle.png"), wordle)
