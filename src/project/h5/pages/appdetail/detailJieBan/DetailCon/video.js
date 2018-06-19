define(['css!old/css/detailYouJi/video.css'], function () {
  var uam = navigator.userAgent.match(/(QYER|LastMinute)\/([\d.]+?\d+)$/)
  var ua = 0
  var uamax = '702'
  if (uam && uam[1]) {
    ua = uam[1].split('.').join('')
  }
  var bodyWidth = $('.bbsDTDetail').width()
  var iframeHeight = bodyWidth * 0.6
  var iframes = '<iframe class="video_iframe" id="video_iframe___id__" width="' + bodyWidth + '" height="__iframeHeight__" frameborder="0" allowfullscreen="true" allowscriptaccess="always" wmode="opaque" allowTransparency="true" src="__src__" scrolling="no"></iframe>'
  var matchs = {
    'v.youku.com': {
      test: /.*id_(.*)\.html.*/,
      src: '//player.youku.com/embed/$1'
    },
    'v.qq.com': {
      test: /.*vid=([\w\-]+)&?.*/,
      src: '//v.qq.com/iframe/player.html?vid=$1&tiny=0&auto=0'
    },
    'www.tudou.com': {
      test: /.*\/(.*)(\.html|\/).*/,
      src: '//www.tudou.com/programs/view/html5embed.action?type=1&code=$1'
    }
  }
  var httpService = {
    getm3u8: function (data, cb) {
      $.get('videoapi.php', data, cb, 'json')
    }
  }
  return {
    translate: function (videos) {
      $.each(videos, function (index, item) {
        var $t = $(item)
        var videoSrc = $t.attr('data-osrc') || $t.attr('data-src')
        if (videoSrc.indexOf('v.qq.com') > -1 && !videoSrc.match(/vid=\w+/)) {
          var qqid = $t.attr('data-src').replace(/.*vid=([\w\-]+)&?.*/, '$1')
          videoSrc = videoSrc.indexOf('?') > -1 ? videoSrc + '&vid=' + qqid : videoSrc + '?vid=' + qqid
        } else if (videoSrc.match(/youku.com/) && videoSrc.match(/\.swf/)) {
          var markPath = videoSrc.split('sid/')
          if (markPath[1]) {
            markPath = markPath[1].split('\/')[0]
            videoSrc = 'http://v.youku.com/v_show/id_' + markPath + '.html#paction'
          }
        }
        var url = videoSrc
        var title = $t.attr('data-title') || $t.attr('data-videotitle') || ''
        var videofrom = $t.attr('data-videofrom') ? $t.attr('data-videofrom') + '视频－' : ''
        $t.html('<a href="' + url + '" class="video_target"><span class="video_from">' + videofrom + '</span><span class="video_title">' + title + '</span></a>')
        $t.addClass('video_trans')
        if (uam && ua < uamax) {
          return
        }
        if (~videoSrc.indexOf('.m3u8') || ~videoSrc.indexOf('.mp4')) {
                    // 视频直播
          httpService.getm3u8({
            tid: BBS.TID,
            url: videoSrc,
            nocache: 1,
            timer: new Date() * 1
          }, function (res) {
            var banimg = document.querySelector('.xban.hasorgbg .ft')
            var poster = banimg ? banimg.style.backgroundImage : ''
            if (poster) {
              poster = poster.replace(/url\(["']*([^"^']*)["']*\).*/, '$1')
            }
            var videoId = Math.random().toString(36).substr(2, 8)
            $t.after('<video id="' + videoId + '" width="' + ($('.bbsDTDetail').width()) + '" height=180 class="video-js vjs-default-skin vjs-big-play-centered" controls poster="' + poster + '">' +
                            '<source src="' + res.data.url + '"/>' +
                            '</video>')
            $t.hide()
          })
        } else {
          for (var key in matchs) {
            if (videoSrc.indexOf(key) > -1) {
              videoSrc = videoSrc.replace(matchs[key].test, matchs[key].src)
              $t.after(iframes.replace(/__src__/, videoSrc).replace(/__id__/, index).replace(/__iframeHeight__/, iframeHeight)).hide()
              var $par = $t.parent()
              $par.css('position', 'relative')
              $par.append('<div class="scroll-shadow ss-top"></div><div class="scroll-shadow ss-right"></div><div class="scroll-shadow ss-bottom"></div><div class="scroll-shadow ss-left"></div>')
              break
            }
          }
        }
      })
      $(document).trigger('VIDEOSUCCESS')
    }
  }
})
