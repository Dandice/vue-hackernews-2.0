'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

$(function () {
  $('body').css('overflow', 'auto');
  var Ue = null;
  requirejs(['assets/issue/components', 'assets/issue/editor', 'assets/issue/draft/threadDraft', 'assets/issue/toolFixed', 'assets/issue/tag', 'assets/issue/constant', 'assets/issue/util'], function (C, E, D, T, A, O, U) {
    C.loadTitle();
    var dataAPI = null;
    C.Plan().done(function (da) {
      draft.setPlan(da);
      dataAPI = da;
    });
    //草稿
    if (!Object.values) {
      Object.values = function (obj) {
        var ary = [];
        if (!obj) {
          return ary;
        }
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            ary.push(obj[key]);
          }
        }
        return ary;
      };
    }
    var allTags = Object.values(window.TAGS);
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

      //tag管理
      var $tagCon = $('#js_tagContainer');
      var $mainTags = $('.main-tags');
      var objReverse = function objReverse(obj) {
        var ot = Object.create(null);
        if (!obj) {
          return ot;
        }
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            ot[obj[key]] = key;
          }
        }
        return ot;
      };

      var defTags = A.getTagsByFid(+window.FID);

      var xTagsHTML = '';
      var selectedTags = [];
      var editHandler = {
        isFirstPopup: true,
        // 显示发布层
        showSubmitPopup: function showSubmitPopup(aEvt, $obj) {
          draft.save($(".qy_issue_mask .text"));
          draft.clearDraftTimer();
          if (this.isFirstPopup) {
            allTags = $tagCon.find('.tag').map(function () {
              return $(this).text();
            }).toArray();
            defTags.then(function (v) {
              if (v.result === 'ok') {
                if (v.data) {
                  var themes = U.distinctJson('name', v.data['主题']);
                  var groups = U.distinctJson('name', v.data['适合人群']);
                  var themeNames = U.map(themes, function (item) {
                    return item.name;
                  });
                  var groupNames = U.map(groups, function (item) {
                    return item.name;
                  });
                  var newTags = [].concat(_toConsumableArray(themeNames), _toConsumableArray(groupNames));
                  if (allTags) {
                    for (var i = 0, key = ''; key = allTags[i++];) {
                      if (U.includes(newTags, key)) {
                        $tagCon.find('.tag').each(function () {
                          if ($(this).text() === key) {
                            $(this).remove();
                          }
                        });
                        $mainTags.find('.item').each(function () {
                          if ($(this).text() === key) {
                            $(this).addClass('selected');
                            selectedTags.push(key);
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
            this.isFirstPopup = false;
          } else {
            for (var k = 0, itm = ''; itm = selectedTags[k++];) {
              $mainTags.find('.item').each(function () {
                if ($(this).text() === itm) {
                  $(this).addClass('selected');
                }
              });
            }
          }
          //储旧的标签内容，如果取消则恢复。
          xTagsHTML = $("#js_tagContainer").html();
          $("#js_blockContainer").html() && $(".pTransmit").css("display", "block");
          //增加高斯模糊效果
          $(".x-filter-blur").addClass("x-pub-blur");
          //打开弹层显示发布按钮
          $(".qy_issue_popup_sbm").css("display", "block");
          //获取联想tag
          var $tagTipLoad = $("#tagTipLoad");
          $(".tipTagExamp").css("display", "none");
          A.preLoadTag(ue);
          $("#js_qy_issue_popup").show();
          $(".qy_issue_wrap").css("opacity", "0.9");
          $("body").css("overflow", "hidden");
        },


        // 关闭发布层
        hideSubmitPopup: function hideSubmitPopup(aEvt, $obj) {
          //如果是取消则存入原先的标签内容。
          if ($obj.hasClass("ui_btn_big_cancel")) {
            $("#js_tagContainer").empty().html(xTagsHTML);
            if (!selectedTags.length) {
              $mainTags.find('.item').removeClass('selected');
            } else {
              for (var k = 0, itm = ''; itm = selectedTags[k++];) {
                $mainTags.find('.item').each(function () {
                  if ($(this).text() === itm) {
                    $(this).addClass('selected').siblings().removeClass('selected');
                  }
                });
              }
            }
          } else {
            // const selectedNow = $mainTags.find('.selected').map(function() { return $(this).text()}).toArray();
            // const selectedOtherTags = $tagCon.find('.tag').map(function() { return $(this).text()}).toArray();
            // allTags = selectedOtherTags.concat(selectedNow);
            selectedTags = $mainTags.find('.selected').map(function () {
              return $(this).text();
            }).toArray();
          }
          draft.save($(".qy_issue_mask .text"));
          $("#js_qy_issue_popup").hide();
          $(".qy_issue_wrap").css("opacity", 1);
          $("body").css("overflow", "auto");
          //隐藏发布按钮
          $(".qy_issue_popup_sbm").css("display", "none");
          //去除高斯模糊
          $(".x-filter-blur").removeClass("x-pub-blur");
        },


        // 删除一个 tag
        delTag: function delTag(aEvt, $obj) {
          $obj.remove();
          !$("#js_tagContainer > a").length && $("#js_tagContainer").css("display", "none");
        },

        // 发布帖子
        publish: function publish(aEvt, $obj) {
          var curTitle = $.trim($("#threadTitle").val());
          if (!curTitle) {
            C.loadTip({ text: '请您输入帖子标题' });
            return false;
          };
          if (curTitle && curTitle.length > 60) {
            C.loadTip({ text: '标题超出字数限制', type: 'error' });
            return false;
          };

          if (!ue.getContent()) {
            C.loadTip({ text: '请您编辑帖子内容' });
            return false;
          }

          $("body .qui-loading").css("z-index", "2000");
          var loading = C.loading();

          ue && (ue.options["isSubmit"] = true);
          $(document.getElementById("ueditor_0").contentWindow.document).find(".phimage").remove();
          var tags = $('.main-tags .selected').map(function () {
            return $(this).text();
          }).toArray().concat($("#js_tagContainer > a").map(function (index, item) {
            return $(item).text();
          }).toArray());
          var pData = {
            tid: O.tid,
            subject: $("#threadTitle").val(),
            content: ue && ue.getContent().replace(/\&nbsp\;/gi, " "),
            tag: U.distinctAry(tags)
          };
          dataAPI && (pData.plan_id = dataAPI.getPlanID());
          pData.attachment = $(document.getElementById("ueditor_0").contentWindow.document).find(".qyer_attach").map(function (index, item) {
            return $(item).attr("data-key") || $(item).attr("data-id");
          }).toArray();
          //发布之时清除保存草稿计时器，防止已发布依旧保存草稿
          draft.clearDraftTimer();
          $.post("/thread-edit", pData).done(function (suc) {
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
                  C.loadTip({ text: '\u7F16\u8F91' + O.threadTypeName + '\u6210\u529F! <br/>\u60A8\u53EF\u4EE5\u5728\u8BE6\u60C5\u9875\u70B9\u51FB\u201C\u7F16\u8F91\u201D\u7EE7\u7EED\u66F4\u65B0\u5E16\u5B50\uFF0C\u5176\u4ED6\u7A77\u6E38er\u56DE\u590D\u65F6\u4F60\u4F1A\u6536\u5230\u7AD9\u5185\u901A\u77E5\u3002' });
                }
              }
              oSuc.data.url && (window.location.href = oSuc.data.url);
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
        }
      };

      $(document).on('click', '.js_cmd', function (aEvt) {
        var $this = $(this);
        var cmd = $this.attr('data-cmd');
        editHandler[cmd] && editHandler[cmd](aEvt, $this);
      });
    });

    T.init('edit');

    // 加载行程单 ---------------------------------------------------------
    $(".x-issue-planLoad").on("click", function () {
      var me = $(this);
      C.loadPlan({ tid: O.tid, topicType: O.threadType, disableCell: { traffic: true } }).done(function () {
        me.hide();
        $(".qy_issue_showHide").css("display", "block");
      });
    });

    $('#threadTitle').height($('.template-textarea').height());
    var $xeditHolder = $('.editHolder');
    $xeditHolder.css({ width: '600px', height: $(window).height() - $xeditHolder.offset().top + 'px', display: 'none' });
    //监听编辑器插入事件
    $(document).on('x-editDomInsert', function () {
      return $xeditHolder.hide();
    });
    $xeditHolder.on("click", function () {
      return $(document.getElementById("ueditor_0").contentWindow.document.body).focus();
    });

    if (+O.planId) {
      C.loadPlan({ tid: O.tid, action: 'edit', planid: O.planId, disableCell: { traffic: true } }).done(function () {
        $(".x-issue-planLoad").hide();
        $(".qy_issue_showHide").show();
      });
    };

    //隐藏发布按钮
    $(".qy_issue_popup_sbm").css("display", "none");
    //只有游记和结伴有行程单
    var loadPanShow = +O.threadType === 1 || +O.threadType === 3;
    loadPanShow ? $(".qy_issue_plan").css("display", "block") : $(".qy_issue_plan").css("display", "none");

    $(".qy_issue_box_title .mask").css("left", "-131px");
  });
});