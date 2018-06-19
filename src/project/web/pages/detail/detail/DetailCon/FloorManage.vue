<template>
    <div class="flo_item_man">
        <div class="floor_bot"
             v-show="item.content && !item.loadError && showAllBtn || postNode">
            <span class="last_edit" v-if="parseInt(item.mtime)>0">
                最后编辑于： {{item.mtime | cha_time(3)}}
            </span>
            <span>
                <span class="manage_item" v-show="showHoverBtn">
                    <span @click="showManageDialog = true" v-show="userInfo.admin">
                        管理
                    </span>
                    <span @click="preNorDel" v-show="item.uid == userInfo.uid || userInfo.admin">
                        删除
                    </span>
                    <span @click="startAdm(4)" v-show="!userInfo.uid || userInfo.uid!=item.uid">举报</span>
                </span>
                <span class="manage_item" @click="cliEdit">
                    <span></span>
                    <span v-show="(item.uid == userInfo.uid || userInfo.admin) && thread.closed == 0"  @click="cliEdit">编辑</span>
                </span>
                <span @click="cliReply" v-show="thread.closed == 0" data-bn-jpg="bbs-thread-post-reply">
                    <i class="reply_icon icomoon"></i>
                    <span class="text">回复</span>
                </span>
            </span>
        </div>
        <div v-show="!showAllBtn" class="reply_user">
            <span>回复</span>
            <a :href="`//bbs.qyer.com/post.php?action=jump&pid=${item.id}`">
                {{page * 15 + index + 1}}楼
            </a>
            <span>@</span>
            <a :href="`//www.qyer.com/u/${item.user.uid}`" class="name" target="_blank">
                {{item.user.username}}
            </a>
        </div>
        <Reply :replyId="`floor_reply_${index}`" :replyAgain="replyAgain" v-if="isInReply" :cancelTip="true" ref="Reply"
               @replyComi="replyComi" :defItem="item"></Reply>

        <!--管理-->
        <OnlyShadow title="管理楼层" Owidth="350px"
                    @togShow="val=>{showManageDialog = val}"
                    v-if="showManageDialog">
            <div class="flex">
                <div class="dia_man_btn" @click="startAdm(item.key)" :key="index"
                     v-for="(item,index) in manOptArray">{{item.val}}
                </div>
            </div>
        </OnlyShadow>

        <!--管理员警告、屏蔽、删除-->
        <el-dialog :title="manTitle" width="620px" :visible.sync="showManCon">
            <div>
                <div class="manage_con">
                    <!--tip-->
                    <div v-html="admTip" v-show="showInpArray.indexOf('tip')>-1" class="man_input_item"></div>

                    <!--radio-->
                    <div class="man_input_item" v-show="showInpArray.indexOf('radio')>-1">
                        <span class="left_key" v-html="radioTitle"></span>
                        <el-radio v-model="radioSel" :label="item.key"
                                  :key="index"
                                  v-for="(item,index) in radioArray">{{item.val}}
                        </el-radio>
                    </div>


                    <!--input-->
                    <div class="man_input_item" v-show="showInpArray.indexOf('normalinput')>-1">
                        <span class="left_key" v-html="inpTitle"></span>
                        <input type="text" class="rea_input" v-model="inpVal">
                    </div>

                    <!--select-->
                    <div class="man_input_item" v-show="showInpArray.indexOf('select')>-1">
                        <span class="left_key" v-html="selTitle"></span>
                        <input type="text" class="rea_input" v-model="selVal"
                               style="width: 200px;margin-right: 10px;" maxlength="100">
                        <el-select v-model="selVal" placeholder="请选择">
                            <el-option
                                v-for="(item,index) in selOptions"
                                :key="index"
                                :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div slot="footer" class="footer">
                    <el-checkbox v-model="tellAuthor">通知作者</el-checkbox>
                    <span class="two_btn confirm" @click="confirmMan">保存设置</span>
                </div>
            </div>
        </el-dialog>

        <!--普通删除楼层-->
        <OnlyShadow title="删除" Owidth="500px"
                    @togShow="val=>{showNormDel = val}"
                    v-if="showNormDel">
            <div>
                <div>
                    <div v-html="normalDelTip"></div>
                </div>
                <div slot="footer" class="footer">
                    <span class="two_btn cancel" @click="showNormDel = false">取消</span>
                    <span class="two_btn confirm" @click="confirmMan('false')">确认</span>
                </div>
            </div>
        </OnlyShadow>
    </div>
