<template>
    <div class="common_block_zan inl_flex">
        <el-popover
            ref="popover1"
            placement="top-start"
            width="200"
            trigger="hover"
            content="这是">
        </el-popover>
        <div class="zan block" style="border-left:  1px solid #e9e9e9;" @click="togZan"
             data-bn-ipg="bbs-thread-top-like">
            <div class="icomoon zanico ico-16" v-show="!userInfo.liked"></div>
            <div class="icomoon zanico ico-17" v-show="userInfo.liked"></div>
            <div class="text">{{counter.likes > 0 ? counter.likes: ''}}赞</div>
        </div>
        <div class="collect block" @click="togCollect" data-bn-ipg="bbs-thread-top-collect">
            <div class="icomoon zanico ico-10" v-show="!userInfo.favorited"></div>
            <div class="icomoon zanico ico-11" v-show="userInfo.favorited"></div>
            <div class="text">{{counter.favorites > 0 ? counter.favorites: ''}}收藏</div>
        </div>
        <div class="reply block" style="position: relative;z-index:1001" @click="doReply"
             data-bn-ipg="bbs-thread-top-reply">
            <div class="icomoon zanico ico-18"></div>
            <div class="text">{{counter.replies}}回复</div>
            <div class="reply_wrap" ref="replyWrap" v-if="isInReply">
                <Reply :replyId="replyId" @replyComi="replyComi" noCb="true"></Reply>
            </div>
        </div>
        <div class="share block">
            <el-popover placement="bottom" trigger="hover">
                <div>
                    <q-share-icon webid="tsina" size="16px" :title="shareConfig.title" :summary="shareConfig.summary"
                                  :url="url" :pic="pic" target="_black"/>
                    <q-share-icon webid="weixin" :title="shareConfig.title" :summary="shareConfig.summary"
                                  :url="shareConfig.url"/>
                    <q-share-icon webid="qzone" :url="shareConfig.url" target="_black" :share-config="shareConfig"/>
                </div>
                <div class="icomoo" slot="reference">
                    <div class="icomoon zanico ico-43"></div>
                    <div class="text">分享</div>
                </div>
            </el-popover>
        </div>
    </div>
</template>

<script>
    import ajax from '../../../../../utils/ajax'
    import Reply from '../Reply/reply.vue'
    import {Popover, Message} from 'element-ui'
    import qShareIcon from 'frame_web/components/ui/qShareIcon/qShareIcon.vue'
    import Vue from 'vue'

    Vue.prototype.$message = Message;

    export default {
        data() {
            const {thread = {}, args = {}, author} = this.$store.state.renderData.data;
            const {options} = this.$store.state.renderData;
            const shareConfig = {
                title: thread.subject,
                summary: '这里有一篇精彩游记，快来看看',
                url: options.url,
                pic: thread.share_pic || author.avatar
            };
            return {
                thread,
                args,
                isInReply: false,
                likeNum: thread.total_likes,
                colNum: thread.total_favorites,
                shareConfig,
                title: shareConfig.title,
                summary: shareConfig.summary,
                url: shareConfig.url,
                pic: shareConfig.pic,
                loadZan: Promise.resolve(),
                loadCol: Promise.resolve(),
            };
        },
        props: ['isFromDock', 'replyId'],
        components: {
            Reply,
            qShareIcon,
            [Popover.name]: Popover
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo;
            },
            counter() {
                return this.$store.state.project.counter
            }

        },
        watch: {
            userInfo(obj) {
            }
        },
        methods: {
            doReply() {
                if (this.userInfo.uid) {
                    if (this.isFromDock) {
                        this.$emit('replyComi', {type: 'show'});
                    } else {
                        if (this.userInfo.uid) {
                            if (this.isInReply) {
                                this.$refs.replyWrap.style.display = 'block';
                            } else {
                                this.isInReply = true;
                            }
                        } else {
                            this.$store.dispatch('LOGIN_MODAL');
                        }
                    }
                } else {
                    this.$store.dispatch('LOGIN_MODAL');
                }
            },
            replyComi(type) {
                if (type === 'cancel') {
                    this.$refs.replyWrap.style.display = 'none';
                }
            },
            togZan() {
                if (this.userInfo.uid && this.loadZan.then) {
                    this.loadZan.then(() => {
                        ajax({
                            url: '/thread.php',
                            data: {
                                action: 'like',
                                tid: this.args.tid,
                                opt: this.userInfo.liked ? 0 : 1,
                                ajaxID: '59ef156eb2eb31d54ccefca7'
                            }
                        }).then(msg => {
                            if (!msg.error_code) {
                                const likes = this.counter.likes;
                                this.$store.commit('SET_VALUE', {
                                    page: 'counter',
                                    attr: 'likes',
                                    data: this.userInfo.liked ? likes - 1 : likes + 1
                                });
                                this.$store.commit('SET_VALUE', {
                                    page: 'userInfo',
                                    attr: 'liked',
                                    data: !this.userInfo.liked
                                });
                            } else {
                                this.$message({message: msg.data.msg, type: 'error'});
                            }
                            this.loadZan = Promise.resolve();
                        });
                        this.loadZan = {};
                    });

                } else {
                    this.$store.dispatch('LOGIN_MODAL');
                }
            },
            togCollect() {
                if (this.userInfo.uid && this.loadCol.then) {
                    this.loadCol.then(() => {
                        ajax({
                            url: '/thread.php',
                            data: {
                                action: 'favorite',
                                tid: this.args.tid,
                                opt: this.userInfo.favorited ? 0 : 1,
                                ajaxID: '5a0006ba0c375ac1580c2e85'
                            }
                        }).then(msg => {
                            if (!msg.error_code) {
                                const favorites = this.counter.favorites;
                                this.$store.commit('SET_VALUE', {
                                    page: 'counter',
                                    attr: 'favorites',
                                    data: this.userInfo.favorited ? favorites - 1 : favorites + 1
                                });
                                this.$store.commit('SET_VALUE', {
                                    page: 'userInfo',
                                    attr: 'favorited',
                                    data: !this.userInfo.favorited
                                });
                            } else {
                                this.$message({message: msg.data.msg, type: 'error'});
                            }
                            this.loadCol = Promise.resolve();
                        });
                        this.loadCol = {};
                    });
                } else {
                    this.$store.dispatch('LOGIN_MODAL');
                }
            }
        },
        mounted() {
        }
    }
</script>

<style lang="stylus">
    @import "zan.styl"
</style>