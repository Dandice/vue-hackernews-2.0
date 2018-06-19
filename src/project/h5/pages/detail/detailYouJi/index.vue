<template>
    <div id="h5_detail">
        <!--头部信息-->
        <topBar></topBar>
        <!--行程单-->
        <HodoMeter></HodoMeter>
        <!--内容-->
        <DetailCon></DetailCon>
        <!--相关推荐-->
        <Recommend></Recommend>
        <div class="open_in_app" data-bn-ipg="m.bbs-ThreadDetail-ToolBar-OpenApp" ref="openApp" @click="toApp">
            App内打开
        </div>
        <!--底部回复等-->
        <BotFixed></BotFixed>
    </div>
</template>

<script>
    import topBar from '../common/TopBar/index.vue'
    import DetailCon from './DetailCon/index.vue'
    import BotFixed from '../common/BotFixed/index.vue'
    import Recommend from './Recommend/index.vue'
    import HodoMeter from '../common/HodoMeter/index.vue'
    import {loadGA, openApp, _Platform} from '../../../../utils/util'
    import {weixinShareConfig} from 'common/utils/weixin.js'

    export default {
        name: 'h5-detailYouJi',
        data () {
            const {options} = this.$store.state.renderData
            return {
                readAll: _Platform(options.ua)
            }
        },
        computed: {
            fixedBar () {
                return this.$store.state.project.fixedBar
            }
        },
        watch: {
            fixedBar (val) {
                if (val === 'fixed' || val === 'hideTop' || !this.readAll) {
                    this.$refs.openApp.className = 'open_in_app popup'
                } else {
                    this.$refs.openApp.className = 'open_in_app popupmini'
                }
            }
        },
        components: {
            topBar,
            HodoMeter,
            DetailCon,
            BotFixed,
            Recommend
        },
        methods: {
            toApp () {
                const {id} = this.$store.state.renderData.data.thread
                const {page} = this.$store.state.renderData.data
                openApp(id, page)
            }
        },
        mounted () {
            loadGA()
            weixinShareConfig({
                imgUrl: this.$store.state.renderData.data.sharePic,
                title: this.$store.state.renderData.options.meta.title,
                desc: this.$store.state.renderData.options.meta.seo_description
            })

            //const vConsole = require('../../../../utils/vconsole');
            if (sessionStorage.getItem('picStyle') === 'false') {
                let opt = {page: 'topBar', attr: 'picStyle', data: false}
                this.$store.commit('SET_VALUE', opt)
            }
        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>