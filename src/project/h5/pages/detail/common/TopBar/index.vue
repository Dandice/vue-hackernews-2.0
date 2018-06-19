<template>
    <div style="width: 100%">
        <div class="topbar com_pad" ref="topBar">
            <a class="left flex" href="//m.qyer.com/bbs">
                <img src="../image/qyer.svg">
            </a>
            <div class="right inl_flex">
                <span class="dianti" @click="togConfirm" data-bn-ipg="m.bbs-ThreadDetail-Nav-elevator"
                      v-if="type !== 3">电梯</span>
                <img :src="favorited ? like : unlike" class="like" @click="showT"
                     data-bn-ipg="m.bbs-ThreadDetail-Nav-collect">
                <span data-bn-ipg="m.bbs-ThreadDetail-Nav-more" @click="togSel" class="inl_flex">
                    <span class="select"></span>
                    <span class="select"></span>
                    <span class="select"></span>
                </span>
            </div>
            <div class="sel_wrap" v-show="inSel" @click="togSel">
                <div class="sharp">
                    <div class="arrow">
                        <em></em><span></span>
                    </div>
                </div>
                <div class="sel_con flex">
                    <div class="no_pic flex">
                        <div @click="chaSel('picStyle')">
                            <img src="../image/nopic.svg">
                            <div>{{picStyle ? '无图' : '取消无图'}}模式</div>
                        </div>
                    </div>
                    <div class="onlylz flex">
                        <div @click="chaSel('haveOther')">
                            <img src="../image/landlord.svg">
                            <div>{{haveOther ? '只看' : '取消只看'}}楼主</div>
                        </div>
                    </div>
                </div>
            </div>
            <Confrim :showConfirm="showConfirm" :message="message" v-on:togConfirm="togConfirm"
                     v-on:cliConfirm="cliConfirm"></Confrim>
        </div>

        <div class="topbar_two com_pad">
            <a class="left flex" href="//m.qyer.com/bbs">
                <img src="../image/qyer.svg">
            </a>
            <div class="right inl_flex">
                <span class="dianti" @click="togConfirm" data-bn-ipg="m.bbs-ThreadDetail-Nav-elevator"
                      v-if="type !== 3">电梯</span>
                <img :src="favorited ? like : unlike" class="like" @click="showT"
                     data-bn-ipg="m.bbs-ThreadDetail-Nav-collect">
                <span data-bn-ipg="m.bbs-ThreadDetail-Nav-more" @click="togSel" class="inl_flex">
                    <span class="select"></span>
                    <span class="select"></span>
                    <span class="select"></span>
                </span>
            </div>
        </div>
        <div class="title_info">
            <div class="cover_wrap" v-if="thread.cover && page === 1">
                <img :src="thread.cover" class="header_pic">
            </div>
            <div class="title_con">
                <span class="sm_subject" :class="{big_subject: thread.subject.length<=33}">{{thread.subject}}</span>
                <span v-if="digest" class="jh inl_flex">
                    <img src="../image/five-point-star.svg" v-for="item in digest">
                    精华
                </span>
                <span v-if="!digest && parseInt(thread.heated_discuss)" class="heated_discuss inl_flex">
                热议
            </span>
                <div class="bottom flex">
                    <img :src="avatar" @click="toUser" class="avatar">
                    <div class="right">
                        <div class="username inl_flex" @click="toUser">
                            {{author.username}}
                            <span v-if="authInfo.indexOf('精华作者')>=0" class="jh">精华作者</span>
                            <img v-else-if="authInfo.indexOf('member')>=0" src="../image/orange-qyer.svg">
                            <img v-else-if="authInfo.indexOf('qyer')>=0" src="../image/green-qyer.svg">
                            <img v-else-if="authInfo.indexOf('company')>=0" src="../image/blue-qyer.svg">
                        </div>
                        <div class="center">
                            <span class="block"><span class="number">{{thread.total_replies}}</span>回复</span>
                            <span class="block"><span class="split ">|</span><span
                                class="number">{{totalFav}}</span>收藏</span>
                            <span class="block"><span class="split">|</span><span
                                class="number">{{thread.total_views}}</span>浏览</span>
                        </div>
                        <div class="pubtime">
                            发布于{{created}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="to_form">
                <div class="com_pad flex" @click="jumpTo(forums[0].url)">
                    <div>来自 {{forums[0].name}}版</div>
                    <div class="flex">{{type === 3 ? '查看全部' : '更多游记'}}<img src="../image/right_arrow.svg"></div>
                </div>
            </div>
        </div>
        <img :src="`//m.qyer.com/bbs/pv/${artId}`" style="visibility: hidden; display: block;">
    </div>
</template>

<script>
    import like from '../image/like.svg'
    import unlike from '../image/unlike.svg'
    import Confrim from '../../../../common/confirm.vue'
    import ajax from '../../../../../utils/ajax'
    import Toast from 'mint-ui/lib/toast'
    import 'mint-ui/lib/toast/style.css'
    import {_ChaPage, openApp, toLogin, _calTime} from '../../../../../utils/util'

    export default {
        name: 'h5-detailYouJi-top-bar',
        data () {
            const {favorited, uid} = this.$store.state.renderData.data.me
            const {thread, forums, page} = this.$store.state.renderData.data
            const {author} = this.$store.state.renderData.data.thread
            let authInfo = []
            author.auth.length && author.auth.map((item) => {
                authInfo.push(item.type)
                authInfo.push(item.desc)
            })
            return {
                author,
                thread,
                forums,
                page,
                digest: parseInt(thread.digest),
                avatar: author.avatar,
                username: author.username,
                totalFav: thread.total_favorites,
                created: _calTime(parseInt(thread.created), 1),
                formName: '',
                authInfo,
                artId: thread.id,
                favorited: favorited,
                message: '请打开穷游App使用“电梯”功能',
                showConfirm: false,
                inSel: false,
                visId: uid,
                like,
                unlike,
                type: parseInt(thread.type) // 帖子类型: 结伴 3,
            }
        },
        components: {Confrim},
        computed: {
            haveOther () {
                return this.$store.state.project.topBar.haveOther
            },
            picStyle () {
                return this.$store.state.project.topBar.picStyle
            },
            fixedBar () {
                return this.$store.state.project.fixedBar
            }
        },
        watch: {
            fixedBar (val) {
                if (val === 'fixed') {
                    this.$refs.topBar.className = 'topbar com_pad top_bar_show'
                } else {
                    this.$refs.topBar.className = 'topbar com_pad'
                    if (this.inSel) {
                        this.inSel = !this.inSel
                    }
                }
            }
        },
        methods: {
            toUser () {
                location.href = `//m.qyer.com/u/${this.author.uid}`
            },
            togConfirm () {
                this.showConfirm = !this.showConfirm
            },
            cliConfirm () {
                const {page} = this.$store.state.renderData.data
                openApp(this.artId, page)
            },
            togSel () {
                this.inSel = !this.inSel
                /* const showMask = this.$store.state.project.showMask;
                 let opt = {page: 'showMask', data: !showMask};
                 this.$store.commit('SET_VALUE', opt); */
            },
            chaSel (type) {
                if (type === 'haveOther') {
                    const {uid} = this.$store.state.renderData.data.thread
                    _ChaPage(1, this.haveOther ? uid : 'all')
                } else {
                    const picStyle = this.$store.state.project.topBar.picStyle
                    let opt = {page: 'topBar', attr: type, data: !picStyle}
                    this.$store.commit('SET_VALUE', opt)
                    this.togSel()
                    sessionStorage.setItem('picStyle', !picStyle)
                }
            },
            showT () {
                if (this.favorited) {
                    Toast({
                        message: '您已经收藏了这篇帖子',
                        position: 'middle',
                        duration: 2000
                    })
                } else {
                    if (this.visId) {
                        ajax({
                            url: '/bbs/thread.php?action=favorite&ajaxID=5a0006ba0c375ac1580c2e85',
                            method: 'POST',
                            data: {
                                tid: this.artId,
                                opt: 1,
                                type: 1
                            }
                        }).then(msg => {
                            if (!msg.error_code) {
                                this.favorited = true
                                this.totalFav += 1
                            } else {
                                Toast({
                                    message: msg.data.msg,
                                    position: 'middle',
                                    duration: 3000
                                })
                            }
                        })
                    } else {
                        toLogin()
                    }
                }
            },
            jumpTo (link) {
                location.href = link
            }
        },
        mounted () {
        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>