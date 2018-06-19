<template>
    <div id="h5_elevator" :class="{show_ele:showEle}" ref="h5Elevator">
        <div id="navigation_scroller">
            <div class="grey_line"></div>
            <div :class="{ part: item.level == 1, unit: item.level == 2 }"
                 v-if="item.title" v-for="(item, index) in elevator"
                 @click="doAnchor(item)"
                 v-html="item.title">
            </div>
        </div>
    </div>
</template>

<script>
    import IScroll from 'frame_h5/components/IScroll'
    import {toAnchor} from '../../../../../utils/hybrid'
    export default {
        name: 'app-elevator',
        data () {
            const {elevator = []} = this.$store.state.renderData.data;
            return {
                showEle: false,
                elevator,
                screenH: 0
            }
        },
        methods: {
            doAnchor(item){
                const jumpId = item.url.match(/anchor=(.*)&?.*/)[1];
                new Promise(resolve=>{
                    window.elevatorOpt();
                    resolve();
                }).then(()=>{
                    window.BBS.toAnchor(item.pid, jumpId);
                });
            }
        },
        mounted () {
            const me = this
            const {options} = this.$store.state.renderData
            let userAgent = 0;
            if (options.ua.indexOf(('QYER/')) > -1) {
                userAgent = options.ua.split('QYER/')[1].split('.')
            }
            this.screenH = window.innerHeight;
            this.$refs.h5Elevator.style.height = this.screenH + 'px';
            // app 兼容处理
            if (!window.BBS) {
                window.BBS = {
                    TID: this.$store.state.renderData.data.thread.id
                }
            }
            toAnchor();
            if (userAgent[0] >= 7 && userAgent[1] >= 12 || userAgent[0] > 7) {

            } else if (this.elevator.length > 0) {
                // 电梯
                window.elevatorOpt = function () {
                    me.showEle = !me.showEle;
                };
                new IScroll(this.$refs.h5Elevator, {direction: 'y'})
            }


        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>