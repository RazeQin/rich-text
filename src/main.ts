import 'ant-design-vue/dist/reset.css';
import '@/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import customComponents from './richTextComponents'
import directives from './directives';
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 注册指令
app.use(directives)
// 注册自定义组件
app.use(customComponents)
app.mount('#app')
