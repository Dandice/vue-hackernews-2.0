<template>
    <div class="mask_two flex" :class="{show_dianti: showConfirm}">
        <div class="confirm_wrap">
            <div class="con_con">
                {{message}}
            </div>
            <div class="con_btn flex">
                <div class="cancel" @click="cancel">取消</div>
                <div class="open" @click="open" data-bn-ipg="m.bbs-ThreadDetail-ToolBar-OpenApp">打开</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
      data () {
        return {}
      },
      props: ['message', 'showConfirm'],
      methods: {
        cancel () {
          this.$emit('togConfirm', {})
        },
        open () {
          this.$emit('cliConfirm', {})
        }
      }
    }
</script>

<style lang="stylus">
    @import "confirm.styl"
</style>