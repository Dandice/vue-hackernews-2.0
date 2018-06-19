'use strict';

define(['assets/issue/components', 'assets/issue/tag', 'assets/issue/constant', 'assets/issue/ajax', 'assets/issue/section', 'assets/issue/util', 'web_ct_submitBeforeValidCode'], function (C, T, O, A, S, U, submitBefore) {

  var $fb = $(".x-filter-blur");
  var $iw = $(".qy_issue_wrap");

  var ue = null;
  var draft = null;
  var plan = null;
  var setUe = function setUe(u) {
    return ue = u;
  };
  var setDraft = function setDraft(d) {
    return draft = d;
  };
  var setPlan = function setPlan(pi) {
    return plan = pi;
  };

  var eventHandler = {
    //发布数据
    getData: function getData(_ref, ue) {
      var checkedFid = _ref.checkedFid,
          draft = _ref.draft,
          type = _ref.type,
          plan_id = _ref.plan_id;

      var fidAry = [];
      var pTemp = $("#js_blockContainer").find("p.show-forward-banner");
      checkedFid && fidAry.push(checkedFid);
      for (var i = 0, len = pTemp.length; i < len; i++) {
        pTemp.eq(i).attr("data-forward-fid") && fidAry.push(pTemp.eq(i).attr("data-forward-fid"));
      }
      //设置是否为提交操作，编辑器中提交时，会转数据，保存草稿则不做操作。提交为true。保存为false
      ue && (ue.options["isSubmit"] = true);
      var tags = $('.main-tags .selected').map(function () {
        return $(this).text();
      }).toArray().concat($("#js_tagContainer > a").map(function () {
        return $(this).text();
      }).toArray());
      return {
        subject: $.trim($("#threadTitle").val()), // 帖子标题
        content: ue && ue.getContent().replace(/\&nbsp\;/gi, " "), // 帖子内容
        tag: U.distinctAry(tags), // 帖子标签
        device: 1, // 设备 web：1，m：2
        fid: fidAry || [], // 板块id
        attachment: $(document.getElementById("ueditor_0").contentWindow.document).find(".qyer_attach").map(function (index, item) {
          return $(item).attr("data-key") || $(item).attr("data-id");
        }).toArray(), // 帖子附件
        draft: draft, // 草稿token
        type: type, // 发帖类型
        plan_id: plan_id };
    },

    // 显示发布层
    showSubmitPopup: function showSubmitPopup(aEvt, $obj) {
      var curTitle = $.trim($("#threadTitle").val());
      if (!curTitle) {
        C.loadTip({ text: '请您输入帖子标题。', type: 'warning' });
        return false;
      }
      if (curTitle && curTitle.length > 60) {
        C.loadTip({ text: '标题超出字数限制。', type: 'error' });
        return false;
      }
      if (!ue.getContent()) {
        C.loadTip({ text: '请您编辑帖子内容。', type: 'warning' });
        return false;
      }

      T.autoTagOnce({ threadType: O.threadType, ue: ue });

      //增加高斯模糊效果
      $fb.addClass("x-pub-blur");

      //获取联系tag
      T.preLoadTag(ue);

      $("#js_qy_issue_popup").show();
      $iw.css("opacity", "0.9");
      $("body").css("overflow", "hidden");
    },


    // 关闭发布层
    hideSubmitPopup: function hideSubmitPopup(aEvt, $obj) {
      $("#js_qy_issue_popup").hide();
      $iw.css("opacity", 1);
      $("body").css("overflow", "auto");
      //去除高斯模糊
      $fb.removeClass("x-pub-blur");
    },


    // 删除一个 tag
    delTag: function delTag(aEvt, $obj) {
      $obj.remove();
      !$("#js_tagContainer > .autotag-cell").length && $(".autotag-title").hide();
      !$("#js_tagContainer > a").length && $("#js_tagContainer").css("display", "none");
    },


    // 弹出层点击事件
    popupClick: function popupClick(aEvt) {
      var dom = aEvt.target || aEvt.srcElement;
      if (dom.id != 'js_qy_issue_block_list') {
        var isHas = document.getElementById('js_qy_issue_block_list').contains(dom);
        if (!isHas) {
          $("#js_qy_issue_block_list").slideUp();
        }
      }
    },


    // 发布帖子
    publish: function publish(aEvt, $obj) {
      var _this = this;
      submitBefore(function (code) {
        var loadingDefPromise = C.loading();
        $("body .qui-loading").css("z-index", "2000");
        var timeDelay = setTimeout(function () {
          draft && draft.clearDraftTimer();
          var data = _this.getData({ checkedFid: S.getCheckedFid(), draft: draft.token, type: O.threadType, plan_id: plan && plan.getPlanID() }, ue);
          if (code) {
            data.valid_code = code;
          }
          A.issueThread(data).done(function (suc) {
            var oSuc = $.parseJSON(suc);
            loadingDefPromise.done(function (l) {
              return l.hide();
            });
            if (oSuc.result === "ok") {
              window.onbeforeunload = null;
              if (oSuc.data) {
                if (oSuc.data.badword && oSuc.data.badword.length) {
                  C.loadTip({ text: '提交成功，但你发布的内容需要接受X光检查。不要担心，正常内容会马上通过。请不要重复发布哟~', time: 2000 });
                  var timeOutPub = setTimeout(function () {
                    oSuc.data.url && (window.location.href = oSuc.data.url);
                    clearTimeout(timeOutPub);
                  }, 2000);
                } else {
                  oSuc.data.url && (window.location.href = oSuc.data.url);
                }
              }
            } else {
              C.loadTip({ 'text': oSuc.data, 'type': 'error' });
              draft && draft.save($(".qy_issue_mask .text"));
            }
          }).fail(function (err) {
            gTip.tip({
              "text": pubNotemod.parse(err).data,
              "type": "error"
            });
            C.loadTip({ 'text': $.parseJSON(err).data, 'type': 'error' });
            draft && draft.save($(".qy_issue_mask .text"));
          });
          clearTimeout(timeDelay);
        }, 300);
      });
    }
  };

  $(document).on('click', '.js_cmd', function (aEvt) {
    var $this = $(this);
    var cmd = $this.attr('data-cmd');
    eventHandler[cmd] && eventHandler[cmd](aEvt, $this);
  });

  $("#js_qy_issue_popup").click(function (aEvt) {
    return eventHandler.popupClick(aEvt);
  });
  return {
    setUe: setUe,
    setDraft: setDraft,
    setPlan: setPlan
  };
});