<template>
    <div v-show="showChiehe">
        <div class="chihe_block" @mouseleave="onMouseLeave">
            <div class="banner">
                <div v-for="item in titleArray"
                     @mouseenter="onMouseEnter(item, $event)"
                     class="black">
                    {{item.val}}
                </div>
            </div>
            <div class="content" v-show="showContent">
                <div class="sharp" :style="{left: sharpX}"></div>
                <div v-for="item in conArray" class="con_item flex_bet">
                    <div class="left">
                        <img :src="item.img" alt="">
                    </div>
                    <div class="right">
                        <div class="title">
                            {{item.title}}
                        </div>
                        <div class="price">
                            <span class="price_num" v-html="item.price"></span> 元起
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <a class="lookmore" v-show="!needMouseOut" href="//bbs.qyer.com/forum-168-1.html" target="_blank"
           data-bn-ipg="bbs-thread-rightreco-more">查看更多<i class="lm"></i></a>
    </div>
</template>

<script>
    import ajax from "../../../../../../utils/ajax";

    export default {
        name: "chihe_block",
        data() {
            return {
                searchVal: "",
                showAll: false,
                conArray: [],
                sharpX: '50px',
                showContent: false,
                showChiehe: false,
                titleArray: [{
                    key: 'localHot',
                    val: '当地热卖'
                }, {
                    key: 'ticket',
                    val: '当地玩乐'
                }, {
                    key: 'traffic',
                    val: '机票酒店'
                }, {
                    key: 'travel',
                    val: '签证'
                }]
            };
        },
        props: ['chiheWrapObj', 'needMouseOut'],
        watch: {
            chiheWrapObj(data) {
                const {localHot = {}, ticket = {}, traffic = {}, travel = {}} = data;
                this.conArray = localHot.list;
                this.showChiehe = localHot.list && ticket.list && traffic.list && travel.list;
            }
        },
        methods: {
            toSearch() {
                window.open(`http://search.qyer.com/bbs?wd=${this.searchVal}`);
            },
            onMouseEnter(item, e) {
                this.showContent = true;
                this.conArray = this.chiheWrapObj[item.key].list;
                this.sharpX = e.target.offsetLeft + e.target.clientWidth / 2 - 7 + "px";
            },
            onMouseLeave() {
                if (this.needMouseOut) {
                    this.showContent = false;
                    this.showAll = false;
                }
            }
        },
        mounted() {
            this.showContent = this.needMouseOut ? false : true;
        }
    };
</script>

<style lang="stylus">
    @import './chihe.styl';
</style>