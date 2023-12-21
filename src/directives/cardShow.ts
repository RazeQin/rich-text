import { type Directive } from 'vue'

const directive: Directive = {
  mounted(el: HTMLElement) {
    el.addEventListener('mousemove', function (evt: MouseEvent) {
      const childEl: HTMLElement | null = el.querySelector('.content')

      if (childEl) {
        const { offsetWidth: width, offsetHeight: height } = this
        const { offsetX, offsetY } = evt

        const rotateX = 10 - (offsetY / height) * 20
        const rotateY = -(10 - (offsetX / width) * 20)

        const highlightValue = 1.5 - offsetY / height

        childEl.style.filter = `brightness(${highlightValue})`
        el.style.zIndex = '99'
        // el.style.transformOrigin = `${offsetX}px ${offsetY}px`
        childEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      }
    })

    el.addEventListener('mouseleave', function () {
      const childEl: HTMLElement | null = el.querySelector('.content')

      if (childEl) {
        el.style.zIndex = '0'
        childEl.style.transition = '.3'
        childEl.style.transform = 'rotate3d(0,0,0,0)'
        childEl.style.filter = `brightness(1)`
      }
    })
  },
  beforeMount(el: HTMLElement) {
    // el.removeEventListener('mousemove', true)
  }
}

export default directive
