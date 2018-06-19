<template>
    <div id="detail_con">
        <div class="detail_wrap">
            <div class="detail_inner">
                <FloorItem v-for="(item, index) in floorArray" :postNode="getData(index)"
                           :item="item" :index="index" :key="index"
                           :page="args.page-1" @emitContent="emitContent" :lzId="thread.uid"></FloorItem>
            </div>
        </div>
        <!--图片点赞-->
        <div id="_bbs_img_toolbar" ref="bbsImgTool" @mouseleave="toolBarLeave">
            <span class="relation" v-show="userInfo.photo_admin" @click="showRelPlace = true">关联目的地</span>
            <span class="cover" v-show="userInfo.photo_admin" @click="setCover">设为封面</span>
            <span class="icomoon zan" @click="cliZan" v-show="showZan"></span>
            <a class="enlarge item" @click="toPhoto">enlarge</a>
        </div>

        <!--酒店-->
        <div class="discount flex_bet"
             @mouseenter="isInMouse = true"
             @mouseleave="notInMouse"
             @click="toZheKou(bbsHtObj)"
             :style="bbsLmStyle" v-if="bbsHtObj">
            <div class="sharp discount_sharp1" :style="{left: sharpLeft}"></div>
            <div class="sharp discount_sharp2" :style="{left: sharpLeft}"></div>
            <div class="discount_con dis_hotel">
                <div class="flex_start">
                    <img :src="bbsHtObj.pic" style="width: 159px; height: 107px">
                    <div class="top_right">
                        <div class="ht_name">
                            {{bbsHtObj.en_name || bbsHtObj.cn_name}}
                        </div>
                        <div class="score" style="color: #0073b6;">
                            评分
                            <span class="grade">{{bbsHtObj.grade}}</span>
                        </div>
                    </div>
                </div>
                <div class="flex_bet" style="marginTop: 20px">
                    <div class="left">
                        <span style="color: #636363">参考价</span>
                        <span class="price" v-html="bbsHtObj.price"></span>
                    </div>
                    <div class="right btn">
                        查看实时价格
                    </div>
                </div>
            </div>
        </div>

        <!--折扣-->
        <div class="discount flex_bet"
             @mouseenter="isInMouse = true"
             @mouseleave="notInMouse"
             :style="bbsLmStyle" v-if="bbsLmArray.length">
            <div class="sharp discount_sharp1" :style="{left: sharpLeft}"></div>
            <div class="sharp discount_sharp2" :style="{left: sharpLeft}"></div>
            <div class="discount_con flex_bet">
                <div class="discount_con_1 flex_bet"
                     @click="toZheKou(bbsLmArray[0])"
                     :style="{width: bbsLmArray.length == 1 ? '100%' : '49%'}"
                     v-show="bbsLmArray[0]">
                    <div class="pic" :style="{width: bbsLmArray.length == 1 ? '90px' : '50px'}">
                        <img :src="bbsLmArray[0].picture">
                        <i class="flag">销量冠军</i>
                    </div>
                    <div class="discount_con_right">
                        <div class="title">
                            {{bbsLmArray[0].title}}
                        </div>
                        <div class="bottom">
                            <span v-html="bbsLmArray[0].price"></span>
                            <span class="cur">元</span>
                        </div>
                    </div>
                </div>
                <div class="discount_con_2" v-show="bbsLmArray[1]">
                    <div class="flex_bet"
                         @click="toZheKou(bbsLmArray[i])"
                         :style="{borderTop: i == 2 ? '1px solid #f5f5f5' : ''}"
                         v-for="i in 2">
                        <div class="title">
                            {{bbsLmArray[i] && bbsLmArray[i].title}}
                        </div>
                        <div class="bottom">
                            <span v-html="bbsLmArray[i] && bbsLmArray[i].price"></span>
                            <span class="cur">元</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--管理员警告、屏蔽、删除-->
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
    import {commonLazyLoad} from "./lazyLoad";
    import {_getQueryString} from "../../../../../utils/util";
    import FloorItem from "./FloorItem.vue";
    import ajax from '../../../../../utils/ajax'
    import ListenFloor from './ListenFloor'
    import {toAppointPoi} from '../../../../utils/util'
    import {Message, Autocomplete, Dialog} from 'element-ui'
    import {jsENV} from '../../../../../utils/util'
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
                videoList: [],
                screenWid: 0,
                sliInstance: null,
                bbsImgTool: null,
                hoverImg: {},
                selRelPlace: {},
                showZan: true,
                bbsLmLabel: null,
                bbsLmArray: [],
                bbsHtObj: null,
                bbsLmStyle: {},
                bbsHotelLabel: null,
                sharpLeft: '5px',
                isInMouse: false
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
                    //this.floorArray = data.list;
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
            toZheKou(item) {
                item && item.url && window.open(item.url);
            },
            toolBarLeave() {
                this.bbsImgTool.style.display = 'none';
            },
            getData(index) {
                if (jsENV === 'node') {
                    let result = this.$store.state.renderData.data.list[index].content;
                    if (result) {
                        result = result.replace(/<b>/g, '');
                        if ((index + 1) == this.floorArray.length) {
                            for (let i = 0; i < this.floorArray.length; i++) {
                                delete this.$store.state.renderData.data.list[i].content
                            }
                        }
                        return result
                    }
                } else {
                    const itemCon = document.getElementById(`item-con-${index}`);
                    return itemCon && itemCon.innerHTML
                }
            },
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
                const val = this.$store.state.project.topBar.picStyle;
                if (data === 'reget' && val) {
                    commonLazyLoad(this.sliInstance._state.imgList, this.sliInstance._state.videoList, this.thread.id);
                    return;
                }
                this.imgList.forEach((imgItem, index) => {
                    if (val) {
                        let getSrc = imgItem.src;
                        if (imgItem.markCurImg && imgItem.markCurImg.indexOf('/showimg') > -1) {
                            getSrc = '//static.qyer.com/models/project/bbs/images/placeholderDetail.png';
                        } else {
                            getSrc = imgItem.markCurImg;
                        }
                        imgItem.src = getSrc;
                        imgItem.onload = () => {
                            imgItem.className = "js_addImgSpan gradient_img";
                        }
                    } else {
                        // 无图模式
                        imgItem.markCurImg = imgItem.src;
                        imgItem.src =
                            "http://common2.qyerstatic.com/mbbs/old/images/new/showimg.png";
                        imgItem.onload = () => {
                            imgItem.className = "js_addImgSpan fillimg";
                        }
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
                        ajaxID: '5aa7a6618776329315f6d14c',
                        time_sta: new Date() * 1,
                    }
                }).then(msg => {
                    this.setContent(msg, pid);
                    if (!msg.error_code) {
                        setTimeout(() => {
                            toAppointPoi(pid[0], anchor, this);
                        }, 200)
                    }
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
                    const place = JSON.parse(imgItem.getAttribute('data-info')||'{}').place;
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
                            e.target.onload = () => {
                                e.target.className = "js_addImgSpan gradient_img";
                            }
                        } else {
                            const dataid = e.target.getAttribute("data-id");
                            window.open(`//photo.qyer.com/${dataid}/allphoto`);
                        }
                    });
                    imgItem.addEventListener("mouseenter", e => {
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
                            this.bbsImgTool.style.display = 'block';
                            this.bbsImgTool.style.top = (e.target.offsetTop + e.target.clientHeight - 32) + 'px';
                            this.bbsImgTool.style.left = (e.target.offsetLeft + e.target.clientWidth - imgToolWidth + 12) + 'px';
                        }
                    }, false);
                    imgItem.addEventListener("mouseleave", e => {
                        const {left, top} = this.bbsImgTool.style;
                        const {pageX, pageY} = e;
                        const {clientHeight, clientWidth} = this.bbsImgTool;
                        if ((pageX - clientWidth) > parseInt(left) || (pageY - clientHeight) > parseInt(top)) {
                            this.bbsImgTool.style.display = 'none';
                        }
                    }, false);
                });
            },
            getPopupStyle(e, type) {
                let {top, x} = e.target.getBoundingClientRect();
                if (x < 300) {
                    this.sharpLeft = '5px';
                } else if (x < 500) {
                    this.sharpLeft = '318px';
                    x -= 318;
                } else {
                    this.sharpLeft = '620px';
                    x -= 610;
                }
                this.bbsLmStyle = {
                    visibility: 'visible',
                    left: x + 'px',
                    top: top + 28 + 'px',
                    paddingRight: this.bbsLmArray.length == 1 ? '10px' : 0
                };
                if (type === 1) {
                    this.bbsLmStyle.width = '648px';
                    this.bbsLmStyle.height = '123px';
                } else if (type === 2) {
                    this.bbsLmStyle.width = '365px';
                }
            },
            previewLabel(LmLabel, HotelLabel) {
                LmLabel.forEach(lmItem => {
                    lmItem.addEventListener("mouseenter", e => {
                        this.bbsHtObj = null;
                        this.isInMouse = false;
                        this.bbsLmArray = JSON.parse(e.target.getAttribute('data-info'));
                        if (this.bbsLmArray.length) {
                            this.getPopupStyle(e, 1);
                        }
                    }, false);
                    lmItem.addEventListener("mouseleave", e => {
                        setTimeout(() => {
                            this.bbsLmStyle.visibility = this.isInMouse ? 'visible' : 'hidden';
                            if (!this.isInMouse) {
                                this.bbsLmArray = [];
                            }
                        }, 200);
                    }, false);
                });
                HotelLabel.forEach(lmItem => {
                    lmItem.addEventListener("mouseenter", e => {
                        this.isInMouse = false;
                        this.bbsHtObj = JSON.parse(e.target.getAttribute('data-info'));
                        if (this.bbsHtObj) {
                            this.bbsHtObj.url = e.target.getAttribute('href');
                            this.getPopupStyle(e, 2);
                        }
                    }, false);
                    lmItem.addEventListener("mouseleave", e => {
                        setTimeout(() => {
                            this.bbsLmStyle.visibility = this.isInMouse ? 'visible' : 'hidden';
                            if (!this.isInMouse) {
                                this.bbsHtObj = null;
                            }
                        }, 200);
                    }, false);
                });
            },
            notInMouse() {
                this.bbsLmArray = [];
                this.bbsHtObj = null;
                this.bbsLmStyle.visibility = 'hidden';
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
            startLisFloor(detailCon, pid) {
                if (!this.args.sync) {
                    new ListenFloor(detailCon, {
                        thisVue: this,
                        pid,
                        callback: (msg, pid) => {
                            this.setContent(msg, pid);
                        }
                    });
                }
            },
            reGetImg(pid) {
                pid.forEach(item => {
                    const newId = document.getElementById(`item-post-${item}`);
                    const newImgList = Array.prototype.slice.call(newId.querySelectorAll('img[data-type="photo"]'));
                    const newVideoList = Array.prototype.slice.call(newId.querySelectorAll('span[data-type="video"]'));
                    const oldImgList = this.sliInstance._state.imgList;
                    const oldVideoList = this.sliInstance._state.videoList;
                    const newLmLabel = Array.prototype.slice.call(newId.querySelectorAll('.bbsLmLabel'));
                    const newHotelLabel = Array.prototype.slice.call(newId.querySelectorAll('.bbsHotelLabel'));
                    this.sliInstance._state.imgList = oldImgList.concat(newImgList);
                    this.sliInstance._state.videoList = oldVideoList.concat(newVideoList);
                    this.imgList = this.imgList.concat(newImgList);
                    this.preview(newImgList, item);
                    this.previewLabel(newLmLabel, newHotelLabel);
                    this.segImgDefWidth(newImgList);
                });
                this.isNOPic('reget');
            },
        },
        mounted() {
            // 因动静分离的原因 需ajax拿到数据后往state里塞content，以驱动loading楼层渲染
            // 但不能直接往renderData里放，因些先同步到state.project.listwrap下
            this.$store.commit("SET_VALUE", {
                page: 'listWrap',
                attr: 'list',
                data: this.floorArray,
            });


            const detailCon = document.getElementById("pc_detail");


            const onlyLZ = _getQueryString("authorid");
            if (onlyLZ) {
                let opt = {
                    page: "topBar",
                    attr: "haveOther",
                    data: false
                };
                this.$store.commit("SET_VALUE", opt);
            }


            const cpList = document.querySelectorAll('img[data-type="photo"]');
            const videoList = document.querySelectorAll('span[data-type="video"]');
            this.imgList = Array.prototype.slice.call(cpList);
            this.screenWid = window.innerWidth;
            this.bbsImgTool = this.$refs.bbsImgTool;
            const tid = this.thread.id;

            this.sliInstance = new Listen(detailCon, {
                imgList: cpList,
                videoList: videoList,
                devRat: window.devicePixelRatio || 1,
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
            let isExit = false, pid;

            let floorIdArray = [];
            this.listWrap.list.forEach(item => {
                floorIdArray.push(item.id);
            });
            this.$store.commit('SET_VALUE', {
                page: 'floorIdArray',
                data: floorIdArray
            });

            if (!hash) {
                isExit = false;
            } else {
                let isExitEle;
                if (hash.indexOf('#post-') > -1) {
                    isExitEle = document.getElementById(`item-post-${hash.split('-')[1]}`);
                    if (isExitEle) {
                        pid = hash.split('-')[1];
                        toAppointPoi(parseInt(pid), hash.split('#')[1], this);
                    }
                    isExit = isExitEle ? true : false;
                } else if (hash.indexOf('#item-') > -1) {
                    isExitEle = document.getElementById(`item-post-${hash.split('-')[2]}`);
                    if (isExitEle) {
                        pid = hash.split('-')[2];
                        toAppointPoi(parseInt(pid), hash.split('#')[1], this);
                    }
                    isExit = isExitEle ? true : false;
                }
                if (isExitEle) {
                    setTimeout(() => {
                        this.startLisFloor(detailCon, pid);
                    }, 1500)
                }
            }

            if (!isExit) {
                this.startLisFloor(detailCon);
            }

            if (!window.BBS) {
                window.BBS = {
                    TID: this.thread.id
                };
            }

        }
    }
    ;
</script>

<style lang="stylus">
    @import 'detailCon.styl';
</style>
