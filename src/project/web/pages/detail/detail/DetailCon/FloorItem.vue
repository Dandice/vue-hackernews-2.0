<template>
    <div class="floor_item com_pad"
         @mouseleave="showHoverBtn = false"
         @mouseenter="showHoverBtn = true" :id="'item-post-'+item.id">
        <div class="user_info">
            <img class="left" :src="item.user.avatar" @click="toUserCen">
            <div class="user_center">
                <div class="center_top">
                    <a :href="`//www.qyer.com/u/${item.user.uid}`" class="name" target="_blank">
                        {{item.user.username}}
                    </a>
                    <!--<span class="lz" v-show="lzId == item.user.uid">楼主</span>-->
                    <span v-if="item.user.auth[0]">
                        <el-tooltip class="item" effect="dark" :content="item.user.auth[0].desc" placement="top">
                            <img class="auth" v-if="item.user.auth[0].type.indexOf('member')>=0"
                                 src="//common1.qyerstatic.com/bbs/old/images/authentication_u.png">
                            <img class="auth" v-else-if="item.user.auth[0].type.indexOf('qyer')>=0"
                                 src="//common1.qyerstatic.com/bbs/old/images/authentication_q.png">
                            <img class="auth" v-else-if="item.user.auth[0].type.indexOf('company')>=0"
                                 src="//common1.qyerstatic.com/bbs/old/images/authentication_c.png">
                        </el-tooltip>
                    </span>
                    <span class="group">{{item.user.group}}</span>
                </div>
                <div class="center_bottom">
                    <span class="time">发表于 {{created}}</span>
                    <el-popover
                        v-if="parseInt(item.from_device) >= 3"
                        ref="popover2"
                        placement="top"
                        trigger="hover">
                        <div style="text-align: center;">
                            <div style="color:#10b041;font-size: 16px;line-height: 30px;font-weight: 500">
                                用穷游APP看帖回帖更方便<br>扫二维码下载
                            </div>
                            <img style="display: block;width: 100%;" src="./img/appdownloaddown.png">
                        </div>
                    </el-popover>
                    <span class="from_app" v-popover:popover2 v-if="parseInt(item.from_device) >= 3">
                        来自穷游APP
                    </span>
                </div>
            </div>
            <el-popover
                ref="popover1"
                placement="right"
                width="200"
                trigger="hover">
                <div style="cursor: pointer" @click="doCopyUrl">点击此处复制此楼层地址</div>
            </el-popover>
            <div class="right flex" v-popover:popover1 @click="doCopyUrl">{{page * 15 + index + 1}}楼</div>
        </div>
        <div class="warn" v-show="item.display_style === '1'">提示：该帖被管理员或版主屏蔽</div>
        <div class="warn" v-show="item.display_style === '2'">提示：该帖被管理员或版主警告</div>
        <div class="quote" v-if="item.reply.i">
            <span class="left">
                <span class="reply">回复：</span>
                <a :href="`//bbs.qyer.com/post.php?action=jump&pid=${item.reply.pid}`">
                    {{item.reply.i}}楼
                </a>
                <span>@</span>
                <a class="reply name" :href="`//www.qyer.com/u/${item.reply.uid}`">
                    {{item.reply.username}}
                </a>
            </span>
            <span class="right" @click="togQuote">
                <span>{{openQuo? '收起引用':'展开引用'}}</span>
                <span class="icon icomoon" :class="{isopen: openQuo}"></span>
            </span>
        </div>
        <div class="open_quote" v-show="openQuo">
            <span class="quo_con" v-if="quoCon.length <= 40">{{quoCon.substr(0, 40)}}</span>
            <span class="quo_con" v-if="quoCon.length > 40">{{quoCon.substr(0, 40)}}...</span>
            <div class="quo_con check_all icomoon" @click="checkAll"
                 v-if="quoCon.length > 40 || quoCon.indexOf('[图片]')>-1">
                <span>查看全部引用</span>
            </div>
        </div>
        <div :id="'item-con-'+index" class="flo_content" v-html="item.content || postNode"
             v-show="!item.loadError && showContent"></div>

       <!-- <div :id="'item-con-'+index" class="flo_content">
            <p>【<a href="//z.qyer.com/deal/72258/" class="bbsLmLabel" data-info="[{&quot;product_type&quot;:2410,&quot;id&quot;:72258,&quot;weight&quot;:1,&quot;url&quot;:&quot;\/\/z.qyer.com\/deal\/72258\/&quot;,&quot;title&quot;:&quot;\u3010\u8d85\u503c\u5305\u95e8\u7968\u3011\u7f8e\u56fd\u8457\u540d\u666f\u70b9\u4e0b\u7f9a\u7f8a\u5ce1\u8c37+\u9a6c\u8e44\u6e7e\u4e00\u65e5\u6e38(\u62c9\u65af\u7ef4\u52a0\u65af\u5f80\u8fd4)&quot;,&quot;price&quot;:&quot;420&quot;,&quot;picture&quot;:&quot;\/\/pic.qyer.com\/public\/supplier\/jd\/2016\/04\/07\/14600085407353&quot;,&quot;highlight&quot;:&quot;&quot;}]" target="_blank" data-bn-ipg="bbs-thread-lmLink-马蹄湾" style="text-decoration: none;border-bottom: 1px dotted rgb(50, 50, 50);color: rgb(50, 50, 50);">马蹄湾</a>】</p>


        </div>-->
        <!-- Placeholder Content -->
        <div class="placeholder-content"
             v-show="typeof item.content === 'undefined' && !item.loadError && item.display_style !== '1' && !postNode">
            <div class="placeholder-content_item"></div>
            <div class="placeholder-content_item"></div>
            <div class="placeholder-content_item"></div>
        </div>
        <div class="load_error flex_cen" v-if="item.loadError"
             @click="loadAgain">
            内容加载失败，请重试
            <img src="./img/load_error.svg"
                 :class="{load_agian: showLoading}">
        </div>

        <EditReply :replyId="`floor_edit_${index}`" :replyAgain="replyAgain" v-if="isInEdit" :isEdit="true"
                   :cancelTip="true" ref="Reply" :defItem="item"
                   @replyComi="replyComi"></EditReply>
        <FloorManage :showHoverBtn="showHoverBtn" :item="item" :index="index" :page="page" :lzId="lzId" @editFloor="editFloor"
                     :postNode="postNode" v-show="showContent"></FloorManage>
    </div>
