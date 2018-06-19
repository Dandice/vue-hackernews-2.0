<template>
    <div class="floor_item com_pad mimi" :id="'item-post-'+item.id">
        <div class="user_info" v-show="page > 1 || (page===1&&index>0)">
            <img class="left" :src="item.user.avatar" @click="toUser">
            <div class="center">
                <div class="inl_flex">
                    <span class="name" @click="toUser">{{item.user.username}}</span>
                    <span class="lz" v-if="item.uid === lzId">楼主</span>
                </div>
                <div class="time">{{created}}</div>
            </div>
            <div class="right flex">{{(page - 1) * 15 + index + 1}}楼</div>
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
        <div :id="'item-con-'+index" v-html="postNode ? postNode : item.content"></div>
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
    </div>
</template>

<script>
    import {_Platform, _calTime, toLogin, jsENV, _IsIOS} from '../../../../../utils/util'
    import FloorItem from './FloorItem.vue'
    import ajax from '../../../../../utils/ajax'

    export default {
        name: 'h5-floor-item',
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
                quoCon: '',
                canDel,
                isIos: _IsIOS(options.ua),
                artId: this.$store.state.renderData.data.thread.id,
                isFirst: false,
                myInfo: me,
                isInManage: false,
                created: _calTime(parseInt(this.item.created), 2)
            }
        },
        props: ['item', 'index', 'lzId', 'page', 'postNode'],
        components: {},
        methods: {
            toUser() {
                location.href = `//m.qyer.com/u/${this.item.user.uid}`
            },
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
                        this.quoCon = msg.data.quote
                    }
                })
            },
            doReply(floor) {
                location.href = `${location.href.split('#')[0].split('?')[0]}?uid=${this.item.uid}&pid=${this.item.id}&tid=${this.artId}&username=${this.item.user.username}&floor=${floor}#reply`
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
            }
        },
        mounted() {
            window.onBtnConfirm = () => {
                const {fid} = this.$store.state.renderData.data.thread
                const {pid, isFirst} = this.$store.state.project.editInfo
                if (this.isInManage) {
                    this.isIos ? window.webkit.messageHandlers.toast.postMessage('请求中~')
                        : window.QYERAPP.toast('请求中~')
                    return;
                }
                this.isInManage = true;
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
                        this.isInManage = false;
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