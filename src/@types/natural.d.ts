declare module "natural" {
  export class WordTokenizer {
    constructor()
    tokenize(text: string): string[]
  }

  export const stopwords: string[]
}
