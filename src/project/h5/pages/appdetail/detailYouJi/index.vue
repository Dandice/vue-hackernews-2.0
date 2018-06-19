<template>
    <div id="h5_detail">
        <!--电梯-->
        <Elevator></Elevator>
        <!--头部信息-->
        <TitleInfo></TitleInfo>
        <!--行程单-->
        <HodoMeter></HodoMeter>
        <!--内容-->
        <DetailCon></DetailCon>
        <!--与大app交互-->
        <div id="js_appdata" v-html="appData">
        </div>
    </div>
</template>

<script>
    import TitleInfo from '../common/TitleInfo/index.vue'
    import DetailCon from './DetailCon/index.vue'
    import HodoMeter from '../common/HodoMeter/index.vue'
    import Elevator from './Elevator/index.vue'
    import {loadGA} from '../../../../utils/util'
    import {onlyLz} from '../../../../utils/hybrid'

    export default {
        name: 'app-detailYouJi',
        data() {
            const {fid, id, uid, author, last_post_time} = this.$store.state.renderData.data.thread;
            const {page, pages, elevator, sharePic} = this.$store.state.renderData.data;
            const {url} = this.$store.state.renderData.options;
            const _ChaPage = (page) => {
                let cpLoa = url.split('?')
                let cpSpi = cpLoa[0].split('-')
                let newUrl = `${cpSpi[0]}-${cpSpi[1]}-${cpSpi[2].replace(/[\d]+/, page)}`
                if (url.indexOf('authorid') > -1) {
                    return `${newUrl}?authorid=${uid}`;
                } else {
                    return newUrl;
                }
            };
            let authoronlyUrl = _ChaPage(1).indexOf('authorid') > -1 ? _ChaPage(1) : `${_ChaPage(1)}?authorid=${uid}`;
            let nextUrl = _ChaPage(page + 1);
            let prevUrl = page - 1 > 0 ? _ChaPage(page - 1) : '';
            return {
                authoronlyUrl,
                appData: `<authoronly>${authoronlyUrl}</authoronly><fid>${fid}</fid><endpage>${pages}</endpage><prevurl>${prevUrl}</prevurl>` +
                `<tid>${id}</tid><author>${author.username}</author><nexturl>${nextUrl}</nexturl>` +
                `<updatedtime>${last_post_time}</updatedtime><elevator>${elevator.length ? 1 : 0}</elevator>` +
                `<timeago>2015-10-23</timeago><photo>${sharePic}</photo><iscompany>0</iscompany>`,
                artId: id
            }
        },
        methods: {
            doRel() {
                location.reload()
            }
        },
        components: {
            TitleInfo,
            HodoMeter,
            DetailCon,
            Elevator
        },
        mounted() {
            loadGA();
            onlyLz(this.authoronlyUrl);
            // 处理兼容性锚点兼容性问题
            if (location.href.split('#')[1]) {
                setTimeout(() => {
                    location.href = location.href;
                }, 100);
            }

            /*const vConsole = require('../../../../utils/vconsole')
             console.log(document.cookie)*/
        }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>