<template>
    <div id="hodometer">
        <div class="allday" v-show="alldayLen && havePlan">
            <div class="day_item" v-for="(item, index) in showDay">
                <span class="hodo_left">
                    D{{index + 1}}
                </span>
                <span class="hodo_center">
                    <span class="city">{{joinCity(item.citys)}}</span>
                </span>
                <span class="hodo_right">
                    <span class="hotel_info" @click="bookHotel(item.hotels[0].url)" v-if="item.hotels[0]">
                        <span slot="reference" class="set">
                            <span class="hotel_name">{{item.hotels[0].cn_name || item.hotels[0].en_name}}</span>
                            <span class="book_hotel">订</span>
                        </span>
                    </span>
                </span>
            </div>
            <div class="checkall icomoon" @click="togglePlan()" data-bn-ipg="bbs-thread-plan-all"
                 v-show="!showAll && this.alldayLen > 3">
                <span>展开</span>
            </div>
            <div class="closeall icomoon" @click="togglePlan()" v-show="showAll">
                <span>收起</span>
            </div>
        </div>
        <div v-show="!alldayLen && havePlan" class="loading">loading...</div>
        <div v-show="!havePlan">暂无行程单</div>
    </div>
</template>

<script>
    import ajax from "../../../../../utils/ajax";
    import {Message,Dialog,Popover} from 'element-ui';

    import Vue from 'vue'

    Vue.prototype.$message = Message;

    export default {
        name: "detail-hodometer",
        data() {
            const {have_plan} = this.$store.state.renderData.data.thread;
            const {page, list, author, args} = this.$store.state.renderData.data;
            return {
                author,
                args,
                havePlan: parseInt(have_plan),
                //havePlan: true,
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
                hotemItem: {}
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
            togglePlan() {
                this.showAll ?
                    (this.showDay = this.hodometer.slice(0, 3)) :
                    (this.showDay = this.hodometer);
                this.showAll = !this.showAll;
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
                        if (!msg.error_code) {
                            this.copySuccess = true;
                            this.showCopy = false;
                            this.successUrl = msg.data.url;
                        } else {
                            this.$message.error(msg.data);
                        }
                    });
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
            joinCity(cityArray) {
                let mark = [];
                cityArray.forEach(item => {
                    mark.push(item.name);
                });
                return mark.join(" - ");
            },
            joinPoi(poiArray) {
                let mark = [];
                poiArray.forEach(item => {
                    mark.push(item.cn_name);
                });
                return mark.join(" - ");
            },
            togglePlan() {
                this.showAll ?
                    (this.showDay = this.hodometer.slice(0, 3)) :
                    (this.showDay = this.hodometer);
                this.showAll = !this.showAll;
            },
            bookHotel(link) {
                location.href = link;
            }
        },
        beforeMount() {

            // 行程单
            if (this.havePlan && this.page === 1) {
                ajax({
                    url: "/planapi/travelnote/route.php",
                    data: {
                        ajaxID: "5aa5f41e8776329315f6d144",
                        action: "getplan",
                        planid: this.planId,
                        sourcetype: 1,
                        topicType: 1
                    },
                    useErcode: false
                }).then(msg => {
                    this.hodometer = msg.allday;
                    this.startTime = msg.start_time;
                    this.showDay = msg.allday.slice(0, 3);
                    this.alldayLen = msg.allday.length;
                });
            }
        },
        mounted() {
        }
    };
</script>

<style lang="stylus">
    @import './hodoMeter.styl';
</style>