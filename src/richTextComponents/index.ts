import { defineCustomElement } from 'vue'
import { customComponentsStore } from '@/stores/customComponents'
import { buildBlockComponentClass, buildInlineComponentClass } from './buildComponent'

import { type CustomComponents } from '@/types/customComponent'

import CustomLink from './CustomLink.ce.vue'
import CodeEdit from './CodeEditor.ce.vue'
import CustomTabs from './CustomTabs.ce.vue'
import CustomImg from './CustomImg.ce.vue'



const Components = [CustomLink, CodeEdit, CustomTabs, CustomImg]

const customComponents = {
  install() {
    const componentsName: CustomComponents = {}
    Components.forEach((component) => {
      const CustomElement = defineCustomElement(component)
      const type = (component.type ?? 'inline')
      // 根据组件类型来获得添加完删除按钮的自定义元素
      const ComponentClass = type === 'inline' ? buildInlineComponentClass(CustomElement) : buildBlockComponentClass(CustomElement)
      if (component.customStyles) {
        component.styles = [...component.styles, ...component.customStyles]
      }

      customElements.define(component.name ?? component.__name, ComponentClass)
      const name = component.name ?? component.__name
      componentsName[name] = {
        name,
        type,
        nestable: component.nestable ?? false,
        Constructor: ComponentClass
      }
      if (component.props) {
        const props = {}
        Object.keys(component.props).forEach((prop) => {
          props[prop] = component.props[prop].name
        })
        componentsName[name].props = props
      }
    })
    const customComponents = customComponentsStore()
    customComponents.setComponents(componentsName)
  }
}

export default customComponents
