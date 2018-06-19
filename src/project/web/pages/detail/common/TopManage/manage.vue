<template>
    <div id="top_manage" class="inl_flex" v-if="userInfo.admin">
        <div class="footer">
            <span class="two_btn" @click="openMan">
                管理主题
            </span>
            <span class="two_btn" @click="showHistory">
                管理历史
            </span>
        </div>

        <!--管理主题选择-->
        <el-dialog
            title="提示"
            :visible.sync="preManage"
            width="425px">
            <div class="manage_item_wrap">
                <div class="manage_item" v-for="item in choOptArray" @click="selManItem(item)">
                    {{item.val}}
                </div>
            </div>
        </el-dialog>

        <!--管理主题输入-->
        <el-dialog
            :title="manTitle"
            :visible.sync="manInput"
            width="620px">
            <div class="manage_con">
                <!--tip-->
                <div v-html="htmlTip" v-show="showInpArray.indexOf('tip')>-1" class="man_input_item"></div>
                <!--select2-->
                <div class="man_input_item" v-show="showInpArray.indexOf('select2')>-1">
                    <span class="left_key" v-html="sel2Title"></span>
                    <el-select v-model="sel2Val" placeholder="请选择">
                        <el-option
                            v-for="item in sel2Options"
                            :key="actionUrl.indexOf('addAnnotation') > -1 ? item.id :item.fid"
                            :label="actionUrl.indexOf('addAnnotation') > -1 ? item.catename :item.name"
                            :value="actionUrl.indexOf('addAnnotation') > -1 ? item.catename :item.fid">
                        </el-option>
                    </el-select>
                </div>

                <!--radio-->
                <div class="man_input_item" v-show="showInpArray.indexOf('radio')>-1">
                    <span class="left_key" v-html="radioTitle"></span>
                    <el-radio v-model="radioSel" :label="item.key" :key="index"
                              v-for="(item,index) in radioArray">{{item.val}}
                    </el-radio>
                </div>

                <!--date-->
                <div class="man_input_item" v-show="showInpArray.indexOf('date')>-1">
                    <span class="left_key" v-html="dataTitle"></span>
                    <el-date-picker
                        v-model="dateVal"
                        type="date"
                        placeholder="选择日期">
                    </el-date-picker>
                </div>

                <!--input-->
                <div class="man_input_item" v-show="showInpArray.indexOf('normalinput')>-1">
                    <span class="left_key" v-html="inpTitle"></span>
                    <input type="text" class="rea_input" v-model="inpVal" :placeholder="inpPlaHod">
                </div>

                <!--checkbox-->
                <div class="man_input_item" v-show="showInpArray.indexOf('checkbox')>-1" v-clickoutside="clickOut">
                    <span class="left_key" v-html="checkTitle"></span>
                    <div class="el-input el-input--suffix">
                        <input readonly="readonly" type="text" v-model="selBoxVal"
                               class="el-input__inner" @click="showSelfCheBox = true">
                        <span class="el-input__suffix">
                            <span class="el-input__suffix-inner">
                                <i class="el-select__caret el-input__icon el-icon-arrow-down"></i>
                            </span>
                        </span>
                        <div class="show_checkbox" v-show="showSelfCheBox">
                            <div v-for="item in cheBoxArray"
                                 :class="{disabled: selBoxId.length == 3, selected:selBoxId.indexOf(item.fid)>-1}">
                                <input type="checkbox" :value="item.fid" :id="item.fid"
                                       :checked="selBoxId.indexOf(item.fid)>-1"
                                       :disabled="selBoxId.length == 3 && selBoxId.indexOf(item.fid)<0"
                                       @click="chaCheckbox(item)"/>
                                <label :for="item.fid">{{item.name}}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!--select-->
                <div class="man_input_item" v-show="showInpArray.indexOf('select')>-1">
                    <span class="left_key" v-html="selTitle"></span>
                    <input type="text" class="rea_input" v-model="selVal" maxlength="100">
                    <el-select v-model="selVal" placeholder="请选择">
                        <el-option
                            v-for="item in selOptions"
                            :key="item.label"
                            :label="item.label"
                            :value="item.label">
                        </el-option>
                    </el-select>
                </div>
            </div>
            <span slot="footer" class="dialog-footer footer">
                <el-checkbox v-model="tellAuthor">通知作者</el-checkbox>
                <span class="two_btn confirm" @click="doOpt">保存设置</span>
            </span>
        </el-dialog>

        <!--管理历史-->
        <el-dialog
            title="当前主题管理历史"
            :visible.sync="manHistory"
            width="620px">
            <div>
                <div v-for="item in historyData" style="margin-bottom: 20px; font-size: 12px;">
                    <div>
                        <span style="margin-right: 10px;color:#10b041;">{{item.username}}</span>
                        <span style="color: #959595">{{item.datetime}}</span>
                    </div>
                    <div style="line-height: 23px; color:#636363;">
                        {{item.content}}
                    </div>
                </div>
                <div v-show="tip">{{tip}}</div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Clickoutside from 'common/directives/clickoutside'
    import {Dialog, Radio, DatePicker, Select, Option, Checkbox, CheckboxGroup, Message} from 'element-ui'
    import ajax from '../../../../../utils/ajax'
    import {_calTime} from '../../../../../utils/util'
    import Vue from 'vue'

    Vue.prototype.$message = Message;

    export default {
        data() {
            const {
                forums
            } = this.$store.state.renderData.data;
            return {
                forums,
                showInpArray: ['radio', 'checkbox', 'data', 'normalinput', 'select', 'select2'],
                selBoxId: [],
                selBoxVal: [],
                cheBoxArray: [],
                checkTitle: '',
                manTitle: '',
                dateVal: null,
                htmlTip: '',
                dataTitle: '',
                inpTitle: '',
                inpVal: '',
                inpPlaHod: '',
                actionUrl: null,
                tellAuthor: true,
                choOptArray: [],
                manInput: false,
                preManage: false,
                manHistory: false,
                radioTitle: '',
                radioSel: 1,
                radioArray: [],
                selTitle: '',
                sel2Title: '',
                selVal: '',
                sel2Val: '',
                selOptions: [],
                sel2Options: [],
                getPZ: [],
                getAllForum: [],
                showSelfCheBox: false,
                disabled: false,
                historyData: [],
                tip: 'loading...'

            }
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo;
            }
        },
        directives: {Clickoutside},
        components: {
            [Dialog.name]: Dialog,
            [Radio.name]: Radio,
            [DatePicker.name]: DatePicker,
            [Select.name]: Select,
            [Option.name]: Option,
            [CheckboxGroup.name]: CheckboxGroup,
            [Checkbox.name]: Checkbox
        },
        methods: {
            showHistory() {
                const {thread} = this.$store.state.renderData.data;
                ajax({
                    url: '/qcross/bbs/thread.php?action=getThreadLog&ajaxID=5ab8c7108776329315f6d185',
                    method: 'POST',
                    data: {
                        tid: thread.id,
                        fid: thread.fid,
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        if (msg.data) {
                            this.historyData = msg.data;
                            this.tip = null;
                        } else {
                            this.tip = '暂无管理记录';
                        }
                    }
                });
                this.manHistory = true;
            },
            chaCheckbox(item) {
                if (this.selBoxId.length === 3 && this.selBoxId.indexOf(item.fid) < 0) {
                    return;
                }
                if (this.selBoxId.indexOf(item.fid) < 0) {
                    this.selBoxId.push(item.fid);
                    this.selBoxVal.push(item.name);
                } else {
                    this.selBoxId.forEach((it, index) => {
                        if (it == item.fid) {
                            this.selBoxId.splice(index, 1);
                        }
                    });
                    this.selBoxVal.forEach((it, index) => {
                        if (it == item.name) {
                            this.selBoxVal.splice(index, 1);
                        }
                    });
                }

            },
            clickOut() {
                if (this.showSelfCheBox) {
                    this.showSelfCheBox = false;
                }
            },
            openMan() {
                const {thread} = this.$store.state.renderData.data;
                this.preManage = true;
                // 获取批注类型
                ajax({
                    url: '/qcross/bbs/thread.php',
                    data: {
                        action: 'getType',
                        fid: thread.fid,
                        ajaxID: '5ab894bb8776329315f6d17f'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.getPZ = msg.data;
                    }
                });

                // 获取所有分类
                ajax({
                    url: '/qcross/bbs/thread.php',
                    data: {
                        action: 'getAllForums',
                        ajaxID: '5ab8983a8776329315f6d183'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.getAllForum = msg.data;
                    }
                });
            },
            doOpt() {
                const {thread} = this.$store.state.renderData.data;
                let data = {
                    tid: thread.id,
                    fid: thread.fid,
                    model: this.radioSel,
                    effectdate: this.dateVal ? _calTime(this.dateVal * 1, 2) : null,
                    reason: this.selVal,
                    notice: this.tellAuthor ? 1 : 0
                };
                if (this.actionUrl.indexOf('digest') > -1) {
                    data.digest = this.radioSel;
                } else if (/addAnnotation/.test(this.actionUrl)) {
                    data.item = this.sel2Val;
                    data.execute_time = this.dateVal ? _calTime(this.dateVal * 1, 2) : null;
                } else if (/setThreadForums/.test(this.actionUrl)) {
                    data.mfid = this.sel2Val;
                    data.dfid = this.selBoxId;
                    data.cfid = thread.fid;
                } else if (/closed/.test(this.actionUrl)) {
                    data.closed = this.radioSel;
                } else if (/sink/.test(this.actionUrl)) {
                    data.type = this.radioSel;
                } else if (/merge/.test(this.actionUrl)) {
                    data.totid = this.inpVal;
                } else if (/setCredit/.test(this.actionUrl)) {
                    data.value_jy = this.radioSel;
                } else if (/heatedDiscuss/.test(this.actionUrl)) {
                    data.discuss = this.radioSel;
                    data.reason = this.inpVal;
                }
                ajax({
                    url: `/qcross/bbs/thread.php?action=${this.actionUrl}`,
                    method: 'POST',
                    data,
                }).then(msg => {
                    if (!msg.error_code) {
                        this.$message({message: msg.data.msg, type: 'success'});
                    } else {
                        this.$message({message: msg.data.msg, type: 'error'});
                    }
                });
            },
            selManItem(item) {
                this.actionUrl = item.key;
                this.manTitle = `主题${item.val}`;
                this.manInput = true;
                if (item.key === 'setTop') {
                    this.showInpArray = ['radio', 'date', 'select'];
                    this.radioTitle = '置顶模式';
                    this.dataTitle = '有&nbsp;&nbsp;效&nbsp;&nbsp;期';
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                    this.radioArray = [{key: 1, val: '全站置顶'}, {key: 2, val: '本版置顶'}, {key: 3, val: '列表置顶'}, {
                        key: 0,
                        val: '取消置顶'
                    }];
                } else if (item.key === 'digest') {
                    this.showInpArray = ['radio', 'select'];
                    this.radioTitle = '精华模式';
                    this.radioArray = [{key: 1, val: '1级精华'}, {key: 2, val: '2级精华'}, {key: 3, val: '3级精华'}, {
                        key: 0,
                        val: '解除'
                    }];
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                } else if (item.key === 'addAnnotation') {
                    this.showInpArray = ['date', 'select2', 'select'];
                    this.sel2Title = '批注类型';
                    this.dataTitle = '推荐时间';
                    this.selTitle = '批注内容';
                    this.sel2Options = this.getPZ;

                } else if (item.key === 'setThreadForums') {
                    let formText = [];
                    for (let i = 0; i < this.forums.length; i++) {
                        formText.push(this.forums[i].name);
                    }
                    this.showInpArray = ['tip', 'select', 'select2', 'checkbox'];
                    this.htmlTip = `本贴属于 ${formText.join('，')}`;
                    this.sel2Title = '移&nbsp;动&nbsp;至';
                    this.sel2Options = this.getAllForum;
                    this.checkTitle = '关&nbsp;联&nbsp;至';
                    this.cheBoxArray = this.getAllForum;
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                } else if (item.key === 'remove') {
                    this.showInpArray = ['tip', 'select'];
                    this.htmlTip = '确认<span style="color: red; margin: 0 5px;"> 删除 </span>主题';
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                } else if (item.key === 'closed') {
                    this.showInpArray = ['radio', 'date', 'select'];
                    this.radioTitle = '主题状态';
                    this.radioArray = [{key: 1, val: '关闭'}, {key: 0, val: '打开'}];
                    this.dataTitle = '有效期';
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                } else if (item.key === 'sink') {
                    this.showInpArray = ['radio', 'select'];
                    this.radioTitle = '主题状态';
                    this.radioArray = [{key: 1, val: '提升'}, {key: 0, val: '下沉'}];
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                } else if (item.key === 'merge') {
                    this.showInpArray = ['normalinput', 'select'];
                    this.inpTitle = '合并至';
                    this.inpPlaHod = '请填写合并至帖子的id';
                    this.selTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                } else if (item.key === 'setCredit') {
                    this.showInpArray = ['radio'];
                    this.radioTitle = '加分额度';
                    this.radioSel = 20;
                    this.radioArray = [{key: 20, val: '20'}, {key: 50, val: '50'}, {key: 80, val: '80'}, {
                        key: 100, val: '100'
                    }, {key: 150, val: '150'}];
                } else if (item.key === 'heatedDiscuss') {
                    this.showInpArray = ['radio', 'normalinput'];
                    this.radioTitle = '操&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;作';
                    this.radioSel = 1;
                    this.radioArray = [{key: 1, val: '执议'}, {key: 0, val: '取消热议'}];
                    this.inpTitle = '原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因';
                    this.inpPlaHod = '';
                }
            }
        },
        mounted() {
            this.selOptions = [{
                value: '选项1',
                label: '图文优美 内容详细'
            }, {
                value: '选项2',
                label: '实用靠谱'
            }, {
                value: '选项3',
                label: '版块选择不适'
            }, {
                value: '选项4',
                label: '禁止广告'
            }, {
                value: '选项5',
                label: '违规内容'
            }];
            this.choOptArray = [{
                key: 'setTop',
                val: '置顶'
            }, {
                key: 'digest',
                val: '加精'
            }, {
                key: 'addAnnotation',
                val: '批注'
            }, {
                key: 'setThreadForums',
                val: '移动/关联'
            }, {
                key: 'remove',
                val: '删除'
            }, {
                key: 'closed',
                val: '关闭/打开'
            }, {
                key: 'sink',
                val: '提升/下沉'
            }, {
                key: 'merge',
                val: '合并主题'
            }, {
                key: 'setCredit',
                val: '加分'
            }, {
                key: 'heatedDiscuss',
                val: '热议'
            }];
        }
    }
</script>

<style lang="stylus">
    @import "./manage.styl"
</style>