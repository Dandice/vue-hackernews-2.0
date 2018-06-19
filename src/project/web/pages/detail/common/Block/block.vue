<template>
    <div id="pc_detail_block">
        <div class="search flex_bet">
            <a class="h_ta" href="//bbs.qyer.com/" target="_blank" data-bn-ipg="bbs-thread-top-index">穷游论坛</a>
            <div class="search_btn flex_cen">
                <i class="icomoon search_icon" data-bn-ipg="bbs-thread-top-search"
                   @click="toSearch"></i>
                <input type="text" v-model="searchVal" placeholder="搜索论坛经验/游记/讨论"
                       @keyup.enter="toSearch">
            </div>
        </div>
        <div @mouseleave="onMouseLeave">
            <ul class="banner">
                <li v-for="(item,index) in titleArray"
                    @click="speClick(item)"
                    @mouseenter="onMouseEnter(item, $event)"
                    @mouseleave="onMouseLeaveItem"
                    class="black flex_cen">
                    <span>{{item.val}}</span>
                    <i :class="{rotate_icon: index === selIndex-1,can_rotate_icon: index === selIndex-1 && !selType}"
                       class="icomoon block-ico-2" v-if="index > 1"></i>
                </li>
            </ul>
            <div class="content" v-show="showCountry || showAll">
                <div class="sharp" :style="{left: sharpX}"></div>
                <ul v-show="showCountry" class="flex">
                    <li v-for="item in conArray"
                        :style="{width: blockWidth}">
                        <span @click="toForm(item)">{{item.name}}</span>
                    </li>
                </ul>
                <div class="classify flex" v-show="showAll">
                    <div class="col col1">
                        <div class="title">穷游兴趣小组</div>
                        <span v-for="item in conArray.穷游兴趣小组"
                              @click="toForm(item)">
                        {{item.name}}
                    </span>
                        <div class="title" style="margin: 20px 0 10px;">线上线下</div>
                        <span v-for="item in conArray.线上线下"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                    </div>
                    <div class="col col2">
                        <div class="title">欧洲</div>
                        <span v-for="item in conArray.欧洲"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                    </div>
                    <div class="col col3">
                        <div class="title">亚洲</div>
                        <span v-for="item in conArray.亚洲"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                    </div>
                    <div class="col col4">
                        <div class="title">美洲</div>
                        <span v-for="item in conArray.美洲"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                        <div class="title" style="margin: 50px 0 10px;">大洋洲</div>
                        <span v-for="item in conArray.大洋洲"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                    </div>
                    <div class="col col5">
                        <div class="title">非洲</div>
                        <span v-for="item in conArray.非洲"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                        <div class="title" style="margin: 50px 0 10px;">后院</div>
                        <span v-for="item in conArray.后院"
                              @click="toForm(item)">
                            {{item.name}}
                        </span>
                    </div>
                </div>
                <!--<span v-for="item in conArray">{{item.name}}</span>-->
            </div>
        </div>
    </div>
</template>

<script>
    import ajax from "../../../../../utils/ajax";

    export default {
        name: "pc_detail_block",
        data() {
            return {
                searchVal: "",
                blockArray: [],
                showCountry: false,
                showAll: false,
                conArray: [],
                titleArray: [{key: 1, val: '论坛首页'}, {key: 2, val: '结伴同游'},
                    {key: 3, val: '欧洲版块'},
                    {key: 4, val: '亚洲版块'},
                    {key: 5, val: '美洲版块'},
                    {key: 6, val: '大洋洲版块'},
                    {key: 7, val: '非洲版块'},
                    {key: 8, val: '全部版块'},],
                sharpX: 0,
                blockWidth: '190px',
                selIndex: null,
                selType: false,
                enterTime: 0,
                spaceTime: 500
            };
        },
        methods: {
            speClick(item) {
                if (item.key === 1) {
                    window.open('//bbs.qyer.com');
                } else if (item.key === 2) {
                    window.open('//bbs.qyer.com/forum-2-1.html');
                }
            },
            toSearch() {
                window.open(`http://search.qyer.com/bbs?wd=${this.searchVal}`);
            },
            onMouseLeaveItem() {
                this.spaceTime = new Date() * 1 - this.enterTime;
            },
            onMouseEnter(item, e) {
                this.enterTime = new Date() * 1;
                this.spaceTime = 500;
                this.onMouseLeave();
                setTimeout(() => {
                    if (this.spaceTime > 300) {
                        this.selIndex = item.key;
                        this.selType = true;
                        if (item.key === 1 || item.key === 2) {
                            // 论坛首页
                            this.showCountry = false;
                        } else if (item.key === 8) {
                            // 全部版块
                            this.showAll = true;
                            this.conArray = this.blockArray;
                            this.showCountry = false;
                        } else {
                            const block = `${item.val.replace(/版块/, '')}`;
                            this.conArray = this.blockArray[block];
                            this.showCountry = true;
                            this.showAll = false;
                        }
                        if (item.key === 3) {
                            this.blockWidth = '190px';
                        } else if (item.key === 4) {
                            this.blockWidth = '170px';
                        } else {
                            this.blockWidth = '100px';
                        }
                        this.sharpX = e.target.offsetLeft + e.target.clientWidth / 2 - 34 + "px";
                    }
                }, 300);

            },
            onMouseLeave() {
                this.showCountry = false;
                this.showAll = false;
                this.selType = false;
            },
            getBlock() {
                ajax({
                    url: "/forum.php",
                    data: {
                        action: "list",
                        ajaxID: "5aa9e0d68776329315f6d159",
                        tmp: new Date() * 1
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.blockArray = msg.data;
                    }
                });
            },
            getUserInfo() {
                const {args} = this.$store.state.renderData.data;
                ajax({
                    url: `/detail/options/t/${args.tid}.json`,
                    data: {
                        //action: 'options',
                        //tid: args.tid,
                        page: args.page,
                        time_sta: new Date() * 1,
                        ajaxID: '5aaf8af48776329315f6d165'
                    }
                }).then(msg => {
                        if (!msg.error_code) {
                            this.$store.commit('SET_VALUE', {page: 'userInfo', data: msg.data});
                        }
                    }
                );
            },
            toForm(item) {
                window.qyerTrack.doTrack(`bbs-thread-navi-${item.id}`);
                window.open(item.url);
            }
        },
        mounted() {
            setTimeout(()=>{//debugger;
                this.getBlock();
                this.getUserInfo();
            },1000);
        }
    }
</script>

<style lang="stylus">
    @import './block.styl';
</style>