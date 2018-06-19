<template>
    <div v-show="showChiehe">
        <div class="chihe_block" @mouseleave="onMouseLeave">
            <div class="banner">
                <div v-for="item in titleArray"
                     v-show="chiheWrapObj[item.key]"
                     @mouseenter="onMouseEnter(item, $event)"
                     class="black">
                    {{item.val}}
                </div>
            </div>
            <div class="content" :style="{position: isDock ? 'absolute' : null}" v-show="showContent">
                <div class="sharp icomoon" :style="{left: sharpX, top: isDock ? '-22px' : null}"></div>
                <div v-for="item in conArray" class="con_item flex_bet" @click="toDetail(item.url)">
                    <div class="left">
                        <img :src="item.img">
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

        <div class="lookmore" v-show="!needMouseOut" @click="lookMore"
             data-bn-ipg="bbs-thread-rightreco-more">查看更多<i class="lm"></i></div>
    </div>
</template>

<script>
    //import ajax from "../../../../../../utils/ajax";

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
                lookUrl: null,
                titleArray: [{
                    key: 'localHot',
                    val: '当地热卖'
                }, {
                    key: 'travel',
                    val: '当地玩乐'
                }, {
                    key: 'traffic',
                    val: '机票酒店'
                }, {
                    key: 'ticket',
                    val: '签证'
                }]
            };
        },
        props: ['chiheWrapObj', 'needMouseOut', 'isDock'],
        watch: {
            chiheWrapObj(data) {
                let localHot = data.localHot || {};
                let ticket = data.ticket || {};
                let traffic = data.traffic || {};
                let travel = data.travel || {};
                this.conArray = localHot.list;
                this.showChiehe = localHot.list || ticket.list || traffic.list || travel.list;
            }
        },
        methods: {
            lookMore() {
                this.lookUrl && window.open(this.lookUrl);
            },
            toDetail(url) {
                window.open(url);
            },
            toSearch() {
                window.open(`http://search.qyer.com/bbs?wd=${this.searchVal}`);
            },
            onMouseEnter(item, e) {
                this.showContent = true;
                this.conArray = this.chiheWrapObj[item.key].list;
                this.lookUrl = this.chiheWrapObj[item.key].url;
                this.sharpX = e.target.offsetLeft + e.target.clientWidth / 2 - 7 + "px";
            },
            onMouseLeave() {
                if (this.needMouseOut) {
                    this.showContent = false;
                    this.showAll = false;
                }
            },
        },
        mounted() {
            this.showContent = this.needMouseOut ? false : true;
        }
    };
</script>

<style lang="stylus">
    @import './chihe.styl';
</style>