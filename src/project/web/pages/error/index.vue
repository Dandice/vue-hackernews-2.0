<template>
    <div id="pc_detail">
        <div v-if="type===1">
            <img src="./warn.svg" alt="">
            <span> {{msg}}</span>
        </div>
    </div>
</template>

<script>
    export default {
      name: 'h5-error',
      data () {
        const {type, msg} = this.$store.state.renderData.data.error
        return {
          type,
          msg
        }
      }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>