<template>
    <div id="h5_preview" class="mask" :class="{isPreview : isPreview}">
        <div class="top">{{curIndex + 1}} / {{imgLen}}</div>
        <img src="./img/close-outline.svg" @click="isPreview = !isPreview" class="close">
        <div class="slider_wrap">
            <div class="slider_con" ref="sliderCon" v-show="isPreview">
                <div class="sli_item" v-for="item in preList" :style="{width: screenW + 'px'}">
                    <img :src="item.getAttribute('data-original')">
                </div>
            </div>
        </div>
        <span class="bottom" data-bn-ipg="m.bbs-ThreadDetail-LargePhoto" @click="openApp(artId,page)">用App查看高清原图</span>
    </div>
</template>

<script>
    import Listen from './Listen'
    import Slider from './Slider'
    import {openApp, _Platform} from '../../../../../utils/util'

    export default {
        name: 'h5-preview',
        data () {
            const {id} = this.$store.state.renderData.data.thread
            const {options} = this.$store.state.renderData
            return {
                imgList: [],
                imgLen: 0,
                isPreview: false,
                preLen: 5,
                curIndex: 0,
                preList: [],
                screenW: 0,
                sliderCon: null,
                sliderWrap: null,
                sliInstance: null,
                lisInstance: null,
                hasPreview: false,
                openApp,
                artId: parseInt(id),
                readAll: _Platform(options.ua)
            }
        },
        props: ['page'],
        components: {Listen, Slider},
        methods: {
            chaPreview (index) {
                let nStart = this.calStart(index)
                new Promise((resolve) => {
                    this.preList = this.imgList.slice(nStart, nStart + this.preLen)
                    this.sliderCon.style.width = this.preLen * this.screenW + 'px'
                    resolve()
                }).then(msg => {
                    const calIndex = this.calIndex(index)
                    const calX = -calIndex * this.screenW
                    this.sliInstance._state.staticData.scrollerStyle.transform = `translate(${calX}px,0) translateZ(0)`
                    this.sliInstance._state.staticData.scrollerStyle.transitionDuration = '0ms'
                    this.sliInstance._state.x = calX
                    this.sliInstance._state.cliIndex = index
                    this.sliInstance._state.nIndex = calIndex
                })
            },
            preview (imgList) {
                imgList.forEach((imgItem, index) => {
                    imgItem.addEventListener('click', (e) => {
                        if (e.target.className.match('fillimg')) {
                            e.target.src = e.target.getAttribute('data-original')
                            e.target.className = 'js_addImgSpan'
                        }
                        let nStart = this.calStart(index)
                        new Promise((resolve) => {
                            this.preList = this.imgList.slice(nStart, nStart + this.preLen)
                            this.curIndex = index
                            this.sliderCon.style.width = this.preLen * this.screenW + 'px'
                            resolve()
                        }).then(msg => {
                            this.isPreview = true
                            if (this.hasPreview) {
                                this.chaPreview(index)
                            } else {
                                this.sliInstance = new Slider(this.sliderWrap, {
                                    direction: 'x',
                                    cliIndex: index,
                                    nIndex: this.calIndex(index),
                                    imgLen: this.imgLen,
                                    preLen: this.preLen,
                                    screenW: this.screenW,
                                    callback: (type, nIndex) => {
                                        type === 'edge' ? this.chaPreview(nIndex) : this.curIndex = nIndex
                                    }
                                })
                                this.hasPreview = true
                            }
                        })
                    })
                })
            },
            calIndex (index) {
                let half = parseInt(this.preLen / 2)
                // imgLen < preLen
                if (this.imgLen <= this.preLen) {
                    return index
                }
                // imgLen > preLen
                if (index < half) {
                    return index
                } else if ((this.imgLen - 1 - index) < half) {
                    return index - (this.imgLen - this.preLen)
                } else {
                    return half
                }
            },
            calStart (index) {
                let start
                let half = parseInt(this.preLen / 2)
                // imgLen < preLen
                if (this.imgLen <= this.preLen) {
                    return 0
                }
                // imgLen > preLen
                if (index < half) {
                    start = 0
                } else if ((this.imgLen - 1 - index) < half) {
                    start = this.imgLen - this.preLen
                } else {
                    start = index - 2
                }
                return start
            }
        },
        computed: {
            haveOther () {
                return this.$store.state.project.topBar.haveOther
            },
            picStyle () {
                return this.$store.state.project.topBar.picStyle
            },
            opeUnFold () {
                return this.$store.state.project.opeUnFold
            }
        },
        watch: {
            picStyle: function (val, oldVal) {
                for (let i = 0; i < this.imgLen; i++) {
                    let dataId = this.imgList[i].getAttribute('data-id')
                    let imgItem = document.querySelector(`img[data-id="${dataId}"]`)
                    if (val) {
                        // 有图模式
                        imgItem.src = imgItem.markCurImg ? imgItem.markCurImg
                            : '//static.qyer.com/models/project/bbs/images/placeholderDetail.png'
                        imgItem.className = 'js_addImgSpan'
                    } else {
                        // 无图模式
                        imgItem.markCurImg = imgItem.src
                        imgItem.src = 'http://common2.qyerstatic.com/mbbs/old/images/new/showimg.png'
                        imgItem.className = 'js_addImgSpan fillimg'
                    }
                }
            },
            opeUnFold () {
                const cpList = document.querySelectorAll('img[data-type="photo"]')
                this.imgList = Array.prototype.slice.call(cpList)
                this.preview(this.imgList)
                // this.lisInstance._state.imgList = Array.prototype.slice.call(cpList);
            }
        },
        mounted () {
            const detailCon = document.getElementById('h5_detail')
            const cpList = document.querySelectorAll('img[data-type="photo"]')
            const videoList = document.querySelectorAll('span[data-type="video"]')
            this.imgList = Array.prototype.slice.call(cpList)
            this.imgLen = this.imgList.length
            this.screenW = window.innerWidth
            this.sliderCon = this.$refs.sliderCon
            this.sliderWrap = document.querySelector('.slider_wrap')
            const tid = this.$store.state.renderData.data.thread.id
            this.lisInstance = new Listen(detailCon, {
                imgList: cpList,
                videoList: videoList,
                innerWidth: window.innerWidth,
                tid,
                callback: (type) => {
                    if (type === 'hideToolBar') {
                        let opt = {page: 'fixedBar', data: 'static'}
                        this.$store.commit('SET_VALUE', opt)
                    } else if (type === 'showToolBar') {
                        let opt = {page: 'fixedBar', data: 'fixed'}
                        this.$store.commit('SET_VALUE', opt)
                    } else if (type === 'hideTop') {
                        let opt = {page: 'fixedBar', data: 'hideTop'}
                        this.$store.commit('SET_VALUE', opt)
                    } else if (type === 'getRec') {
                        let opt = {page: 'getRec', data: true}
                        this.$store.commit('SET_VALUE', opt)
                    }
                }
            })
            this.preview(this.imgList);


            const basePicW = this.screenW - 40;
            if (this.imgLen) {
                for (let i = 0; i < this.imgLen; i++) {
                    const item = this.imgList[i]
                    let oriW = item.getAttribute('width') || item.getAttribute('data-orgwidth');
                    let oriH = parseInt(item.getAttribute('height')) || 0;
                    if (oriW && oriW > basePicW) {
                        item.height = parseInt(basePicW * oriH / parseInt(oriW));
                        item.width = basePicW;
                    }
                }
            }
        }
    }
</script>


<style lang="stylus">
    @import "slider.styl"
</style>