import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import pinia from './stores/index';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { i18n } from '/@/i18n';
import VForm3 from 'form-designer-plus'; //引入VForm3库
import hljsVuePlugin from '@highlightjs/vue-plugin';
import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/lib/common';
import { ElementIcons,  UploadExcel, UploadFile, UploadImg, Editor } from '/@/components/index';

import 'amfe-flexible'
import '/@/styles/index.scss'

console.log(router)
const app = createApp(App)

// 导入通用自定义组件
app.component('uploadExcel', UploadExcel);
app.component('UploadFile', UploadFile);
app.component('UploadImg', UploadImg);
app.component('Editor', Editor);
app
    .use(pinia) // pinia 存储
    .use(router) // 路由
    .use(ElementPlus, { i18n: i18n.global.t }) // ElementPlus 全局引入
    .use(ElementIcons) // elementIcons 图标全局引入
    .use(VForm3) // 表单设计
    .use(i18n) // 国际化
    .use(hljsVuePlugin) // 代码高亮
  .use(router).mount('#app');