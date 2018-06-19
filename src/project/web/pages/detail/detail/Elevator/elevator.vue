<template>
    <div class="elevator_con" :style="{border: !isDock ? '1px solid #ececec' : ''}" ref="eleWrap">
        <div class="elevator_list_wrap">
            <div class="elevator_list_con">
                <div class="grey_line"></div>
                <div v-if="item.title" v-for="(item, index) in elevator"
                     :data-bn-ipg="isDock ? 'bbs-thread-docklift-second' : 'bbs-thread-rightlift-first'"
                     :class="{ part: item.level == 1, unit: item.level == 2, selected: selIndex === index }"
                     @click="doAnchor(item)"
                     v-html="item.title">
                </div>
                <div class="block"></div>
            </div>
        </div>
    </div>
</template>

<script>
    // import {toAnchor} from "../../../../../utils/hybrid";
    import {toAppointPoi} from '../../../../utils/util'

    export default {
        name: "app-elevator",
        data() {
            const {args} = this.$store.state.renderData.data;
            return {
                args,
                timer: null,
                eleIdArray: [],
                selIndex: null,
                realHeight: 0,
                app: null,
                fixedEle: null
            };
        },
        props: ['elevator', 'isDock'],
        computed: {
            fixedBar() {
                return this.$store.state.project.fixedBar;
            }
        },
        methods: {
            doAnchor(item) {
                toAppointPoi(item.pid, `post-${item.pid}-${item.i}`, this);
            },
            analyFloorId() {
                for (let i = 0; i < this.elevator.length; i++) {
                    let curItem = this.elevator[i];
                    let curId = `post-${curItem.pid}-${curItem.i}`;
                    const getCurItem = document.getElementById(curId);
                    if (getCurItem) {
                        const curTop = getCurItem.getBoundingClientRect().top;
                        if (curTop < 300) {
                            let nexItem = this.elevator[i + 1];
                            if (nexItem) {
                                let nexId = `post-${nexItem.pid}-${nexItem.i}`;
                                const getNexItem = document.getElementById(nexId);
                                if (getNexItem) {
                                    let nexTop = getNexItem.getBoundingClientRect().top;
                                    if (nexTop > 80) {
                                        this.selIndex = i;
                                        break;
                                    }
                                } else {
                                    this.selIndex = i;
                                }
                            } else {
                                this.selIndex = i;
                            }
                        }
                    }
                }
                if (!this.isDock) return;
                if (this.fixedBar === 'fixbot') {
                    this.fixedEle.style.visibility = 'visible';
                    const {top} = this.app.getBoundingClientRect();
                    const calEleHeight = window.innerHeight > 800 ? (window.innerHeight - 400) * 0.9  : 210;
                    this.realHeight = document.querySelector('.elevator_list_con').clientHeight;
                    let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                    if (Math.abs(top) + 1200 > scrollHeight) {
                        this.fixedEle.style.top = '370px';
                        this.$refs.eleWrap.style.height = this.realHeight > (calEleHeight-140) ? `${calEleHeight-140}px` : `${this.realHeight}px`
                    } else {
                        this.fixedEle.style.top = null;
                        this.$refs.eleWrap.style.height = this.realHeight > calEleHeight ? `${calEleHeight}px` : `${this.realHeight}px`
                    }
                } else {
                    this.fixedEle.style.visibility = 'hidden';
                }
            },
            onScroll() {
                const me = this;
                clearTimeout(this.timer);
                this.timer = setTimeout(function () {
                    me.analyFloorId();
                }, 300)
            }
        },
        mounted() {
            this.fixedEle = document.getElementById('fixed_elevator');
            this.app = document.getElementById('app');
            window.addEventListener('scroll', this.onScroll, false);
        }
    };
</script>

<style lang="stylus">
    @import './elevator.styl';
</style>