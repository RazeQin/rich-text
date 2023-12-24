import { type CSSProperties } from './type'
import { type RichTextVirtualDOM } from '@/types/customComponent'
import { customComponentsStore } from '@/stores/customComponents'
// const customComponents = customComponentsStore().getComponents

// 解决pinia循环引用导致报错的问题
const getCustomComponents = () => {
  return customComponentsStore().getComponents
}

class RichText {
  private rootElement!: HTMLElement
  private mode!: 'edit' | 'show'
  private focusEl: HTMLElement | null = null
  constructor(parent: HTMLElement, vdom: RichTextVirtualDOM | string = '', mode: 'edit' | 'show' = 'edit') {
    this.mode = mode
    this.initRootNode(parent, vdom)
  }

  public getRootElement(){
    return this.rootElement
  }

  private initRootNode(parent: HTMLElement, vdom: RichTextVirtualDOM | string | undefined) {
    if (typeof vdom === 'string') {
      // 如果为字符串则将他装起来
      this.rootElement = document.createElement('div')
      this.rootElement.appendChild(document.createTextNode(vdom))
    } else if (vdom) {
      console.log(RichText.parse2DOM(vdom));

      this.rootElement = RichText.parse2DOM(vdom) as HTMLElement
    } else {
      this.rootElement = document.createElement('div')
    }

    this.rootElement.contentEditable = 'true'
    this.rootElement.addEventListener('paste', this.processingPasteEvt.bind(this))

    parent.appendChild(this.rootElement)
    document.addEventListener('selectionchange', () => {
      // 获取当前聚焦元素
      let activeEl = document.activeElement
      // shadow dom中的聚焦元素需要递归获取
      //不断地通过shadowroot.activeElement与自定义元素列表比对，观察是否焦点还在内部
      while (activeEl?.shadowRoot && getCustomComponents()[activeEl.nodeName.toLocaleLowerCase()]) {
        const childActiveEl = activeEl.shadowRoot.activeElement
        // 只有当childActiveEl存在且聚焦的为自定义元素才继续找，不然就锁定到这一层就好了，方便获取selection
        if (childActiveEl && getCustomComponents()[childActiveEl.nodeName.toLocaleLowerCase()]) {
          activeEl = childActiveEl
        } else {
          break
        }
      }
      this.focusEl = activeEl as HTMLElement
    })
  }

  public getCustomSelection(styles: CSSProperties) {
    const range = this.getCursorRange()
    if (range) {
      const { commonAncestorContainer } = range

      if (commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        this.processingTextNode(range, styles)
      } else {
        this.processingHTMLNode(range, styles)
      }
      console.log(this.rootElement.innerHTML)
    }
  }

  // 解决shadow dom引发的contenteditable光标丢失
  public insertCustomElement(name: string, props = {}) {
    if (!getCustomComponents()[name]) {
      console.error(`不存在该自定义元素：${name}`)
      return
    }
    // 这种方式新建元素支持不同元素类型，比setAttribute好
    const customComponent = getCustomComponents()[name]
    const componentInstance = new customComponent.Constructor({ ...props })

    const range = this.getCursorRange()
    if (range) {
      if (!range.collapsed) {
        range.deleteContents()
        range.collapse()
      }

      componentInstance.setAttribute('mode', this.mode)
      if (customComponent.type === 'inline') {
        this.insertInlineCustomElement(componentInstance, range)
      } else {
        this.insertBlockCustomElement(componentInstance, range)
      }

      range.collapse(true)
      this.rootElement.focus()
    }
  }

