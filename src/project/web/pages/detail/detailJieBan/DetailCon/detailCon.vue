<template>
    <div id="detail_con">
        <div class="detail_wrap">
            <div class="detail_inner">
                <FloorItem v-for="(item, index) in floorArray" :item="item" :index="index" :key="index"
                           :page="args.page-1" @emitContent="emitContent" :lzId="thread.uid"></FloorItem>
            </div>
        </div>
        <div id="_bbs_img_toolbar" ref="bbsImgTool">
            <span class="relation" v-show="userInfo.photo_admin" @click="showRelPlace = true">关联目的地</span>
            <span class="cover" v-show="userInfo.photo_admin" @click="setCover">设为封面</span>
            <span class="icomoon zan" @click="cliZan" v-show="showZan"></span>
            <a class="enlarge item" @click="toPhoto">enlarge</a>
        </div>
        <!--图片关联目的地-->
        <el-dialog
            title="图片关联目的地"
            :visible.sync="showRelPlace"
            width="620px">
            <div class="manage_con">
                <span class="left"
                      style="display: inline-block;width: 90px;text-align:center;margin-right: 10px;line-height: 90px;border: 1px solid #ededed;">
                    <!--<img :src="hoverImg.src" alt="">-->
                    暂无图片
                </span>
                <span class="right" style="display: inline-block;width: 400px;">
                    <div class="sub-title">图片关联至</div>
                    <el-autocomplete style="width: 100%;"
                                     popper-class="my-autocomplete"
                                     v-model="selRelName"
                                     :fetch-suggestions="querySearch"
                                     placeholder="请输入内容"
                                     @select="handleSelect">
                        <template slot-scope="props">
                            <span class="name" style="font-size: 12px;margin-right: 5px">
                              {{ props.item.cn_name }}
                            </span>
                            <span class="addr" style="font-size: 12px;margin-right: 5px">
                                {{ props.item.en_name }}
                            </span>
                            <span class="addr" style="font-size: 12px;color:#ccc">
                                {{ props.item.last}}
                            </span>
                      </template>
                    </el-autocomplete>
                </span>
            </div>
            <span slot="footer" class="dialog-footer">
                <span class="two_btn confirm" @click="doRelPlace">保存设置</span>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import Listen from "./Listen";
    import {
        _getQueryString
    } from "../../../../../utils/util";
    import FloorItem from "./FloorItem.vue";
    import ajax from '../../../../../utils/ajax'
    import ListenFloor from './ListenFloor'
    import {toAppointPoi} from '../../../../utils/util'
    import {Message, Autocomplete, Dialog} from 'element-ui'
    import Vue from 'vue'

    Vue.prototype.$message = Message;

    export default {
        name: "pc-detailYouJi-con",
        data() {
            const {args, list, thread} = this.$store.state.renderData.data;
            return {
                showRelPlace: false,
                selRelName: '',
                thread,
                totHeight: 0,
                zkNum: 0,
                detailInner: null,
                detailWrap: null,
                floorArray: list,
                timer: null,
                args,
                imgList: [],
                imgLen: 0,
                screenWid: 0,
                sliInstance: null,
                bbsImgTool: null,
                hoverImg: {},
                selRelPlace: {},
                showZan: true
                //hasZan: false
            };
        },
        components: {
            Listen,
            FloorItem,
            [Dialog.name]: Dialog,
            [Autocomplete.name]: Autocomplete
        },
        computed: {
            picStyle() {
                return this.$store.state.project.topBar.picStyle;
            },
            listWrap() {
                return this.$store.state.project.listWrap;
            },
            needToGet() {
                return this.$store.state.project.needToGet;
            },
            userInfo() {
                return this.$store.state.project.userInfo;
            }
        },
        watch: {
            needToGet(data) {
                this.getContent(data.pid, data.anchor);
            },
            listWrap: {
                handler: function (data) {
                    this.floorArray = JSON.parse(JSON.stringify(data.list));
                },
                deep: true
            },
            picStyle: function (val) {
                if (!val) {
                    this.bbsImgTool.style.display = 'none';
                }
                this.isNOPic(val);
            }
        },
        methods: {
            doRelPlace() {
                ajax({
                    url: '/qcross/pictrip/detail.php?action=editPhotoPlace',
                    method: 'POST',
                    data: {
                        fid: this.thread.fid,
                        pid: this.hoverImg.pid,
                        'photo[0][photoid]': this.hoverImg.id,
                        'photo[0][type]': 4,
                        'photo[0][placeid]': this.selRelPlace.id,
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.showRelPlace = false;
                        this.selRelPlace = {};
                        this.selRelName = '';
                        this.$message({message: '关联目的地成功！', type: 'success'});
                    } else {
                        this.$message({message: msg.data.msg, type: 'error'});
                    }
                });
            },
            handleSelect(item) {
                this.selRelPlace = item;
                this.selRelName = `${item.cn_name}${item.en_name}${item.last}`;
            },
            querySearch(queryString, cb) {
                if (queryString) {
                    ajax({
                        url: '/qcross/place/poi.php?action=poisearch',
                        method: 'POST',
                        data: {
                            keyword: queryString
                        }
                    }).then(msg => {
                        if (!msg.error_code) {
                            let results = msg.data || [];
                            cb(results);
                        }
                    });
                }
            },
            setCover() {
                ajax({
                    url: '/qcross/bbs/thread.php?action=editAdminCover',
                    method: 'POST',
                    data: {
                        photoid: this.hoverImg.id,
                        tid: this.thread.id,
                        fid: this.thread.fid
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.$message({message: '修改封面成功！', type: 'success'});
                    } else {
                        this.$message({message: msg.data.msg, type: 'error'});
                    }
                });
            },
            cliZan() {
                ajax({
                    url: '/qcross/pictrip/detail.php?action=like',
                    method: 'POST',
                    data: {
                        photoid: this.hoverImg.id,
                        opt: 1,
                        type: 1
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.$message({message: '点赞成功！', type: 'success'});
                        //this.hasZan = true;
                    } else {
                        this.$message({message: msg.data.msg, type: 'error'});
                    }
                });
            },
            toPhoto() {
                window.open(`//photo.qyer.com/${this.hoverImg.id}/allphoto`);
            },
            isNOPic(data) {
                const val = data ? data : this.$store.state.project.topBar.picStyle;
                this.imgList.forEach((imgItem, index) => {
                    if (val) {
                        imgItem.src = imgItem.getAttribute('data-original');
                        imgItem.className = "js_addImgSpan";
                    } else {
                        // 无图模式
                        imgItem.markCurImg = imgItem.src;
                        imgItem.src =
                            "http://common2.qyerstatic.com/mbbs/old/images/new/showimg.png";
                        imgItem.className = "js_addImgSpan fillimg";
                    }
                });
            },
            emitContent(obj) {
                this.setContent(obj.msg, obj.pid);
            },
            getContent(pid, anchor) {
                ajax({
                    url: `/detail/content/p/${encodeURIComponent(pid.join())}.json`,
                    data: {
                        //action: 'content',
                        ajaxID: '5aa7a6618776329315f6d14c',
                        //pid: pid.join(),
                        time_sta: new Date() * 1,
                    }
                }).then(msg => {
                    this.setContent(msg, pid);
                    setTimeout(() => {
                        toAppointPoi(pid[0], anchor, this);
                    }, 200)
                });
            },
            setContent(msg, pid) {
                if (!msg.error_code) {
                    this.$store.commit('SET_CON_VALUE', {data: msg.data, markArray: pid});
                    setTimeout(() => {
                        this.reGetImg(pid);
                    }, 500);
                } else {
                    this.$store.commit('SET_CON_VALUE', {data: msg.data, markArray: pid});
                }
            },
            insertAfter(newElement, targetElement) {
                let parent = targetElement.parentNode;
                if (parent.lastChild == targetElement) {
                    parent.appendChild(newElement);
                } else {
                    parent.insertBefore(newElement, targetElement.nextSibling);
                }
            },
            preview(imgList, pid) {
                imgList.forEach((imgItem, index) => {
                    const place = JSON.parse(imgItem.getAttribute('data-info')).place;
                    if (place) {
                        let html = document.createElement('div');
                        html.className = 'bind_place';
                        html.innerHTML = `<i class="icomoon"></i><a class='x-image-dest' href="${place.url}" target='_blank' style='border:none;' data-bn-ipg='bbs-thread-placeLink${place.id}'>${place.name}</a>`;
                        this.insertAfter(html, imgItem);
                        //imgItem.parentNode.insertBefore(html,imgItem);
                    }
                    imgItem.addEventListener("click", e => {
                        if (e.target.className.match("fillimg")) {
                            e.target.src = null;
                            e.target.src = e.target.getAttribute("data-original")//.replace('test1362383214.qiniudn.com', 'pic.qyer.com');
                            e.target.className = "js_addImgSpan gradient_img";
                        } else {
                            const dataid = e.target.getAttribute("data-id");
                            window.open(`//photo.qyer.com/${dataid}/allphoto`);
                        }
                    });
                    imgItem.addEventListener("mousemove", e => {
                        if (!e.target.className.match("fillimg")) {
                            if (this.userInfo.uid) {
                                for (let i = 0; i < this.floorArray.length; i++) {
                                    let item = this.floorArray[i];
                                    if (pid === item.id) {
                                        if (parseInt(item.user.uid) === this.userInfo.uid) {
                                            this.showZan = false;
                                            break;
                                        }
                                    } else if (i === this.floorArray.length - 1) {
                                        this.showZan = true;
                                    }
                                }
                            }
                            this.hoverImg = {
                                pid,
                                src: e.target.getAttribute("data-original"),
                                id: e.target.getAttribute("data-id")
                            };
                            let imgToolWidth;
                            if (this.userInfo.uid) {
                                if (this.userInfo.photo_admin) {
                                    imgToolWidth = this.showZan ? 220 : 188;
                                } else {
                                    imgToolWidth = this.showZan ? 80 : 48;
                                }
                            } else {
                                imgToolWidth = 80;
                            }
                            if (pid === this.listWrap.list[0].id) {
                                imgToolWidth += 55;
                            }
                            this.bbsImgTool.style.display = 'block';
                            this.bbsImgTool.style.top = (e.target.offsetTop + e.target.clientHeight - 40) + 'px';
                            this.bbsImgTool.style.left = (e.target.offsetLeft + e.target.clientWidth - imgToolWidth) + 'px';
                        }
                        //this.hasZan = false;
                    }, false);
                    /*imgItem.addEventListener("mouseleave", e => {
                        console.log('mouseleave');
                        this.bbsImgTool.style.display = 'none';
                    }, false);*/
                });
            },
            doReply(pid) {
                let opt = {
                    page: "replyInfo",
                    data: {
                        isReply: true,
                        pid
                    }
                };
                this.$store.commit("SET_VALUE", opt);
            },
            segImgDefWidth(imgList) {
                for (let i = 0; i < imgList.length; i++) {
                    const item = imgList[i];
                    let oriW =
                        parseInt(item.getAttribute("width")) ||
                        parseInt(item.getAttribute("data-orgwidth"));
                    let oriH = parseInt(item.getAttribute("height")) || 0;
                    if (oriW && oriW > 750) {
                        item.height = parseInt(750 * oriH / parseInt(oriW));
                        item.width = 750;
                    } else {
                        item.width = oriW;
                    }
                }
            },
            startLisFloor(detailCon) {
                let floorIdArray = [];
                this.listWrap.list.forEach(item => {
                    floorIdArray.push(item.id);
                });
                if (!this.args.sync) {
                    new ListenFloor(detailCon, {
                        floorIdArray: floorIdArray,
                        thisVue: this,
                        callback: (msg, pid) => {
                            this.setContent(msg, pid);
                        }
                    });
                }
            },
            getTogether() {
                if (this.thread.type === '3') {
                    ajax({
                        url: `/detail/together/p/${this.floorArray[0].id}.json`,
                        data: {
                            //action: 'together',
                            ajaxID: '5ab9f4de8776329315f6d191',
                            //pid: this.floorArray[0].id
                        },
                        useErcode: false
                    }).then(data => {
                            this.$store.commit('SET_VALUE', {
                                page: 'together',
                                data: data.together
                            });
                        }
                    );
                }
            },
            reGetImg(pid) {
                pid.forEach(item => {
                    const newId = document.getElementById(`item-post-${item}`);
                    const newImgList = Array.prototype.slice.call(newId.querySelectorAll('img[data-type="photo"]'));
                    const newVideoList = Array.prototype.slice.call(newId.querySelectorAll('span[data-type="video"]'));
                    const oldImgList = this.sliInstance._state.imgList;
                    const oldVideoList = this.sliInstance._state.videoList;
                    this.sliInstance._state.imgList = oldImgList.concat(newImgList);
                    this.sliInstance._state.videoList = oldVideoList.concat(newVideoList);
                    this.imgList = this.imgList.concat(newImgList);
                    this.preview(newImgList, item);
                    this.segImgDefWidth(newImgList);
                });
                this.isNOPic();
            },
        },
        mounted() {

            // 同步renderData
            this.$store.commit("SET_VALUE", {
                page: 'listWrap',
                attr: 'list',
                data: this.floorArray,
            });


            const onlyLZ = _getQueryString("authorid");
            if (onlyLZ) {
                let opt = {
                    page: "topBar",
                    attr: "haveOther",
                    data: false
                };
                this.$store.commit("SET_VALUE", opt);
            }

            const detailCon = document.getElementById("pc_detail");

            const cpList = document.querySelectorAll('img[data-type="photo"]');
            const videoList = document.querySelectorAll('span[data-type="video"]');
            this.imgList = Array.prototype.slice.call(cpList);
            this.imgLen = this.imgList.length;
            this.screenWid = window.innerWidth;
            this.bbsImgTool = this.$refs.bbsImgTool;
            const tid = this.thread.id;

            this.startLisFloor(detailCon);
            this.getTogether();

            this.sliInstance = new Listen(detailCon, {
                imgList: cpList,
                videoList: videoList,
                innerWidth: window.innerWidth,
                tid,
                callback: type => {
                    if (type === "canceldock") {
                        let opt = {
                            page: "fixedBar",
                            data: "static"
                        };
                        this.$store.commit("SET_VALUE", opt);
                    } else if (type === "topdock") {
                        let opt = {
                            page: "fixedBar",
                            data: "fixtop"
                        };
                        this.$store.commit("SET_VALUE", opt);
                    } else if (type === "botdock") {
                        let opt = {
                            page: "fixedBar",
                            data: "fixbot"
                        };
                        this.$store.commit("SET_VALUE", opt);
                    }
                }
            });

            const hash = location.hash;
            if (hash.indexOf('#post') > -1) {
                toAppointPoi(parseInt(hash.split('-')[1]), hash.split('#')[1], this);
            }

        }
    }
    ;
</script>

<style lang="stylus">
    @import 'detailCon.styl';
</style>