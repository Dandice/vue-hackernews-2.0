<template>
    <div class="sip_rep_wrap">
        <div class="sip_rep_frame">
            <div class="content">
                <UE :id="replyId" :defItem="defItem" :isEdit="isEdit"></UE>
            </div>
            <div class="tool flex_bet">
                <div class="inl_flex">
                    <el-popover placement="bottom" trigger="hover" v-for="(item,index) in toolList"
                                :key="index">
                        <!--表情-->
                        <div class="popemotion" v-if="item.key=='popemotion'">
                            <a :style="{backgroundPosition: `0 -${item*26}px`}"
                               @click="insEmotion(item)"
                               v-for="item in 30"></a>
                        </div>
                        <!--图片-->
                        <div class="picture" v-else-if="item.key=='poppic'">
                            <div :id="`${replyId}_up`">本地上传</div>
                            <div @click="()=>{showAlbum= true}">相册选择</div>
                        </div>
                        <div style="cursor: pointer" v-else>
                            <div :id="`${replyId}_up`" @click="insertOpt('popvideo')">插入视频</div>
                        </div>
                        <div slot="reference" :class="item.class"></div>
                    </el-popover>
                </div>

                <div class="writer" @click="toWriter"
                     v-if="thread.uid == userInfo.uid || userInfo.admin && replyId.indexOf('floor_reply')<0">
                    <i></i>
                    <span>切换到写作模式</span>
                </div>
            </div>
        </div>
        <div class="footer">
            <span class="two_btn cancel" @click.stop="cancelEdit">取消</span>
            <span class="two_btn confirm" @click="prePub">{{replyT}}</span>
        </div>

        <!--插入视频-->
        <OnlyShadow title="插入视频" Owidth="620px"
                    @togShow="val=>{showInsVideo = val}"
                    v-show="showInsVideo">
            <div>
                <div>
                    <input type="text" class="rea_input"
                           :style="{border: videoError ? '1px solid #fb6850' : ''}"
                           v-model="videoUrl" style="width: 95%">
                    <div style="color:#959595; font-size: 14px;marginTop:10px" v-show="!videoError">仅支持优酷、腾讯视频
                    </div>
                    <div class="tip" style="color: #fb6850;margin-top: 5px;" v-show="videoError">
                        {{errTip}}
                    </div>
                </div>
                <div class="footer">
                    <span class="two_btn cancel" @click="()=>{showInsVideo = false;videoUrl = null;emitOpt('cancel')}">取消</span>
                    <span class="two_btn confirm" @click="insVideo">插入视频</span>
                </div>
            </div>
        </OnlyShadow>


        <!--图片验证码-->
        <OnlyShadow title="请输入验证码" Owidth="282px" v-show="showVertify">
            <div>
                <span>
                <input type="text" class="rea_input" style="width: 100px; margin-right: 5px;" maxlength="4"
                       placeholder="请输入验证码" ref="inpVal">
                <img id="js_valid_code_img" src="/ajax.php?action=captcha"
                     onclick="this.src=&quot;/ajax.php?action=captcha&amp;timer=&quot;+((new Date()).getTime())+(window.QYER&amp;&amp;window.QYER.uid?(&quot;&amp;uid=&quot;+window.QYER.uid):&quot;&quot;)">
            </span>
                <span slot="footer" class="dialog-footer">
                <span class="two_btn cancel" @click="showVertify = false">取消</span>
                <span class="two_btn confirm" @click="doPublish">确认</span>
            </span>
            </div>
        </OnlyShadow>

        <!--相册-->
        <OnlyShadow Owidth="622px"
                    @togShow="val=>{showAlbum = val}"
                    v-show="showAlbum">
            <div>
                <span>
                    <Album @setPicUrl="setPicUrl" :isReply="true"></Album>
                </span>
                <div class="footer">
                    <span class="two_btn cancel" @click="showAlbum = false">取消</span>
                    <span class="two_btn confirm" :class="{grey: !selPicItem}" @click="insPic">插入图片</span>
                </div>
            </div>
        </OnlyShadow>


        <!--确认取消操作-->
        <OnlyShadow title="取消" Owidth="50%"
                    @togShow="val=>{sureCancel = val}"
                    v-if="sureCancel">
            <div>
                <span class="tip">确认取消操作？</span>
                <div class="footer">
                    <span class="two_btn cancel" @click="sureCancel = false">取消</span>
                    <span class="two_btn confirm" @click="comCancel">确认</span>
                </div>
            </div>
        </OnlyShadow>

    </div>
</template>

