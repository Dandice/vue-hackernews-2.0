<template>
    <div id="rich_text" @click="closeFC">
        <div class="info">UE编辑器示例<br>需要使用编辑器时，调用UE公共组件即可。可设置填充内容defaultMsg，配置信息config(宽度和高度等)，可调用组件中获取内容的方法。</div>
        <button @click="getUEContent()">获取内容</button>
        <div class="rich_text_wrap com_flex">
            <div class="editor-container">
                <div id="ueditor1" ref="ue"></div>
            </div>
            <toolBar></toolBar>
        </div>
        <FontControl></FontControl>
    </div>
</template>

<script>
    import toolBar from './toolBar/toolBar.vue'
    import FontControl from '../FontControl/fontcontrol.vue'
    import './static/UE/themes/default/css/ueditor.css'

    export default {
        name: 'rich-text',
        components: {
            toolBar,
            FontControl
        },
        data() {
            return {
                config: {
                    initialFrameWidth: null,
                    enableContextMenu: false,  // 关闭右键菜单
                    toolbars: [],
                    wordCount: false,
                    initialFrameHeight: 350,
                    focus: true,
                    fontCon: null,
                    elementPathEnabled: false // 关闭elementPath
                }
            }
        },
        methods: {
            closeFC() {
                this.fontCon.style.visibility = 'hidden';
            },
            getUEContent() {
                this.editor.execCommand('Paragraph', 'h1')
            },
        },
        mounted() {
            require('./static/UE/ueditor.config');
            require('./static/UE/ueditor.all.js');
            require('./static/UE/lang/zh-cn/zh-cn.js');
            require('./static/UE/ueditor.parse.min.js');
            this.fontCon = document.getElementById('edui1_fontcontrol');
            const _this = this;
            this.editor = UE.getEditor('ueditor1', this.config); // 初始化UE
            this.editor.addListener("ready", function () {
                _this.editor.setContent('<p>feffwfewfewfweffefwefwefewfw<br/></p>'); // 确保UE加载完成后，放入内容。
                //setContent(json.Body.GoodDescription)
            });
        }
    }
</script>

<style lang="stylus">
    @import "./index.styl"
</style>