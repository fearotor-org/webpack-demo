// 开发环境时，引入页面文件，方便改变页面文件后及时模块热更新
if (process.env.NODE_ENV === 'development') {
    require('../../views/index.html');
}

// 设置允许模块热替换
if (module.hot) {
    module.hot.accept();

    // 页面文件更新 自动刷新页面
    module.hot.accept('../../views/index.html', () => {
        location.reload();
    });
}

import Vue from 'vue';

import ElementUI from 'element-ui';
Vue.use(ElementUI);
import 'element-ui/lib/theme-chalk/index.css';
import '../scss/index.scss';

import Router from './router';

import Index from '../components/index/Index.vue';

new Vue({
    el: '#app',
    router:Router,
    render: h => h(Index)
});