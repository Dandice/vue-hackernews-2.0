<template>
    <div id="post-hodometer-1" v-if="havePlan && page === 1">
        <div class="allday" v-show="alldayLen">
            <div class="title flex_bet">
                <div class="left">行程单</div>
                <div class="right flex_bet">
                    <div class="btn" @click="showCopy = true">复制行程单</div>
                    <a class="btn" v-show="!userInfo.uid || userInfo.uid!==parseInt(author.uid)"
                       href="//plan.qyer.com/create/" target="_blank">
                        <span>+</span> 创建专属行程
                    </a>
                    <a class="btn" v-show="userInfo.uid===parseInt(author.uid)"
                       :href="`//bbs.qyer.com/thread-edit?tid=${args.tid}`" target="_blank">
                        <span>+</span> 编辑行程
                    </a>
                </div>
            </div>
            <div class="day_item" v-for="(item, index) in showDay">
                <div class="hodo_left">
                    <div class="day_number" @click="toPlanDay(index)">
                        D{{index + 1}}
                    </div>
                    <div class="detail_day">
                        {{calTime(startTime, index)}}
                    </div>
                </div>
                <div class="hodo_right">
                    <div class="line1">
                        <span>
                            <span v-if="item.traffics.length">
                                <div class="city" v-for="traffic in item.traffics">
                                    <span class="city_item" data-bn-ipg="bbs-thread-plan-city"
                                          @click="toClickItem(traffic.fromurl)">{{traffic.fromplace}}</span>
                                    <span :class="`tripmode-${traffic.tripmode} icomoon`"></span>
                                    <span class="city_item" data-bn-ipg="bbs-thread-plan-city"
                                          @click="toClickItem(traffic.tourl)">{{traffic.toplace}}</span>
                                    <span class="spend">
                                        {{traffic.spend}}{{traffic.currency}}
                                    </span>
                                </div>
                            </span>
                            <span v-else-if="item.citys.length">
                                <span v-for="(cityItem,index) in item.citys">
                                    <span class="city_item" data-bn-ipg="bbs-thread-plan-city"
                                          @click="toClickItem(cityItem.url)">{{cityItem.name}}</span>
                                    {{index + 1 == item.citys.length ? '':'-'}}
                                </span>
                                <!--<span class="city_item" data-bn-ipg="bbs-thread-plan-city"
                                      @click="toClickItem(item.citys[0].url)">{{item.citys[0].name}}</span>-->
                            </span>
                        </span>
                    </div>
                    <div class="hotel_poi" v-if="item.pois[0]">
                        <i class="icomoon"></i>
                        <span v-for="(poiItem,index) in item.pois">
                                <span class="poi_item" data-bn-ipg="bbs-thread-plan-poi"
                                      @click="toClickItem(poiItem.url)">
                                    {{poiItem.cn_name || poiItem.en_name}}
                                </span>
                                {{index + 1 == item.pois.length ? '':'-'}}
                        </span>
                    </div>
                    <span class="hotel_info" :data-bn-ipg="item.hotels[0].id"
                          @click="bookHotel(item.hotels[0].url)" v-if="item.hotels[0]">
                        <i class="icomoon"></i>
                        <el-popover placement="top" width="310" trigger="hover">
                            <div class="hot_inf_card">
                                <div class="cn_name">
                                    {{item.hotels[0].cn_name}}</div>
                                <div class="en_name">
                                    {{item.hotels[0].en_name}}
                                </div>
                                <div class="star">
                                    {{hotemItem.star}}星级
                                    <span class="sip">|</span>
                                    {{hotemItem.city_name}}
                                </div>
                                <div class="book">
                                    <span class="price">{{hotemItem.price}}</span>
                                    <span class="curency">元</span>
                                    <span v-show="hotemItem.source === '1'"
                                          @click="bookHotel(item.hotels[0].url)"
                                          class="tobook">
                                        去Booking.com查看
                                    </span>
                                    <span v-show="hotemItem.source === '3'"
                                          @click="bookHotel(item.hotels[0].url)"
                                          class="toairbnb">
                                        去Airbnb 爱彼迎查看
                                    </span>
                                </div>
                            </div>
                            <span slot="reference" class="set" @mouseenter="getPriceById(item)">
                                <span class="hotel_name">{{item.hotels[0].cn_name || item.hotels[0].en_name}}</span>
                                <span class="book_hotel">订</span>
                            </span>
                        </el-popover>
                    </span>
                    <div class="hodo_icon_wrap">
                        <a class="icomoon hodo_icon" data-bn-jpg="bbs-thread-plan-map"
                           :href="`//plan.qyer.com/trip/${planId}/map/#D${index+1}`"></a>
                    </div>
                </div>
            </div>
            <div class="checkall inl_flex" @click="togglePlan()" data-bn-ipg="bbs-thread-plan-all"
                 v-show="!showAll && this.alldayLen > 3">
                查看全部{{this.alldayLen}}日行程
                <img src="./arrow_down.svg" alt="">
            </div>
            <div class="checkall inl_flex" @click="togglePlan()" v-show="showAll">
                收起
                <img src="./arrow_up.svg" alt="">
            </div>
        </div>
        <div v-show="alldayLen" style="margin-top: 10px;text-align: right;font-size: 12px;">
            powered by
            <a data-bn-ipg="bbs-tread-plan-powerby" data-bn-jpg="bbs-tread-plan-powerby" style="color: #0cbf79"
               href="//plan.qyer.com" target="_blank">行程助手</a>
        </div>
        <div v-show="!alldayLen" class="loading">loading...</div>

        <!--复制行程单-->
        <el-dialog
            title="复制行程"
            :visible.sync="showCopy"
            width="430px">
            <span>
                <input v-model="copyTitle" class="rea_input" type="text" maxlength="18" placeholder="填写行程计划标题，最多18个汉字">
            </span>
            <span slot="footer" class="footer">
                <span class="two_btn cancel" @click="showCopy =false">取消</span>
                <span class="two_btn confirm" @click="doCopy">{{doCopyText}}</span>
            </span>
        </el-dialog>

        <!--复制成功提示-->
        <el-dialog
            title="复制行程成功"
            :visible.sync="copySuccess"
            width="680px">
            <div>
                <div class="text fontYaHei">
                    复制行程后，你可以去<a target="_blank" href="//plan.qyer.com">行程助手</a>按照自己的想法随意调整行程，获得智能目的地推荐，并轻松导出PDF同步到手机查看。
                    <div class="bbs_found_content clearfix">
                        <dl class="bg1">
                            <dt>轻松打造个性化完美行程<span></span></dt>
                            <dd>根据喜好，快速安排完美行程</dd>
                        </dl>
                        <dl class="bg2">
                            <dt>1000万网友智能推荐<span></span></dt>
                            <dd>基于1000万穷游er的旅行经验智能推荐全球20万目的地</dd>
                        </dl>
                        <dl class="bg3">
                            <dt>一键同步到移动设备<span></span></dt>
                            <dd>可以同步到手机，也可导出超详细PDF，在路上随时查看</dd>
                        </dl>
                    </div>
                    <a target="_blank" class="check_hodo" :href="successUrl">查看行程</a>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {Dialog,Message,Popover} from 'element-ui'
    import ajax from "../../../../../utils/ajax";
    import Vue from 'vue'

    Vue.prototype.$message = Message;

    export default {
        name: "detail-hodometer",
        data() {
            const {have_plan} = this.$store.state.renderData.data.thread;
            const {page, list, author, args} = this.$store.state.renderData.data;
            return {
                doOpt: true,
                doCopyText: '确定',
                author,
                args,
                havePlan: parseInt(have_plan),
                planId: list[0] && list[0].plan_id,
                page,
                hodometer: null,
                showDay: null,
                alldayLen: 0,
                showAll: false,
                startTime: null,
                copyTitle: null,
                showCopy: false,
                copySuccess: false,
                successUrl: null,
                hotemItem: {},
                planUrl: null
            };
        },
        computed: {
            userInfo() {
                return this.$store.state.project.userInfo;
            }
        },
        components: {
            [Dialog.name]: Dialog,
            [Popover.name]: Popover
        },
        methods: {
            toClickItem(url) {
                url && window.open(url);
            },
            toPlanDay(index) {
                window.open(`${this.planUrl}#day${index + 1}`);
            },
            getPriceById(item) {
                ajax({
                    url: '/qcross/bbs/post.php?action=planhotelByid&ajaxID=5ac2ed418776329315f6d1b4',
                    method: 'POST',
                    data: {
                        hotel_id: item.hotels[0].pid,
                    }
                }).then(msg => {
                    if (!msg.error_code) {
                        this.hotemItem = msg.data || {};
                    }
                });
            },
            doCopy() {
                if (!this.copyTitle) {
                    this.$message({
                        message: '请输入行程标题',
                        type: 'warning'
                    });
                    this.$message.warning('请输入行程标题');
                } else {
                    const {list} = this.$store.state.renderData.data;
                    if (this.doOpt) {
                        this.doOpt = false;
                        this.doCopyText = '复制中';
                        ajax({
                            url: '/planapi/route.php?action=copyplan&ajaxID=5ab37cac8776329315f6d175',
                            method: 'POST',
                            data: {
                                planid: list[0] && list[0].plan_id,
                                planner_name: this.copyTitle,
                                token: '5ab37cac8776329315f6d175',
                                sourcetype: 1,
                            }
                        }).then(msg => {
                            this.doCopyText = '确定';
                            this.doOpt = true;
                            if (!msg.error_code) {
                                this.copySuccess = true;
                                this.showCopy = false;
                                this.successUrl = msg.data.url;
                            } else {
                                this.$message.error(msg.data);
                            }
                        });
                    }
                }
            },
            calTime(st, index) {
                if (typeof st !== "string" || !st) {
                    return "";
                }
                const s = st.split("-"),
                    sr = s[1] + "/" + s[2] + "/" + s[0],
                    dn = Date.parse(sr) + index * (24 * 60 * 60 * 1000),
                    day = new Date(dn),
                    dm = day.getMonth() + 1,
                    dd = day.getDate();
                return (dm > 9 ? dm : "0" + dm) + "-" + (dd > 9 ? dd : "0" + dd);
            },
            togglePlan() {
                this.showAll ?
                    (this.showDay = this.hodometer.slice(0, 3)) :
                    (this.showDay = this.hodometer);
                this.showAll = !this.showAll;
            },
            bookHotel(link) {
                window.open(link);
            },
            getPlan(page) {
                // 行程单
                if (this.havePlan && this.page === 1) {
                    ajax({
                        url: "/planapi/travelnote/route.php",
                        data: {
                            ajaxID: "5aa5f41e8776329315f6d144",
                            action: "getplan",
                            planid: this.planId,
                            sourcetype: 1,
                            topicType: 1,
                            page
                        },
                        useErcode: false
                    }).then(msg => {
                        if (page === 1) {
                            this.hodometer = msg.allday;
                            this.startTime = msg.start_time;
                            this.showDay = msg.allday.slice(0, 3);
                            this.alldayLen = msg.total;
                            this.planUrl = msg.url;
                        } else {
                            this.hodometer = this.hodometer.concat(msg.allday);
                        }
                        if (page === 1 && msg.total > 3) {
                            this.getPlan(2);
                        }
                    });
                }
            }
        },
        mounted() {
            this.getPlan(1);
        }
    };
</script>

<style lang="stylus">
    @import './hodometer.styl';
</style>