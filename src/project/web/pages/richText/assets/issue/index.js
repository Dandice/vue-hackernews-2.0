'use strict';

$(function () {
  requirejs(['assets/issue/constant', 'assets/issue/editor', 'assets/issue/draft/threadDraft', 'assets/issue/section', 'assets/issue/tag', 'assets/issue/components', 'assets/issue/toolFixed', 'assets/issue/issuePopup'], function (C, E, D, S, T, O, L, P) {
    $("body").css("overflow", "auto");
    var Ue = null;
    var $plan = $(".qy_issue_plan");
    // 创建行程单
    $(".x-issue-planLoad").on("click", function () {
      var me = $(this);
      O.loadPlan({ topicType: C.threadType, disableCell: { traffic: true } }).done(function () {
        me.hide();
        $(".qy_issue_showHide").css("display", "block");
      });
    });
    //只有游记和结伴有行程单
    var loadPanShow = +C.threadType === 1 || +C.threadType === 3;
    loadPanShow ? $plan.css("display", "block") : $plan.css("display", "none");

    O.loadTitle();
    L.init();
    var draft = new D.ThreadDraft().loadDraft({ delayRead: true });
    // draft.multipleWin();

    P.setDraft(draft);

    O.Plan().done(function (dataAPI) {
      P.setPlan(dataAPI);
      draft.setPlan(dataAPI);
    });

    var editorPromise = E({
      saveSceneHandler: function saveSceneHandler() {
        $(".saveBtns .save").trigger("click");
      }
    }).done(function () {
      var $editHolder = $(".editHolder");
      var $iframeDomBody = $(document.getElementById("ueditor_0").contentWindow.document.body);
      $iframeDomBody.focus();
      $editHolder.on("click", function () {
        $iframeDomBody.focus();
      });
      $iframeDomBody.on("keydown", function (e) {
        $editHolder.hide();
      }).on("keyup", function (e) {
        var editorContent = UE.getEditor("senior_editor").getContent();
        if ((!editorContent || !$iframeDomBody.text()) && !/<img.*\/?>/.test(editorContent)) {
          $editHolder.show();
        }
      });
    });

    editorPromise.done(function (ue) {
      Ue = ue;
      P.setUe(ue);
      draft.setUe(ue);
      draft.setSection(S);
      draft.read();
      O.loadToolContent(ue).done(function (tc) {
        return draft.setToolContent(tc);
      });
      O.loadToolContent(ue);
    });

    //编辑器占位符placeholder
    $(".editHolder").css({ width: "600px", height: $(window).height() - $(".editHolder").offset().top });

    //监听编辑器插入事件
    $(document).on("x-editDomInsert", function () {
      $(".editHolder").hide();
    });
  });
});