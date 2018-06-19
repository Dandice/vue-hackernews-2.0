'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* --------------------------------------------------------------------------*/
/**
* @Synopsis  define 草稿模块
* @author wei.xu@qyer.com
*
*/
/* --------------------------------------------------------------------------*/
define(['assets/issue/components', 'assets/issue/util'], function (C, U) {

  //数据接口部分
  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  {Class} Draft 草稿父类
  */
  /* --------------------------------------------------------------------------*/
  var Draft = function () {
    function Draft() {
      _classCallCheck(this, Draft);

      // 是否当前正在有保存草稿的请求，
      // 防止网络延时，及手动保存和自动保存请求冲突
      this.isSaveProcess = false;
      //用于判断用户主动离开时是否有未保存的草稿
      this.hasDraftUnsave = false;
      //读取草稿的次数
      this.loadDraftTime = 0;
      this.loadDraftCount = 3;
      //草稿token值,为保存草稿必需字段
      this.token = '';
      this.ue = null;
      //保存字段提示, 一般位于发布页右上角
      this.saveDraftStatus = '保存中';
      //防止用户还未选择继续编辑即离开页面时弹出对话框
      this.beforeunloadstart = false;
    }
    /* --------------------------------------------------------------------------*/
    /**
    * @Synopsis  writeContent 向编辑器中写入草稿内容
    *
      * @Param {String} content 草稿内容
      */
    /* --------------------------------------------------------------------------*/


    _createClass(Draft, [{
      key: 'writeContent',
      value: function writeContent(content) {
        var _this = this;

        if (!this.ue) {
          return;
        }
        this.ue.setOpt("isSubmit", false);
        $(".editHolder").hide();
        this.ue.setContent(content);
        //触发内容改变事件
        var editorTimeChange = setTimeout(function () {
          _this.ue.fireEvent("contentChange");
          clearTimeout(editorTimeChange);
        }, 500);
      }
      //
      /* --------------------------------------------------------------------------*/
      /**
       * @Synopsis  resumeEditDraft  选择继续编辑草稿后的操作，不同的草稿实现不同
       *
       * @Param {Object} data 获取草稿接口返回的草稿数据
       */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'resumeEditDraft',
      value: function resumeEditDraft(data) {
        var subjectDraft = data && $("<div/>").html(data.subject).text();
        Draft.loadTitle(subjectDraft, $(".thread-title-placeholder"), $("#threadTitle"), $(".template-textarea"));
        // autoTagOneFlag = false;
        //载入行程单
        data.plan_id && Draft.loadPlan(data.plan_id);
        //载入标签
        Draft.loadTag(data.tag);
        //载入编辑器
        if ($.trim(data.content)) {
          this.writeContent(data.content);
        }
        Draft.updateLift();
      }
      //获取草稿的接口, 不同的草稿接口不同
      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  getDraft 获取草稿ajax接口，为抽象方法，由子类具体实现
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'getDraft',
      value: function getDraft() {
        return new $.Deferred().promise();
      }
      /* --------------------------------------------------------------------------*/
      /**
       * @Synopsis read 读取草稿
       *
      * @Param {Object}
      *   @property {string} okText 弹层确认按钮文案
      *   @property {string} cancelText 弹层取消按钮文案
      *   @property {Function} deleteHandler 取消按钮回调
      *   @property {Number} count 草稿读取次数
      *   @property {JQueryDom} statusDom 草稿保存状态栏jq dom对象
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'read',
      value: function read() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$okText = _ref.okText,
            okText = _ref$okText === undefined ? '继续写草稿' : _ref$okText,
            _ref$cancelText = _ref.cancelText,
            cancelText = _ref$cancelText === undefined ? '删除草稿写新帖' : _ref$cancelText,
            _ref$count = _ref.count,
            count = _ref$count === undefined ? 3 : _ref$count,
            _ref$statusDom = _ref.statusDom,
            statusDom = _ref$statusDom === undefined ? $(".qy_issue_mask .text") : _ref$statusDom,
            _ref$deleteHandler = _ref.deleteHandler,
            deleteHandler = _ref$deleteHandler === undefined ? function () {} : _ref$deleteHandler;

        this.loadDraftCount = count;
        //保存状态栏
        this.statusDom = statusDom;
        Draft.loadDraft(okText, cancelText, deleteHandler, statusDom, this);
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  saveDraft  保存草稿接口， 由子类具体实现
      * @param {Boolean} sync 是否为同步接口
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'saveDraft',
      value: function saveDraft(sync) {
        return $.Deferred().promise();
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  save 保存草稿
      *
        * @Param {jQuery} dom 草稿保存状态栏jq dom 对象
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'save',
      value: function save(dom) {
        var _this2 = this;

        var saveDef = $.Deferred();
        //是否只保存一次，清除循环保存，在保存发生401错误时，即同时有多个窗口操作一个草稿时,保存失败，弹出操作层，清除保存循环
        var isOnce = false;
        var setSaveDraftStatus = function setSaveDraftStatus(text, unSave) {
          _this2.saveDraftStatus = text;
          _this2.hasDraftUnsave = !!unSave;
          dom.html(_this2.saveDraftStatus);
          isOnce ? _this2.clearDraftTimer() : _this2.saveDraftTimer(dom);
          _this2.isSaveProcess = false;
        };
        if (!this.ue || !this.ue.getContent()) {
          var text = !this.ue ? '编辑器未加载完成' : '帖子还没有内容哟，请您书写帖子吧';
          setSaveDraftStatus(text);
          saveDef.reject(text);
          return saveDef.promise();
        }
        this.saveDraftStatus = '保存中';
        dom.html(this.saveDraftStatus);
        if (!this.isSaveProcess) {
          this.isSaveProcess = true;
          this.saveDraft().done(function (data) {
            var rtv = $.parseJSON(data);
            var text = '';
            var isUnsave = true;
            if (rtv.result === "ok") {
              saveDef.resolve();
              isUnsave = false;
              text = '保存成功';
              _this2.toolContent && _this2.toolContent.models["lift"].reload();
              // lu zhen xing 如果有草稿token就保存
              if (rtv.data && rtv.data.token) {
                _this2.token = rtv.data.token;
              }
              _this2.saveLastTime = U.dateParse(new Date());
            } else {
              text = '保存失败';
              saveDef.reject(text, rtv);
              if (+rtv.error_code === 412) {
                isOnce = true;
                var newDate = U.dateParse(rtv.data.t ? rtv.data.t + '000' : '');
                var curSaveStr = _this2.saveLastTime ? '<p>\u5F53\u524D\u9875\u9762\u7684\u5185\u5BB9\u6700\u540E\u4FDD\u5B58\u4E8E ' + _this2.saveLastTime + '</p>' : '';
                var confirmOpt = {
                  title: '发现了一份更新的草稿',
                  exClassName: 'loadnew-draft-confirm',
                  okText: '替换草稿',
                  onCancel: function onCancel() {
                    $(".x-draft-popup").show();
                  }
                };
                Draft.loadPopup({
                  title: '发现了一份更新的草稿',
                  okText: '载入最新的草稿',
                  cancelText: '将当前页面内容保存为最新草稿',
                  contentHTML: '<div class="qpbc">' + curSaveStr + '<p>\u6211\u4EEC\u53D1\u73B0\u6700\u65B0\u7684\u4E00\u4EFD\u8349\u7A3F\u4FDD\u5B58\u4E8E ' + newDate + ' <a class="detail-draft" target="_blank" href="' + window.location.href + '&lookDetail">\u67E5\u770B\u8BE6\u60C5</a></p><p class="new-content">' + (rtv.data.c && rtv.data.c.content) + '</p></div>',
                  draft: _this2,
                  data: rtv.data,
                  okHandler: function okHandler() {
                    C.loadConfirm($.extend({
                      text: '\u8F7D\u5165\u60A8\u4E8E' + newDate + '\u4FDD\u5B58\u7684\u8349\u7A3F\uFF1F </br>\u5F53\u524D\u9875\u9762\u4E0A\u7F16\u8F91\u7684\u5185\u5BB9\u5C06\u88AB\u66FF\u6362\u4E14\u65E0\u6CD5\u6062\u590D\u3002',
                      onOK: function onOK() {
                        Draft.loadDraftWithoutPopup(_this2);
                      }
                    }, confirmOpt));
                  },
                  cancelHandler: function cancelHandler() {
                    C.loadConfirm($.extend({
                      text: '\u5C06\u4FDD\u5B58\u5F53\u524D\u9875\u9762\u7684\u5185\u5BB9\u4F5C\u4E3A\u6700\u65B0\u7684\u8349\u7A3F\uFF1F </br>\u60A8\u4E8E' + newDate + '\u4FDD\u5B58\u7684\u8349\u7A3F\u5C06\u88AB\u66FF\u6362\u4E14\u65E0\u6CD5\u6062\u590D\u3002',
                      onOK: function onOK() {
                        _this2.token = rtv.data.token;
                        _this2.save(_this2.statusDom);
                      }
                    }, confirmOpt));
                  }
                });
              } else if (+rtv.error_code === 401) {
                //弹出登录框
                C.loadTip();
              }
            }
            setSaveDraftStatus(text, isUnsave);
          }).fail(function (fail) {
            saveDef.reject(fail);
            setSaveDraftStatus('保存失败', true);
          });
        } else {
          saveDef.reject();
        }
        return saveDef.promise();
      }

      /* --------------------------------------------------------------------------*/
      /**
       * @Synopsis  saveDraftTimer  定时自动保存草稿
      *
        * @Param {jQuery} dom 草稿状态栏
        * @Param {Number} timer 草稿定时保存时间，默认每20s保存一次单位ms
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'saveDraftTimer',
      value: function saveDraftTimer(dom) {
        var _this3 = this;

        var timer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20000;

        //当前时间后20s
        var saveDate = new Date(new Date().getTime() + timer);
        var saveHour = saveDate.getHours();
        var saveMinu = saveDate.getMinutes();
        var saveTime = (saveHour < 10 ? "0" + saveHour : saveHour) + ":" + (saveMinu < 10 ? "0" + saveMinu : saveMinu);
        var timeTemp = setTimeout(function () {
          _this3.saveDraftStatus = "保存于" + saveTime;
          dom.html(_this3.saveDraftStatus);
          clearTimeout(timeTemp);
        }, 1000);
        this.saveDraftTime = setTimeout(function () {
          _this3.save(dom);
        }, timer);
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  clearDraftTimer 清除草稿定时保存功能
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'clearDraftTimer',
      value: function clearDraftTimer() {
        clearTimeout(this.saveDraftTime);
        return this;
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  saveSync 同步保存草稿接口
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'saveSync',
      value: function saveSync() {
        return this.saveDraft(1);
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  deleteDraft 删除草稿接口 抽象方法，子类实现
      * @return {Deferred}
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'deleteDraft',
      value: function deleteDraft() {
        return $.Deferred().promise();
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  draftDelete 删除草稿
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'draftDelete',
      value: function draftDelete() {
        var _this4 = this;

        this.deleteDraft().done(function (data) {
          _this4.getDraft().done(function (suc) {
            var cbv = $.parseJSON(suc);
            _this4.token = cbv.data && cbv.data.token;
          });
        });
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  saveManu 手动保存草稿
      *
        * @Param dom 草稿状态栏
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'saveManu',
      value: function saveManu(dom) {
        this.clearDraftTimer();
        return this.save(dom);
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  bindEvent 手动保存草稿事件绑定
      *
        * @Param {jQuery} saveBtn 保存草稿按钮
        * @Param {JQuery} saveBackBtn 返回并保存按钮
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'bindEvent',
      value: function bindEvent(saveBtn, saveBackBtn) {
        var _this5 = this;

        saveBtn.on("click", function () {
          _this5.saveManu(_this5.statusDom);
        });
        saveBackBtn && saveBackBtn.length > 0 && saveBackBtn.on('click', '.btn', function () {
          var $sts = saveBackBtn.find('.sts');
          $sts.fadeIn(300);
          _this5.saveManu(_this5.statusDom).done(function () {
            $sts.html('保存成功').fadeOut(1000, function () {
              history.go(-1);
            });
          }).fail(function () {
            $sts.html('保存失败');
          });
        });
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  beforeunload 浏览器关闭，刷新时判断是否有未保存的草稿
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'beforeunload',
      value: function beforeunload() {
        var _this6 = this;

        window.onbeforeunload = function () {
          var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.event;

          var rtv = { result: 'ok' };
          _this6.beforeunloadstart && _this6.ue && _this6.ue.getContent() && _this6.saveSync(_this6.body()).done(function (objStr) {
            return rtv = $.parseJSON(objStr);
          });
          if (rtv.result !== "ok") {
            var text = '您有未保存的草稿！';
            if (e) {
              e.returnValue = text;
            }
            return text;
          }
        };
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  body  草稿post数据
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'body',
      value: function body() {
        return {};
      }
      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  setPlan  设置草稿plan对象
      *
        * @Param {Object} p plan对象
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'setPlan',
      value: function setPlan(p) {
        this.plan = p;
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  setUe 设置ueditor对象
      *
        * @Param {UEditor} ue ueditor对象
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'setUe',
      value: function setUe(ue) {
        this.ue = ue;
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  setSection 设置板块对象
      *
        * @Param {Object} s 板块对象
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'setSection',
      value: function setSection(s) {
        this.section = s;
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  setToolContent 设置编辑器右侧工具栏
      *
        * @Param {Object} tc 编辑器右侧工具对象
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'setToolContent',
      value: function setToolContent(tc) {
        this.toolContent = tc;
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  multipleWin 用户打开多个窗口时草稿操作
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'multipleWin',
      value: function multipleWin() {}
      /* U.windowActive(); */
      // $(document).on('winunactived', () => {
      // // console.log('当前窗口处于非激活状态');
      // this.save(this.statusDom, true);
      // this.saveLastTime = U.dateParse(new Date())
      // }).on('winactived', () => {
      // // console.log('当前窗口处于激活状态');
      // this.save(this.statusDom).fail((txt, rtv) => {
      // if (rtv && +rtv.error_code === 401) {
      // const newDate = U.dateParse(rtv.data.t ? rtv.data.t + '000' : '');

      // }
      // });
      /* }); */


      /* --------------------------------------------------------------------------*/
      /**
       * @Synopsis loadPopup 静态方法, 草稿加载提示弹层
       *
      * @Param {Object}
      *   @property {string} title 弹层标题
      *   @property {string} okText 弹层确认按钮文案
      *   @property {string} cancelText 弹层取消按钮文案
      *   @property {Function} deleteHandler 取消按钮回调
      *   @property {Object} data 草稿数据
      *   $property {Draft} draft 草稿实例化对象
      */
      /* --------------------------------------------------------------------------*/

    }], [{
      key: 'loadPopup',
      value: function loadPopup() {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            title = _ref2.title,
            contentHTML = _ref2.contentHTML,
            _ref2$okText = _ref2.okText,
            okText = _ref2$okText === undefined ? '继续写草稿' : _ref2$okText,
            _ref2$cancelText = _ref2.cancelText,
            cancelText = _ref2$cancelText === undefined ? '删除草稿写新帖' : _ref2$cancelText,
            deleteHandler = _ref2.deleteHandler,
            _ref2$okHandler = _ref2.okHandler,
            okHandler = _ref2$okHandler === undefined ? function () {
          draft.beforeunloadstart = true;
          draft.resumeEditDraft(data.c);
        } : _ref2$okHandler,
            _ref2$cancelHandler = _ref2.cancelHandler,
            cancelHandler = _ref2$cancelHandler === undefined ? function () {
          Draft.cancelEditDraft(deleteHandler, draft);
        } : _ref2$cancelHandler,
            _ref2$data = _ref2.data,
            data = _ref2$data === undefined ? {} : _ref2$data,
            draft = _ref2.draft;

        //存在草稿
        var name = '';
        var contentSubstr = '';
        if (data.c) {
          name = data.c.subject ? data.c.subject : "未命名草稿";
          contentSubstr = U.removeHtmlTag(data.c.content);
          contentSubstr = contentSubstr ? "..." + contentSubstr.substring(contentSubstr.length - 100) : "";
        }
        var date = '<span class="savetime">\u6700\u540E\u4FDD\u5B58\u4E8E ' + (data.date || '') + '</span>';
        C.loadPopup({
          title: title,
          okText: okText,
          cancelText: cancelText,
          name: name,
          date: date,
          contentHTML: contentHTML,
          contentSubstr: contentSubstr,
          onBeforeHide: function onBeforeHide() {
            $(".x-draft-popup").hide();
            return false;
          },

          onOK: okHandler,
          onCancel: cancelHandler
        });
      }
    }, {
      key: 'loadDraftWithoutPopup',
      value: function loadDraftWithoutPopup(draft) {
        draft.getDraft().done(function (data) {
          var cbv = $.parseJSON(data);
          if (cbv.result === 'ok') {
            draft.token = cbv.data.token;
            draft.hasDraftUnsave = false;
            draft.saveDraftTimer(draft.statusDom);
            if (cbv.data && cbv.data.t) {
              draft.beforeunloadstart = true;
              draft.resumeEditDraft(cbv.data.c);
            }
          }
        });
      }
      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  loadDraft  静态方法，加载草稿
      *
        * @Param {String} okText
        * @Param {String} cancelText
        * @Param {Function} deleteHandler
        * @Param {JQueryDom} statusDom
        * @param {Draft} draft 草稿实例化对象
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'loadDraft',
      value: function loadDraft() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var okText = args[0],
            cancelText = args[1],
            deleteHandler = args[2],
            statusDom = args[3],
            draft = args[4];


        var hasPopup = true;
        if (window.location.href.match(/lookDetail/)) {
          hasPopup = false;
        }
        if (hasPopup) {
          draft.loadDraftTime += 1;
          draft.getDraft().done(function (data) {
            var cbv = $.parseJSON(data);
            if (cbv.result === "ok") {
              //t为草稿最后保存时间，如果没有，则表示草稿不存在
              draft.token = cbv.data.token;
              draft.hasDraftUnsave = false;
              draft.saveDraftTimer(statusDom);
              if (cbv.data && cbv.data.t) {
                Draft.loadPopup({ okText: okText, cancelText: cancelText, data: cbv.data, deleteHandler: deleteHandler, draft: draft });
              } else {
                draft.beforeunloadstart = true;
              }
            } else {
              //如果是未登录状态导致请求失败
              if (+cbv.error_code === 401) {
                //弹出登录框
                C.loadTip();
              } else {
                //其他情况
                if (draft.loadDraftTime < draft.loadDraftCount) {
                  //继续发送读取请求，共发送3次
                  Draft.loadDraft.apply(Draft, args);
                } else {
                  //草稿读取彻底失败进行相关操作
                }
              }
            }
          }).fail(function (err) {});
        } else {
          Draft.loadDraftWithoutPopup(draft);
        }
      }
      /**
        * @Synopsis  cancelEditDraft 静态方法, 删除草稿
        *
        * @Param {Function} deleteHandler 删除草稿回调
        * @param {Draft} Draft实例化对象
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'cancelEditDraft',
      value: function cancelEditDraft(deleteHandler, draft) {
        C.loadConfirm({
          onOK: function onOK() {
            //删除草稿写新帖
            draft.draftDelete();
            deleteHandler();
            draft.beforeunloadstart = true;
          },
          onCancel: function onCancel() {
            $(".x-draft-popup").show();
          }
        });
      }
      /**
      * @Synopsis loadTitle 静态方法，加载标题
      *
      * @Param {String} subjectDraft 草稿标题
      * @Param {jQuery} Placeholder 占位dom对象
      * @Param {jQuery} Title 标题dom对象
      * @Param {jQuery} Textarea 文本框dom对象
      *
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'loadTitle',
      value: function loadTitle(subjectDraft, Placeholder, Title, Textarea) {
        subjectDraft !== "" ? Placeholder.css("display", "none") : Placeholder.css("display", "block");
        Title.val(subjectDraft);
        Textarea.html(subjectDraft);
        Title.height(Textarea.height() || 40);
      }

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  loadPlan 静态方法，加载行程单
      * @param {Number} id 行程单id
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'loadPlan',
      value: function loadPlan(id) {
        requirejs(['common/models/common/component/planItinerary/index'], function (m) {
          m.init({
            action: 'edit',
            planid: id,
            disableCell: { traffic: true }
          });
          $(".x-issue-planLoad").hide();
          $(".qy_issue_showHide").show();
        });
      }
      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  loadTag 静态方法， 加载标签
      *
        * @Param {Array} tag 标签草稿
        *
          */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'loadTag',
      value: function loadTag() {
        var tag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        if (tag.length > 0) {
          var str = "";
          $.each(tag, function (index, item) {
            str = str + '<a href="javascript:;" class="tag js_cmd" data-cmd="delTag">' + $("<div/>").html(item).text() + '</a>';
          });
          $("#js_tagContainer").html(str).css("display", "block");
        };
      }
      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  updateLift 静态方法， 更新电梯
      *
        */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'updateLift',
      value: function updateLift() {
        // 2016-05-03 luzhenxing 更新电梯
        if ($('[data-mode=lift]').length && $('[data-mode=lift]').hasClass('selected')) {
          $('[data-mode=lift]').trigger('click');
        }
      }
    }]);

    return Draft;
  }();

  return { Draft: Draft };
});