  // 获取当前光标位置
  private getCursorRange() {
    // 只有chrome需要特殊处理
    if (this.focusEl && getCustomComponents()[this.focusEl.nodeName.toLocaleLowerCase()]) {
      // 如果不支持嵌套增加组件，则直接返回
      if (!getCustomComponents()[this.focusEl.nodeName.toLocaleLowerCase()].nestable) {
        alert('当前组件内部不支持嵌套其他组件或进行操作！')
        return null
      }
      // 进入自定义元素的shadowdom了,还不支持嵌套shadow dom处理
      const shadowroot = this.focusEl.shadowRoot
      const selection = shadowroot?.getSelection()
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0)
        return range
      }
    } else {
      const sel = getSelection()
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0)
        // 只允许rootElement的子节点参与修改，不允许本身参与修改
        if (this.rootElement.contains(range.commonAncestorContainer)) return range
      }
    }
    return null
  }

  // 如果是文本节点则需要分裂
  private processingTextNode(range: Range, styles: CSSProperties) {
    const { startContainer, endContainer, startOffset, endOffset, commonAncestorContainer } = range
    if (this.checkElementStyles(commonAncestorContainer.parentElement!, styles)) return
    if (range.cloneContents().textContent === commonAncestorContainer.textContent) {
      this.applyCSSToObject(commonAncestorContainer.parentElement!, styles)
      return
    }
    const startRange = new Range()
    startRange.setStartBefore(commonAncestorContainer)
    startRange.setEnd(startContainer, startOffset)
    const startEl = document.createTextNode(startRange.cloneContents().textContent || '')
    startRange.detach()

    const endRange = new Range()
    endRange.setStart(endContainer, endOffset)
    endRange.setEndAfter(commonAncestorContainer)
    const endEl = document.createTextNode(endRange.cloneContents().textContent || '')
    endRange.detach()

    const targetEl = document.createElement('span')
    const textNode = document.createTextNode(range.cloneContents().textContent || '')
    targetEl.appendChild(textNode)
    this.applyCSSToObject(targetEl, styles)
    range.detach()

    commonAncestorContainer.parentNode?.insertBefore(startEl, commonAncestorContainer)
    commonAncestorContainer.parentNode?.insertBefore(targetEl, commonAncestorContainer)
    commonAncestorContainer.parentNode?.insertBefore(endEl, commonAncestorContainer)
    commonAncestorContainer.textContent = ''
    commonAncestorContainer.parentNode?.removeChild(commonAncestorContainer)
  }

  // 如果是元素节点则需要找到所有文本节点，并按照分区进行截断设置或者全部设置
  private processingHTMLNode(range: Range, styles: CSSProperties) {
    const { startContainer, endContainer, startOffset, endOffset, commonAncestorContainer } = range

    const textNodesUnder = (root: Node) => {
      const textNodes: Node[] = []
      const addTextNodes = (el: Node) => {
        if (el.nodeType === Node.TEXT_NODE && range.intersectsNode(el)) {
          textNodes.push(el)
        } else {
          for (let i = 0, len = el.childNodes.length; i < len; ++i) {
            addTextNodes(el.childNodes[i])
          }
        }
      }
      addTextNodes(root)
      return textNodes
    }

    const textNodes = textNodesUnder(commonAncestorContainer)

    textNodes.forEach((node) => {
      if (node.parentElement && this.checkElementStyles(node.parentElement, styles)) return

      if (node === startContainer) {
        console.log('start---->', startContainer)
        const [lText, rText] = this.splitStr(startContainer.textContent || '', startOffset)
        const lTextNode = document.createTextNode(lText)
        const rTextNode = document.createTextNode(rText)
        const rTextEl = document.createElement('span')
        this.applyCSSToObject(rTextEl, styles)
        rTextEl.appendChild(rTextNode)
        node.parentNode?.insertBefore(lTextNode, node)
        node.parentNode?.replaceChild(rTextEl, node)
      } else if (node === endContainer) {
        console.log('end---->', endContainer)

        const [lText, rText] = this.splitStr(endContainer.textContent || '', endOffset)
        const lTextNode = document.createTextNode(lText)
        const rTextNode = document.createTextNode(rText)
        const lTextEl = document.createElement('span')
        this.applyCSSToObject(lTextEl, styles)
        lTextEl.appendChild(lTextNode)
        node.parentNode?.insertBefore(lTextEl, node)
        node.parentNode?.replaceChild(rTextNode, node)
      } else {
        console.log('center-->', node)

        const text = node.textContent
        const textNode = document.createTextNode(text || '')
        const textEl = document.createElement('span')
        this.applyCSSToObject(textEl, styles)
        textEl.appendChild(textNode)
        node.parentNode?.replaceChild(textEl, node)
      }
    })
  }

  // 将样式设置到节点
  private applyCSSToObject(element: HTMLElement, cssObject: CSSProperties): void {
    Object.assign(element.style, cssObject)
  }

  // 检查样式是否都设置了，如果设置了就不需要重复设置了
  private checkElementStyles(element: HTMLElement, cssObject: CSSProperties): boolean {
    const elementStyles = window.getComputedStyle(element)
    for (const prop in cssObject) {
      if (Object.prototype.hasOwnProperty.call(cssObject, prop)) {
        if (elementStyles[prop] !== cssObject[prop]) {
          return false
        }
      }
    }

    return true
  }

  private insertInlineCustomElement(el: HTMLElement, range: Range) {
    const container = document.createElement('div')
    container.style.display = 'inline-block'
    container.setAttribute('contenteditable', 'false')
    el.setAttribute('containereditable', 'true')
    container.appendChild(el)
    range.insertNode(container)
  }

  private insertBlockCustomElement(el: HTMLElement, range: Range) {
    const container = document.createElement('div')
    container.contentEditable = 'false'
    container.appendChild(el)

    const afterContainer = document.createElement('div')
    afterContainer.appendChild(document.createElement('br'))

    range.insertNode(container)
    range.setStartAfter(container)
    range.collapse(true)
    range.insertNode(afterContainer)
    range.setStartAfter(afterContainer)
    range.collapse(true)
    // this.rootElement.focus()
  }

  private processingPasteEvt(evt: ClipboardEvent) {
    if (!(evt.clipboardData && evt.clipboardData.items)) {
      return
    }

    const html = evt.clipboardData.getData('text/html')
    const text = evt.clipboardData.getData('text/plain')

    const range = this.getCursorRange()
    range.deleteContents()

    if (html) {
      const processedHtml = html.replace(/<img/g, '<custom-img').replace(/img>/g, 'custom-img>')
      if (processedHtml !== html) {
        evt.preventDefault()
        const parser = new DOMParser()
        const htmlDom = parser.parseFromString(processedHtml, 'text/html')
        const fragmentBody = htmlDom.querySelector('body')
        if (fragmentBody) {
          const fragment = document.createDocumentFragment()
          while (fragmentBody.firstChild) {
            fragment.appendChild(fragmentBody.firstChild)
          }
          range.insertNode(fragment)
        } else {
          range.insertNode(htmlDom)
        }
      }
    } else if (!text) {
      evt.preventDefault()
      for (let i = 0, len = evt.clipboardData.items.length; i < len; i++) {
        const item = evt.clipboardData.items[i]
        if (item.kind === 'file' && item.type.match('^image/')) {
          const pasteFile = item.getAsFile()
          // pasteFile就是获取到的文件
          const img = getCustomComponents()['custom-img']
          const imgInstance = new img.Constructor({ file: pasteFile })
          console.log(imgInstance)
          range.insertNode(imgInstance)
        }
      }
    }
  }

  // 将dom转换为虚拟dom，重点就是递归的获取自定义元素的props
  public static jsonize(dom: HTMLElement) {
    const virtualDOM: RichTextVirtualDOM = {
      nodeName: dom.nodeName,
      nodeType: dom.nodeType,
      isCustomEl: !!getCustomComponents()[dom.nodeName.toLocaleLowerCase()],
      attrs: {},
      children: [],
      textContent: '',
      props: {}
    }
    const attrs = dom.attributes
    // 如果是自定义元素，则调用自定义元素的getProps方法获取props
    if (virtualDOM.isCustomEl) {
      virtualDOM.props = dom.getProps().props
    }
    // 如果是元素节点，则往下找子节点
    else if (dom.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < attrs.length; i++) {
        const attrName = attrs[i].name
        virtualDOM.attrs[attrName] = attrs[i].value
      }
      virtualDOM.children = Array.from(dom.childNodes).map(child => this.jsonize(child as HTMLElement))
    }
    // 如果是文本节点，则直接获取内容
    else if (dom.nodeType === Node.TEXT_NODE) {
      virtualDOM.textContent = dom.textContent || ''
    }
    return virtualDOM
  }

  // 将虚拟dom转换为真实dom
  public static parse2DOM(virtualDOM: RichTextVirtualDOM, isAncestor = true) {
    let dom: Node
    // 自定义函数就new,传递mode
    if (virtualDOM.isCustomEl) {
      const CustomComp = getCustomComponents()[virtualDOM.nodeName.toLocaleLowerCase()]
      dom = new CustomComp.Constructor({ ...virtualDOM.props, mode: this.mode })
    } else {
      // 原生节点先判断节点类型，根据类型来创建节点
      if (virtualDOM.nodeType === Node.ELEMENT_NODE) {
        dom = document.createElement(virtualDOM.nodeName)
        // 原生元素则将子节点塞进去
        virtualDOM.children.forEach(child => {
          dom.appendChild(this.parse2DOM(child, false))
        })
        // 设置属性
        Object.keys(virtualDOM.attrs).forEach(name => {
          (dom as HTMLElement).setAttribute(name, virtualDOM.attrs[name])
        })
      } else if (virtualDOM.nodeType === Node.TEXT_NODE) {
        dom = document.createTextNode(virtualDOM.textContent)
      } else {
        dom = document.createTextNode('')
      }
    }
    // 如果一开始就是文本节点，则代表需要套一个元素
    if (isAncestor && virtualDOM.nodeType === Node.ELEMENT_NODE) {
      const textContainer = document.createElement('span')
      textContainer.appendChild(dom)
      return textContainer
    } else {
      return dom
    }
  }

  private splitStr(str: string, offset: number) {
    return [str.slice(0, offset), str.slice(offset)]
  }
}

export { RichText }
