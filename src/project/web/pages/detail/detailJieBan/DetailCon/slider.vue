<template>

</template>

<script>
    import Listen from "./Listen";

    export default {
        name: "h5-preview",
        data() {
            return {
                imgList: [],
                imgLen: 0,
                screenWid: 0,
            };
        },
        components: {
            Listen
        },
        methods: {
            preview(imgList) {
                imgList.forEach((imgItem, index) => {
                    imgItem.addEventListener("click", e => {
                        if (e.target.className.match("fillimg")) {
                            e.target.src = e.target.getAttribute("data-original");
                            e.target.className = "js_addImgSpan gradient_img";
                        } else {
                            const dataid = e.target.getAttribute("data-id");
                            window.open(`//photo.qyer.com/${dataid}/allphoto`);
                        }
                    });
                });
            }
        },
        computed: {
            picStyle() {
                return this.$store.state.project.topBar.picStyle;
            }
        },
        watch: {
            picStyle: function (val, oldVal) {
                this.imgList.forEach((imgItem, index) => {
                    if (val) {
                        imgItem.src = imgItem.markCurImg;
                        imgItem.className = "js_addImgSpan";
                    } else {
                        // 无图模式
                        imgItem.markCurImg = imgItem.src;
                        imgItem.src =
                            "http://common2.qyerstatic.com/mbbs/old/images/new/showimg.png";
                        imgItem.className = "js_addImgSpan fillimg";
                    }
                });
            }
        },
        mounted() {

        }
    };
</script>


<style lang="stylus">
    @import 'slider.styl';
</style>