<script>
    import {Dialog, Message, Select,Popover} from 'element-ui'
    import UE from '../UE/ue.vue'
    import Album from '../../common/Album/album.vue'
    import ajax from '../../../../../utils/ajax'
    import {scriptLoader} from 'common/utils/utils'
    import qiniuConfig from 'common/components/qiniu/qiniuConfig'
    import OnlyShadow from './onlyShadow.vue'
    import Vue from 'vue'
    import clickoutside from './clickOutSide.js'

    Vue.prototype.$message = Message;

    export default {
        name: 'pc-detail-reply',
        props: ['replyId', 'noCb', 'cancelTip', 'isReply', 'defItem', 'isEdit', 'replyAgain'],
        directives: {clickoutside},
        data() {
            const {thread} = this.$store.state.renderData.data;
            return {
                thread,
                showInsVideo: false,
                showAlbum: false,
                editor: null,
                selPicItem: null,
                videoUrl: null,
                videoError: false,
                errTip: '视频网址有错误，请重新输入',
                showVertify: false,
                sureCancel: false,
                domUtils: null,
                replyP: Promise.resolve(),
                replyT: '发布',
                toolList: [
                    {
                        key: 'popemotion',
                        val: '表情',
                        tip: '插入表情',
                        class: 'icomoon iconmoon-52'
                    },
                    {
                        key: 'poppic',
                        val: '图片',
                        tip: '插入图片',
                        class: 'icomoon iconmoon-27'
                    },
                    {
                        key: 'insVideo',
                        val: '图片',
                        tip: '插入视频',
                        class: 'icomoon iconmoon-58'
                    }
                ],
                urlMap: {
                    "youku": "优酷",
                    "youtube": "youtube",
                    "sina": "新浪",
                    "56": "我乐",
                    "pps": "PPS影音",
                    "letv": "乐视网",
                    "tudou": "土豆",
                    "qq": "腾讯",
                    "ku6": "酷6",
                    "sohu": "搜狐",
                    "qyer": "穷游网"
                }
            }
        },
        watch: {
            replyAgain(data) {
                if (data) {
                    this.replyP = Promise.resolve();
                    this.replyT = '发布';
                }
            }
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo;
            },
            needVerifyImage() {
                return this.$store.state.project.userInfo.needVerifyImage
            }
        },
        components: {
            OnlyShadow,
            [Popover.name]: Popover,
            [Dialog.name]: Dialog,
            [Select.name]: Select,
            Album,
            UE
        },
        methods: {
            toWriter() {
                if (this.isEdit) {
                    // 编辑楼层
                    location.href = `//bbs.qyer.com/post-edit?tid=${this.thread.id}&pid=${this.defItem.id}`;
                } else {
                    // 直接回复
                    location.href = `//bbs.qyer.com/thread-reply?tid=${this.thread.id}`;
                }
            },
            cancelEdit() {
                const winUE = window.UE;
                const editor = winUE.getEditor(this.replyId);
                const content = editor.getContent();
                if (content && this.cancelTip) {
                    this.sureCancel = true;
                } else {
                    this.$emit('replyComi', 'cancel');
                }
            },
            comCancel() {
                this.editor.execCommand('cleardoc');
                this.sureCancel = false;
                this.$emit('replyComi', 'cancel');
            },
            prePub() {
                const phimage = this.editor.body.querySelector('.phimage');
                if (phimage) {
                    this.$message({message: '您还有图片正在上传中，请耐心等待~', type: 'warning'});
                    return;
                }

                const content = this.editor.getContent();
                if (!content) {
                    this.$message({message: '请输入回复内容~', type: 'warning'});
                } else if (this.needVerifyImage) {
                    this.showVertify = true;
                } else {
                    if (this.replyP && this.replyP.then) {
                        this.replyP.then(() => {
                            this.replyT = '发布中';
                            this.replyP = this.doPublish(content);
                        });
                    }
                }
            }
            ,
            doPublish(content) {
                if (this.noCb) {
                    const {token} = this.$store.state.project.userInfo;
                    const {args} = this.$store.state.renderData.data;
                    ajax({
                        url: '/thread-reply?ajaxId=5abb38048776329315f6d1a4',
                        method: 'POST',
                        data: {
                            token,
                            tid: args.tid,
                            device: 1,
                            content: content,
                            valid_code: this.needVerifyImage ? this.$refs.inpVal.value : '',
                        }
                    }).then(msg => {
                        if (!msg.error_code) {
                            this.$message({message: '回复成功！', type: 'success'});
                            setTimeout(() => {
                                location.reload();
                            }, 1000)
                        } else {
                            this.$message({message: msg.data, type: 'error'});
                        }
                        this.replyP = Promise.resolve();
                        this.replyT = '发布';
                    });
                } else {
                    this.$emit('replyComi', {
                        type: 'publish',
                        content,
                        validCode: this.needVerifyImage ? this.$refs.inpVal.value : '',
                    })
                }

            },
            insVideo() {
                const arr = this.videoUrl.match("([a-z1-9]*).com");
                if (!this.videoUrl && !arr) {
                    this.videoError = true;
                    this.errTip = '视频网址有错误，请重新输入';
                } else {
                    this.videoError = false;
                    const arr = this.videoUrl.match("([a-z1-9]*).com");
                    ajax({
                        url: '/qcross/bbs/thread.php',
                        data: {
                            action: 'videoUrl',
                            url: this.videoUrl,
                            encode: false,
                            ajaxID: '5abcb2e38776329315f6d1ac'
                        }
                    }).then(msg => {
                        if (!msg.error_code) {
                            let source = this.urlMap[arr[1]]
                            let simTitle = msg.data.title.length > 10 ? `${msg.data.title.substr(0, 10)}...` : msg.data.title;

                            const html = `<div><span class="qyer_block qyer_video" data-type="video" data-live="0"` +
                                `data-title="${msg.data.title}" data-videofrom="` +
                                `${source}" contenteditable="false" data-url="${msg.data.swf}" data-src="${msg.data.swf}"` +
                                `data-videotitle="${simTitle}" data-osrc="${encodeURIComponent(this.videoUrl)}"> <a class="title fontSong">${simTitle}-${source}视频</a></span></div>`;
                            this.editor.execCommand('inserthtml', html);
                            this.videoUrl = null;
                            this.showInsVideo = false;
                        } else {
                            this.videoError = true;
                            this.errTip = msg.data.msg;
                        }
                    });
                }
            }
            ,
            setPicUrl(item) {
                this.selPicItem = item;
            }
            ,
            insertOpt(key) {
                if (key === 'popvideo') {
                    this.showInsVideo = true;
                }
            }
            ,
            insEmotion(i) {
                let text = `<img src="//static.qyer.com/models/project/bbs/css/images/face/face${i}.png">`;
                this.editor.execCommand('inserthtml', text);
            },
            insPic() {
                if (!this.selPicItem) {
                    return;
                    //this.$message({message: '请选择图片~', type: 'warning'});
                } else {
                    let text = `<img src="${this.selPicItem.url}" data-id="${this.selPicItem.id}" class="qyer_image">`;
                    this.editor.execCommand('inserthtml', text);
                    this.showAlbum = false;
                }
            },
            qnConfig(options) {
                let newOpt = {
                    auto_start: false,  //是否自动上传
                    getphoIdUrl: '/photo.php',
                    max_file_size: '10mb',
                    get_new_uptoken: false,
                    browse_button: `${this.replyId}_up`,
                };
                qiniuConfig.qiniu(this, Object.assign(options, newOpt),
                    () => {
                        this.editor.execCommand('inserthtml', '<img class="phimage" src="//static.qyer.com/models/project/bbs/images/loading.gif">');
                    },
                    (type, cb) => {
                        const phimage = this.editor.body.querySelector('.phimage');
                        phimage && phimage.remove();
                        if (type === 'ok') {
                            const photo = cb.data.photo;
                            const img = `<img src="${photo.url}" _src="${photo.url}" class="qyer_image" data-id="${photo.id}">`;
                            this.editor.execCommand('inserthtml', img);
                        } else {
                            if (cb.err && cb.err.code === -600) {
                                this.$message({message: '您的图片过大，建议控制在10mb以内~', type: 'warning'});
                            } else {
                                this.$message({message: `图片上传失败${cb.errTip}`, type: 'warning'});
                            }
                        }
                    })
            },
            getUpToken() {
                ajax({
                    url: '/photo.php',
                    data: {
                        action: 'token'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.uptoken = msg.data.token;
                        this.$store.commit('SET_VALUE', {
                            page: 'token',
                            data: msg.data.token
                        });
                        let newOpt = {
                            uptoken: msg.data.token
                        };
                        this.qnConfig(newOpt);
                    }
                })
            },
        },
        mounted() {
            const winUE = window.UE;
            this.editor = winUE.getEditor(this.replyId); // 初始化UE
            const token = this.$store.state.project.token;
            this.domUtils = winUE.dom.domUtils;
            if (!token) {
                let urlOne = '//fes.qyerstatic.com/FkDnY51qfolmNbtelIanGCQmYaHF'
                let urlTwo = '//fes.qyerstatic.com/FoSIrctGlu6jjKBxmJqw1zYHbJk0'

                Promise.all([scriptLoader(urlOne), scriptLoader(urlTwo)]).then(() => {
                    this.getUpToken()
                });
            } else {
                let newOpt = {
                    uptoken: token
                };
                this.qnConfig(newOpt);
            }
        }
    }
</script>

<style lang="stylus">
    @import "./reply.styl"
</style>