<style scoped>

</style>

<template>
        <el-row class="box">
            <el-col :span="24">
                <div class="title">ET通用后台管理系统</div>
            </el-col>

            <el-col :span="24">
                <el-card class="content">
                    <div slot="header" class="clearfix" v-if="currentBox=='login'">
                        <span class="header-tag">用户登录</span>
                        <el-button class="fr" @click="toogleBox('findpw')" type="text">找回密码</el-button>
                    </div>

                    <div slot="header" class="clearfix" v-else>
                        <span class="header-tag">找回密码</span>
                        <el-button class="fr" @click="toogleBox('login')" type="text">返回登录</el-button>
                    </div>

                    <el-form :model="formData" ref="form" label-width="100px">

                        <template v-if="currentBox=='login'">
                            <el-form-item label="账号">
                                <el-input
                                        class="x-input"
                                        v-model="formData.account"
                                        placeholder="用户名或邮箱"
                                        auto-complete="off"
                                ></el-input>
                            </el-form-item>

                            <el-form-item label="密码">
                                <el-input
                                        class="x-input"
                                        v-model="formData.password"
                                        type="password"
                                        auto-complete="off"
                                ></el-input>
                            </el-form-item>

                            <el-form-item label="验证码">
                                <el-input class="vcode-input fl" v-model="formData.verifycode"></el-input>
                                <img class="vcode-img fl" src="../images/verifycode.png"/>
                            </el-form-item>
                        </template>

                        <template v-else>
                            <el-form-item label="邮箱">
                                <el-input
                                        class="x-input"
                                        v-model="formData.email"
                                        auto-complete="off"
                                ></el-input>
                            </el-form-item>

                            <el-form-item label="邮箱验证码">
                                <el-input class="ecode-input" v-model="formData.emailcode"
                                          auto-complete="off"></el-input>
                                <el-button type="primary" :disabled="formData.email==''">获取验证码</el-button>
                            </el-form-item>

                            <el-form-item label="新密码">
                                <el-input
                                        class="x-input"
                                        v-model="formData.newpassword"
                                        type="password"
                                        auto-complete="off"
                                ></el-input>
                            </el-form-item>

                            <el-form-item label="确认新密码">
                                <el-input
                                        class="x-input"
                                        v-model="formData.renewpassword"
                                        type="password"
                                        auto-complete="off"
                                ></el-input>
                            </el-form-item>
                        </template>

                        <el-form-item>
                            <el-button type="primary" @click="submitForm">提交</el-button>
                            <el-button @click="resetForm">重置</el-button>
                        </el-form-item>

                    </el-form>
                </el-card>
            </el-col>
        </el-row>

</template>

<script>
    export default {
        data(){
            return {
                currentBox: 'login',
                formData: {
                    account: '',
                    password: '',
                    email: '',
                    emailcode: '',
                    newpassword: '',
                    renewpassword: '',
                    verifycode: ''
                }
            }
        },
        methods: {
            toogleBox(box){
                this.currentBox = box;
                this.resetForm();
            },
            submitForm(){
                location='/';
            },
            resetForm(){
                this.$refs.form.resetFields();
            }
        }
    }
</script>