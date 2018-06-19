<template>
    <div :id=id>
    </div>
</template>

<script>

    export default {
        name: 'u-editor',
        data() {
            return {
                domUtils: null
            }
        },
        props: ['defItem', 'id', 'isEdit'],
        watch: {
            defItem(html) {
            }
        },
        methods: {
            keyDown(type, evt) {
                let keyCode = evt.keyCode || evt.which;
                let rng = this.editor.selection.getRange();
                const me = this;
                if ((keyCode == 46 || (keyCode == 8)) && rng.collapsed == true) {
                    //执行删除操作,del建
                    let start = rng.startContainer,
                        reg = /qyer_video|qyer_attach/ig,
                        parentP = this.domUtils.findParent(start, function (node) {
                            if (me.domUtils.isBody(node.parentNode)) {
                                return node;
                            }
                        }, true),
                        pre;
                    pre = parentP.previousSibling;
                    //满足可以删除前一行的元素要求是：
                    //range的startOffset是0，没有前一个兄弟元素，并且有前一行元素
                    //<p>[]ssss<br>dddd</p>   用这个条件判断!start.previousSibling
                    //[<p></p>]     这种情况用/p/ig.test(start.tagName)条件判断
                    if (pre && (!start.previousSibling || /p/ig.test(start.tagName)) && rng.startOffset == 0) {
                        //如果有前一个元素
                        //判断这个元素里是否有视频或者附件
                        if (pre.firstChild && reg.test(pre.firstChild.className)) {
                            me.editor.fireEvent('saveScene');
                            this.domUtils.remove(pre);
                        }

                    }
                    //如果将图片改成block则在图片后边删除是无法删除的(原生问题)

                }
                /*if(evt.metaKey&&keyCode==83){
                    this.domUtils.preventDefault(evt);
                    me.fireEvent('saveScene');
                }*/
            }
        },
        mounted() {
            require('../static/UE/ueditor.config');
            require('../static/UE/ueditor.all.js');
            require('../static/UE/lang/zh-cn/zh-cn.js');
            require('../static/UE/ueditor.parse.min.js');
            const me = this;
            this.editor = UE.getEditor(this.id); // 初始化UE
            this.domUtils = UE.dom.domUtils;

            //对于点击视频或者附件的后边，将光标移到下一行的开头处理
            this.editor.addListener('selectionchange', () => {
                let rng = this.editor.selection.getRange();
                let start = rng.startContainer;
                let parent, pre, next;
                parent = this.domUtils.findParent(start, function (node) {
                    if (me.domUtils.isBody(node.parentNode)) {
                        return node;
                    }
                }, true);
                this.domUtils.getElementsByTagName(parent, "span", function (node) {
                    if (/qyer_video|qyer_attach/ig.test(node.className)) {
                        next = parent.nextSibling;
                        if (!next) {
                            //next = document.createElement("p");
                            next = '<p><br></p>';
                            me.domUtils.insertAfter(parent, next);
                        }
                        rng.selectNode(next).shrinkBoundary().setCursor().select();
                        return;
                    }
                })
            });

            this.editor.addListener('keydown', (type, evt) => {
                me.keyDown(type, evt);
            });
            if (this.isEdit && me.defItem && me.defItem.content) {
                this.editor.addListener("ready", () => {
                    me.editor.setContent(me.defItem.content);
                });
            }
        },
    }
</script>

<style lang="stylus">

</style>