</template>

<script>
    import OnlyShadow from '../../common/Reply/onlyShadow.vue'
    import {Dialog,Radio,Select,Option,Checkbox,Message,Tooltip} from 'element-ui'
    import Reply from '../../common/Reply/reply.vue'
    import Vue from 'vue'
    import ajax from '../../../../../utils/ajax'

    Vue.prototype.$message = Message;

    export default {
        name: 'pc-detail-flo-man',
        data() {
            const {thread} = this.$store.state.renderData.data;
            return {
                thread,
                manOptArray: [{key: 1, val: '警告'}, {key: 2, val: '屏蔽'}, {key: 3, val: '删除'}],
                showInpArray: ['radio', 'normalinput', 'select'],
                showManageDialog: false,
                showAllBtn: true,
                showManCon: false,
                showNormDel: false,
                isInReply: false,
                radioSel: null,
                tellAuthor: true,
                selOptions: [],
                manTitle: '',
                inpTitle: '',
                inpVal: '',
                selTitle: '',
                selVal: '',
                radioTitle: '',
                radioVal: 1,
                radioArray: [],
                admTip: null,
                selAction: 0, // 1 警告 2 屏蔽 3 删除 4 举报 5 普通删除
                normalDelTip: '',
                opt: null,
                replyAgain: false,
                isInManage: false
            }
        },
        props: ['item', 'index', 'page', 'lzId', 'postNode', 'showHoverBtn'],
        components: {
            [Radio.name]: Radio,
            [Dialog.name]: Dialog,
            [Select.name]: Select,
            [Option.name]: Option,
            [Checkbox.name]: Checkbox,
            [Tooltip.name]: Tooltip,
            OnlyShadow,
            Reply
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo
            }
        },
        methods: {
            cliEdit() {
                if (this.page === 0 && this.index === 0) {
                    location.href = `//bbs.qyer.com/thread-edit?tid=${this.thread.id}&pid=${this.item.id}`;
                } else {
                    // || this.userInfo.admin
                    if (this.userInfo.uid == this.thread.uid) {
                        // 是作者 or 管理员
                        location.href = `//bbs.qyer.com/post-edit?tid=${this.thread.id}&pid=${this.item.id}`;
                    } else {
                        // 非作者非管理 编辑自己楼层
                        this.$emit('editFloor', {content: this.item.content || this.postNode})
                    }
                }
            },
            cliReply() {
                if (this.userInfo.uid) {
                    if (this.isInReply) {
                        this.$refs.Reply.$el.style.display = 'block';
                    } else {
                        this.isInReply = true;
                    }
                    this.showAllBtn = false;
                } else {
                    this.$store.dispatch('LOGIN_MODAL');
                }
            },
            preNorDel() {
                this.showNormDel = true;
                this.selAction = 'remove';
                if (this.page === 1 && this.index === 0) {
                    this.normalDelTip = '确认删除首楼层吗？删除首楼层将删除整个帖子。此操作不可撤销。';
                } else {
                    this.normalDelTip = '确认删除该楼层帖子吗？此操作不可撤销';
                }
            },
            confirmMan(bol) {
                let url = `/qcross/bbs/post.php?action=${this.selAction}`;
                let reason = this.selVal;
                if (this.selAction.indexOf('jubao') > -1) {
                    url = this.selAction;
                    reason = this.inpVal;
                }
                if (this.isInManage) {
                    this.$message({message: '请求中~', type: 'warning'});
                } else if (!reason && !this.showNormDel) {
                    this.$message({message: '请输入原因', type: 'warning'});
                } else if (!this.isInManage) {
                    this.isInManage = true;
                    ajax({
                        url,
                        method: 'POST',
                        data: {
                            url: location.href,
                            id: this.item.id,
                            pid: this.item.id,
                            pids: this.item.id,
                            fid: this.thread.fid,
                            reason,
                            reason_other: this.selVal || this.inpVal,
                            opt: this.opt,
                            mode: this.radioSel,
                            type: 80,
                            page_url: location.href,
                            notice: bol === 'false' ? 0 : this.tellAuthor ? 1 : 0
                        }
                    }).then(msg => {
                        if (!msg.error_code && this.selAction === 'remove') {
                            location.reload();
                        } else if (!msg.error_code) {
                            this.isInManage = false;
                            this.$message({message: msg.data.msg, type: 'success'});
                        } else {
                            this.isInManage = false;
                            this.$message({message: msg.data.msg, type: 'error'});
                        }
                    });
                }
            },
            startAdm(key) {
                this.tellAuthor = true;
                if (this.userInfo.uid) {
                    this.showManCon = true;
                    this.selAction = 'warn';
                    this.opt = null;
                    if (key === 1) {
                        this.showInpArray = ['radio', 'select'];
                        this.radioTitle = '操作';
                        this.radioSel = 2;
                        this.radioArray = [{key: 2, val: '警告'}, {key: 0, val: '解除警告'}];
                        this.selTitle = '原因';
                        this.opt = 2;
                    } else if (key === 2) {
                        this.showInpArray = ['radio', 'select'];
                        this.radioTitle = '操作';
                        this.radioSel = 1;
                        this.radioArray = [{key: 1, val: '屏蔽'}, {key: 0, val: '解除屏蔽'}];
                        this.selTitle = '原因';
                        this.opt = 1;
                    } else if (key === 3) {
                        this.selAction = 'remove';
                        this.showInpArray = ['tip', 'select'];
                        this.admTip = `确认 <span style="color: red;">删除</span>${this.page * 15 + this.index + 1}楼？`;
                        this.selTitle = '原因';
                    } else {
                        this.tellAuthor = false;
                        this.selAction = '/qcross/www/u/api.php?action=jubao';
                        this.showInpArray = ['radio', 'normalinput'];
                        this.radioTitle = '举报原因';
                        this.radioArray = [{key: 1, val: '广告'},
                            {key: '灌水', val: '灌水'},
                            {key: '色情污秽', val: '色情污秽'},
                            {key: '危害国家安全', val: '危害国家安全'},
                            {key: '其它', val: '其它'}];
                        this.inpTitle = '详细原因';
                    }
                } else {
                    this.$store.dispatch('LOGIN_MODAL');
                }
            },
            replyComi(obj) {
                if (obj === 'cancel') {
                    this.$refs.Reply.$el.style.display = 'none';
                    this.showAllBtn = true;
                } else if (obj.type === 'publish') {
                    this.doReply(obj);
                }
            },
            doReply(obj) {
                const {args} = this.$store.state.renderData.data;
                const {content, valid_code} = obj;
                if (!obj.content) {
                    this.$message({message: '请输入回复内容~', type: 'warning'});
                } else {
                    ajax({
                        url: '/thread-reply?ajaxId=5abb38048776329315f6d1a4',
                        method: 'POST',
                        data: {
                            token: this.userInfo.token,
                            tid: args.tid,
                            device: 1,
                            pid: this.item.id,
                            content,
                            valid_code,
                            quote: this.item.content
                        }
                    }).then(msg => {
                        if (!msg.error_code) {
                            this.$message({message: '回复成功！', type: 'success'});
                            setTimeout(() => {
                                location.reload();
                            }, 1000)
                        } else {
                            this.replyAgain = true;
                            this.$message({message: msg.data, type: 'error'});
                        }
                    });
                }
            }
        },
        mounted() {
            this.selOptions = [{
                label: '图文优美 内容详细'
            }, {
                label: '实用靠谱'
            }, {
                label: '版块选择不适'
            }, {
                label: '禁止广告'
            }, {
                label: '违规内容'
            }];
        }
    }
</script>

<style lang="stylus">
    .flo_item_man {
        margin-top: 20px;
        .reply_user {
            font-size 14px;
            margin-bottom 10px;
            a {
                margin-left: -4px;
                margin-right 5px;
            }
        }
    }
</style>