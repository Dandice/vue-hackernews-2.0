<template>
    <div id="pc_top_dock" ref="pcDock">
        <div class="pc_top_dock_con flex_bet">
            <div class="left">
                <div class="title">{{thread.subject}}</div>
                <picStyle></picStyle>
            </div>
            <div class="top_dock_opt">
                <Zan :isFromDock="true" @replyComi="replyComi" replyId="top_dock_reply"></Zan>
                <div ref="rttWrap" class="rtt-wrap" v-show="replyTip">
                    <div class="rtt-triangle"></div>
                    <div class="rtt-con">
                        盖个楼，提个问，来跟楼主唠唠嗑～
                        <span class="rtt-close icomoon" @click="noShowTip"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Zan from './zan.vue'
    import picStyle from './picStyle.vue'

    export default {
        data() {
            const {thread} = this.$store.state.renderData.data;
            return {
                thread,
                replyTip: false
            }
        },
        components: {
            Zan,
            picStyle
        },
        methods: {
            noShowTip() {
                this.replyTip = false;
                localStorage.setItem('reply_tip', true);
            },
            replyComi(obj) {
                this.$emit('replyComi', obj)
            }
        },
        computed: {
            fixedBar() {
                return this.$store.state.project.fixedBar;
            }
        },
        watch: {
            fixedBar(val) {
                if (val === "fixtop" || val === "fixbot") {
                    this.$refs.pcDock.className = "popup flex_bet";
                    setTimeout(() => {
                        this.$refs.rttWrap.className = 'rtt-wrap rttshow';
                    }, 500);
                } else {
                    this.$refs.rttWrap.className = 'rtt-wrap';
                    this.$refs.pcDock.className = "popupmini flex_bet";
                }
            }
        },
        mounted() {
            this.replyTip = !localStorage.getItem('reply_tip');
        }
    };
</script>

<style lang="stylus">
    @import 'TopDock.styl';
</style>