</template>

<script>
    import {_calTime} from '../../../../../utils/util'
    import FloorManage from './FloorManage.vue'
    import EditReply from '../../common/Reply/reply.vue'
    import Vue from 'vue'
    import ajax from '../../../../../utils/ajax'
    import {_calTime} from '../../../../../utils/util'
    import {Message,Tooltip,Popover} from 'element-ui'

    Vue.prototype.$message = Message;

    export default {
        name: 'pc-detail-jieban-con',
        data() {
            return {
                showHoverBtn: false,
                openQuo: false,
                quoCon: '',
                created: _calTime(parseInt(this.item.created), 1),
                startTime: '',
                endTime: '',
                totalDay: '',
                outdata: false,
                showLoading: false,
                isInEdit: false,
                showContent: true,
                editor: null,
                replyAgain: false,
                floorContent: null
            }
        },
        props: ['item', 'index', 'page', 'lzId', 'postNode'],
        components: {
            [Tooltip.name]: Tooltip,
            EditReply,
            FloorManage,
            [Popover.name]: Popover
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo
            }
        },
        watch: {},
        methods: {
            toUserCen() {
                window.qyerTrack.doTrack('bbs-thread-post-writer');
                window.open(`//www.qyer.com/u/${this.item.user.uid}`);
            },
            doCopyUrl() {
                let url = `bbs.qyer.com/post.php?action=jump&pid=${this.item.id}`;
                if (window.clipboardData) {
                    //如果是IE浏览器
                    window.clipboardData.setData("text", url);
                    this.$message({message: '复制成功！', type: 'success'});
                } else {
                    let textArea = document.createElement("textarea");

                    textArea.style.position = 'fixed';

                    textArea.value = url;

                    document.body.appendChild(textArea);

                    textArea.select();
                    if (document.execCommand('copy')) {
                        this.$message({message: '复制地址成功！', type: 'success'});
                        textArea.remove();
                    }
                }
            },
            replyComi(obj) {
                if (obj === 'cancel') {
                    this.$refs.Reply.$el.style.display = 'none';
                    this.showContent = true;
                } else if (obj.type === 'publish') {
                    ajax({
                        url: '/post-edit',
                        method: 'POST',
                        data: {
                            pid: this.item.id,
                            device: 1,
                            content: obj.content,
                            valid_code: obj.validCode,
                        }
                    }).then(msg => {
                        if (!msg.error_code) {
                            this.$message({message: '编辑成功！', type: 'success'});
                            setTimeout(() => {
                                location.reload();
                            }, 1000)
                        } else {
                            this.replyAgain = true;
                            this.$message({message: msg.data, type: 'error'});
                        }
                    });
                }
            },
            editFloor(obj) {
                if (this.isInEdit) {
                    this.$refs.Reply.$el.style.display = 'block';
                    this.editor.setContent(obj.content);
                } else {
                    this.isInEdit = true;
                    setTimeout(() => {
                        if (!this.editor) {
                            this.editor = window.UE.getEditor(`floor_edit_${this.index}`); // 初始化UE
                        }
                        this.editor.setContent(obj.content);
                    }, 0);
                }
                document.getElementById('_bbs_img_toolbar').style.display = 'none';
                this.showContent = false;
            },
            loadAgain() {
                const pid = [this.item.id];
                this.showLoading = true;
                ajax({
                    url: `/detail/content/p/${encodeURIComponent(pid.join())}.json`,
                    data: {
                        //action: 'content',
                        ajaxID: '5aa7a6618776329315f6d14c',
                        //pid: pid.join(),
                        time_sta: new Date() * 1,
                    }
                }).then(msg => {
                    this.showLoading = false;
                    this.$emit('emitContent', {msg, pid: pid});
                });
            },
            checkAll() {
                let pid = `item-post-${this.item.reply.url.split('pid=')[1]}`
                if (document.getElementById(pid)) {
                    location.href = `${location.href.split('#')[0]}#${pid}`
                } else {
                    location.href = this.item.reply.url
                }
            },
            togQuote() {
                if (this.openQuo) {
                    this.openQuo = false;
                } else {
                    if (!this.quoCon) {
                        ajax({
                            url: `/detail/quote/p/${this.item.id}.json`,
                            data: {
                                //action: 'quote',
                                //pid: this.item.id,
                                ajaxID: '5aa7aeb78776329315f6d14e'
                            }
                        }).then(msg => {
                            if (!msg.error_code) {
                                this.openQuo = true;
                                this.quoCon = msg.data.quote.substr(0, 45)
                            }
                        })
                    } else {
                        this.openQuo = true;
                    }
                }
            }
        },
        mounted() {
        }
    }
</script>

<style lang="stylus">
    @import "floorItem.styl"
</style>