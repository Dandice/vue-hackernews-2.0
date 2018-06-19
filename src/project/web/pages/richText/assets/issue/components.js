'use strict';

define(['assets/issue/constant'], function (C) {
  var noop = function noop() {};
  var lookMore = C.uid ? '<a class="lookmore" href="//www.qyer.com/u/' + C.uid + '/travel#draft" target="_blank">\u67E5\u770B\u5168\u90E8\u8349\u7A3F</a>' : '';
  var loadPopup = function loadPopup() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$exClassName = _ref.exClassName,
        exClassName = _ref$exClassName === undefined ? 'x-draft-popup' : _ref$exClassName,
        _ref$title = _ref.title,
        title = _ref$title === undefined ? '\u4F60\u6709\u4E00\u4EFD\u8349\u7A3F' + lookMore : _ref$title,
        _ref$name = _ref.name,
        name = _ref$name === undefined ? '' : _ref$name,
        _ref$date = _ref.date,
        date = _ref$date === undefined ? '' : _ref$date,
        _ref$okText = _ref.okText,
        okText = _ref$okText === undefined ? '继续写草稿' : _ref$okText,
        _ref$width = _ref.width,
        width = _ref$width === undefined ? '478' : _ref$width,
        _ref$cancelText = _ref.cancelText,
        cancelText = _ref$cancelText === undefined ? '删除草稿写新帖' : _ref$cancelText,
        _ref$showCloseIcon = _ref.showCloseIcon,
        showCloseIcon = _ref$showCloseIcon === undefined ? false : _ref$showCloseIcon,
        _ref$contentSubstr = _ref.contentSubstr,
        contentSubstr = _ref$contentSubstr === undefined ? '' : _ref$contentSubstr,
        _ref$contentHTML = _ref.contentHTML,
        contentHTML = _ref$contentHTML === undefined ? '<h3 class=\'x-draftp-title\'>[' + name + ']' + date + '</h3><p class=\'x-draftp-content\'>' + contentSubstr + '</p>' : _ref$contentHTML,
        _ref$onBeforeHide = _ref.onBeforeHide,
        onBeforeHide = _ref$onBeforeHide === undefined ? noop : _ref$onBeforeHide,
        _ref$onOK = _ref.onOK,
        onOK = _ref$onOK === undefined ? noop : _ref$onOK,
        _ref$onCancel = _ref.onCancel,
        onCancel = _ref$onCancel === undefined ? noop : _ref$onCancel;

    requirejs(['web_old_popup'], function (pp) {
      pp.show({
        exClassName: exClassName,
        title: title,
        name: name,
        date: date,
        okText: okText,
        width: width,
        cancelText: cancelText,
        showCloseIcon: showCloseIcon,
        contentHTML: contentHTML,
        onBeforeHide: onBeforeHide,
        onOK: onOK,
        onCancel: onCancel
      });
    });
  };

  var loadConfirm = function loadConfirm() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$title = _ref2.title,
        title = _ref2$title === undefined ? '确认删除' : _ref2$title,
        _ref2$text = _ref2.text,
        text = _ref2$text === undefined ? '确定要永久删除这份草稿吗？' : _ref2$text,
        _ref2$exClassName = _ref2.exClassName,
        exClassName = _ref2$exClassName === undefined ? 'x-draft-confirm' : _ref2$exClassName,
        _ref2$okText = _ref2.okText,
        okText = _ref2$okText === undefined ? '确认删除' : _ref2$okText,
        _ref2$onOK = _ref2.onOK,
        onOK = _ref2$onOK === undefined ? noop : _ref2$onOK,
        _ref2$onCancel = _ref2.onCancel,
        onCancel = _ref2$onCancel === undefined ? noop : _ref2$onCancel;

    requirejs(["web_old_confirm"], function (cfm) {
      cfm.confirm({
        title: title,
        text: text,
        exClassName: exClassName,
        okText: okText,
        onOK: onOK,
        onCancel: onCancel
      });
    });
  };

  var loadTip = function loadTip() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref3$text = _ref3.text,
        text = _ref3$text === undefined ? '请登录' : _ref3$text,
        _ref3$type = _ref3.type,
        type = _ref3$type === undefined ? 'warning' : _ref3$type,
        _ref3$timer = _ref3.timer,
        timer = _ref3$timer === undefined ? 2000 : _ref3$timer;

    require(['web_old_tip'], function (tip) {
      tip.tip({
        text: text,
        type: type,
        timer: timer
      });
    });
  };

  var loadSearch = function loadSearch(dom) {
    var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        parent = _ref4.parent,
        _ref4$onSearch = _ref4.onSearch,
        onSearch = _ref4$onSearch === undefined ? noop : _ref4$onSearch,
        _ref4$onSelect = _ref4.onSelect,
        onSelect = _ref4$onSelect === undefined ? noop : _ref4$onSelect;

    requirejs(['web_old_inputautocomplete'], function () {
      dom.qyerAutocomplete({
        parent: parent,
        onSearch: onSearch,
        onSelect: onSelect
      });
    });
  };

  var Plan = function Plan() {
    var def = $.Deferred();
    requirejs(['common/models/common/component/planItinerary/dataAPI'], function (dataAPI) {
      def.resolve(dataAPI);
    });
    return def.promise();
  };

  var loadPlan = function loadPlan() {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { disableCell: { traffic: true } },
        _ref5$action = _ref5.action,
        action = _ref5$action === undefined ? 'guidance' : _ref5$action,
        topicType = _ref5.topicType,
        disableCell = _ref5.disableCell,
        tid = _ref5.tid,
        planid = _ref5.planid;

    var def = $.Deferred();
    requirejs(['common/models/common/component/planItinerary/index'], function (m) {
      var option = {
        action: action,
        topicType: topicType, // 1 游记攻略， 2 结伴同行
        disableCell: disableCell };
      if (tid) {
        option.tid = tid;
      }
      if (planid) {
        option.planid = planid;
      }
      m.init(option);
      def.resolve();
    });
    return def.promise();
  };

  var loading = function loading() {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref6$text = _ref6.text,
        text = _ref6$text === undefined ? '正在发布中，请稍候...' : _ref6$text;

    var def = $.Deferred();
    requirejs(['web_old_loading'], function (l) {
      l.show({ text: text });
      def.resolve(l);
    });
    return def.promise();
  };

  var loadToolContent = function loadToolContent(editor) {
    var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.tool_right';
    var isShowLift = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var toolContentDef = $.Deferred();
    if (!editor) {
      toolContentDef.reject();
    } else {
      requirejs(['old/js/senior_tool'], function (tc) {
        return toolContentDef.resolve(new tc({ target: target, editor: editor, isShowLift: isShowLift }));
      });
    }
    return toolContentDef.promise();
  };

  var loadTitle = function loadTitle() {
    requirejs(['old/js/bbs_title']);
  };

  return { loadPopup: loadPopup, loadConfirm: loadConfirm, loadTip: loadTip, loadSearch: loadSearch, Plan: Plan, loadPlan: loadPlan, loading: loading, loadToolContent: loadToolContent, loadTitle: loadTitle };
});