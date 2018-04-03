<style scoped>
    .el-menu{
        border-right: 0px;
    }
</style>

<template>
    <el-menu
            default-active=""
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            router
    >

        <el-submenu index="1">
            <template slot="title">
                <i class="el-icon-location"></i>
                <span>示例</span>
            </template>
            <el-menu-item-group>
                <el-menu-item index="/table">
                    <span slot="title">表格</span>
                </el-menu-item>
                <el-menu-item index="/form">
                    <span slot="title">表单</span>
                </el-menu-item>
            </el-menu-item-group>
        </el-submenu>

    </el-menu>
</template>

<script type="text/javascript">
    export default {
        data(){
            return {};
        }
    }
</script>