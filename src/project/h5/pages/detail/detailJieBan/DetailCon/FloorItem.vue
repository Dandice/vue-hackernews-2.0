<template>
    <div class="floor_item com_pad" :id="'item-post-'+item.id">
        <div class="together" v-if="together">
            <div v-if="outdata" class="outdata">该结伴已过期</div>
            <div class="title">
                结伴信息
            </div>
            <div class="row com_row">
                <img src="./img/location.svg" class="left">
                <div class="right flex">
                    <div v-if="!together.place.length">不限目的地</div>
                    <div v-for="(item,index) in together.place" :key="index">{{item.cn_name}}</div>
                </div>
            </div>
            <div class="row com_row">
                <img src="./img/calendar.svg" class="left">
                <div class="right">
                    {{startTime}} <em>至</em> {{endTime}} <em>共</em> {{together.during}} <em>天</em>
                </div>
            </div>
            <div class="row com_row">
                <img src="./img/phone.svg" class="left">
                <div class="right">联系方式：{{together.contact}}</div>
            </div>
            <div class="row_two com_row">
                <img src="./img/message.svg" class="left">
                <div class="right" v-html="item.content"></div>
            </div>
        </div>
        <div class="user_info" v-if="index !== 0">
            <img class="left" :src="item.user.avatar">
            <div class="center">
                <div>
                    <a :href="'../../u/'+item.user.uid" class="name">{{item.user.username}}</a>
                    <span class="lz" v-if="item.uid === lzId">楼主</span>
                </div>
                <div class="time">{{created}}</div>
            </div>
            <div class="right flex">{{index + 1}}楼</div>
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
        <div v-html="item.content" v-if="!together"></div>
        <div class="floor_bot" @click="doReply(item)">
            <img src="./img/reply.svg">
            回复
        </div>
    </div>
</template>

<script>
    import {_Platform, _calTime, toLogin} from '../../../../../utils/util'
    import FloorItem from './FloorItem.vue'
    import ajax from '../../../../../utils/ajax'
    export default {
      name: 'h5-detail-jieban-con',
      data () {
        return {
          quoCon: '',
          created: _calTime(parseInt(this.item.created), 2),
          startTime: '',
          endTime: '',
          totalDay: '',
          outdata: false
        }
      },
      props: ['item', 'index', 'lzId', 'together'],
      components: {},
      methods: {
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
              this.quoCon = msg.data.quote.substr(0, 45)
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
        if (this.together) {
          this.startTime = _calTime(parseInt(this.together.departure_time_latest), 2)
          this.endTime = _calTime(parseInt(this.together.return_time), 2)
          this.outdata = !(parseInt(new Date() * 1 / 1000) < parseInt(this.together.return_time))
        }
      }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>