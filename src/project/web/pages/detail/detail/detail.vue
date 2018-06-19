<template>
    <qFrame id="pc_detail">
        <TopDock @replyComi="replyComi"></TopDock>
        <div class="common_reply_wrap" ref="replyWrap"
             v-if="topDockReply">
            <dockReply class="top_dock_reply" replyId="top_dock_reply"
                       @replyComi="replyComi"
                       noCb="true">
            </dockReply>
        </div>
        <Block></Block>
        <div>
            <!-- 头部信息 -->
            <TitleInfo></TitleInfo>
            <div class="detail_con">
                <div class="detail_con_left">
                    <!--管理员管理-->
                    <TopManage></TopManage>
                    <!--标签、分页信息-->
                    <div class="flex_bet tag_pagination">
                        <div style="width: 59%">
                            <a :href="item.url" class="tag_item"
                               :data-bn-ipg="`bbs-thread-tags-${item.id}`"
                               v-for="(item,index) in tags" :key="index" target="_blank">
                                {{item.name}}
                            </a>
                        </div>
                        <Pagination :top="true"></Pagination>
                    </div>
                    <!-- 行程单 -->
                    <HodoMeter></HodoMeter>
                    <!-- 内容 -->
                    <DetailCon></DetailCon>
                    <!--底部分页-->
                    <Pagination></Pagination>
                    <!--底部回复-->
                    <SepReply></SepReply>
                    <!--底部推荐-->
                    <RecBot></RecBot>
                </div>
                <div class="detail_con_right">
                    <Recommend></Recommend>
                </div>
            </div>
        </div>

        <qSideBar :items="sideBar" :threadQcode="threadQcode"></qSideBar>
    </qFrame>
</template>

<script>
    import qFrame from 'frame_web/layout/qFrame.vue'
    import TitleInfo from "../common/TitleInfo/TitleInfo.vue";
    import TopDock from '../common/TitleInfo/TopDock.vue'
    import Block from "../common/Block/block.vue";
    import DetailCon from "./DetailCon/detailCon.vue";
    import SepReply from '../common/SepReply/sepReply.vue'
    import RecBot from './Recommend/RecBot/recbot.vue'
    import Pagination from '../common/Pagination/pagination.vue'
    import TopManage from '../common/TopManage/manage.vue'
    import HodoMeter from "../common/HodoMeter/hodometer.vue";
    import qSideBar from '../../../common/qSidebar.vue';
    import Recommend from "./Recommend/recommend.vue";
    //import 'element-ui/lib/theme-chalk/icon.css'
    //import 'element-ui/lib/theme-chalk/index.css'
    import dockReply from '../common/Reply/reply.vue'
    import Vue from 'vue'
    import {cssLoader} from '../../../../utils/util'

    // 时间转换
    Vue.filter('cha_time', (st, type) => {
        if (st.length === 10) {
            st = parseInt(st) * 1000
        }
        let date = new Date(parseInt(st))
        let year = date.getFullYear()
        let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
        let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        //let sec = date.getSeconds()
        switch (type) {
            case 3:
                return `${year}-${month}-${day} ${hour}:${min}`  // 2013年12月29日 13:42  2017-11-06 16:33
        }
    });

    export default {
        name: "pc-detail",
        data() {
            const {tags, args, page} = this.$store.state.renderData.data;
            return {
                topDockReply: false,
                sideBar: "gotoTop,lookonPhone,feedback,gotoBottom",
                threadQcode: `/detail.php?action=qrcode&data=${args.tid},${page}`,
                tags
            };
        },
        computed: {
            fixedBar() {
                return this.$store.state.project.fixedBar;
            },
            userInfo() {
                return this.$store.state.userInfo;
            },
        },
        watch: {
            fixedBar(val) {
                if (val === "fixtop" || val === "fixbot") {
                } else {
                    if (this.$refs.replyWrap) {
                        this.$refs.replyWrap.style.display = 'none';
                    }
                }
            }
        },
        components: {
            dockReply,
            qFrame,
            TopDock,
            Recommend,
            DetailCon,
            SepReply,
            RecBot,
            Pagination,
            TopManage,
            HodoMeter,
            TitleInfo,
            qSideBar,
            Block,
        },
        methods: {
            replyComi(data) {
                if (data === 'cancel') {
                    this.$refs.replyWrap.style.display = 'none';
                } else if (data.type === 'show') {
                    if (this.topDockReply) {
                        this.$refs.replyWrap.style.display = 'block';
                    } else {
                        this.topDockReply = true;
                    }
                }
            },
        },
        mounted() {
            if (sessionStorage.getItem("picStyle") === "false") {
                let opt = {
                    page: "topBar",
                    attr: "picStyle",
                    data: false
                };
                this.$store.commit("SET_VALUE", opt);
            }

            // 首次未登录 提示登录
            if (!this.userInfo.uid && !localStorage.getItem('login_tip')) {
                setTimeout(() => {
                    this.$store.dispatch('LOGIN_MODAL');
                    localStorage.setItem('login_tip', true);
                }, 5000);
            }
            // 引入 element-ui 样式库，减少首包体积及编译包大小
            cssLoader('https://unpkg.com/element-ui/lib/theme-chalk/index.css');
        }
    };
</script>

<style lang="stylus">
    @import './detail.styl';
</style>
