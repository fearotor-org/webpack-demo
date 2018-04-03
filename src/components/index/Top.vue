<style scoped>


</style>

<template>
    <div>
        <div class="quick">
            <el-button type="primary" icon="el-icon-edit" size="small">快捷菜单1</el-button>
            <el-button type="success" icon="el-icon-check" size="small">快捷菜单2</el-button>
            <el-button type="info" icon="el-icon-message" size="small">快捷菜单3</el-button>
            <el-button type="warning" icon="el-icon-star-off" size="small">快捷菜单4</el-button>
        </div>

        <div class="tabs">
            <el-tabs class="tab-btns" v-model="tabsValue" type="card" closable>
                <el-tab-pane
                        v-for="(item, index) in tabs"
                        :key="item.name"
                        :label="item.title"
                        :name="item.name"
                >
                </el-tab-pane>
            </el-tabs>

            <div class="other-btns">
                <el-button class="refresh-btn" icon="el-icon-refresh" circle></el-button>

                <el-dropdown @command="dropdownHandle" class="user">
                        <span class="el-dropdown-link ">
                            <i class="el-icon-caret-bottom"></i><span class="username">username</span>
                        </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="setting">个人设置</el-dropdown-item>
                        <el-dropdown-item command="logout" divided>安全退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        mounted(){

        },
        data(){
            return {
                tabsValue: '1',
                tabs: [
                    {
                        title: '标签1',
                        name: '1'
                    },
                    {
                        title: '标签2',
                        name: '2'
                    }
                ]
            }
        },
        methods: {
            dropdownHandle(command) {
                if(command=='setting'){
                    alert('设置');
                }
                if(command=='logout'){
                    location='/login.html';
                }
            }
        }
    }
</script>


