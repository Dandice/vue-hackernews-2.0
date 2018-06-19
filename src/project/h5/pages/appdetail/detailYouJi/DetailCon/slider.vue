<template>
</template>

<script>
    import Listen from './Listen'
    import Slider from './Slider'
    import {_getCkVal} from '../../../../../utils/util'

    export default {
        name: 'h5-preview',
        data () {
            const {id} = this.$store.state.renderData.data.thread
            return {
                imgList: [],
                imgLen: 0,
                curIndex: 0,
                lisInstance: null,
                screenW: 0,
                artId: parseInt(id),
            }
        },
        props: ['page'],
        components: {Listen, Slider},
        methods: {
            preview(imgList){
                imgList.forEach((imgItem) => {
                    imgItem.addEventListener('click', (e) => {
                        const tar = e.target;
                        let url = tar.getAttribute('data-original');
                        if (tar.parentNode.tagName === 'A') {
                            // 这块的图片预览原生捕获
                            return;
                        } else {
                            /*new Promise((resolve) => {
                                tar.parentNode.href = url;
                                resolve();
                            }).then(() => {
                                location.href = url;
                            });*/
                            location.href = url;
                        }
                    });
                });
            },
            setTids(tid) {
                let tids = _getCkVal('qyer_tids');
                !this.hasTid(tid) && tids.push(tid);
                const exp = new Date();
                exp.setTime(exp.getTime() + 24 * 3600 * 1000);
                document.cookie = `qyer_tids=${tids.join(',')}; expires=${exp.toGMTString()}`;
            },
            removeTids(tid) {
                let tids = _getCkVal('qyer_tids');
                let idx = -1;
                for (let i = 0; i < tids.length; i++) {
                    if (tids[i] == tid) {
                        idx = i;
                    }
                }
                tids.splice(idx, 1);
                document.cookie = `qyer_tids=${tids.join(',')}; expires: 1}`;
            },
            hasTid(tid) {
                const tids = _getCkVal('qyer_tids');
                let flag = false;
                for (let i = 0; i < tids.length; i++) {
                    if (tid == tids[i]) {
                        flag = true;
                        break;
                    }
                }
                return flag;
            }
        },
        computed: {
            haveOther () {
                return this.$store.state.project.topBar.haveOther
            },
            picStyle () {
                return this.$store.state.project.topBar.picStyle
            }
        },
        watch: {
            picStyle: function (val, oldVal) {
                for (let i = 0; i < this.imgLen; i++) {
                    let dataId = this.imgList[i].getAttribute('data-id')
                    //let imgItem = document.querySelector(`img[data-id="${dataId}"]`)
                    let imgItem = this.imgList[i]
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
            }
        },
        mounted () {
            const me = this
            const detailCon = document.getElementById('h5_detail')
            const cpList = document.querySelectorAll('img[data-original]')
            const videoList = document.querySelectorAll('span[data-type="video"]')
            this.imgList = Array.prototype.slice.call(cpList)
            this.imgLen = this.imgList.length
            this.screenW = window.innerWidth - 40
            const tid = this.$store.state.renderData.data.thread.id
            this.preview(this.imgList);
            this.lisInstance = new Listen(detailCon, {
                imgList: cpList,
                videoList: videoList,
                innerWidth: window.innerWidth,
                tid,
                callback: (type) => {
                    if (type === 'getRec') {
                        let opt = {page: 'getRec', data: true}
                        this.$store.commit('SET_VALUE', opt)
                    }
                }
            });
            if (this.imgLen) {
                for (let i = 0; i < this.imgLen; i++) {
                    const item = this.imgList[i]
                    let oriW = parseInt(item.getAttribute('width')) || parseInt(item.getAttribute('data-orgwidth'));
                    let oriH = parseInt(item.getAttribute('height')) || 0;
                    if (oriW && oriW > this.screenW) {
                        item.height = parseInt(this.screenW * oriH / parseInt(oriW));
                        item.width = this.screenW;
                    }
                }
            }

            window.bbsDetailPhotoOpt = () => {
                const picStyle = me.$store.state.project.topBar.picStyle
                picStyle ? this.setTids(this.artId) : this.removeTids(this.artId)
                let opt = {page: 'topBar', attr: 'picStyle', data: !picStyle}
                me.$store.commit('SET_VALUE', opt)
                //localStorage.setItem(`${this.artId}pic`, !picStyle)
            }
            // 查询图片的展示方式`
            if (this.hasTid(this.artId)) {
                let opt = {page: 'topBar', attr: 'picStyle', data: false}
                this.$store.commit('SET_VALUE', opt)
            }
            /*if (localStorage.getItem(`${this.artId}pic`) === 'false') {
             let opt = {page: 'topBar', attr: 'picStyle', data: false}
             this.$store.commit('SET_VALUE', opt)
             }*/
        }
    }
</script>


<style lang="stylus">
    @import "slider.styl"
</style>