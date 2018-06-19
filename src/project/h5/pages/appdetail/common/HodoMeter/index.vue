<template>
    <div id="hodometer" v-if="havePlan && page === 1">
        <div class="title">行程单</div>
        <div class="allday" v-show="alldayLen">
            <div class="day_item" v-for="(item, index) in showDay">
                <div class="left">
                    <div class="day_number">
                        D{{index + 1}}
                    </div>
                    <div class="detail_day">
                        {{calTime(startTime, index)}}
                    </div>
                </div>
                <div class="right">
                    <div class="line1">{{joinCity(item.citys)}}</div>
                    <div class="hotel_poi" v-if="item.pois[0]">{{joinPoi(item.pois)}}</div>
                    <div class="hotel_info" @click="bookHotel(item.hotels[0].url)" v-if="item.hotels[0]">
                        <img class="sleep_icon" src="../../detailYouJi/DetailCon/img/sleep.svg">
                        <div class="hotel_name">{{item.hotels[0].cn_name || item.hotels[0].en_name}}</div>
                        <div class="hotel_currency">{{item.hotels[0].currency}}{{item.hotels[0].spend}}</div>
                        <span class="book_hotel">订</span>
                    </div>
                </div>
            </div>
            <div class="checkall inl_flex" data-bn-ipg="bbs-thread-plan-fold" @click="togglePlan()" v-show="!showAll && this.alldayLen > 3">
                查看全部{{this.alldayLen}}日行程
                <img src="./arrow_down.svg" alt="">
            </div>
            <div class="checkall inl_flex" @click="togglePlan()" v-show="showAll">
                收起
                <img src="./arrow_up.svg" alt="">
            </div>
        </div>
        <img class="loading" src="./loading.svg" v-show="!alldayLen">
    </div>
</template>

<script>
    import ajax from '../../../../../utils/ajax'

    export default {
      name: 'detail-hodometer',
      data () {
        const {have_plan} = this.$store.state.renderData.data.thread
        const {page} = this.$store.state.renderData.data
        return {
          havePlan: parseInt(have_plan),
          page,
          hodometer: null,
          showDay: null,
          alldayLen: 0,
          showAll: false,
          startTime: null
        }
      },
      methods: {
        calTime (st, index) {
          if (typeof st !== 'string' || !st) {
            return ''
          }
          const s = st.split('-'),
            sr = s[1] + '/' + s[2] + '/' + s[0],
            dn = Date.parse(sr) + index * (24 * 60 * 60 * 1000),
            day = new Date(dn),
            dm = day.getMonth() + 1,
            dd = day.getDate()
          return (dm > 9 ? dm : '0' + dm) + '-' + (dd > 9 ? dd : '0' + dd)
        },
        joinCity (cityArray) {
          let mark = []
          cityArray.forEach(item => {
            mark.push(item.name)
          })
          return mark.join(' ... ')
        },
        joinPoi (poiArray) {
          let mark = []
          poiArray.forEach(item => {
            mark.push(item.cn_name)
          })
          return mark.join(' - ')
        },
        togglePlan () {
          this.showAll ? this.showDay = this.hodometer.slice(0, 3) : this.showDay = this.hodometer
          this.showAll = !this.showAll
        },
        bookHotel (link) {
          location.href = link
        }
      },
      beforeMount () {
            // 行程单
        if (this.havePlan) {
          ajax({
            url: '/bbs/planapi/travelnote/route.php',
            data: {
              ajaxID: '59f00a42b2eb31d54ccefcb2',
              action: 'getplan',
              planid: this.$store.state.renderData.data.thread.plan_id,
              sourcetype: 1,
              topicType: 1
            },
            useErcode: false
          }).then(msg => {
            this.hodometer = msg.allday
            this.startTime = msg.start_time
            this.showDay = msg.allday.slice(0, 3)
            this.alldayLen = msg.allday.length
          })
        }
      },
      mounted () {
      }
    }
</script>

<style lang="stylus">
    @import 'index.styl';
</style>