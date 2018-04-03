// 开发环境时，引入页面文件，方便改变页面文件后及时模块热更新
if (process.env.NODE_ENV === 'development') {
    require('../../views/login.html');
}

// 设置允许模块热替换
if (module.hot) {
    module.hot.accept();

    // 页面文件更新 自动刷新页面
    module.hot.accept('../../views/login.html', () => {
        location.reload();
    });
}


import Vue from 'vue';

import ElementUI from 'element-ui';
Vue.use(ElementUI);
import 'element-ui/lib/theme-chalk/index.css';
import '../scss/login.scss';

import Login from '../components/Login.vue';

new Vue({
    el: '#app',
    render: h => h(Login)
});