<template>
    <div class="title_info">
        <div class="cover_wrap" v-if="thread.cover && page === 1">
            <img :src="thread.cover" class="header_pic">
        </div>
        <div class="title_con">
            <span class="sm_subject" :class="{big_subject: thread.subject.length<=33}">{{thread.subject}}</span>
            <span v-if="digest" class="jh inl_flex">
                <img src="../image/five-point-star.svg" class="icon" v-for="item in digest">
                精华
            </span>
            <span v-if="!digest && parseInt(thread.heated_discuss)" class="heated_discuss inl_flex">
                热议
            </span>
            <div class="bottom flex">
                <img :src="avatar" @click="toUser" class="avatar">
                <div class="right">
                    <div class="username inl_flex" @click="toUser">
                        {{author.username}}
                        <span v-if="authInfo.indexOf('精华作者')>=0" class="jh">精华作者</span>
                        <img v-else-if="authInfo.indexOf('member')>=0" src="../image/orange-qyer.svg">
                        <img v-else-if="authInfo.indexOf('qyer')>=0" src="../image/green-qyer.svg">
                        <img v-else-if="authInfo.indexOf('company')>=0" src="../image/blue-qyer.svg">
                    </div>
                    <div class="center">
                        <span class="block"><span class="number">{{thread.total_replies}}</span>回复</span>
                        <span class="block"><span class="split ">|</span><span
                            class="number">{{totalFav}}</span>收藏</span>
                        <span class="block"><span class="split">|</span><span
                            class="number">{{thread.total_views}}</span>浏览</span>
                    </div>
                    <div class="pubtime">
                        发布于{{created}}
                    </div>
                </div>
            </div>
        </div>
        <div class="to_form">
            <div class="com_pad flex" @click="jumpTo(forums[0].url)">
                <div>来自 {{forums[0].name}}版</div>
                <div class="flex">{{type === 3 ? '查看全部' : '更多游记'}}<img src="../image/right_arrow.svg"></div>
            </div>
        </div>
        <img :src="`//m.qyer.com/bbs/pv/${artId}`" style="visibility: hidden; display: block;">
    </div>
</template>

<script>
    import like from '../image/like.svg'
    import unlike from '../image/unlike.svg'
    import ajax from '../../../../../utils/ajax'
    import {_ChaPage, openApp, toLogin, _calTime} from '../../../../../utils/util'

    export default {
      name: 'h5-detailYouJi-title',
      data () {
        const {favorited, uid} = this.$store.state.renderData.data.me
        const {thread, forums, page} = this.$store.state.renderData.data
        const {author} = this.$store.state.renderData.data.thread
        let authInfo = []
        author.auth.length && author.auth.map((item) => {
          authInfo.push(item.type)
          authInfo.push(item.desc)
        })
        return {
          author,
          thread,
          forums,
          page,
          digest: parseInt(thread.digest),
          avatar: author.avatar,
          username: author.username,
          totalFav: thread.total_favorites,
          created: _calTime(parseInt(thread.created), 1),
          formName: '',
          authInfo,
          artId: thread.id,
          favorited: favorited,
          message: '请打开穷游App使用“电梯”功能',
          showConfirm: false,
          inSel: false,
          visId: uid,
          like,
          unlike,
          type: parseInt(thread.type) // 帖子类型: 结伴 3,
        }
      },
      components: {},
      computed: {
        haveOther () {
          return this.$store.state.project.topBar.haveOther
        },
        picStyle () {
          return this.$store.state.project.topBar.picStyle
        }
      },
      methods: {
        toUser () {
          location.href = `//m.qyer.com/u/${this.author.uid}`
        },
        jumpTo (link) {
          location.href = link
        }
      },
      mounted () {
      }
    }
</script>

<style lang="stylus">
    @import "index.styl"
</style>