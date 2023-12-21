import { defineStore } from 'pinia'
import { type CustomComponents } from '@/types/customComponent'

export const customComponentsStore = defineStore('customComponentsStore', {
    state: (): { customComponents: CustomComponents } => {
        return {
            customComponents: {}
        }
    },

    getters: {
        getComponents(): CustomComponents {
            return this.customComponents
        }
    },
    actions: {
        setComponents(components: CustomComponents): void {
            this.customComponents = components
        }
    }
})
