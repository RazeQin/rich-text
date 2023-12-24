
export type CustomComponents = {
  [key: string]: {
    name: string
    type: 'inline' | 'block'
    nestable: boolean
    props?: {
      [key: string]: string
    },
    Constructor: CustomElementConstructor
  }
}

type Attr = {
  [key: string]: any
}

export type RichTextVirtualDOM = {
  nodeName: string,
  nodeType: number,
  isCustomEl: boolean,
  attrs: Attr,
  children: Array<RichTextVirtualDOM>,
  textContent: string,
  props: object
}