<template>
    <div id="h5_recommend">
        <div class="grey_sep" v-show="recYJList.length"></div>
        <div class="com_pad rec_yj_title" v-show="recYJList.length">
            其他热门游记
        </div>
        <div class="rec_yj">
            <div class="yj_item" v-for="(item,index) in recYJList"
                 :data-bn-ipg="`m.bbs-ThreadDetail-Relative-${index+1}-${artId}`" @click="toDet(item, index)">
                <div class="left">
                    <img :src="item.cover? item.cover+'/80x80': defImg">
                </div>
                <div class="right">
                    <div class="title">
                        {{item.subject}}
                    </div>
                    <div class="flex">
                        <div class="pv">
                            <img src="./img/eye.svg">
                            {{item.pv}}
                        </div>
                        <span v-if="index <3">App专享</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="grey_sep"></div>
        <div class="rec_place" @click="toForm(recPlace)">
            <div class="rec_place_con" data-bn-ipg="m.bbs-ThreadDetail-Body-MainForumDigest">
                <div>
                    更多{{recPlace.name}}
                </div>
                <span class="inl_flex">
                    精华好帖
                    <img src="./img/right_arrow.svg">
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    import ajax from '../../../../../utils/ajax'
    import {openApp} from '../../../../../utils/util'
    import defImg from './img/default.jpg'
    export default {
      name: 'h5-recommend',
      data () {
        const {forums, page} = this.$store.state.renderData.data
        const {id} = this.$store.state.renderData.data.thread
        return {
          page,
          recYJList: [],
          openApp,
          artId: id,
          defImg,
          recPlace: forums && forums[0]
        }
      },
      computed: {
        getRec () {
          return this.$store.state.project.getRec
        }
      },
      watch: {
        getRec () {
          this.getRecommend()
        }
      },
      methods: {
        toForm (recPlace) {
          location.href = recPlace.url
        },
        toDet (item, index) {
          if (index > 2) {
            location.href = item.url
          } else {
            openApp(item.id)
          }
        },
        getRecommend () {
          ajax({
            url: '/bbs/post.php',
            data: {
              action: 'recommend',
              tid: this.$store.state.renderData.data.thread.id,
              ajaxID: '59f30a62b2eb31d54ccefcc6'
            },
            useErcode: false
          }).then(data => {
            if (data.list.length > 5) {
              let mark = []
              for (let i = 0; i < 6; i++) {
                let l = Math.floor(Math.random() * data.list.length)
                mark.push(data.list[l])
                data.list.splice(l, 1)
              }
              this.recYJList = mark
            } else {
              this.recYJList = data.list
            }
          })
        }
      }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>