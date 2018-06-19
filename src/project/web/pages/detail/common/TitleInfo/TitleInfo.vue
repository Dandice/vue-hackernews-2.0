<template>
    <div id="pc_title_info">
        <img :src="blurImg" class="blur_img" v-if="blurImg">
        <div class="top_info" :style="{background: thread.cover,height: thread.cover ? '400px' : '150px'}">
            <div class="strategy" v-show="forums.length"
                 :style="{color: `${thread.cover? '#fff' : '#636363'}`}">
                <span>旅游攻略论坛：</span>
                <a :href="item.url" data-bn-ipg="bbs-thread-backforum" v-for="(item,index) in forums" target="_blank">
                    <span class="strategy_item">{{item.name}}</span>
                    <span class="strategy_block" v-show="index+1<forums.length">
                        及
                    </span>
                </a>
            </div>
            <img :src="thread.cover" class="bg_img" v-if="thread.cover">
            <div class="subject_con" :class="{no_cover_sub: !thread.cover}">{{thread.subject}}</div>
        </div>
        <div class="subject" v-if="thread.cover"></div>
        <div class="bottom_info">
            <div class="bottom_con flex_bet">
                <div class="left">
                    <a class="head_pho" data-bn-ipg="bbs-thread-top-userphoto"
                       :href="`//www.qyer.com/u/${author.uid}`" target="_blank"
                       v-if="thread.cover">
                        <img :src="author.avatar" class="avatar">


                        <el-popover
                            ref="popover1"
                            placement="bottom"
                            trigger="hover">
                            <div style="color: #959595;">{{auth.desc}}</div>
                        </el-popover>


                        <div class="auth"  v-popover:popover1>
                            <img v-if="authInfo.indexOf('member')>=0"
                                 src="//common1.qyerstatic.com/bbs/old/images/authentication_u.png">
                            <img v-else-if="authInfo.indexOf('qyer')>=0"
                                 src="//common1.qyerstatic.com/bbs/old/images/authentication_q.png">
                            <img v-else-if="authInfo.indexOf('company')>=0"
                                 src="//common1.qyerstatic.com/bbs/old/images/authentication_c.png">
                        </div>
                    </a>
                    <div class="detail" :style="{marginLeft: thread.cover ? '170px' : '0'}">
                        <div class="top">
                            <a :href="`//www.qyer.com/u/${author.uid}`" data-bn-ipg="bbs-thread-top-username"
                               target="_blank" class="user_name">{{author.username}}</a>
                            <span class="level">{{author.group}}</span>
                            <span v-if="parseInt(thread.digest)>0" class="jh inl_flex">
                                <img src="../../img/five-point-star.svg" class="icon"
                                     v-for="item in parseInt(thread.digest)">
                                精华
                            </span>
                            <span v-else-if="thread.heated_discuss == 1" class="jh inl_flex" style="background: #FFBB2F;">
                                热议
                            </span>
                            <a href="javascript:;" class="cha_cover"
                               v-if="parseInt(author.uid) === userInfo.uid && thread.type !== '3'"
                               @click="showAlbum = true">修改封面</a>
                        </div>
                        <div class="info_bottom only_flex">
                            <span class="only_flex">
                                <span class="icon icomoon time_icon"></span>
                                <span>{{thread.created | yeaMonDat}}</span>
                            </span>
                            <span class="only_flex">
                                <span class="icon icomoon total_views_icon"></span>
                                <span class="total_views">{{counter.views}}人阅读</span>
                            </span>
                            <picStyle></picStyle>
                        </div>
                    </div>
                </div>
                <Zan :counter="counter" replyId="title_info_reply"></Zan>
            </div>
        </div>
        <!--相册-->
        <el-dialog
            :visible.sync="showAlbum"
            width="622px">
            <span>
                <Album @setPicUrl="setPicUrl" :isReply="false"></Album>
            </span>
            <span slot="footer" class="dialog-footer">
                <div class="bottom">
                    <div class="cancel btn" @click="showAlbum = false">取消</div>
                    <div class="insPic btn" :class="{grey:!selPhotoid}" @click="editCover">确认</div>
                </div>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import Vue from "vue";
    import Zan from './zan.vue'
    import picStyle from './picStyle.vue'
    import ajax from '../../../../../utils/ajax'
    import Album from '../Album/album.vue'
    import {Dialog,Popover,Message} from 'element-ui'

    Vue.prototype.$message = Message;


    Vue.filter("yeaMonDat", function (st) {
        if (st.length === 10) {
            st = parseInt(st) * 1000;
        }
        let date = new Date(parseInt(st));
        let year = date.getFullYear();
        let month =
            date.getMonth() + 1 < 10 ?
                "0" + (date.getMonth() + 1) :
                date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        return `${year}-${month}-${day}`; // 2013-12-29
    });

    export default {
        data() {
            const {
                thread = {},
                author = {},
                forums
            } = this.$store.state.renderData.data;
            let authInfo = []
            author.auth.length && author.auth.map((item) => {
                authInfo.push(item.type)
                authInfo.push(item.desc)
            })
            return {
                blurImg: thread.cover ? `${thread.cover.split('?')[0]}?imageMogr/v2/thumbnail/x520/blur/30x30` : '',
                author,
                auth: author.auth[0] || {desc: null},
                authInfo,
                forums,
                thread,
                artId: parseInt(thread.id),
                counter: {},
                showAlbum: false,
                selPhotoid: null
            };
        },
        components: {
            picStyle,
            Zan,
            Album,
            [Popover.name]: Popover,
            [Dialog.name]: Dialog
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo
            }
        },
        methods: {
            editCover() {
                if (this.selPhotoid) {
                    ajax({
                        url: '/qcross/bbs/thread.php?action=editCover',
                        method: 'POST',
                        data: {
                            tid: this.thread.id,
                            photoid: this.selPhotoid
                        }
                    }).then(msg => {
                        if (msg.error_code) {
                            this.$message({message: msg.data.msg, type: 'error'});
                        } else {
                            this.showAlbum = false;
                            this.thread.cover = msg.data.pic;
                            this.$message({message: '修改封面成功！', type: 'success'});
                        }
                    })
                }
            },
            setPicUrl(item) {
                this.selPhotoid = item && item.id;
            },
            getCounter() {
                ajax({
                    url: `/detail/counter/t/${this.artId}.json`,
                    data: {
                        //action: 'counter',
                        time_sta: new Date() * 1,
                        //tid: this.artId,
                    },
                    useErcode: false
                }).then(msg => {
                    this.counter = msg;
                    this.$store.commit('SET_VALUE', {
                        page: 'counter',
                        data: msg
                    });
                })
            }
        },
        mounted() {
            this.getCounter();
        }
    };
</script>

<style lang="stylus">
    @import 'TitleInfo.styl';
</style>