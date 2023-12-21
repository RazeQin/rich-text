// import directives
import { type App } from 'vue';
import cardShow from './cardShow'


const directivesList: any = {
    // Custom directives
    cardShow
};

const directives = {
    install: function (app: App<Element>) {
        Object.keys(directivesList).forEach(key => {
            // 注册自定义指令
            app.directive(key, directivesList[key]);
        });
    }
};

export default directives;