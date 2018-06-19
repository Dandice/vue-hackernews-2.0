'use strict';

define(['assets/issue/util', 'assets/issue/ajax', 'assets/issue/components'], function (U, A, C) {
  //自动打标签tag，只有一次，包括保存否草稿
  //获取自动tag
  var $tc = $("#js_tagContainer");
  var autoTagOnce = function autoTagOnce() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$autoTagOneFlag = _ref.autoTagOneFlag,
        autoTagOneFlag = _ref$autoTagOneFlag === undefined ? true : _ref$autoTagOneFlag,
        threadType = _ref.threadType,
        ue = _ref.ue;

    if (autoTagOneFlag) {
      autoTagOneFlag = false;
      var contentnohtml = $.trim(U.removeHtmlTag($("#threadTitle").val() + ue.getContent()));
      $(".autotag-title").hide();
      $tc.css("display", "block");
      if (contentnohtml.length > 100 && (+threadType === 1 || +threadType === 2)) {
        $(".autotag-load").show();
        $tc.css("display", "none");
        A.makeTag(contentnohtml).done(function (res) {
          $(".autotag-load").hide();
          $tc.css("display", "block");
          var d = $.parseJSON(res);
          if (d.result === "ok" && d.data) {
            $(".autotag-title").show();
            var strTags = "";
            d.data.length && $.each(d.data.slice(0, 5), function (index, item) {
              strTags += '<a href=\'javascript:;\' class=\'tag js_cmd autotag-cell\' data-cmd=\'delTag\'>' + item + '</a>';
            });
            $tc.prepend(strTags);
          }
        });
      }
    }
  };

  // tag 搜索联想框
  var $st = $("#js_searchTag");
  C.loadSearch($st, {
    parent: document.getElementById('js_searchTagContainer'),
    onSearch: function onSearch() {
      A.searchTag({ "keyword": $("<div/>").html($st.val()).text() }).done(function (str) {
        var aJSON = $.parseJSON(str);
        if (aJSON.data.item.length) {
          var html = ['<ul class="qui-inputAutocomplete-ul">'];
          $.each(aJSON.data.item, function (index, item) {
            index < 10 && html.push('<li data-id="' + index + '">' + $("<div/>").html(item).text() + '</li>');
          });
          html.push('</ul>');
          html = html.join('');
          $st.qyerAutocomplete("pushHTML", html);
          $("#js_searchTagContainer").find("li:first").attr("data-select", "true");
        } else {
          $st.qyerAutocomplete("pushHTML", '<div class="qui-inputAutocomplete-noResult" > 没有找到任何结果</div>');
        }
      });
    },
    onSelect: function onSelect(aLi) {
      $tc.css("display", "block");
      if ($("#js_tagContainer > a").length < 10) {
        var $ali = $(aLi);
        var textTemp = $ali.hasClass("qyer_inputAutocomplete_creat") ? $ali.find("span").html() : $ali.html();
        var appendTagFlag = !$tc.find("a").filter(function () {
          return $(this).html() === textTemp;
        }).length;
        if ($ali.hasClass("qyer_inputAutocomplete_creat")) {
          var iVal = $ali.find("span").html();
          appendTagFlag && $.trim(iVal) && $tc.append('<a href="javascript:;" class="tag js_cmd" data-key="' + $(aLi).attr('data-id') + '" data-cmd="delTag">' + iVal + '</a>');
        } else {
          if ($.trim($(aLi).text())) {
            var html = '<a href="javascript:;" class="tag js_cmd" data-key="' + $(aLi).attr('data-id') + '" data-cmd="delTag">' + $(aLi).text() + '</a>';
            appendTagFlag && $tc.append(html);
            this.value = '';
          }
        }
      } else {
        C.loadTip({ text: '最多添加10个标签', type: 'warning' });
      }
      $st.val("");
    }
  });

  //获取联想tag
  var preLoadTag = function preLoadTag(ue) {
    var $ttl = $("#tagTipLoad");
    var $tte = $(".tipTagExamp");
    $tte.css("display", "none");
    A.tagPreload({ title: U.removeHtmlTag($("#threadTitle").val()) + U.removeHtmlTag(ue.getContent().replace(/\&nbsp\;/gi, " ")) }).done(function (suc) {
      var sucData = $.parseJSON(suc);
      if (sucData.result === "ok") {
        var tagAry = [];
        sucData.data && sucData.data.length && $tte.css("display", "inline") && $.each(sucData.data.slice(0, 10), function (index, item) {
          tagAry[index] = '<a href=\'javascript:;\'>' + item + '</a>';
        });
        $ttl.empty().append(tagAry.join(""));
      }
      $ttl.on("click", "a", function () {
        var me = $(this);
        var index = me.index();
        $tc.css("display", "block");
        var appendTagFlag = !$tc.find("a").filter(function () {
          return $(this).html() === me.html();
        }).length;
        if ($tc.find("a").length < 10) {
          appendTagFlag && $tc.append("<a href='javascript:;' class='tag js_cmd' data-cmd='delTag' data-ta-index='" + index + "'>" + me.text() + "</a>");
        } else {
          C.loadTip({ text: '最多添加10个标签', type: 'warning' });
        }
      });
    });
  };

  var fitGroup = {
    type: 'group',
    '情侣': 'couple',
    '亲子': 'parentchild',
    '家庭': 'family',
    '朋友': 'friends',
    '独自旅行': 'travel'
  };
  var themes = {
    type: 'theme',
    '动漫': 'cartoon',
    '购物': 'shopping',
    '美食': 'cate',
    '摄影': 'shoot',
    '赏樱': 'sakuragari',
    '米其林': 'michelin',
    '温泉': 'hotspring'
  };
  var container = {
    group: '适合人群',
    theme: '主题'
  };

  var TAGTPL = '<span class="item _type_" data-tagid="_id_"><span class="ico" _style_></span><span class="des" title="_des_">_des_</span></span>';
  var $mainTags = $('.main-tags');
  var $wrap = $mainTags.find('.wrap');
  var $fitGroup = $('.fitgroup');
  var $allTheme = $('.alltheme');
  var getTagsByFid = function getTagsByFid(fid) {
    if (getTagsByFid.fid === fid) return;
    getTagsByFid.fid = fid;
    var getHtml = function getHtml(list, classes) {
      var str = '';
      var len = list.length;
      var style = classes.type === 'theme' ? 'style="background: url(_url_) no-repeat center"' : '';
      for (var i = 0, item; item = list[i++];) {
        var type = classes[item.name] || '';
        if (i === len) {
          type = type + ' last';
        }
        str = str + TAGTPL.replace(/_id_/, item.id).replace(/_type_/, type).replace(/_style_/, style.replace(/_url_/, item.icon)).replace(/_des_/g, item.name);
      }
      return str;
    };
    return A.getTagsByFid(fid).then(function (res) {
      if (res.result === 'ok') {
        if (res.data) {
          var themeList = U.distinctJson('name', res.data[container['theme']]);
          var fitGroupList = U.distinctJson('name', res.data[container['group']]);
          $wrap.empty();
          fitGroupList && $fitGroup.html(getHtml(fitGroupList, fitGroup));
          themeList && $allTheme.html(getHtml(themeList, themes));
          $mainTags.fadeIn(800);
        } else {
          $mainTags.fadeOut(800);
        }
      }
      return res;
    });
  };

  $mainTags.on('click', '.item', function (e) {
    var tagId = $(this).data('tagid');
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
    } else {
      if (this.parentNode.className.match(/fitgroup/)) {
        $(this).addClass('selected').siblings().removeClass('selected');
      } else {
        $(this).addClass('selected');
      }
    }
  });

  return { autoTagOnce: autoTagOnce, preLoadTag: preLoadTag, getTagsByFid: getTagsByFid };
});