<style scoped>

</style>

<template>
    <div :style="layout.appStyle">
        <div class="content" :style="layout.contentStyle">
            <div class="inner-content">
                <router-view></router-view>
            </div>
        </div>
        <div class="menu" :style="layout.menuStyle">
            <Menu></Menu>
        </div>
        <div class="top" :style="layout.topStyle">
            <Top></Top>
        </div>
        <div class="logo" :style="layout.logoStyle">
            <span>ET-Admin</span>
        </div>
    </div>
</template>

<script>
    import Menu from './Menu.vue';
    import Top from './Top.vue';

    //页面布局配置
    var w=250,h=100,docMinW=1366,docMinH=768,resizeTimer;

    export default {
        components: { Menu, Top },
        mounted(){
            this.reBuildLayout();
            this.$nextTick(function () {
                this.reBuildLayout();
            });

            var that = this;
            window.onresize = function() {
                if (resizeTimer){
                    clearTimeout(resizeTimer);
                }
                resizeTimer=setTimeout(function(){
                    that.reBuildLayout();
                },300);
            }
        },
        data(){
            return {
                layout:{
                    appStyle:       { width:'auto', height:'auto'                         },
                    contentStyle:   { width:'auto', height:'auto', top:h+'px', left:w+'px'},
                    menuStyle:      { width:w+'px', height:'auto', top:h+'px', left:'0px' },
                    topStyle:       { width:'auto', height:h+'px', top:'0px' , left:w+'px'},
                    logoStyle:      { width:w+'px', height:h+'px', top:'0px' , left:'0px' }
                }
            }
        },
        methods:{
            reBuildLayout(){
                var currentDocH=document.documentElement.clientHeight;
                var currentDocW=document.documentElement.clientWidth;

                var width=currentDocW<docMinW?docMinW:currentDocW;
                this.layout.topStyle.width=(width-w)+'px';
                this.layout.contentStyle.width=(width-w)+'px';
                this.layout.appStyle.width=width+'px';

                var height=currentDocH<docMinH?docMinH:currentDocH;
                this.layout.menuStyle.height=(height-h)+'px';
                this.layout.contentStyle.height=(height-h)+'px';
                this.layout.appStyle.height=height+'px';
            }
        }
    };
</script>