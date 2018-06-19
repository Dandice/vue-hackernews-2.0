<template>
    <div id="botFixed" ref="bottomBar" class="flex">
        <div :class="liked ? 'zan': 'unzan'" class="inl_flex block" v-if="type !== 3"
             @click="togLike"
             data-bn-ipg="m.bbs-ThreadDetail-ToolBar-ThumbUp">
            <img class="gesture" src="../image/zan.svg" v-show="liked">
            <img src="../image/unzan.svg" v-show="!liked">
            {{liked ? "已赞" : "赞"}}{{showLike === 0 ? '' : showLike}}
        </div>
        <div class="page inl_flex block">
            <span><</span> {{selected}}/{{pages}}页 <span>></span>
            <select v-model="selected" data-bn-ipg="m.bbs-ThreadDetail-ToolBar-PagePicker">
                <option :value="i" v-for="i in pages">第{{i}}页 {{i * 15 - 14}}楼-{{i * 15}}楼</option>
            </select>
        </div>
        <div class="reply block" @click="opeReply()">
            <span data-bn-ipg="m.bbs-ThreadDetail-ToolBar-PagePicker">回复楼主</span>
        </div>
        <div class="mask_two" :class="{isReply : isReply}" @click="cloReply">
            <div class="reply_con com_pad" @click.stop>
                <div class="top flex">
                    <div class="left" @click="cloReply">关闭</div>
                    <div class="center">发表回复</div>
                    <div @click="doReply" class="right" :class="{hav_rep_con: replyCon}">回复</div>
                </div>
                <textarea v-model="replyCon" :placeholder="'回复'+replyWho"></textarea>
                <div class="bottom inl_flex re_three_btn">
                    <img id="pickfiles" class="img_icon" src="../image/pic.svg">
                    <input v-if="needVertify" class="vertify" ref="vertify" placeholder="请输入验证码" maxlength="6"
                           type="text">
                    <img v-if="needVertify" :src="imgVertify">
                </div>
                <div class="img_list" v-show="imgList.length">
                    <div class="img_item flex" v-for="(item, index) in imgList">
                        <img src="../image/icon-close.svg" @click="delPic(item.id, index)"
                             class="del">
                        <img :src="item.src">
                    </div>
                    <div class="qiniu_upload_btn img_item flex">
                        <img :src="this.addPic">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import qiniuConfig from 'common/components/qiniu/qiniuConfig'
    import ajax from '../../../../../utils/ajax'
    import addPic from '../image/addpic.svg'
    import Toast from 'mint-ui/lib/toast'
    import 'mint-ui/lib/toast/style.css'
    import {scriptLoader} from 'common/utils/utils'
    import {_ChaPage, toLogin, _Platform} from '../../../../../utils/util'

    export default {
        name: 'detailYouJi-bot-fixed',
        data() {
            const {page, me, _needVerifyImage} = this.$store.state.renderData.data
            const {options} = this.$store.state.renderData
            const {total_likes, id, type} = this.$store.state.renderData.data.thread
            return {
                me,
                liked: me.liked,
                pages: null,
                artId: id,
                selected: page,
                replyCon: null,
                totLike: total_likes,
                showLike: null,
                addPic,
                needVertify: _needVerifyImage,
                imgVertify: null,
                imgList: [],
                readAll: _Platform(options.ua),
                hasCliReply: false,
                type: parseInt(type) // 帖子类型: 结伴 3,
            }
        },
        computed: {
            isReply() {
                return this.$store.state.project.replyInfo.isReply
            },
            replyWho() {
                return this.$store.state.project.replyInfo.replyWho
            },
            fixedBar() {
                return this.$store.state.project.fixedBar
            }
        },
        watch: {
            liked() {
                this.analyZan()
            },
            selected: function (page) {
                _ChaPage(page)
            },
            fixedBar(val) {
                if (val === 'fixed' || val === 'hideTop' || !this.readAll) {
                    this.$refs.bottomBar.className = 'flex'
                } else if (!this.isReply) {
                    this.$refs.bottomBar.className = 'flex bot_bar_hide'
                }
            },
            isReply(val) {
                if (val) {
                    this.$refs.bottomBar.className = 'flex'
                    if (!this.hasCliReply) {
                        this.loadQiNiu();
                    }
                }
            }
        },
        methods: {
            anaImgVer() {
                this.imgVertify = `http://m.qyer.com/ajax.php?action=captcha&timer=${new Date() * 1}&uid=${this.me.uid}`
            },
            analyZan() {
                if (this.totLike >= 1000) {
                    this.showLike = (this.totLike / 1000).toFixed(1) + 'k'
                } else {
                    this.showLike = this.totLike
                }
            },
            togLike() {
                const lzId = this.$store.state.renderData.data.thread.uid
                if (!this.me.uid) {
                    toLogin()
                } else if (parseInt(lzId) === this.me.uid) {
                    Toast({
                        message: '不能给自己点赞哦',
                        position: 'center',
                        duration: 3000
                    })
                } else if (!this.liked) {
                    ajax({
                        url: '/bbs/thread.php?action=like&ajaxID=59ef156eb2eb31d54ccefca7',
                        method: 'POST',
                        data: {
                            tid: this.artId,
                            opt: 1,
                            from_device: 2
                        }
                    }).then(msg => {
                        if (!msg.error_code) {
                            this.liked = true
                            this.totLike += 1
                        }
                    })
                }
            },
            cloReply(e) {
                let opt = {page: 'replyInfo', data: {isReply: false, pid: null, replyWho: '楼主'}}
                this.$store.commit('SET_VALUE', opt)
                this.replyCon = null
                if (this.fixedBar === 'static') {
                    this.$refs.bottomBar.className = 'flex bot_bar_hide'
                }
            },
            opeReply() {
                if (this.me.uid) {
                    let opt = {page: 'replyInfo', data: {isReply: true, pid: null, replyWho: '楼主'}}
                    this.$store.commit('SET_VALUE', opt)
                    // 第一次点击回复做标记
                    if (!this.hasCliReply) {
                        this.loadQiNiu();
                    }
                } else {
                    toLogin()
                }
            },
            loadQiNiu() {
                let urlOne = '//fes.qyerstatic.com/FkDnY51qfolmNbtelIanGCQmYaHF'
                let urlTwo = '//fes.qyerstatic.com/FoSIrctGlu6jjKBxmJqw1zYHbJk0'

                Promise.all([scriptLoader(urlOne), scriptLoader(urlTwo)]).then(() => {
                    this.getUpToken()
                });
                this.hasCliReply = true
            },
            doReply() {
                if (!this.replyCon) {
                    this.uniToast('请输入回复内容')
                } else if (this.needVertify && !this.$refs.vertify.value.length) {
                    this.uniToast('请输入验证码')
                } else {
                    let newbb = []
                    this.imgList.forEach((item) => {
                        newbb.push('<span data-type="photo" data-id="' + item.id + '"></span>')
                    })
                    // 回复前鉴权
                    this.uniToast('提交中...')
                    ajax({
                        url: '/bbs/thread-reply',
                        data: {tid: this.artId, ajaxID: '5a012e530c375ac1580c2e89'}
                    }).then(msg => {
                        const pid = this.$store.state.project.replyInfo.pid
                        let data = {
                            token: msg.data.token,
                            device: 2,
                            tid: this.artId,
                            content: this.replyCon + newbb.join(''),
                            valid_code: this.needVertify ? this.$refs.vertify.value : ''
                        }
                        if (pid) data.pid = pid
                        if (!msg.error_code) {
                            ajax({
                                url: '/bbs/thread-reply?ajaxID=59ffce190c375ac1580c2e82',
                                method: 'POST',
                                data
                            }).then(msg => {
                                if (this.needVertify) {
                                    this.$refs.vertify.value = null
                                }
                                if (!msg.error_code) {
                                    this.uniToast('回复成功！')
                                    this.imgList = []
                                    this.replyCon = ''
                                    let opt = {page: 'replyInfo', data: {isReply: false, pid: null, replyWho: '楼主'}}
                                    this.$store.commit('SET_VALUE', opt)
                                    // 如果是最后一页，刷新页面
                                    if (this.selected === this.pages) {
                                        location.reload()
                                    }
                                } else {
                                    this.anaImgVer()
                                    this.uniToast(msg.data)
                                }
                            })
                        } else {
                            this.uniToast(msg.data)
                        }
                    })
                }
            },
            uniToast(msg) {
                Toast({
                    message: msg,
                    position: 'bottom',
                    duration: 3000
                })
            },
            getUpToken() {
                ajax({
                    url: '/bbs/photo.php',
                    data: {
                        action: 'token'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        let newOpt = {
                            uptoken: msg.data.token,
                            auto_start: false,  //是否自动上传
                            getphoIdUrl: '/bbs/photo.php',
                            max_file_size: '10mb',
                            browse_button: 'pickfiles',
                            filters: {
                                mime_types: [{title: 'Image files', extensions: 'jpg,png'}]
                            }
                        };
                        qiniuConfig.qiniu(this, newOpt,
                            () => {
                            },
                            (type, cb) => {
                                if (type === 'ok') {
                                    this.imgList.push({src: cb.data.photo.url, id: cb.data.photo.id})
                                    setTimeout(this.resetPosition, 300)
                                } else {
                                    Toast({
                                        message: '上传失败',
                                        position: 'bottom',
                                        duration: 3000
                                    })
                                }
                            })
                    }
                })
            },
            resetPosition() {
                const moxieshim = document.querySelector('.moxie-shim')
                const qnUpBtn = document.querySelector('.qiniu_upload_btn')
                const threeBtn = document.querySelector('.re_three_btn')
                if (this.imgList.length) {
                    const {width, height, top, left} = qnUpBtn.getBoundingClientRect()
                    const btTop = threeBtn.getBoundingClientRect().top
                    moxieshim.style.top = (top - btTop) + 'px'
                    moxieshim.style.left = (left - 15) + 'px'
                    moxieshim.style.width = width + 'px'
                    moxieshim.style.height = height + 'px'
                } else {
                    moxieshim.style.top = 0
                    moxieshim.style.left = 0
                    moxieshim.style.width = '20px'
                    moxieshim.style.height = '20px'
                }
            },
            delPic(pid, idx) {
                ajax({
                    url: '/bbs/photo.php?action=remove&ajaxID=5a014c920c375ac1580c2e8d',
                    method: 'POST',
                    data: {
                        'id[]': pid
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.imgList.splice(idx, 1)
                        setTimeout(this.resetPosition, 300)
                    } else {
                        Toast({
                            message: msg.data,
                            position: 'bottom',
                            duration: 3000
                        })
                    }
                })
            }
        },
        mounted() {
            this.analyZan()
            this.anaImgVer()
            this.pages = this.$store.state.renderData.data.pages
        }
    }
</script>

<style lang="stylus">
    @import './index.styl';
</style>