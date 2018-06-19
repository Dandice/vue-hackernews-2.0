<template>
    <div class="only_shadow flex_cen" :style="{height: inHeight}">
        <div class="only_shadow_con" :style="{width: Owidth,height: Oheight}"
             v-clickoutside="togShow">
            <div class="only_shadow_top flex_bet">
                <div class="left">{{title}}</div>
                <div class="right_btn" @click="togShow">
                    <button type="button" aria-label="Close">
                        <i class="el-dialog__close el-icon el-icon-close"></i>
                    </button>
                </div>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>

    import clickoutside from './clickOutSide.js'

    export default {
        directives: {clickoutside},
        props: ['title', 'Owidth', 'Oheight'],
        data() {
            return {
                inHeight: '100%'
            }
        },
        methods: {
            togShow() {
                this.$emit('togShow', false);
            }
        },
        mounted() {
            this.inHeight = window.innerHeight + 'px';
        }
    }
</script>

<style lang="stylus">
    .only_shadow {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        background: rgba(0, 0, 0, 0.5);

        .only_shadow_con {
            position relative;
            margin: auto;
            background: #fff;
            width: 90%;
            /*margin-top: 50px;*/
            padding: 20px;
            box-sizing: border-box;
            border-radius: 2px;
            text-align left;
            .rea_input {
                width: 75%;
                height 35px;
                outline none;
                font-size 14px;
                line-height 30px;
                padding-left 10px;
                margin-right: 10px;
                border-radius: 3px;
                border: 1px solid #dcdfe6;
            }
            .rea_input:focus {
                border 1px solid #3f9f5f;
            }
            button {
                border: none;
            }
            .only_shadow_top {
                line-height: 24px;
                font-size: 18px;
                color: #303133;
                margin-bottom: 20px;
                .right_btn {
                    position absolute;
                    right 20px;
                    top: 20px;
                }
            }
            .tip {
                font-size 14px;
            }
            .footer {
                .cancel {
                    border: 1px solid silver;
                    .two_btn {
                        padding 5px 15px;
                    }
                }
            }

        }

    }
</style>