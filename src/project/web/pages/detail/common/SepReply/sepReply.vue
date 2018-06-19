<template>
    <div id="sep_reply">
        <div class="left">
            <img :src="`${logSta.avatar  || '//static.qyer.com/images/user2/avatar/middle6.png'}`" class="userimg">
        </div>
        <div class="right">
            <div class="reply_pla_hol" v-show="!clickReply" ref="repPlaHol" @click="startReply">
                <span class="reply" v-if="thread.uid == userInfo.uid">续写</span>
                <span v-if="thread.uid == userInfo.uid">或</span>
                <span class="reply">回复</span>
                <span>当前帖子</span>
            </div>
            <Reply noCb="true" replyId="bot_sep_reply" v-if="clickReply" :cancelTip="true" @replyComi="replyComi"
                   ref="reply"></Reply>
        </div>
    </div>
</template>

<script>
    import Reply from '../Reply/reply.vue'

    export default {
        data() {
            const {thread} = this.$store.state.renderData.data;
            return {
                thread,
                clickReply: false
            }
        },
        components: {
            Reply
        },
        computed: {
            logSta() {
                return this.$store.state.userInfo;
            },
            userInfo() {
                return this.$store.state.project.userInfo;
            }
        },
        methods: {
            startReply() {
                if (!this.userInfo.uid) {
                    this.$store.dispatch('LOGIN_MODAL');
                } else if (this.thread.uid == this.userInfo.uid) {
                    location.href = `//bbs.qyer.com/thread-reply?tid=${this.thread.id}`;
                } else if (this.clickReply) {
                    this.$refs.reply.$el.style.display = 'block';
                    this.$refs.repPlaHol.style.display = 'none';
                } else {
                    this.clickReply = true;
                }
            },
            replyComi(type) {
                if (type === 'cancel') {
                    this.$refs.reply.$el.style.display = 'none';
                    this.$refs.repPlaHol.style.display = 'block';
                }
            }
        },
        mounted() {
        }
    }
</script>

<style lang="stylus">
    @import "sepReply.styl"
</style>