export function buildInlineComponentClass(ParentClass: CustomElementConstructor) {
  class InlineComponent extends ParentClass {
    constructor(initialProps) {
      super(initialProps)
    }
    connectedCallback() {
      super.connectedCallback && super.connectedCallback()
      // 处理原生撤回时重复生成clone-btn的问题，要判断是否已经存在.v__close-btn'
      if (this.shadowRoot && !this.shadowRoot.querySelector('.v__close-btn')) {
        const closeBtn = document.createElement('a')
        closeBtn.style.marginLeft = '3px'
        closeBtn.innerText = '×'
        closeBtn.classList.add('v__close-btn')
        closeBtn.addEventListener('click', () => {
          this.parentElement?.removeChild(this)
        })
        this.shadowRoot.appendChild(closeBtn)
      }
    }
  }
  return InlineComponent
}

export function buildBlockComponentClass(ParentClass: CustomElementConstructor) {
  class BlockComponent extends ParentClass {
    constructor(initialProps) {
      super(initialProps)
    }
    connectedCallback() {
      super.connectedCallback && super.connectedCallback()
      if (this.shadowRoot && !this.shadowRoot.querySelector('.v__config-container')) {
        const configContainer = document.createElement('div')
        configContainer.classList.add('v__config-container')
        const closeBtn = document.createElement('a')
        closeBtn.textContent = '×'
        closeBtn.classList.add('close-btn')
        closeBtn.addEventListener('click', () => {
          this.parentElement?.removeChild(this)
        })
        configContainer.appendChild(closeBtn)
        this.shadowRoot.insertBefore(configContainer, this.shadowRoot.firstChild)
        const style = document.createElement('style')
        style.textContent = `
                .v__config-container {
                    width: 100%;
                    height: 24px;
                    background-color: black;
                    opacity: .5;
                    transition: .3s;
                }
                
                .close-btn{
                    cursor: pointer;
                    font-size: 18px;
                    color: white;
                    float: right;
                    line-height: 18px;
                    padding: 3px;
                    width: 24px;
                    box-sizing: border-box;
                    text-align: center;
                }
                `
        this.shadowRoot.appendChild(style)
      }
    }
  }
  return BlockComponent
}
