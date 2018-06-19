'use strict';

$(function () {
  $('body').css('overflow', 'auto');
  var Ue = null;
  requirejs(['assets/issue/components', 'assets/issue/editor', 'assets/issue/draft/threadDraft', 'assets/issue/toolFixed', 'assets/issue/tag', 'assets/issue/constant', 'web_ct_submitBeforeValidCode'], function (C, E, D, T, A, O, submitBefore) {
    var dataAPI = null;
    //草稿
    var draft = new D.ThreadDraft().loadDraft({ okText: '继续编辑草稿', cancelText: '删除草稿重新编辑', mode: 'edit' });
    // draft.multipleWin();

    var editorPromise = E({
      isSubmit: true,
      filterTxtRules: function () {
        function transP(node) {
          node.tagName = 'p';
          node.attrs = {};
        }
        function removeNode(node) {
          node.parentNode.removeChild(node, true);
        }
        return {
          //直接删除及其字节点内容
          '-': 'script style object iframe embed input select',
          'p': { $: {} },
          'img': { $: {} },
          'a': function a(node) {
            for (var attr in node.attrs) {
              if (attr != "href") {
                delete node.attrs[attr];
              }
            }
            node.attrs["target"] = "_blank";
          },
          // 'br':{$:{}},
          'br': transP,
          div: function div(node) {
            var tmpNode,
                p = UE.uNode.createElement('p');
            while (tmpNode = node.firstChild()) {
              if (tmpNode.type == 'text' || !UE.dom.dtd.$block[tmpNode.tagName]) {
                p.appendChild(tmpNode);
              } else {
                if (p.firstChild()) {
                  node.parentNode.insertBefore(p, node);
                  p = UE.uNode.createElement('p');
                } else {
                  node.parentNode.insertBefore(tmpNode, node);
                }
              }
            }
            if (p.firstChild()) {
              node.parentNode.insertBefore(p, node);
            }
            node.parentNode.removeChild(node);
          },
          ol: removeNode,
          ul: removeNode,
          dl: removeNode,
          dt: removeNode,
          dd: removeNode,
          'li': removeNode,
          'caption': transP,
          'th': transP,
          'tr': transP,
          'h3': transP, 'h4': transP, 'h5': transP, 'h6': transP,
          'td': function td(node) {
            //没有内容的td直接删掉
            var txt = !!node.innerText();
            if (txt) {
              node.parentNode.insertAfter(UE.uNode.createText(' &nbsp; &nbsp;'), node);
            }
            node.parentNode.removeChild(node, node.innerText());
          }
        };
      }()
    });
    editorPromise.done(function (ue) {
      Ue = ue;
      draft.setUe(ue);
      C.loadToolContent(ue).done(function (tl) {
        return draft.setToolContent(tl);
      });
      ue.options['isSubmit'] = true;
      //由于旧帖子图片生成格式不对，导致针对图片的系列错误
      var $qbi = $("#editContentContainer").find(".qyer_block.qyer_image");
      $qbi.length && $.each($qbi, function (index, item) {
        var $imgs = $(item).find("img");
        $(item).replaceWith('<img data-type="photo" data-info="[]" data-original="' + $imgs.attr("src") + '" data-id="' + $imgs.attr("id") + '" />');
      });

      var editorConImg = $("#editContentContainer img[data-original]");
      $.each(editorConImg, function (index, item) {
        $(item).attr("src", $(item).attr("data-original")).css("max-width", "600px");
      });
      ue.setContent($("#editContentContainer").html());

      //触发内容改变事件
      var editorTimeChange = setTimeout(function () {
        ue.fireEvent("contentChange");
        ue.focus(true);
        ue.selection.getRange().select();
        clearTimeout(editorTimeChange);
      }, 1000);
      var $editHolder = $(".editHolder");
      var $iframeDomBody = $(document.getElementById("ueditor_0").contentWindow.document.body);
      $iframeDomBody.on("keydown", function () {
        $editHolder.hide();
      }).on("keyup", function () {
        var editorContent = UE.getEditor("senior_editor").getContent();
        if ((!editorContent || !$iframeDomBody.text()) && !/<img.*\/?>/.test(editorContent)) {
          $editHolder.show();
        }
      });

      var editHandler = {

        // 发布帖子
        publish: function publish(aEvt, $obj) {

          if (!ue.getContent()) {
            C.loadTip({ text: '请您编辑回复内容' });
            return false;
          }
          var pidmatch = window.location.search.match(/pid=(\d+)&?/);
          if (!pidmatch) {
            C.loadTip({ text: '无法获取您编辑的楼层' });
            return false;
          }
          submitBefore(function (code) {
            $("body .qui-loading").css("z-index", "2000");
            var loading = C.loading();

            ue && (ue.options["isSubmit"] = true);
            $(document.getElementById("ueditor_0").contentWindow.document).find(".phimage").remove();
            var pData = {
              pid: pidmatch[1],
              content: ue && ue.getContent().replace(/\&nbsp\;/gi, " "),
              valid_code: code
            };
            pData.attachment = $(document.getElementById("ueditor_0").contentWindow.document).find(".qyer_attach").map(function (index, item) {
              return $(item).attr("data-key") || $(item).attr("data-id");
            }).toArray();
            //发布之时清除保存草稿计时器，防止已发布依旧保存草稿
            draft.clearDraftTimer();
            $.post("/post-edit", pData).done(function (suc) {
              var oSuc = $.parseJSON(suc);
              loading.done(function (l) {
                return l.hide();
              });
              if (oSuc.result === "ok") {
                window.onbeforeunload = null;
                if (oSuc.data) {
                  if (oSuc.data.badword_level) {
                    C.loadTip({ text: '你发布的内容正在接受穷游为你独家定制的X光检查。不要担心，正常内容马上就会通过。请不要重复发布哟~' });
                  } else {
                    C.loadTip({ text: '\u7F16\u8F91\u6210\u529F!' });
                  }
                }
                oSuc.data.jumpUrl && (window.location.href = oSuc.data.jumpUrl);
              } else {
                //保存失败，继续保存草稿
                draft.save($(".qy_issue_mask .text"));
                C.loadTip({ text: oSuc.data, type: 'error' });
              }
            }).fail(function (err) {
              //保存失败，继续保存草稿
              draft.save($(".qy_issue_mask .text"));
              C.loadTip({ text: $.parseJSON(err).data, type: 'error' });
            });
          });
        }
      };

      $(document).on('click', '.js_cmd', function (aEvt) {
        var $this = $(this);
        var cmd = $this.attr('data-cmd');
        editHandler[cmd] && editHandler[cmd](aEvt, $this);
      });
    });

    T.init('edit');

    var $xeditHolder = $('.editHolder');
    $xeditHolder.css({ width: '600px', height: $(window).height() - $xeditHolder.offset().top + 'px', display: 'none' });
    //监听编辑器插入事件
    $(document).on('x-editDomInsert', function () {
      return $xeditHolder.hide();
    });
    $xeditHolder.on("click", function () {
      return $(document.getElementById("ueditor_0").contentWindow.document.body).focus();
    });
  });
});