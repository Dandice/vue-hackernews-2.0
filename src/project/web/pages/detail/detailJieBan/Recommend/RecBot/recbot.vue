<template>
    <div class="rec_bot">
        <div class="rec_bot_read" v-show="recommend[9]">
            <div class="title">相关阅读</div>
            <div id="bot_read_wrap" class="flex_bet">
                <div class="bot_prev_btn icon icomoon"
                     :class="{cancli: readIndex !==0}"
                     @click="resPosition('prev')"></div>
                <div class="bot_read_con_scroll">
                    <div class="bot_read_con" ref="botReadCon">
                        <a class="read_item"
                           :href="recommend[i+8].url" target="_blank"
                           v-for="i in 9" v-if="recommend[i+8]">
                            <div class="img"><img :src="recommend[i+8].cover ? recommend[i+8].cover + '/210x140' : '//static.qyer.com/images/place/no/poi_200_133.png'"></div>
                            <div class="des">
                                <div>{{recommend[i+8].subject}}</div>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="bot_next_btn icon icomoon"
                     :class="{cancli: readIndex !==2}"
                     @click="resPosition('next')"></div>
            </div>
        </div>
        <div class="rec_bot_ask" v-show="askArray.length">
            <div class="title">相关问答</div>
            <div class="bot_ask_con">
                <a :href="item.url" v-for="item in askArray" target="_blank">{{item.title}}</a>
            </div>
        </div>
    </div>
</template>

<script>
    import {Carousel,CarouselItem} from 'element-ui'
    import ajax from '../../../../../../utils/ajax'

    export default {
        data() {
            const {ask, recommend_threads,args} = this.$store.state.renderData.data;

            if (recommend_threads) {
                this.$store.commit('SET_VALUE', {
                    page: 'recommend',
                    data: recommend_threads
                })
            }
            return {
                args,
                readWrap: null,
                readIndex: 0,
                askArray: ask || []
            }
        },
        computed: {
            recommend() {
                return this.$store.state.project.recommend;
            }
        },
        methods: {
            resPosition(type) {
                if (type === 'prev') {
                    if (this.readIndex === 0) return;
                    this.readIndex -= 1;
                } else {
                    if (this.readIndex === 2) return;
                    this.readIndex += 1;
                }
                const weiyi = -(this.readIndex * 236 * 3) + 'px';
                //this.readWrap.style['transform'] = 'translate3d(' + weiyi + ', 0, 0)' + ' translateZ(0)';
                this.readWrap.style['webkitTransform'] = 'translate3d(' + weiyi + ', 0, 0)' + ' translateZ(0)';
                //this.loadAnsImg(index + 1);
            },
            getRecommend() {
                const {args} = this.$store.state.renderData.data;
                ajax({
                    url: '/post.php',
                    data: {
                        action: 'recommend',
                        tid: args.tid,
                        limit: 18,
                        ajaxID: '5ab384af8776329315f6d179'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.$store.commit('SET_VALUE', {
                            page: 'recommend',
                            data: msg.data.list
                        })
                    }
                });
            },
            getAsk() {
                const {args, tags} = this.$store.state.renderData.data;
                let tagArray = [];
                tags.forEach(item => {
                    tagArray.push(item.id);
                });
                ajax({
                    url: `/detail/ask/t/${args.tid}.json`,
                    data: {
                        //action: 'ask',
                        time_sta: new Date() * 1,
                        //tid: args.tid,
                        tagid: tagArray.join(),
                        ajaxID: '5ab4a1018776329315f6d17b'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.askArray = msg.data.list;
                    }
                });
            }
        },
        components: {
            [Carousel.name]: Carousel,
            [CarouselItem.name]: CarouselItem
        },
        mounted() {
            this.readWrap = this.$refs.botReadCon;
            this.readWrap.style.width = 236 * 9 + 'px';
            if (!this.args.sync){
                // 获取相关推荐
                this.getRecommend();
                // 获取相关问答
                this.getAsk();
            }
        }
    }
</script>

<style lang="stylus">
    .el-carousel__item h3 {
        color: #475669;
        font-size: 18px;
        opacity: 0.75;
        line-height: 300px;
        margin: 0;
    }

    .el-carousel__item:nth-child(2n) {
        background-color: #99a9bf;
    }

    .el-carousel__item:nth-child(2n+1) {
        background-color: #d3dce6;
    }

    @import "./recbot.styl"
</style>