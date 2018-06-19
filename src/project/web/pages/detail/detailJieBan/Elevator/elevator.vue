<template>
    <div class="elevator_con" ref="eleWrap">
        <div class="elevator_list_wrap">
            <div class="elevator_list_con">
                <div class="grey_line"></div>
                <div v-if="item.title" v-for="(item, index) in elevator"
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
                app: null
            };
        },
        props: ['elevator', 'isDock'],
        computed: {},
        methods: {
            doAnchor(item) {
                toAppointPoi(item.pid, `post-${item.pid}-${item.i}`, this);
            },
            analyFloorId() {
                for (let i = 0; i < this.elevator.length; i++) {
                    let curItem = this.elevator[i];
                    let curId = curItem.level === '1' ? `item-post-${curItem.pid}` : `post-${curItem.pid}-${curItem.i}`;
                    const getCurItem = document.getElementById(curId);
                    if (getCurItem) {
                        const curTop = getCurItem.getBoundingClientRect().top;
                        if (curTop < 300) {
                            let nexItem = this.elevator[i + 1];
                            if (nexItem) {
                                let nexId = nexItem.level === '1' ? `item-post-${nexItem.pid}` : `post-${nexItem.pid}-${nexItem.i}`;
                                const getNexItem = document.getElementById(nexId);
                                if (getNexItem) {
                                    let nexTop = getNexItem.getBoundingClientRect().top;
                                    if (nexTop > 150) {
                                        this.selIndex = i;
                                        break;
                                    }
                                }
                            } else {
                                this.selIndex = i;
                            }
                        }
                    }
                }
                if (!this.isDock) return
                const {top} = this.app.getBoundingClientRect();
                this.realHeight = document.querySelector('.elevator_list_con').clientHeight;
                let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop;
                if (Math.abs(top) + 1200 > scrollHeight) {
                    this.$refs.eleWrap.style.height = this.realHeight > 395 ? '510px' : `${this.realHeight + 200}px`
                } else {
                    this.$refs.eleWrap.style.height = this.realHeight > 395 ? '395px' : `${this.realHeight}px`
                }
            },
            onScroll() {
                const me = this;
                clearTimeout(this.timer);
                this.timer = setTimeout(function () {
                    me.analyFloorId();
                }, 200)
            }
        },
        mounted() {
            if (!window.BBS) {
                window.BBS = {
                    TID: this.args.tid
                };
            }
            this.app = document.getElementById('app');
            window.addEventListener('scroll', this.onScroll, false);
        }
    };
</script>

<style lang="stylus">
    @import './elevator.styl';
</style>