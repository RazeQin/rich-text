import { type CSSProperties } from './type'
import { customComponentsStore } from '@/stores/customComponents'
import { browserType } from '@/utils/utils'

const customComponents = customComponentsStore().getComponents

class RichText {
  private rootElement!: HTMLElement
  private mode!: 'edit' | 'show'
  private focusEl: HTMLElement | null = null
  constructor(parent: HTMLElement, mode: 'edit' | 'show') {
    this.initRootNode(parent, mode)
  }

  private initRootNode(parent: HTMLElement, mode: 'edit' | 'show') {
    this.rootElement = document.createElement('div')
    this.rootElement.contentEditable = 'true'
    this.rootElement.addEventListener('paste', this.processingPasteEvt.bind(this))
    this.mode = mode
    parent.appendChild(this.rootElement)
    document.addEventListener('selectionchange', () => {
      // 获取当前聚焦元素
      let activeEl = document.activeElement
      // shadow dom中的聚焦元素需要递归获取
      //不断地通过shadowroot.activeElement与自定义元素列表比对，观察是否焦点还在内部
      while (activeEl?.shadowRoot && customComponents[activeEl.nodeName.toLocaleLowerCase()]) {
        const childActiveEl = activeEl.shadowRoot.activeElement
        // 只有当childActiveEl存在且聚焦的为自定义元素才继续找，不然就锁定到这一层就好了，方便获取selection
        if (childActiveEl && customComponents[childActiveEl.nodeName.toLocaleLowerCase()]) {
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
    if (!customComponents[name]) {
      console.error(`不存在该自定义元素：${name}`)
      return
    }
    // 这种方式新建元素支持不同元素类型，比setAttribute好
    const customComponent = customComponents[name]
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
    if (this.focusEl && customComponents[this.focusEl.nodeName.toLocaleLowerCase()]) {
      // 如果不支持嵌套增加组件，则直接返回
      if (!customComponents[this.focusEl.nodeName.toLocaleLowerCase()].nestable) {
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

    const targetEl = document.createElement('text')
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
        const rTextEl = document.createElement('text')
        this.applyCSSToObject(rTextEl, styles)
        rTextEl.appendChild(rTextNode)
        node.parentNode?.insertBefore(lTextNode, node)
        node.parentNode?.replaceChild(rTextEl, node)
      } else if (node === endContainer) {
        console.log('end---->', endContainer)

        const [lText, rText] = this.splitStr(endContainer.textContent || '', endOffset)
        const lTextNode = document.createTextNode(lText)
        const rTextNode = document.createTextNode(rText)
        const lTextEl = document.createElement('text')
        this.applyCSSToObject(lTextEl, styles)
        lTextEl.appendChild(lTextNode)
        node.parentNode?.insertBefore(lTextEl, node)
        node.parentNode?.replaceChild(rTextNode, node)
      } else {
        console.log('center-->', node)

        const text = node.textContent
        const textNode = document.createTextNode(text || '')
        const textEl = document.createElement('text')
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
    const beforeText = document.createTextNode('\xa0')
    const afterText = document.createTextNode('\xa0')

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
          const img = customComponents['custom-img']
          const imgInstance = new img.Constructor({ file: pasteFile })
          console.log(imgInstance)
          range.insertNode(imgInstance)
        }
      }
    }
  }

  private splitStr(str: string, offset: number) {
    return [str.slice(0, offset), str.slice(offset)]
  }
}

export { RichText }
