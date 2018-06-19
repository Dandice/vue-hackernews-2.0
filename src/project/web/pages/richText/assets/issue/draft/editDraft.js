'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['assets/issue/draft/draft', 'assets/issue/util'], function (D, U) {
  var EditDraft = function (_D$Draft) {
    _inherits(EditDraft, _D$Draft);

    function EditDraft(pid) {
      _classCallCheck(this, EditDraft);

      //编辑首楼时首楼id
      var _this = _possibleConstructorReturn(this, (EditDraft.__proto__ || Object.getPrototypeOf(EditDraft)).call(this));

      _this.pid = pid;
      return _this;
    }

    _createClass(EditDraft, [{
      key: 'getDraft',
      value: function getDraft() {
        return $.get('/draft/load-modify?pid=' + this.pid + '&' + U.now());
      }
    }, {
      key: 'saveDraft',
      value: function saveDraft(sync) {
        return $.ajax({
          type: 'POST',
          url: '/draft/save-modify?pid=' + this.pid,
          data: this.body(),
          async: !sync
        });
      }
    }, {
      key: 'deleteDraft',
      value: function deleteDraft() {
        return $.post('/draft/remove-modify', { pid: this.pid });
      }
    }, {
      key: 'body',
      value: function body() {
        if (!this.ue) {
          return {};
        }
        var plan_id = this.plan && this.plan.getPlanID();
        //设置是否为提交操作，编辑器中提交时，会转数据，保存草稿则不做操作。提交为true。保存为false
        this.ue.options["isSubmit"] = false;
        var mainTags = $('.main-tags .selected').map(function () {
          return $(this).text();
        }).toArray();
        var data = {
          subject: $.trim($("#threadTitle").val()),
          content: this.ue.getContent().replace(/\&nbsp\;/gi, " "),
          tag: $("#js_tagContainer > a").map(function () {
            return $(this).text();
          }).toArray().concat(mainTags),
          plan_id: plan_id
        };
        // data.md5 = typeof md5 === "function" && md5(data.content);
        return {
          token: this.token,
          mode: "W",
          data: data
        };
      }
    }]);

    return EditDraft;
  }(D.Draft);

  return { EditDraft: EditDraft };
});