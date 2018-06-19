<template>
    <div id="detail_con">
        <div class="detail_wrap">
            <div class="detail_inner">
                <!--上面的renderData优化可以减少约40%的首包体积，修改需慎重,wpp-->
                <FloorItem v-for="(item, index) in dataLen" :index="index"
                           :postNode="getData(index)" :key="index"
                           :lzId="lzId" :page="page" :dataLen="dataLen" :item="conArray[index]"></FloorItem>
                <!--<FloorItem v-for="(item, index) in conArray" :item="item" :index="index"
                           :lzId="lzId" :page="page" :dataLen="dataLen"></FloorItem>-->
                <Slider :page="page"></Slider>
            </div>
        </div>
    </div>
</template>

<script>
    import Slider from './slider.vue'
    import {_getQueryString, _ChaPage, jsENV} from '../../../../../utils/util'
    import FloorItem from './FloorItem.vue'
    export default {
        name: 'h5-detailYouJi-con',
        data () {
            const {list} = this.$store.state.renderData.data.posts
            const {uid} = this.$store.state.renderData.data.thread
            const {page, pages} = this.$store.state.renderData.data
            if (jsENV === 'node') {
                const dataLen = this.$store.state.renderData.data.posts.list.length
                this.$store.state.renderData.data.dataLen = dataLen
            }
            return {
                page,
                pages,
                conArray: list,
                totHeight: 0,
                zkNum: 0,
                readAll: true,
                dataLen: this.$store.state.renderData.data.dataLen,
                lzId: uid,
                detailInner: null,
                detailWrap: null
            }
        },
        components: {
            Slider,
            FloorItem
        },
        computed: {
            picStyle () {
                return this.$store.state.project.topBar.picStyle
            }
        },
        watch: {
            picStyle: function (val, oldVal) {
                if (!this.readAll) {
                    this.totHeight = this.detailInner.clientHeight
                    if (this.detailWrap.clientHeight >= this.totHeight) {
                        this.readAll = true
                        this.detailInner.style.height = 'auto'
                    }
                }
            }
        },
        methods: {
            getData (index) {
                if (jsENV === 'node') {
                    let result = this.$store.state.renderData.data.posts.list[index].content;
                    result = result ? result.replace(/<b>/g, '') : result;
                    if ((index + 1) == this.dataLen) {
                        for (let i = 0; i < this.dataLen; i++) {
                            delete this.$store.state.renderData.data.posts.list[i].content
                        }
                        delete this.$store.state.msgList
                    }
                    return result
                } else {
                    return document.getElementById(`item-con-${index}`).innerHTML
                }
            },
            nextPage () {
                _ChaPage(this.page + 1)
            },
            doReply (pid) {
                let opt = {page: 'replyInfo', data: {isReply: true, pid}}
                this.$store.commit('SET_VALUE', opt)
            }
        },
        mounted () {
            const onlyLZ = _getQueryString('authorid')
            if (onlyLZ) {
                let opt = {page: 'topBar', attr: 'haveOther', data: false}
                this.$store.commit('SET_VALUE', opt)
            }
        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>