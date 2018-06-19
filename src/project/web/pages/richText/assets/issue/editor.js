'use strict';

define(function () {
  var noop = function noop() {};
  var initEditor = function initEditor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$theme = _ref.theme,
        theme = _ref$theme === undefined ? 'simple' : _ref$theme,
        _ref$id = _ref.id,
        id = _ref$id === undefined ? 'senior_editor' : _ref$id,
        _ref$saveSceneHandler = _ref.saveSceneHandler,
        saveSceneHandler = _ref$saveSceneHandler === undefined ? noop : _ref$saveSceneHandler,
        _ref$initialContent = _ref.initialContent,
        initialContent = _ref$initialContent === undefined ? '' : _ref$initialContent,
        _ref$toolbars = _ref.toolbars,
        toolbars = _ref$toolbars === undefined ? ['stylecontrol', 'bbs_common'] : _ref$toolbars,
        _ref$bbs_font = _ref.bbs_font,
        bbs_font = _ref$bbs_font === undefined ? true : _ref$bbs_font,
        _ref$pasteplain = _ref.pasteplain,
        pasteplain = _ref$pasteplain === undefined ? true : _ref$pasteplain,
        _ref$initialFrameHeig = _ref.initialFrameHeight,
        initialFrameHeight = _ref$initialFrameHeig === undefined ? document.documentElement.clientHeight - 160 : _ref$initialFrameHeig,
        _ref$focus = _ref.focus,
        focus = _ref$focus === undefined ? true : _ref$focus,
        _ref$isSubmit = _ref.isSubmit,
        isSubmit = _ref$isSubmit === undefined ? false : _ref$isSubmit,
        filterTxtRules = _ref.filterTxtRules;

    var option = {
      //皮肤，开发时将themePath注释，上线打开
      theme: theme,
      initialContent: initialContent,
      toolbars: toolbars,
      //是否开启字体样式控制
      bbs_font: bbs_font,
      pasteplain: pasteplain,
      initialFrameHeight: initialFrameHeight,
      focus: focus

    };
    if (isSubmit) {
      option.isSubmit = true;
    }
    if (filterTxtRules) {
      option.filterTxtRules = filterTxtRules;
    }
    var ue = UE.getEditor(id, option);
    ue.addListener('saveScene', saveSceneHandler);
    var editorDeferred = $.Deferred();
    ue.ready(function () {
      editorDeferred.resolve(ue);
    });
    return editorDeferred.promise();
  };
  return initEditor;
});