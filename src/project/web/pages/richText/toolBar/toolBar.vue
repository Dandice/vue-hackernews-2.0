<template>
    <div class="tool_bar">
        <el-tooltip class="item" effect="dark"
                    :content="item.val"
                    placement="right" v-for="item in iconArray">
            <div :class="`iconfont icon-${item.key}`" @click="insertOpt(item.key)"></div>
        </el-tooltip>
        <!--添加视频-->
        <el-dialog
            title="添加视频"
            :visible.sync="showAddVideo"
            width="50%">
            <div>
                <input type="text" class="addvideo" placeholder="请输入视频网址">
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showAddVideo = false">取 消</el-button>
                <el-button type="primary" @click="showAddVideo = false">确 定</el-button>
            </span>
        </el-dialog>
        <!--添加附件-->
        <el-dialog
            title="添加视频"
            :visible.sync="showAddFile"
            width="50%">
            <div>
                <input type="text" class="addvideo" placeholder="请输入视频网址">
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showAddVideo = false">取 消</el-button>
                <el-button type="primary" @click="showAddVideo = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {Dialog, tooltip, Button} from 'element-ui'
    import "../font/iconfont.css"

    export default {
        name: 'tool_bar',
        components: {
            [tooltip.name]: tooltip,
            [Dialog.name]: Dialog,
            [Button.name]: Button
        },
        data() {
            return {
                showAddVideo: false,
                showAddFile: false,
                iconArray: [{key: 'iconfont10026', val: '帖子电梯'},
                    {key: 'smile', val: '插入表情'},
                    {key: 'tupian', val: '插入图片'},
                    {key: 'movie', val: '插入视频'},
                    {key: 'qubiezhen', val: '插入附件'},
                    {key: 'question94', val: '发贴帮助'}],
            }
        },
        methods: {
            insertOpt(type) {
                if (type === 'movie') {
                    this.showAddVideo = true;
                } else if (type === 'file') {
                    this.showAddFile = true;
                }
            }
        },
        mounted() {

        }
    }
</script>

<style lang="stylus">
    @import "toolBar.styl"
</style>