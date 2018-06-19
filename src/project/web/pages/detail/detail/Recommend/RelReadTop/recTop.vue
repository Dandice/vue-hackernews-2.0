<template>
    <div>
        <div class="rel_read_top" v-show="pagSize">
            <div class="top_info flex_bet">
                <div class="title">相关阅读</div>
                <div class="cur_index flex_bet">
                    <span class="icomoon ico icon_prev" @click="resPosition('prev')"></span>
                    <div>{{curPage}} / {{pagSize}}</div>
                    <span class="icomoon ico icon_next" @click="resPosition('next')"></span>
                </div>
            </div>
            <div class="read_top_scroll">
                <!-- {{ReadArray}}-->
                <div class="read_top_con" ref="topReadCon">
                    <div class="read_top_block">
                        <a class="read_top_item" data-bn-ipg="bbs-thread-rightreco-1"
                           target="_blank"
                           v-for="item in ReadArray[pagSize-1]" :href="item.url">
                            <div class="item_left">
                                <img :src="item.cover ? item.cover+'/80x80' : '//static.qyer.com/images/place/no/poi_200_133.png'">
                            </div>
                            <div class="item_right">
                                <div class="subject">{{item.subject}}</div>
                                <div class="pv">
                                    <span class="icomoon pv_icon"></span>
                                    <span>{{item.pv}}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="read_top_block" v-for="itemBlock in ReadArray">
                        <a class="read_top_item" data-bn-ipg="bbs-thread-rightreco-1"
                           :href="item.url" target="_blank"
                           v-for="item in itemBlock">
                            <div class="item_left">
                                <img :src="item.cover ? item.cover+'/80x80' : '//static.qyer.com/images/place/no/poi_200_133.png'">
                            </div>
                            <div class="item_right">
                                <div class="subject">{{item.subject}}</div>
                                <div class="pv">
                                    <span class="icomoon pv_icon"></span>
                                    <span>{{item.pv}}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="read_top_block">
                        <a class="read_top_item" data-bn-ipg="bbs-thread-rightreco-1"
                           target="_blank"
                           v-for="item in ReadArray[0]" :href="item.url">
                            <div class="item_left">
                                <img :src="item.cover ? item.cover+'/80x80' : '//static.qyer.com/images/place/no/poi_200_133.png'">
                            </div>
                            <div class="item_right">
                                <div class="subject">{{item.subject}}</div>
                                <div class="pv">
                                    <span class="icomoon pv_icon"></span>
                                    <span>{{item.pv}}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <a class="lookmore " :href="lookMoreUrl" target="_blank"
           data-bn-ipg="bbs-thread-rightreco-more">查看更多<i class="lm"></i></a>
    </div>
</template>

<script>

    export default {
        data() {
            const {forums} = this.$store.state.renderData.data;
            return {
                curPage: 1,
                topReadCon: null,
                pagSize: 0,
                ReadArray: [],

                lookMoreUrl: `//bbs.qyer.com/forum-${forums && forums[0].id}-1.html`,
            }
        },
        computed: {
            recommend() {
                return this.$store.state.project.recommend;
            }
        },
        watch: {
            recommend(data) {
                data && this.getRec(data);
            }
        },
        methods: {
            getRec(data){
                let result = [];
                for (let i = 0; i < 9; i += 3) {
                    result.push(data.slice(i, i + 3));
                }
                this.ReadArray = result;
                this.pagSize = result.length;
            },
            doResPoi(weiyi, time) {
                this.topReadCon.style['webkitTransform'] = 'translate3d(' + weiyi + ', 0, 0)' + ' translateZ(0)';
                this.topReadCon.style['webkitTransitionDuration'] = time;
            },
            resPosition(type) {
                if (type === 'prev') {
                    this.curPage = this.curPage - 1 == 0 ? this.pagSize : this.curPage - 1;
                    new Promise(resolve => {
                        const weiyi = this.curPage === this.pagSize ? 0 : -((this.curPage) * 320) + 'px';
                        this.doResPoi(weiyi, '300ms');
                        setTimeout(() => {
                            resolve();
                        }, 300)
                    }).then(() => {
                        if (this.curPage === this.pagSize) {//
                            const weiyi = -((this.curPage) * 320) + 'px';
                            this.doResPoi(weiyi, '0ms');
                        }
                    });
                } else {
                    this.curPage = this.curPage + 1 > this.pagSize ? 1 : this.curPage + 1;
                    new Promise(resolve => {
                        const weiyi = -((this.curPage) * 320) + 'px';
                        this.doResPoi(weiyi, '300ms');
                        setTimeout(() => {
                            resolve();
                        }, 300)
                    }).then(() => {
                        if (this.curPage === this.pagSize && type === 'next') {//
                            this.doResPoi(0, '0ms');
                        }
                    });
                }


            }
        },
        mounted() {
            this.topReadCon = this.$refs.topReadCon;
            this.doResPoi('-320px', '0ms');
        }
    }
</script>


<style lang="stylus">
    @import 'recTop.styl';
</style>
