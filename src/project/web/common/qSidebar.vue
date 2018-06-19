<template>
    <div>
        <div :style="sidebarFadeIn" class="web_components_sidebar">
            <a v-if="items.includes('gotoTop')" class="web_components_sidebar-item" href="javascript:;"
               @click="gotoTop">
                <i class="web_components_sidebar-icon fanhuidingbu"></i>
                <span class="title">返回顶部</span>
            </a>

            <!--<a v-if="items.includes('appCode')" class="web_components_sidebar-item" href="javascript:;">
                <i class="web_components_sidebar-icon saomaxiazai"></i>
                <span class="title">扫码下载</span>
                <div class="web_components_sidebar-layer">
                    <span class="web_components_sidebar-layer-title">下载穷游App</span>
                    <img class="web_components_sidebar-layer-img"
                         src="//common1.qyerstatic.com/zworld/web/project/headfoot/images/foot-qrcode-qapp.png">
                </div>
            </a>-->

            <a v-if="items.includes('lookonPhone')" class="web_components_sidebar-item" href="javascript:;">
                <i class="web_components_sidebar-icon shoujikantie"></i>
                <span class="title">手机看帖</span>
                <div class="web_components_sidebar-layer shoujikantie">
                    <span class="web_components_sidebar-layer-title">扫码看帖</span>
                    <img class="web_components_sidebar-layer-img" :src="threadQcode">
                    <hr class="web_components_sidebar-layer-hr">
                    <span class="web_components_sidebar-layer-title">下载穷游App</span>
                    <img class="web_components_sidebar-layer-img"
                         src="//common1.qyerstatic.com/zworld/web/project/headfoot/images/foot-qrcode-qapp.png">
                </div>
            </a>

            <a v-if="items.includes('feedback')" class="web_components_sidebar-item" href="javascript:;"
               @click="showFeedbackDialog">
                <i class="web_components_sidebar-icon yijianfankui"></i>
                <span class="title">意见反馈</span>
            </a>

            <a v-if="items.includes('gotoBottom')" class="web_components_sidebar-item" href="javascript:;"
               @click="gotoBottom">
                <i class="web_components_sidebar-icon zhidadibu"></i>
                <span class="title">直达底部</span>
            </a>
        </div>
        <!-- 反馈对话框 -->
        <div class="web_components_sidebar_feedbackdialog_wrap" :style="feedbackDialogWrapFadeIn">
            <div class="web_components_sidebar_feedbackdialog" :class="feedbackDialogShow">
                <i class="huiji" :class="planeShow"></i>
                <img class="closeImg" @click="closeFeedbackDialog"
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAUtJREFUOBGNk19LhEAQwHNN6KkjqJdEIfBZP0Fg3ee+Q+iDnHj4dqAbPlyU2vxEj3XTamDdZWZ+82eddaIoSh3H8Xzff8uy7Hz1D0nT9KYsy+e+7z8VcNu296LYYviLH+EtDKwis+u676K4LYri9bcg2PDBF2Zg8zz/iuP4qLV+lOwb9iRJjujNaiYYH1k6CII9Lbs44Qy0FsSGwzAcYFiHzyRLjtgoW7YhswljmwVAYQdBJ7IIYxha4DCJ3Y7o+TPazjz5/wgwGq7lFz2NMKqPqqoOdV3PLhaD4mMKLSilLj2LTcvaoMNm+nKeVWD333XdXqbtINWs/uJLBTZMz3IfZxZnSTZUYg/bUMESbL4L+2LNYXOAeQeMJ1nWbpt+zUTjKO9cz/NeBL5DMY0nzksyVdI0jU9C2R8UT1LgkzyMnVn2UgB0+OALA/sN7JgLAG++UEcAAAAASUVORK5CYII="/>
                <h5 class="title">意见反馈</h5>
                <textarea @keyup="getInputed" v-model="feedbackContent" class="content"
                          placeholder="有任何意见或建议请反馈给我们~"></textarea>
                <p class="address_title">联系方式</p>
                <input type="text" class="address" v-model="feedbackAddress" placeholder="邮箱/手机号码">
                <p class="errortip" v-show="feedbackErrortip">{{feedbackErrortip}}</p>
                <button class="button" @click="submitFeedback">提交</button>
                <span class="texttip" :class="feedbackTexttip">{{feedbackNumInputed}}</span>
            </div>
        </div>

        <!-- tip -->
        <div class="feedback-tip" v-show="feedbackNoticeTip">
            <div class="feedback-tip-box">
                <span class="feedback-tip-text">{{feedbackNoticeTip}}</span>
            </div>
        </div>

    </div>
