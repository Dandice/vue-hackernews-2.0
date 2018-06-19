'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['assets/issue/draft/draft', 'assets/issue/util'], function (D, U) {
  var Draft = D.Draft;

  var ReplyDraft = function (_Draft) {
    _inherits(ReplyDraft, _Draft);

    function ReplyDraft(tid) {
      _classCallCheck(this, ReplyDraft);

      //回复的帖子id
      var _this = _possibleConstructorReturn(this, (ReplyDraft.__proto__ || Object.getPrototypeOf(ReplyDraft)).call(this));

      _this.tid = tid;
      return _this;
    }

    _createClass(ReplyDraft, [{
      key: 'resumeEditDraft',
      value: function resumeEditDraft(data) {
        if (data && data.content && $.trim(data.content)) {
          this.writeContent(data.content);
        }
        Draft.updateLift();
      }
    }, {
      key: 'getDraft',
      value: function getDraft() {
        return $.get('/draft/load-reply?tid=' + this.tid + '&' + U.now());
      }
    }, {
      key: 'saveDraft',
      value: function saveDraft(sync) {
        return $.ajax({
          type: 'POST',
          url: '/draft/save-reply?tid=' + this.tid,
          data: this.body(),
          async: !sync
        });
      }
    }, {
      key: 'deleteDraft',
      value: function deleteDraft() {
        return $.post('/draft/remove-reply', { tid: this.tid });
      }
    }, {
      key: 'body',
      value: function body() {
        if (!this.ue) {
          return {};
        }
        this.ue.options["isSubmit"] = false;
        var data = {
          content: this.ue.getContent().replace(/\&nbsp\;/gi, " ")
        };
        return {
          token: this.token,
          mode: "W",
          data: data
        };
      }
    }]);

    return ReplyDraft;
  }(Draft);

  return { ReplyDraft: ReplyDraft };
});