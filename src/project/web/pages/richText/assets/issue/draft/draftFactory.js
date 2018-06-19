'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* --------------------------------------------------------------------------*/
/**
* @Synopsis  define 草稿工厂模块
* @author wei.xu@qyer.com
*
  */
/* --------------------------------------------------------------------------*/
define(function () {
  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis Class DraftFactory 草稿工厂父类
  * @return {Class} DraftFactory
  */
  /* --------------------------------------------------------------------------*/
  var DraftFactory = function () {
    function DraftFactory() {
      _classCallCheck(this, DraftFactory);
    }

    _createClass(DraftFactory, [{
      key: 'loadDraft',

      /* --------------------------------------------------------------------------*/
      /**
       * @Synopsis loadDraft 加载草稿总入口，外部调用
       *
      * @Param {Object}
      *   @property {string} okText 弹层确认按钮文案
      *   @property {string} cancelText 弹层取消按钮文案
      *   @property {Function} deleteHandler 取消按钮回调
      *   @property {jQuery} statusDom 保存草稿状态栏jq dom对象
      *   @property {String} mode 草稿类型，默认为pub,即发布草稿类
      *   @property {jQuery} saveBtn 草稿保存按钮jq dom
      *   @property {jQuery} saveBackBtn 草稿返回并保存按钮 jq dom
      *   @property {Boolean} DelayRead 延迟读取草稿标识
      *   @return {Draft} 草稿实例化对象
      */
      /* --------------------------------------------------------------------------*/
      value: function loadDraft() {
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
            deleteHandler = _ref$deleteHandler === undefined ? function () {} : _ref$deleteHandler,
            _ref$mode = _ref.mode,
            mode = _ref$mode === undefined ? 'pub' : _ref$mode,
            _ref$saveBtn = _ref.saveBtn,
            saveBtn = _ref$saveBtn === undefined ? $(".saveBtns .save") : _ref$saveBtn,
            _ref$saveBackBtn = _ref.saveBackBtn,
            saveBackBtn = _ref$saveBackBtn === undefined ? $('.save-back') : _ref$saveBackBtn,
            _ref$delayRead = _ref.delayRead,
            delayRead = _ref$delayRead === undefined ? false : _ref$delayRead;

        var draft = this.genDraft(mode);
        draft.beforeunload();
        !delayRead && draft.read({ okText: okText, cancelText: cancelText, count: count, statusDom: statusDom, deleteHandler: deleteHandler });
        draft.bindEvent(saveBtn, saveBackBtn);
        return draft;
      }
      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis genDraft 生成草稿对象的抽象工厂方法，由子类具体定义
      */
      /* --------------------------------------------------------------------------*/

    }, {
      key: 'genDraft',
      value: function genDraft() {
        throw new Error('Unsupported opteration on an abstract class.');
      }
    }]);

    return DraftFactory;
  }();

  return { DraftFactory: DraftFactory };
});