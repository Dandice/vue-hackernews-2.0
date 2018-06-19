<template>
    <div id="detail_con_rec">
        <!--电梯-->
        <div class="pc_elevator" v-show="elevator.length">
            <div class="title" style="margin-bottom: 20px;">电梯</div>
            <Elevator :style="{height: topHeight}" :elevator="elevator" :isDock="false"></Elevator>
        </div>

        <ADZone :zone-id="35" :country-id="forum_countries" style="width: 100%; margin-top: 45px;" target="_blank"></ADZone>

        <!-- 相关阅读 -->
        <RelRead></RelRead>

        <!--奇遇广告 与adzone不同-->
        <a class="qiyu_video" :href="qiyuObj.href" target="_blank">
            <img :src="qiyuObj.src">
        </a>

        <!--吃喝玩乐-->
        <Chihe :chiheWrapObj="chiheWrapObj" :showContent="true" :needMouseOut="false"></Chihe>


        <!--吃喝推荐dock-->
        <div class="chihe_dock" v-show="topDock" :style="{left: fixedLeft}">
            <Chihe :chiheWrapObj="chiheWrapObj" :showContent="false" :isDock="true" :needMouseOut="true"></Chihe>
            <a class="qiyu_video" :href="qiyuObj.href" target="_blank">
                <img :src="qiyuObj.src">
            </a>
        </div>

        <!--电梯dock-->
        <div id="fixed_elevator" class="pc_elevator" ref="dockEle" :class="eleDock" v-show="elevator.length">
            <div class="title">电梯</div>
            <Elevator :isDock="true" :style="botEleStyl" :elevator="elevator"></Elevator>
        </div>
    </div>
</template>

<script>
    import Elevator from "../Elevator/elevator.vue";
    import ADZone from 'common/components/ADZone.vue'
    import RelRead from './RelReadTop/recTop.vue';
    import Chihe from './Chihe/chihe.vue'
    import ajax from "../../../../../utils/ajax";

    export default {
        data() {
            const {args,forum_countries} = this.$store.state.renderData.data;
            return {
                args,
                topHeight: '200px',
                botEleStyl: {},
                elevator: [],
                eleDock: '',
                chiheWrapObj: {},
                topDock: false,
                qiyuObj: {},
                fixedLeft: 0,
                forum_countries
            }
        },
        components: {
            Elevator,
            ADZone,
            RelRead,
            Chihe,
        },
        computed: {
            fixedBar() {
                return this.$store.state.project.fixedBar;
            }
        },
        watch: {
            fixedBar(val) {
                if (val === "fixbot") {
                    const gap = window.innerWidth - 1160 > 0 ? window.innerWidth - 1160 : 0;
                    this.eleDock = "popup_fixed_elevator";
                    this.topDock = true;
                    this.fixedLeft = parseInt(gap / 2 + 800) + 'px'
                } else {
                    this.eleDock = "";
                    this.topDock = false;
                }
            }
        },
        methods: {
            getElevator() {
                const me = this;
                ajax({
                    url: `/detail/toc/t/${this.args.tid}.json`,
                    data: {
                        //action: 'toc',
                        time_sta: new Date() * 1,
                        //tid: this.args.tid,
                        ajaxID: "5ab0a9b48776329315f6d167"
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        let {toc} = msg.data;
                        const {have_plan} = this.$store.state.renderData.data.thread;
                        if (have_plan && toc.length) {
                            let mark = {i: 1, level: '1', pid: 'hodometer', title: '行程单'};
                            toc.unshift(mark);
                        }
                        me.elevator = toc;
                        setTimeout(() => {
                            me.setStyle();
                        }, 500);
                    }
                });
            },
            setStyle() {
                let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                if (scrollTop > 1900) {
                    const gap = window.innerWidth - 1160 > 0 ? window.innerWidth - 1160 : 0;
                    this.eleDock = "popup_fixed_elevator";
                    this.topDock = true;
                    this.fixedLeft = parseInt(gap / 2 + 800) + 'px'
                }
                const gap = window.innerWidth - 1160 > 0 ? window.innerWidth - 1160 : 0;
                const calEleHeight = window.innerHeight > 800 ? (window.innerHeight - 400) * 0.9 : 210;
                let realHeight = document.querySelector('.elevator_list_con').clientHeight;
                this.topHeight = realHeight > 395 ? '395px' : `${realHeight}px`;

                this.botEleStyl.height = realHeight < calEleHeight ? realHeight + 'px' : calEleHeight + 'px';
                this.$refs.dockEle.style.left = parseInt(gap / 2 + 807) + 'px';
            },
            getChihe() {
                const {args} = this.$store.state.renderData.data;
                ajax({
                    url: '/thread.php',
                    data: {
                        action: "getBusinessRecommend",
                        tid: args.tid,
                        ajaxID: '5aeabbdcae8bfd4e7106d4fc'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.chiheWrapObj = msg.data;
                    }
                });
            },
            getQiYu() {
                const {args} = this.$store.state.renderData.data;
                ajax({
                    url: `/detail/ad/t/${args.tid}.json`,
                    data: {
                        time_sta: new Date()*1,
                        ajaxID: '5ab313f78776329315f6d16d'
                    },
                    useErcode: false
                }).then(data => {
                    this.qiyuObj = data.qyer_ad_bbs;
                })
            }
        },
        mounted() {
            setTimeout(()=>{
                this.getElevator();
                this.getChihe();
                this.getQiYu();
            },500);
            window.onresize = () => {
                if (this.fixedBar === "fixbot") {
                    const calEleHeight = window.innerHeight > 800 ? (window.innerHeight - 400) * 0.9 : 210;
                    let realHeight = document.querySelector('.elevator_list_con').clientHeight;
                    if (realHeight < calEleHeight) {
                        this.botEleStyl.height = realHeight + 'px';
                    } else {
                        this.botEleStyl.height = calEleHeight + 'px';
                    }
                    const gap = window.innerWidth - 1160 > 0 ? window.innerWidth - 1160 : 0;
                    this.fixedLeft = parseInt(gap / 2 + 800) + 'px';
                    this.$refs.dockEle.style.left = parseInt(gap / 2 + 807) + 'px';
                }
            }
        }
    };
</script>

<style lang="stylus">
    @import './recommend.styl';
</style>