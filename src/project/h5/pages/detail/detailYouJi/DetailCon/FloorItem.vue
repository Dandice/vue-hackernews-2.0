<template>
    <div class="floor_item com_pad mimi" :id="'item-post-'+item.id">
        <div class="user_info" v-show="page > 1 || (page===1&&index>0)">
            <img class="left" :src="item.user.avatar" @click="toUser">
            <div class="center">
                <div  class="inl_flex">
                    <span class="name" @click="toUser">{{item.user.username}}</span>
                    <span class="lz" v-if="item.uid === lzId">楼主</span>
                </div>
                <div class="time">{{created}}</div>
            </div>
            <div class="right flex">{{(page - 1) * 15 + index + 1}}楼</div>
        </div>
        <div class="quote flex" v-if="item.quote">
            <div class="left flex">
                <div class="reply">回复：</div>
                <div class="floor">{{item.reply.i}}楼</div>
                <div class="reply name">{{item.reply.username}}</div>
            </div>
            <div class="right flex" @click="openQuote" v-show="!quoCon">
                展开引用
                <img src="./img/down_arrow.svg">
            </div>
        </div>
        <div class="open_quote" v-show="quoCon">
            <span class="quo_con" v-if="quoCon.length <= 40">{{quoCon.substr(0, 40)}}</span>
            <span class="quo_con" v-if="quoCon.length > 40">{{quoCon.substr(0, 40)}}...</span>
            <span @click="checkAll" v-if="quoCon.length > 40">查看全部引用</span>
        </div>
        <div :id="'item-con-'+index" v-html="postNode ? postNode : item.content"></div>
        <div class="floor_bot" @click="doReply(item)">
            <img src="./img/reply.png">
            回复
        </div>
    </div>
</template>

<script>
    import {_Platform, _calTime, toLogin, jsENV} from '../../../../../utils/util'
    import FloorItem from './FloorItem.vue'
    import ajax from '../../../../../utils/ajax'
    export default {
      name: 'h5-floor-item',
      data () {
        return {
          quoCon: '',
          created: _calTime(parseInt(this.item.created), 2)
        }
      },
      props: ['item', 'index', 'lzId', 'page', 'dataLen', 'postNode'],
      components: {},
      methods: {
        toUser () {
          location.href = `//m.qyer.com/u/${this.item.user.uid}`
        },
        checkAll () {
          let pid = `item-post-${this.item.reply.url.split('pid=')[1]}`
          if (document.getElementById(pid)) {
            location.href = `${location.href.split('#')[0]}#${pid}`
          } else {
            location.href = this.item.reply.url
          }
        },
        openQuote () {
          ajax({
            url: '/bbs/post.php',
            data: {
              action: 'quote',
              pid: this.item.id,
              ajaxID: '59ef1a1ab2eb31d54ccefca9'
            }
          }).then(msg => {
            if (!msg.error_code) {
              this.quoCon = msg.data.quote
            }
          })
        },
        doReply (item) {
          const uid = this.$store.state.renderData.data.me.uid
          if (uid) {
            let opt = {page: 'replyInfo', data: {isReply: true, pid: item.id, replyWho: item.user.username}}
            this.$store.commit('SET_VALUE', opt)
          } else {
            toLogin()
          }
        }
      },
      mounted () {
      }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>