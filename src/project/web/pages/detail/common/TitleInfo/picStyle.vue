<template>
    <span class="pic_style">
        <span @click="chaSel('haveOther')" data-bn-ipg="bbs-thread-top-authoronly">{{haveOther ? '只看' : '取消只看'}}楼主</span>
        <span v-if="thread.type !== '3'" data-bn-ipg="bbs-thread-top-nopic" @click="chaSel('picStyle')"> {{picStyle ? '无图' : '取消无图'}}模式</span>
    </span>
</template>

<script>
    import {
        _ChaPage,
        _getCkVal
    } from "../../../../../utils/util";

    export default {
        data() {
            const {thread} = this.$store.state.renderData.data;
            return {
                thread
            }
        },
        computed: {
            haveOther() {
                return this.$store.state.project.topBar.haveOther;
            },
            picStyle() {
                return this.$store.state.project.topBar.picStyle;
            }
        },
        methods: {
            setTids(tid) {
                let tids = _getCkVal("qyer_tids");
                !this.hasTid(tid) && tids.push(tid);
                const exp = new Date();
                exp.setTime(exp.getTime() + 24 * 3600 * 1000);
                document.cookie = `qyer_tids=${tids.join(
                    ","
                )}; expires=${exp.toGMTString()}`;
            },
            removeTids(tid) {
                let tids = _getCkVal("qyer_tids");
                let idx = -1;
                for (let i = 0; i < tids.length; i++) {
                    if (tids[i] == tid) {
                        idx = i;
                    }
                }
                tids.splice(idx, 1);
                document.cookie = `qyer_tids=${tids.join(",")}; expires: 1}`;
            },
            hasTid(tid) {
                const tids = _getCkVal("qyer_tids");
                let flag = false;
                for (let i = 0; i < tids.length; i++) {
                    if (tid == tids[i]) {
                        flag = true;
                        break;
                    }
                }
                return flag;
            },
            chaSel(type) {
                if (type === "haveOther") {
                    const {
                        uid
                    } = this.$store.state.renderData.data.thread;
                    _ChaPage(1, this.haveOther ? uid : "all");
                } else {
                    const picStyle = this.$store.state.project.topBar.picStyle;
                    picStyle ? this.setTids(this.artId) : this.removeTids(this.artId);
                    let opt = {
                        page: "topBar",
                        attr: "picStyle",
                        data: !picStyle
                    };
                    this.$store.commit("SET_VALUE", opt);
                    sessionStorage.setItem('picStyle', !picStyle)
                }
            }
        },
        mounted() {
            // 查询图片的展示方式`
            if (this.hasTid(this.artId)) {
                let opt = {
                    page: "topBar",
                    attr: "picStyle",
                    data: false
                };
                this.$store.commit("SET_VALUE", opt);
            }
        }
    }
</script>

<style lang="stylus">
    .pic_style {
        color: #10b041;
        cursor: pointer;
        span {
            margin-right: 10px;
        }
    }
</style>