</template>

<script>
    import {ajax} from 'common/utils/utils.js'

    export default {
        props: {
            /*
            @items 参数为一个拼接的字符串，代表需要开启哪些功能，支持以下功能
              gotoTop  返回顶部(页面滚动到顶部)
              appCode   扫码下载(下载穷游 app)
              lookonPhone  手机看帖(当前帖子页面 H5 链接)
              myOrder   我的订单(跳转到个人中心，我的订单页面)
              myCollection  我我的收藏(跳转到个人中心产品收藏)
              phoneDiscount  手机立减(下载穷游 app)
              feedback  意见反馈(弹出意见反馈层)
              gotoBottom    直达底部(滚动到页面最底部)
            */
            items: {
                type: String
            },
            // 帖子二维码图片地址，如果开启手机看帖功能，此参数一定要传
            threadQcode: {
                type: String
            }
        },
        data() {
            return {
                sidebarFadeIn: {
                    opacity: 0,
                    display: 'none'
                },
                planeShow: '',
                feedbackDialogShow: '',
                feedbackDialogWrapFadeIn: {
                    opacity: 0,
                    display: 'none'
                },
                feedbackContent: '',
                feedbackNumInputed: '0/140',
                feedbackTexttip: '',
                feedbackErrortip: '',
                feedbackAddress: '',
                feedbackNoticeTip: '',
                timeoutTopId: -1,
                timeoutBottomId: -1,
                rootElement: null,
                SCROLL_TOP: 320,
                __timer: null,
                pageHeight: 0,
                step: 0,
                freshInterval: 13
            }
        },
        mounted() {
            this.rootElement = null
            if (document.scrollingElement) {
                this.rootElement = document.scrollingElement
            } else {
                if (document.compatMode !== 'BackCompat') {
                    this.rootElement = document.documentElement
                } else {
                    this.rootElement = document.body
                }
            }
            if (this.rootElement.scrollTop > this.SCROLL_TOP) {
                this.sidebarFadeIn = {
                    opacity: 1,
                    display: 'block'
                }
            }
            window.addEventListener('scroll', () => {
                if (this.__timer) {
                    window.clearTimeout(this.__timer)
                }
                this.__timer = window.setTimeout(() => {
                    var scrollTop = this.rootElement.scrollTop
                    if (scrollTop > this.SCROLL_TOP) {
                        this.sidebarFadeIn = {
                            opacity: 1,
                            display: 'block'
                        }
                    } else {
                        this.sidebarFadeIn = {
                            opacity: 0,
                            display: 'none'
                        }
                    }
                }, 200)
            }, false)
        },
        methods: {
            // 直达顶部
            gotoTop() {
                let fixedEle = document.getElementById('fixed_elevator')
                if (fixedEle) {
                    fixedEle.style.visibility = 'hidden'
                }
                this.gotoTopNum();
            },
            gotoTopNum() {
                this.pageHeight = this.rootElement.scrollHeight
                this.step = this.pageHeight / 300 * this.freshInterval
                if (this.timeoutBottomId) {
                    clearTimeout(this.timeoutBottomId)
                }
                if (this.rootElement.scrollTop === 0) {
                    clearTimeout(this.timeoutTopId)
                    let fixedEle = document.getElementById('fixed_elevator')
                    if (fixedEle) {
                        fixedEle.style.visibility = 'hidden'
                    }
                } else {
                    this.rootElement.scrollTop -= this.step
                    this.timeoutTopId = setTimeout(this.gotoTop, this.freshInterval)
                }
            },
            // 直达底部
            gotoBottom() {
                this.pageHeight = this.rootElement.scrollHeight
                this.step = this.pageHeight / 300 * this.freshInterval
                if (this.timeoutTopId) {
                    clearTimeout(this.timeoutTopId)
                }
                var des = this.rootElement.scrollHeight - this.rootElement.clientHeight
                if (Math.abs(this.rootElement.scrollTop - des) <= this.step) {
                    this.rootElement.scrollTop = this.pageHeight;
                    clearTimeout(this.timeoutBottomId)
                } else {
                    this.rootElement.scrollTop += this.step
                    this.timeoutBottomId = setTimeout(this.gotoBottom, this.freshInterval)
                }
            },
            showFeedbackDialog() {
                // 判断登录
                if (this.$store.state.userInfo.uid > 0) {
                    this.feedbackDialogWrapFadeIn.display = 'block'
                    setTimeout(() => {
                        this.feedbackDialogWrapFadeIn.opacity = 1
                    }, 100)
                    // 飞机出现
                    setTimeout(() => {
                        this.planeShow = 'show'
                    }, 800)

                    setTimeout(() => {
                        this.feedbackDialogShow = 'zoom'
                    }, 1500)
                } else {
                    this.$store.dispatch('LOGIN_MODAL')
                }
            },
            closeFeedbackDialog() {
                this.feedbackDialogWrapFadeIn.opacity = 0
                setTimeout(() => {
                    this.feedbackDialogWrapFadeIn.display = 'none'
                }, 700)
                this.feedbackDialogShow = ''
                this.planeShow = ''
                this.feedbackContent = ''
                this.feedbackTexttip = ''
                this.feedbackNumInputed = '0/140'
                this.feedbackErrortip = ''
            },
            getInputed() {
                this.feedbackNumInputed = this.feedbackContent.length + '/140'
                if (this.feedbackContent.length > 140) {
                    this.feedbackTexttip = 'error'
                } else {
                    this.feedbackTexttip = ''
                }
            },
            submitFeedback() {
                if (this.feedbackContent.length === 0) {
                    this.feedbackErrortip = '请输入反馈内容'
                    return
                }
                if (this.feedbackContent.length > 140) {
                    this.feedbackErrortip = '反馈内容应小于 140 字'
                    return
                }
                if (this.feedbackAddress.length !== 0 && !this.isMail(this.feedbackAddress) && !this.isPhone(this.feedbackAddress)) {
                    this.feedbackErrortip = '联系方式错误，请输入邮箱或者手机号码'
                    return
                }
                // 发送给后端
                ajax({
                    url: '/qcross/place/public.php?action=feedback&ajaxID=5a1d397e0c375ac1580c2ead',
                    data: {
                        url: window.location.href,
                        email: '',
                        cnt: this.feedbackContent + '|' + this.feedbackAddress,
                        title: ''
                    }
                }).then((result) => {
                    this.closeFeedbackDialog()
                    this.showFeedbackNoticeTip('发送成功')
                })
            },
            showFeedbackNoticeTip(text) {
                this.feedbackNoticeTip = text
                setTimeout(() => {
                    this.feedbackNoticeTip = ''
                }, 2000)
            },
            isMail(str) {
                return /^\w+([-_.]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/gi.test(str) // eslint-disable-line
            },
            isPhone(str) {
                return /^1[3|4|5|7|8]\d{9}$/gi.test(str)
            }
        }
    }
</script>

<style>
    .web_components_sidebar {
        display: block;
        width: 55px;
        box-sizing: border-box;
        position: fixed;
        bottom: 120px;
        right: 40px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Microsoft YaHei", 宋体, sans-serif;
        background-color: white;
        z-index: 1000;
        transition: all ease 700ms;
    }

    .web_components_sidebar-item {
        display: block;
        width: 55px;
        height: 55px;
        box-sizing: border-box;
        border: solid 1px #e2e2e2;
        color: #b2b2b2;
        text-align: center;
        margin-top: -1px;
        position: relative;
    }

    .web_components_sidebar-item:hover {
        border: solid 1px rgba(0, 0, 0, 0);
        color: white;
        z-index: 1;
        background-color: #07AE72;
    }

    .web_components_sidebar-item .title {
        font-size: 12px;
        -webkit-transform: scale(0.8);
        -moz-transform: scale(0.8);
        -o-transform: scale(0.8);
        transform: scale(0.8);
        display: block;
        position: absolute;
        bottom: 1px;
        width: 100%;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-layer {
        display: block;
    }

    .web_components_sidebar-layer {
        display: none;
        padding: 14px;
        text-align: center;
        position: absolute;
        left: -172px;
        top: -126px;
        border: 1px solid rgb(221, 221, 221);
        background-color: rgb(255, 255, 255);
        box-shadow: rgba(0, 0, 0, 0.1) 0 0 4px;
    }

    .web_components_sidebar-layer-img {
        display: block;
        width: 120px;
        height: 120px;
        margin-top: 9px;
    }

    .web_components_sidebar-layer-title {
        font-size: 14px;
        color: #323232 !important;
    }

    .web_components_sidebar-layer::after, .web_components_sidebar-layer::before {
        content: "";
        width: 0;
        height: 0;
        position: absolute;
        font-size: 0;
        line-height: 0;
        overflow: hidden;
    }

    .web_components_sidebar-layer::before {
        right: -12px;
        top: 146px;
        border-left: 6px solid rgb(221, 221, 221);
        border-right: 6px solid rgba(0, 0, 0, 0);
        border-top: 6px solid rgba(0, 0, 0, 0);
        border-bottom: 6px solid rgba(0, 0, 0, 0);
    }

    .web_components_sidebar-layer::after {
        right: -10px;
        top: 147px;
        border-left: 5px solid rgb(255, 255, 255);
        border-right: 5px solid rgba(0, 0, 0, 0);
        border-top: 5px solid rgba(0, 0, 0, 0);
        border-bottom: 5px solid rgba(0, 0, 0, 0);
    }

    .web_components_sidebar-layer-hr {
        margin: 20px 0 18px 0;
        border: none;
        height: 1px;
        background-color: #e2e2e2;
    }

    .web_components_sidebar-layer.shoujikantie {
        top: -207px;
    }

    .web_components_sidebar-layer.shoujikantie::before {
        top: 228px;
    }

    .web_components_sidebar-layer.shoujikantie::after {
        top: 229px;
    }

    .web_components_sidebar-icon {
        background-image: url(//static.qyer.com/models/common/component/sidebar/icons.png);
        background-repeat: no-repeat;
        width: 18px;
        height: 18px;
        display: block;
        margin: 12px auto 0 auto;
        background-position: 0px 0;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.fanhuidingbu {
        background-position: -28px 0;
    }

    .web_components_sidebar-icon.saomaxiazai {
        background-position: 0px -24px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.saomaxiazai {
        background-position: -28px -24px;
    }

    .web_components_sidebar-icon.shoujikantie {
        background-position: 0px -24px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.shoujikantie {
        background-position: -28px -24px;
    }

    .web_components_sidebar-icon.wodedingdan {
        background-position: 0px -116px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.wodedingdan {
        background-position: -28px -116px;
    }

    .web_components_sidebar-icon.wodeshoucang {
        background-position: 0px -157px;
        width: 20px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.wodeshoucang {
        background-position: -27px -157px;
    }

    .web_components_sidebar-icon.shoujilijian {
        background-position: 0px -184px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.shoujilijian {
        background-position: -28px -184px;
    }

    .web_components_sidebar-icon.yijianfankui {
        background-position: 0px -62px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.yijianfankui {
        background-position: -29px -62px;
    }

    .web_components_sidebar-icon.zhidadibu {
        background-position: 0px -88px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon.zhidadibu {
        background-position: -30px -88px;
    }

    .web_components_sidebar-item:hover .web_components_sidebar-icon {
        -webkit-animation: shake .4s;
        -moz-animation: shake .4s;
        -o-animation: shake .4s;
        animation: shake .4s;
    }

    @keyframes -webkit-shake {
        0%, 100% {
            -webkit-transform: rotate(0);
        }
        10%, 50%, 90% {
            -webkit-transform: rotate(13deg);
        }
        20%, 60%, 80% {
            -webkit-transform: rotate(-13deg);
        }
    }

    @keyframes -moz-shake {
        0%, 100% {
            -webkit-transform: rotate(0);
        }
        10%, 50%, 90% {
            -webkit-transform: rotate(13deg);
        }
        20%, 60%, 80% {
            -webkit-transform: rotate(-13deg);
        }
    }

    @keyframes -o-shake {
        0%, 100% {
            -webkit-transform: rotate(0);
        }
        10%, 50%, 90% {
            -webkit-transform: rotate(13deg);
        }
        20%, 60%, 80% {
            -webkit-transform: rotate(-13deg);
        }
    }

    @keyframes shake {
        0%, 100% {
            -webkit-transform: rotate(0);
        }
        10%, 50%, 90% {
            -webkit-transform: rotate(13deg);
        }
        20%, 60%, 80% {
            -webkit-transform: rotate(-13deg);
        }
    }

    /*意见反馈弹窗和提示样式*/
    .web_components_sidebar_feedbackdialog_wrap {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2200;
        background-color: rgba(0, 0, 0, 0.3);
        transition: all ease 700ms;
    }

    .web_components_sidebar_feedbackdialog {
        display: block;
        padding: 20px;
        width: 400px;
        box-sizing: border-box;
        background-color: #fff;
        border: solid 1px #e2e2e2;
        position: fixed;
        left: 50%;
        top: 50%;
        margin: -240px auto auto -200px;
        -webkit-box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
        -o-box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
        -moz-box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
    }

    .web_components_sidebar_feedbackdialog .closeImg {
        position: absolute;
        top: 19px;
        right: 19px;
        cursor: pointer;
    }

    .web_components_sidebar_feedbackdialog .huiji {
        opacity: 0;
        background-image: url(//static.qyer.com/models/common/component/sidebar/huiji.png);
        width: 132px;
        height: 120px;
        display: block;
        position: absolute;
        top: -36px;
        left: 40px;
    }

    .web_components_sidebar_feedbackdialog .title {
        font-size: 20px;
        color: #222;
        height: 78px;
        line-height: 78px;
        text-align: center;
        margin-top: -20px;
    }

    .web_components_sidebar_feedbackdialog .content {
        font-size: 14px;
        height: 190px;
        padding: 20px 15px;
        width: 100%;
        box-sizing: border-box;
        border: solid 1px #e2e2e2;
        overflow: hidden;
    }

    .web_components_sidebar_feedbackdialog .address_title {
        color: rgba(34, 34, 34, 0.65);
        font-size: 14px;
        margin: 16px 0 8px 0;
    }

    .web_components_sidebar_feedbackdialog .address {
        font-size: 14px;
        height: 40px;
        padding: 10px 20px;
        width: 100%;
        box-sizing: border-box;
        border: solid 1px #e2e2e2;
    }

    .web_components_sidebar_feedbackdialog .button {
        display: block;
        width: 120px;
        height: 40px;
        margin: 30px auto 20px auto;
        border: none;
        line-height: 40px;
        font-size: 14px;
        color: #fff;
        cursor: pointer;
        background-color: #31b57f;
        box-shadow: 0 3px 6px rgba(11, 191, 121, 0.3);
        -webkit-background: linear-gradient(to right, rgb(77, 192, 117) 0%, rgb(31, 175, 133) 100%);
        -moz-background: linear-gradient(to right, rgb(77, 192, 117) 0%, rgb(31, 175, 133) 100%);
        -o-background: linear-gradient(to right, rgb(77, 192, 117) 0%, rgb(31, 175, 133) 100%);
        background: linear-gradient(to right, rgb(77, 192, 117) 0%, rgb(31, 175, 133) 100%);
    }

    .web_components_sidebar_feedbackdialog .texttip {
        position: absolute;
        right: 30px;
        top: 240px;
        font-size: 12px;
        color: rgba(34, 34, 34, .35);
    }

    .web_components_sidebar_feedbackdialog .texttip.error {
        color: red;
    }

    .web_components_sidebar_feedbackdialog .errortip {
        color: red;
        margin: 2px 0 -20px 0;
        font-size: 12px;
    }

    .web_components_sidebar_feedbackdialog.zoom {
        -webkit-animation: zoom .3s linear;
        -moz-animation: zoom .3s linear;
        -o-animation: zoom .3s linear;
        animation: zoom .3s linear;
    }

    @keyframes -webkit-zoom {
        from {
            transform: scale(1)
        }
        50% {
            transform: scale(0.98)
        }
        to {
            transform: scale(1)
        }
    }

    @keyframes -moz-zoom {
        from {
            transform: scale(1)
        }
        50% {
            transform: scale(0.98)
        }
        to {
            transform: scale(1)
        }
    }

    @keyframes -o-zoom {
        from {
            transform: scale(1)
        }
        50% {
            transform: scale(0.98)
        }
        to {
            transform: scale(1)
        }
    }

    @keyframes zoom {
        from {
            transform: scale(1)
        }
        50% {
            transform: scale(0.98)
        }
        to {
            transform: scale(1)
        }
    }

    .web_components_sidebar_feedbackdialog .huiji.show {
        -webkit-animation: spin .7s linear;
        -moz-animation: spin .7s linear;
        -o-animation: spin .7s linear;
        animation: spin .7s linear;
        -webkit-transform-origin: 87px 193px;
        -moz-transform-origin: 87px 193px;
        -o-transform-origin: 87px 193px;
        transform-origin: 87px 193px;
        opacity: 1;
    }

    @keyframes -webkit-spin {
        from {
            transform: rotate(-200deg);
            opacity: 0;
        }
        40% {
            transform: rotate(-120deg);
            opacity: 0;
        }
        to {
            transform: rotate(0);
            opacity: 1;
        }
    }

    @keyframes -moz-spin {
        from {
            transform: rotate(-200deg);
            opacity: 0;
        }
        40% {
            transform: rotate(-120deg);
            opacity: 0;
        }
        to {
            transform: rotate(0);
            opacity: 1;
        }
    }

    @keyframes -o-spin {
        from {
            transform: rotate(-200deg);
            opacity: 0;
        }
        40% {
            transform: rotate(-120deg);
            opacity: 0;
        }
        to {
            transform: rotate(0);
            opacity: 1;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(-200deg);
            opacity: 0;
        }
        40% {
            transform: rotate(-120deg);
            opacity: 0;
        }
        to {
            transform: rotate(0);
            opacity: 1;
        }
    }

    .feedback-tip {
        position: fixed;
        top: 200px;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 1200;
    }

    .feedback-tip-box {
        display: inline-block;
        max-width: 390px;
        padding: 15px 20px;
        background-color: #fff;
        box-shadow: 0 2px 7px rgba(0, 0, 0, 0.25);
        border: solid 1px #c0c0c0;
        text-align: left;
        font-size: 18px;
        line-height: 32px;
        border-radius: 5px;
    }

    .feedback-tip-text {
        display: block;
        position: relative;
        color: #323232;
    }
</style>