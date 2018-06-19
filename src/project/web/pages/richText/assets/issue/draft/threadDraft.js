'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* --------------------------------------------------------------------------*/
/**
* @Synopsis  define 草稿工厂模块
*
  * @Param ['assets/issue/draft/draftFactory'] 工厂父类
  * @Param 'assets/issue/draft/editDraft' 编辑草稿类
  * @Param 'assets/issue/draft/pubDraft' 发布草稿类
  * @Param 'assets/issue/draft/replyDraft' 回复草稿类
  * @Param 'assets/issue/constant'] 常量模块
  */
/* --------------------------------------------------------------------------*/
define(['assets/issue/draft/draftFactory', 'assets/issue/draft/editDraft', 'assets/issue/draft/pubDraft', 'assets/issue/draft/replyDraft', 'assets/issue/constant'], function (D, E, P, R, C) {
  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  Class ThreadDraft 草稿工厂类，继承DraftFactory类
  */
  /* --------------------------------------------------------------------------*/
  var ThreadDraft = function (_D$DraftFactory) {
    _inherits(ThreadDraft, _D$DraftFactory);

    function ThreadDraft() {
      _classCallCheck(this, ThreadDraft);

      return _possibleConstructorReturn(this, (ThreadDraft.__proto__ || Object.getPrototypeOf(ThreadDraft)).apply(this, arguments));
    }

    _createClass(ThreadDraft, [{
      key: 'genDraft',

      /* --------------------------------------------------------------------------*/
      /**
      * @Synopsis  genDraft 工厂方法
      *
        * @Param {String} mode 生成草稿类型, edit, pub, reply
        * @return {Object} draft 草稿对象
        */
      /* --------------------------------------------------------------------------*/
      value: function genDraft(mode) {
        var lm = window.location.href.match(/pid=(\d+)&?.*$/);
        var pid = lm ? lm[1] : 0;
        var draft = null;
        switch (mode) {
          case 'edit':
            draft = new E.EditDraft(pid);
            break;
          case 'pub':
            draft = new P.PubDraft(C.fid, C.threadType);
            break;
          case 'reply':
            draft = new R.ReplyDraft(C.tid);
            break;
          default:
            draft = new P.PubDraft(C.fid, C.threadType);
        }
        return draft;
      }
    }]);

    return ThreadDraft;
  }(D.DraftFactory);

  return { ThreadDraft: ThreadDraft };
});