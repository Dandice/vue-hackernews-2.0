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
                <div class="next_page" v-if="page < pages" @click="nextPage">下一页</div>
                <Slider :page="page"></Slider>
            </div>
        </div>
        <div class="unfold" @click="unfold" v-show="!readAll" :data-bn-ipg="`m.bbs-ThreadDetail-ReadMore-${zkNum}`">
            <div>展开继续阅读</div>
            <img src="./img/down_arrow.svg">
        </div>
    </div>
</template>

<script>
    import Slider from './slider.vue'
    import {_Platform, _getQueryString, _ChaPage, jsENV} from '../../../../../utils/util'
    import FloorItem from './FloorItem.vue'

    export default {
        name: 'h5-detailYouJi-con',
        data() {
            const {list} = this.$store.state.renderData.data.posts
            const {uid} = this.$store.state.renderData.data.thread
            const {page, pages} = this.$store.state.renderData.data
            delete this.$store.state.msgList
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
            picStyle() {
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
            getData(index) {
                if (jsENV === 'node') {
                    //let result = this.$store.state.renderData.data.posts.list[index].content.replace(/<b>/g, '')
                    let result = this.$store.state.renderData.data.posts.list[index].content;
                    result = result ? result.replace(/<b>/g, '') : result;
                    if ((index + 1) == this.dataLen) {
                        for (let i = 0; i < this.dataLen; i++) {
                            delete this.$store.state.renderData.data.posts.list[i].content
                        }
                        delete this.$store.state.renderData.data.elevator
                        // delete this.$store.state.renderData.options.hot_forums
                    }
                    return result
                } else {
                    return document.getElementById(`item-con-${index}`).innerHTML
                }
            },
            unfold() {
                const totHeight = document.querySelector('.detail_inner').clientHeight
                if (totHeight - this.detailWrap.clientHeight < 4000) {
                    this.readAll = true
                    this.detailWrap.style.height = 'auto'
                } else {
                    this.zkNum += 1
                    this.detailWrap.style.height = this.detailWrap.clientHeight + 2000 + 'px'
                }
                const {opeUnFold} = this.$store.state.project
                let opt = {page: 'opeUnFold', data: !opeUnFold}
                this.$store.commit('SET_VALUE', opt)
            },
            nextPage() {
                _ChaPage(this.page + 1)
            },
            doReply(pid) {
                let opt = {page: 'replyInfo', data: {isReply: true, pid}}
                this.$store.commit('SET_VALUE', opt)
            }
        },
        mounted() {
            const onlyLZ = _getQueryString('authorid')
            if (onlyLZ) {
                let opt = {page: 'topBar', attr: 'haveOther', data: false}
                this.$store.commit('SET_VALUE', opt)
            }
            // 判断是否要截断

            const {options} = this.$store.state.renderData
            this.readAll = _Platform(options.ua) || location.href.indexOf('item-post') > -1
            if (!this.readAll) {
                this.detailInner = document.querySelector('.detail_inner')
                this.detailWrap = document.querySelector('.detail_wrap')
                this.totHeight = this.detailInner.clientHeight
                if (this.totHeight > 500) {
                    this.detailWrap.style.height = '500px'
                } else {
                    this.readAll = true
                }
            } else if (location.href.split('#')[1]) {
                const hash = document.getElementById(`${location.href.split('#')[1]}`);
                if (hash) {
                    const targetTop = hash.offsetTop - 50;
                    // 处理锚点兼容性问题
                    setTimeout(() => {
                        document.body.scrollTop = targetTop;
                        document.documentElement.scrollTop = targetTop;
                    }, 200);
                }
            }
        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>