
export type CustomComponents = {
  [key: string]: {
    name: string
    type: 'inline' | 'block'
    nestable: boolean
    props?: {
      [key: string]: string
    },
    Constructor:CustomElementConstructor
  }
}
