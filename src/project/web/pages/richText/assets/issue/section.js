'use strict';

define(['assets/issue/ajax', 'assets/issue/constant', 'assets/issue/tag'], function (A, C, Tag) {

  //按类型获取帖子可以发布的论坛版面（主版块及转发版块所有操作）
  var $fb = $("#pubForceBanner");
  var $smm = $("#supMainModule");
  var $sms = $("#subMainSelect");
  var checkedFid = 0;

  $fb.empty().html("<span class='x-c63 x-fz14'>正在获取主版块...</span>");

  var defFid = C.fid;
  //存在默认主板块
  +defFid && Tag.getTagsByFid(+defFid);

  A.getForm(C.threadType).done(function (suc) {
    var sd = $.parseJSON(suc);
    var defFname = '';
    if (sd.result === "ok") {
      var sucData = sd.data;
      //如果有默认主版块，则不可修改。
      if (sucData.main && sucData.main.force) {
        $fb.html(sucData.main.force.name).attr("data-main-fid", sucData.main.force.id);
        if (sucData.forward && (!$.isEmptyObject(sucData.forward.list) || sucData.forward.force)) {
          $(".pTransmit").css("display", "block");
        }
        checkedFid = sucData.main.force.id;
      } else {
        var checkedList = sucData.main.list;
        $fb.empty().html("<a id='selectMainModule' href='javascript:;' class='x-c10b041'>添加帖子所属版面</a><span id='selectMainValueArea' style='display:none;cursor:pointer;'><span></span><a style='margin-left:20px;color:#10b041' href='javascript:;'>修改</a></span>");
        //slideFlag:判断主版块选择区域的展开与收起。
        var slideFlag = true;
        var ary = [];
        var arySub = [];
        $.each(checkedList, function (key, value) {
          key = key === '穷游兴趣小组' ? '兴趣小组' : key;
          ary.push('<li><a href=\'javascript:;\'>' + key + '</a></li>');
          arySub.push("<ul class='popup_list_ul clearfix'>");
          for (var j = 0, len = value.length; j < len; j++) {
            arySub.push('<li><label><input class="js_cmd" type="radio" name="mainBanner" data-sub-fid="' + value[j].id + '" data-sub-fname="' + value[j].name + '"><span>' + value[j].name + '</span></label></li>');
            if (defFid === +value[j].id) {
              defFname = value[j].name;
            }
          }
          arySub.push("</ul>");
        });
        $smm.empty().append(ary.join("")).find("li").eq(0).addClass("active");
        $sms.empty().append(arySub.join("")).find("ul").eq(0).css("display", "block");

        //如果list列表中存在默认的fid版块
        if (defFname) {
          $("#selectMainValueArea").css("display", "block").prev().css("display", "none").end().find("span").html(defFname);
          var defIndex = $sms.find("[data-sub-fid=" + defFid + "]").attr("checked", "checked").parents(".popup_list_ul").index();
          checkedFid = defFid;
          $fb.attr("data-main-index", defIndex);
          // $(".pTransmit").css("display","block");
          if (sucData.forward && (!$.isEmptyObject(sucData.forward.list) || sucData.forward.force)) {
            $(".pTransmit").css("display", "block");
          }
        }

        var $mbs = $("#mainBannerSelect");

        $fb.on("click", function (e) {
          var me = $(this);
          if (slideFlag) {
            slideFlag = false;
            $mbs.slideDown();
            var dataMainIndex = me.attr("data-main-index");
            if (dataMainIndex !== undefined) {
              $smm.find("li").eq(dataMainIndex).addClass("active").siblings().removeClass("active");
              $sms.find("ul").eq(dataMainIndex).css("display", "block").siblings().css("display", "none");
            }
          } else {
            $mbs.slideUp();
            slideFlag = true;
          }
          if (window.event) {
            window.event.cancelBubble = true;
          } else {
            e.stopPropagation();
          }
        });

        $smm.delegate("li", "mouseenter", function () {
          $(this).addClass("active").siblings().removeClass("active");
          $sms.find('ul').eq($(this).index()).css("display", "block").siblings().css("display", "none");
        });

        $(document).on("click", function (e) {
          var evt = window.event || e;
          var $t = $(evt.target || evt.srcElement);
          if (!$t.closest("#mainBannerSelect").length) {
            $mbs.slideUp();
            slideFlag = true;
          } else if ($t.attr("name") === "mainBanner") {
            var $smv = $("#selectMainValueArea");
            $smv.css("display", "block").prev().css("display", "none");
            $smv.find("span").html($t.attr("data-sub-fname"));
            checkedFid = $t.attr("data-sub-fid");
            //加载标签
            Tag.getTagsByFid(+checkedFid);
            $mbs.slideUp();
            slideFlag = true;
            if (sucData.forward && (!$.isEmptyObject(sucData.forward.list) || sucData.forward.force)) {
              $(".pTransmit").css("display", "block");
            }
            $fb.attr("data-main-index", $t.parents(".popup_list_ul").index());
          }
        });
      }
      var $bc = $("#js_blockContainer");
      var forwardLimit = sucData.forward_limit;
      var aryFw = [];
      var arySubFw = [];
      var forward_force_id = 0;
      //如果有默认的转发模块,则可转发的模块个数减1.
      if (sucData.forward && sucData.forward.force) {
        forward_force_id = sucData.forward.force.id;
        forwardLimit = forwardLimit - 1;
        $bc.append("<div class='show-forward-banner' data-forward-fid=" + sucData.forward.force.id + ">" + sucData.forward.force.name + "</div>");
      }
      //转发模块部分
      if (!sucData.forward || sucData.forward && $.isEmptyObject(sucData.forward.list) && !sucData.forward.force) {
        $(".pTransmit").css("display", "none");
      };

      if (sucData.forward && !$.isEmptyObject(sucData.forward.list)) {
        var forward_index = -1;
        var forwardSlideFlag = true;
        $.each(sucData.forward.list, function (key, value) {
          forward_index = forward_index + 1;
          key = key === "穷游兴趣小组" ? "兴趣小组" : key;
          aryFw.push('<li><a href="javascript:;">' + key + '</a></li>');
          arySubFw.push('<ul class="popup_list_ul clearfix">');
          for (var i = 0, len = value.length; i < len; i++) {
            arySubFw.push('<li><label><input type="checkbox" class="checkbox-forward" value=' + value[i].id + ' data-forward-name=' + value[i].name + ' data-forward-index=' + forward_index + '><span>' + value[i].name + '</span></label></li>');
          }
          arySubFw.push('</ul>');
        });
        var $mu = $("#js_menuUL");
        var $pl = $("#js_popup_list");
        var $ibl = $("#js_qy_issue_block_list");
        var $sbl = $("#js_showBlockList");
        $mu.empty().append(aryFw.join(""));
        $pl.empty().append(arySubFw.join(""));
        //显示转发模块弹层
        $(".pTransmit").on("click", ".show-forward-banner", function (e) {
          if (forwardSlideFlag) {
            forwardSlideFlag = false;
            $ibl.slideDown();
          } else {
            $ibl.slideUp();
            forwardSlideFlag = true;
          }
          //转发模块左侧索引。
          var index = $(this).attr("data-forward-index") || 0;
          $mu.find('li').eq(index).addClass("active").siblings().removeClass("active");
          $pl.find('ul').eq(index).css("display", "block").siblings().css("display", "none");
          if (window.event) {
            window.event.cancelBubble = true;
          } else {
            e.stopPropagation();
          }
        });

        $mu.delegate("li", "mouseenter", function () {
          $(this).addClass("active").siblings().removeClass("active");
          $pl.find("ul").eq($(this).index()).css("display", "block").siblings().css("display", "none");
        });
        $bc.css({ "display": "inline-block", "*display": "inline", "*zoom": 1 });
        var modifyA = $("<a href='javascript:;' style='float:right;display:none;' class='show-forward-banner'>修改</a>");
        $bc.append(modifyA);
        $(document).on("click", function (e) {
          var evt = window.event || e;
          var $t = $(evt.target || evt.srcElement);
          if (!$t.closest("#js_qy_issue_block_list").length) {
            $ibl.slideUp();
            forwardSlideFlag = true;
          } else if ($t.hasClass("checkbox-forward")) {
            $pl.find('input:checked').length >= forwardLimit ? $pl.find('input[type=checkbox]').not(":checked").attr("disabled", "disabled") : $pl.find('input[type=checkbox]').removeAttr("disabled");
            if ($pl.find('input:checked').length) {
              $sbl.parent().css("display", "none");
              modifyA.css("display", "block");
            } else {
              modifyA.css("display", "none");
              $sbl.parent().css("display", "block");
            }
            if ($t.is(":checked")) {
              $bc.find('a:first').attr("data-forward-fid", $t.val()).attr("data-forward-index", $t.attr('data-forward-index')).attr("data-forward-name", $t.attr('data-forward-name'));
              $bc.append("<p style='cursor:pointer;margin-right:20px;display:inline-block;' class='show-forward-banner' data-forward-fid=" + $t.val() + " data-forward-index=" + $t.attr('data-forward-index') + " data-forward-name=" + $t.attr('data-forward-name') + ">" + $t.attr('data-forward-name') + "</p>");
            } else {
              var pContainers = $bc.find("p");
              for (var clen = pContainers.length; clen--;) {
                if (pContainers.eq(clen).attr("data-forward-name") === $t.attr("data-forward-name")) {
                  pContainers.eq(clen).remove();
                  break;
                }
              }
            }
          }
        });
      }
    }
  });
  var getCheckedFid = function getCheckedFid() {
    return checkedFid;
  };
  return { getCheckedFid: getCheckedFid };
});