<template>
    <div class="floor_item com_pad" :id="'item-post-'+item.id">
        <div class="together" v-if="together">
            <div v-if="outdata" class="outdata">该结伴已过期</div>
            <div class="title">
                结伴信息
            </div>
            <div class="row com_row">
                <img src="./img/location.svg" class="left">
                <div class="right flex">
                    <div v-if="!together.place.length">不限目的地</div>
                    <div v-for="(item,index) in together.place" :key="index">{{item.cn_name}}</div>
                </div>
            </div>
            <div class="row com_row">
                <img src="./img/calendar.svg" class="left">
                <div class="right">
                    {{startTime}} <em>至</em> {{endTime}} <em>共</em> {{together.during}} <em>天</em>
                </div>
            </div>
            <div class="row com_row">
                <img src="./img/phone.svg" class="left">
                <div class="right">联系方式：{{together.contact}}</div>
            </div>
            <div class="row_two com_row">
                <img src="./img/message.svg" class="left">
                <div class="right" v-html="item.content"></div>
            </div>
        </div>
        <div class="user_info" v-if="index !== 0">
            <img class="left" :src="item.user.avatar">
            <div class="center">
                <div>
                    <a :href="'../../u/'+item.user.uid" class="name">{{item.user.username}}</a>
                    <span class="lz" v-if="item.uid === lzId">楼主</span>
                </div>
                <div class="time">{{created}}</div>
            </div>
            <div class="right flex">{{index + 1}}楼</div>
        </div>
        <div class="quote flex" v-if="item.quote">
            <div class="left flex">
                <div class="reply">回复：</div>
                <div class="floor">{{item.reply.i}}楼</div>
                <div class="reply name">{{item.reply.username}}</div>
            </div>
            <div class="right flex" @click="openQuote" v-show="!quoCon">
                展开引用
                <img src="./img/down_arrow.svg">
            </div>
        </div>
        <div class="open_quote" v-show="quoCon">
            <span class="quo_con" v-if="quoCon.length <= 40">{{quoCon.substr(0, 40)}}</span>
            <span class="quo_con" v-if="quoCon.length > 40">{{quoCon.substr(0, 40)}}...</span>
            <span @click="checkAll" v-if="quoCon.length > 40">查看全部引用</span>
        </div>
        <div v-html="item.content" v-if="!together"></div>
        <div class="floor_bot">
            <div class="del inl_flex" @click="delComment" v-if="String(myInfo.uid) === item.user.uid && canDel"
                 :data-floor="(page - 1) * 15 + index + 1">
                <img src="./img/del.png">
                删除
            </div>
            <div @click="doReply((page-1)*15+index+1)" class="reply inl_flex">
                <img src="./img/reply.png">
                回复
            </div>
        </div>
        <!--与大app交互-->
        <div v-html="appData"></div>
    </div>
</template>

<script>
    import {_Platform, _calTime, toLogin, _IsIOS} from '../../../../../utils/util'
    import FloorItem from './FloorItem.vue'
    import ajax from '../../../../../utils/ajax'

    export default {
        name: 'h5-detail-jieban-con',
        data() {
            const {options} = this.$store.state.renderData
            const {me = {}} = this.$store.state.renderData.data
            let userAgent = 0;
            if (options.ua.indexOf(('QYER/')) > -1) {
                userAgent = options.ua.split('QYER/')[1].split('.')
            }
            let canDel = false
            if (userAgent[0] >= 7 && userAgent[1] >= 12 || userAgent[0] > 7) {
                canDel = true
            }
            return {
                canDel,
                quoCon: '',
                isIos: _IsIOS(options.ua),
                created: _calTime(parseInt(this.item.created), 2),
                startTime: '',
                endTime: '',
                totalDay: '',
                myInfo: me,
                artId: this.$store.state.renderData.data.thread.id,
                outdata: false,
                appData: `<companypid id=${this.item.id}></companypid>`,
            }
        },
        props: ['item', 'index', 'lzId', 'page', 'together'],
        components: {},
        methods: {
            checkAll() {
                let pid = `item-post-${this.item.reply.url.split('pid=')[1]}`
                if (document.getElementById(pid)) {
                    location.href = `${location.href.split('#')[0]}#${pid}`
                } else {
                    location.href = this.item.reply.url
                }
            },
            openQuote() {
                ajax({
                    url: '/bbs/post.php',
                    data: {
                        action: 'quote',
                        pid: this.item.id,
                        ajaxID: '59ef1a1ab2eb31d54ccefca9'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.quoCon = msg.data.quote.substr(0, 45)
                    }
                })
            },
            delComment(e) {
                const {page} = this.$store.state.renderData.data
                this.isFirst = parseInt(e.target.getAttribute('data-floor')) === 1 && parseInt(page) === 1
                // 提示
                const params = {
                    cancelBtnVal: '取消',
                    confirmBtnVal: '删除'
                }
                params.title = this.isFirst ? '确认删除首楼吗？' : '确认删除该楼层帖子吗？'
                params.describe = this.isFirst ? '删除首楼层将删除整个帖子。此操作不可撤消。' : '此操作不可撤消。'
                if (this.isIos) {
                    window.webkit.messageHandlers.dialog.postMessage(JSON.stringify(params))
                } else {
                    window.QYERAPP.dialog(JSON.stringify(params))
                }
                let opt = {page: 'editInfo', data: {pid: this.item.id, isFirst: this.isFirst}}
                this.$store.commit('SET_VALUE', opt)
            },
            doReply(floor) {
                location.href = `${location.href.split('#')[0].split('?')[0]}?uid=${this.item.uid}&pid=${this.item.id}&tid=${this.artId}&username=${this.item.user.username}&floor=${floor}#reply`
            },
        },
        mounted() {
            if (this.together) {
                this.startTime = _calTime(parseInt(this.together.departure_time_latest), 2)
                this.endTime = _calTime(parseInt(this.together.return_time), 2)
                this.outdata = !(parseInt(new Date() * 1 / 1000) < parseInt(this.together.return_time))
            }
            window.onBtnConfirm = () => {
                const {fid} = this.$store.state.renderData.data.thread
                const {pid, isFirst} = this.$store.state.project.editInfo
                ajax({
                    url: '/qcross/bbs/post.php?action=remove',
                    method: 'POST',
                    data: {
                        pid,
                        fid
                    }
                }).then(msg => {
                    if (msg.result != 'ok') {
                        this.isIos ? window.webkit.messageHandlers.toast.postMessage('删除失败~')
                            : window.QYERAPP.toast('删除失败~')
                    } else if (msg.result == 'ok') {
                        // 删除成功
                        if (isFirst) {
                            // 关闭当前webview
                            this.isIos ? window.webkit.messageHandlers.closeWebView.postMessage('') : window.QYERAPP.closeWebView()
                        } else {
                            // 删除普通楼层
                            window.location.reload()
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>