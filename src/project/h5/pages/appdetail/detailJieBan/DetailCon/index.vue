<template>
    <div id="detail_con">
        <div class="detail_wrap">
            <div class="detail_inner">
                <FloorItem v-for="(item, index) in conArray" :item="item" :index="index" :key="index"
                           :lzId="lzId" :page="page" :together="index === 0 ? together : null"></FloorItem>
                <div class="next_page" v-if="page < pages" @click="nextPage">下一页</div>
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
        name: 'h5-detailTog-con',
        data () {
            const {list} = this.$store.state.renderData.data.posts
            const {uid, together} = this.$store.state.renderData.data.thread
            const {page, pages} = this.$store.state.renderData.data
            return {
                page,
                pages,
                conArray: list,
                totHeight: 0,
                zkNum: 0,
                lzId: uid,
                detailInner: null,
                detailWrap: null,
                together
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
        methods: {
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