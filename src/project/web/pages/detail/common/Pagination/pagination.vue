<template>
    <div class="in_pagination"
         v-if="total>15">
        <q-pager
            :total="total"
            :current-page="currentPage"
            :page-size="15"
            :max-pager="4"
            :is-has-firt-last="true"
            pre-txt="上一页"
            next-txt="下一页"
            @change="qPageChange"
        />
    </div>
</template>

<script>
    import qPager from '../../../../common/qPager.vue'
    import {_ChaPage} from '../../../../../utils/util'

    export default {
        data() {
            const {page, count} = this.$store.state.renderData.data;
            return {
                currentPage: page,
                total: count
            }
        },
        props: ['top'],
        components: {
            qPager,
        },
        methods: {
            qPageChange(data) {
                this.currentPage = data;
                window.qyerTrack.doTrack(`pages-${data}`);
                _ChaPage(data);
            }
        },
    }
</script>

<style lang="stylus">
    .in_pagination {
        text-align right;
        .qui-pager {
            width 100%;
            margin: 0;
        }
    }
</style>