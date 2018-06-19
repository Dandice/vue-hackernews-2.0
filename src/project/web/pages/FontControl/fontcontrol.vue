<template>
    <div id="edui1_fontcontrol" @click.stop>
        <div class="flex_cen edit_font_base" v-show="editType === 1">
            <div class="iconfont weight icon-bold"
                 :class="{ active: bold }" @click="doOpe('bold')"></div>
            <div class="iconfont color"
                 @click="chaEditType(2)">
                <div class="icon-A" :style="{borderBottom: `2px solid ${curFontColor}`, paddingBottom: '2px'}"></div>
            </div>
            <div class="iconfont line">|</div>
            <div class="iconfont title" :class="{ active: h1 }"
                 @click="doOpe('Paragraph','h1')">标题1
            </div>
            <div class="iconfont title" :class="{ active: h2 }"
                 @click="doOpe('Paragraph','h2')">标题2
            </div>
            <div class="iconfont text" @click="doOpe('Paragraph','p')">正文</div>
            <div class="iconfont line">|</div>
            <div class="iconfont link icon-link" @click="chaEditType(3)"></div>
            <span class="arrow"></span>
        </div>
        <div class="flex_cen edit_font_base edit_color" v-show="editType === 2">
            <div v-for="item in colorList" @click="doOpe('forecolor',item)"
                 :style="{background: item}"></div>
        </div>
        <div v-show="editType === 3" class="flex_cen edit_font_base">
            <input type="text" placeholder="粘贴超链接地址" ref="myseltest">
            <img src="./enter.svg" class="enter" alt="">
        </div>
    </div>
</template>

<script>

    export default {
        name: 'font-control',
        components: {},
        data() {
            return {
                editor: null,
                styleList: ['bold', 'h1', 'h2', 'forecolor'],
                bold: false,
                h1: false,
                h2: false,
                editType: 1,
                curFontColor: '#323232',
                colorList: ["#323232", "#636363", "#ff0f00", "#ff8d00", "#818100", "#308b50", "#038081", "#3d67e9", "#000086", "#7f0085", "#4a0088", "#8b0400"]
            }
        },
        methods: {
            doOpe(type, val) {
                if (type === 'Paragraph' || type === 'forecolor') {
                    this.editor.execCommand(type, val);
                } else {
                    this.editor.execCommand(type); //加粗
                }
            },
            chaEditType(val) {
                this.editType = val;
                //
                this.$refs.myseltest.autofocus = true;
            },
            selchange() {
                //this.editType = 1;
                for (let i = 0; i < this.styleList.length; i++) {
                    if (this.styleList[i] === 'bold') {
                        if (this.editor.queryCommandState(this.styleList[i])) {
                            this[this.styleList[i]] = true;
                        } else {
                            this[this.styleList[i]] = false;
                        }
                    } else if (this.styleList[i] === 'forecolor') {
                        console.log('this.editor.queryCommandValue(\'forecolor\')')
                        console.log(this.editor.queryCommandValue('forecolor'))
                        this.curFontColor = this.editor.queryCommandValue('forecolor');
                    } else {
                        const {domUtils} = baidu.editor.dom;
                        const node = domUtils.filterNodeList(this.editor.selection.getStartElementPath(), this.styleList[i])
                        this[this.styleList[i]] = node ? true : false;
                    }
                }
            }
        },
        mounted() {
            setTimeout(() => {
                this.editor = UE.getEditor('ueditor1', this.config);
                this.editor.addListener('selectionchange', this.selchange);
            }, 0)
        }
    }
</script>

<style lang="stylus">
    @import "fontcontrol.styl"
</style>