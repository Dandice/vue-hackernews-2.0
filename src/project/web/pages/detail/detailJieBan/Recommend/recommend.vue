<template>
    <div>
        <ADZone :zone-id="35" style="width: 100%; margin-top: 45px;" target="_blank"></ADZone>
    </div>
</template>

<script>
    import ADZone from 'common/components/ADZone.vue'

    export default {
        data() {
            const {args} = this.$store.state.renderData.data;
            return {
                args,
                topHeight: '200px',
                botEleStyl: {},
                elevator: [],
                eleDock: 'fixed_elevator',
                chiheWrapObj: {},
                topDock: false,
                qiyuObj: {},
                fixedLeft: 0
            }
        },
        components: {
            ADZone,
        },
        computed: {},
        watch: {},
        methods: {},
        mounted() {
        }
    };
</script>

<style lang="stylus">
    @import './recommend.styl';
</style>