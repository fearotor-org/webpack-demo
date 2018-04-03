import Vue from 'vue';
import VueRouter from 'vue-router'
Vue.use(VueRouter);


import Welcome from '../../components/Welcome.vue';
import Table from '../../components/Table.vue';
import Form from '../../components/Form.vue';

const routes = [
    { path: '/', component: Welcome ,name:'welcome'},
    { path: '/table', component: Table ,name:'table'},
    { path: '/form', component: Form ,name:'form'},
];

const Router = new VueRouter({
    routes
});

export default Router;