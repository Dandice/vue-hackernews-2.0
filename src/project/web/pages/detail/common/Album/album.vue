<template>
    <div class="pc_album">
        <el-menu :default-active="activeIndex" v-if="!isReply"
                 class="el-menu-demo" mode="horizontal" @select="handleSelect">
            <el-menu-item index="1">从我的相册选择</el-menu-item>
            <el-menu-item index="2">本地上传</el-menu-item>
        </el-menu>
        <div class="album_top" style="border-bottom: 1px solid #e8e5df;padding-bottom: 10px">
            <span style="margin-right: 10px">选择相册</span>
            <!--<el-select v-model="selAlbId" placeholder="请选择">
                <el-option
                    v-for="item in albumArray"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                </el-option>
            </el-select>-->
            <select v-model="selAlbId" placeholder="请选择">
                <option v-for="item in albumArray"
                        :key="item.id"
                        :value="item.id">{{item.name}}
                </option>
            </select>
        </div>
        <div v-show="activeIndex === '1'">
            <div class="pic_list" @scroll="onScroll" ref="picList">
                <div v-for="(item,i) in picArray" @click="selPic(i,item)" class="img_item">
                    <img :src='`${item.url}/120x120`'>
                    <div :class="{selected: selPicIdx === i}"></div>
                </div>
            </div>
        </div>
        <div v-show="activeIndex === '2'">
            <div id="uploadbtn" v-show="!inUpload">+ 上传照片</div>
            <div class="img_list" v-for="item in imgList" v-show="inUpload">
                <span class="percent">
                    <span :style="{width: item.percent}"></span>
                </span>
                <span class="tip">{{item.tip}}</span>
                <span class="del" @click="delPic">{{item.del}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import {Select, Option, Menu, MenuItem,Message} from 'element-ui'
    import ajax from '../../../../../utils/ajax'
    import {scriptLoader} from 'common/utils/utils'
    import qiniuConfig from 'common/components/qiniu/qiniuConfig'
    import Vue from 'vue'

    Vue.prototype.$message = Message;

    export default {
        name: 'pc-album',
        data() {
            return {
                showInsVideo: false,
                albumArray: [],
                picArray: [],
                selAlbId: null,
                curPage: 1,
                totalPic: null,
                selPicIdx: null,
                optPic: Promise.resolve(),
                activeIndex: '1',
                inUpload: false,
                imgList: [],
                uptoken: null
            }
        },
        props: ['isReply'],
        components: {
            [Select.name]: Select,
            [Option.name]: Option,
            [Menu.name]: Menu,
            [MenuItem.name]: MenuItem
        },
        watch: {
            selAlbId() {
                this.optPic = Promise.resolve();
                this.$emit('setPicUrl', null);
                this.selPicIdx = null;
                this.curPage = 1;
                this.getPicById('new');
                window.selAlbId = this.selAlbId;
            },
            activeIndex() {
                this.selPicIdx = null;
                this.$emit('setPicUrl', null);
            }
        },
        methods: {
            delPic() {
                this.imgList = [];
                this.selPicIdx = null;
                this.inUpload = false
                this.$emit('setPicUrl', null);
            },
            handleSelect(key) {
                this.activeIndex = key;
            },
            selPic(i, item) {
                this.selPicIdx = i;
                this.$emit('setPicUrl', item);
            },
            getPicById(type) {
                this.optPic.then(() => {
                    this.optPic = null;
                    ajax({
                        url: '/qcross/pictrip/album.php',
                        data: {
                            action: 'getAlbumPhotoPage',
                            type: 'json',
                            album: this.selAlbId,
                            page: this.curPage,
                            size: 48,
                            timeSta: new Date() * 1
                        }
                    }).then(msg => {
                        this.optPic = Promise.resolve();
                        if (!msg.error_code) {
                            if (type === 'new') {
                                this.totalPic = msg.data.count;
                                this.picArray = msg.data.res;
                            } else if (msg.data.res) {
                                this.picArray = this.picArray.concat(msg.data.res);
                            }
                        }
                    })
                })
            },
            getAlbumList() {
                ajax({
                    url: '/qcross/pictrip/album.php',
                    data: {
                        action: 'getMyAlbumList',
                        ajaxID: '5aa8cd588776329315f6d151'
                    }
                }).then(msg => {
                    if (!msg.error_code && msg.data.length > 0) {
                        this.albumArray = msg.data;
                        this.selAlbId = msg.data[0].id
                    }
                })
            },
            onScroll() {
                const scollToop = 260 - this.$refs.picList.scrollTop % 260;
                if (scollToop < 40 && this.optPic && this.curPage * 20 < this.totalPic) {
                    this.curPage += 1;
                    this.getPicById();
                }
            },
            qnConfig(options) {
                let newOpt = {
                    auto_start: false,  //是否自动上传
                    getphoIdUrl: '/photo.php',
                    max_file_size: '10mb',
                    browse_button: 'uploadbtn',
                    multi_selection: false,
                };
                qiniuConfig.qiniu(this, Object.assign(options, newOpt),
                    () => {
                        if (this.isReply) {
                            this.editor.execCommand('inserthtml', '<img class="phimage" src="//static.qyer.com/models/project/bbs/images/loading.gif">');
                        } else {
                            this.imgList = [{
                                percent: '50%',
                                tip: '上传中',
                                del: ''
                            }];
                            this.inUpload = true;
                        }
                    },
                    (type, cb) => {
                        const phimage = this.editor.body.querySelector('.phimage');
                        phimage && phimage.remove();
                        if (type === 'ok') {
                            const photo = cb.data.photo;
                            if (this.isReply) {
                                const img = `<img src="${photo.url}" _src="${photo.url}" class="qyer_image" data-id="${photo.id}">`;
                                this.editor.execCommand('inserthtml', img);
                            } else {
                                this.imgList = [{
                                    percent: '100%',
                                    tip: '上传成功',
                                    del: '删除'
                                }];
                                this.inUpload = true;
                                this.$emit('setPicUrl', {id: photo.id});
                            }
                        } else {
                            if (cb.err && cb.err.code === -600) {
                                this.$message({message: '您的图片过大，建议控制在10mb以内~', type: 'warning'});
                            } else {
                                this.$message({message: `图片上传失败${cb.errTip}`, type: 'warning'});
                            }
                        }
                    })
            },
            getUpToken() {
                ajax({
                    url: '/photo.php',
                    data: {
                        action: 'token'
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.uptoken = msg.data.token;
                        this.$store.commit('SET_VALUE', {
                            page: 'token',
                            data: msg.data.token
                        });
                        let newOpt = {
                            uptoken: msg.data.token
                        };
                        this.qnConfig(newOpt);
                    }
                })
            },
        },
        mounted() {
            this.getAlbumList();
            const token = this.$store.state.project.token;
            if (!this.isReply) {
                if (!token) {
                    let urlOne = '//fes.qyerstatic.com/FkDnY51qfolmNbtelIanGCQmYaHF'
                    let urlTwo = '//fes.qyerstatic.com/FoSIrctGlu6jjKBxmJqw1zYHbJk0'

                    Promise.all([scriptLoader(urlOne), scriptLoader(urlTwo)]).then(() => {
                        this.getUpToken()
                    });
                } else {
                    let newOpt = {
                        uptoken: token
                    };
                    this.qnConfig(newOpt);
                }
            }
        }
    }
</script>

<style lang="stylus">
    @import "./album.styl"
</style>