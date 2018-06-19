"use strict";

define(function () {

  return {
    disTop: 51,
    toolOrgRight: function toolOrgRight() {
      return {
        fl: +($(".qy_issue_travel_content").offset().left || 0).toFixed() + $(".qy_issue_travel_content").width() + 2
      };
    },
    init: function init(type) {
      this.dom = $(".tool_right");
      this.initOffset();
      this.bindEvent(type);
    },
    initOffset: function initOffset() {
      this.offset = this.dom.offset();
    },
    bindEvent: function bindEvent(type) {
      var _this = this;

      var $w = $(window);
      $('.tool_right').on('mousedown', 'img', function (e) {
        e.preventDefault();
      });
      $w.on("scroll", function () {
        var qitcTop = ($(".qy_issue_travel_content").offset() || {}).top || 0;
        var csso = { position: "absolute", top: 0, left: '' };
        if (type === 'edit') {
          // csso = {position: 'absolute', right: window.getComputedStyle ? window.getComputedStyle($(".tool_right").get(0),null).right : $(".tool_right").get(0).currentStyle.right, top: 0, left: ''};
          qitcTop = qitcTop + 40;
        }
        if ($w.scrollTop() > qitcTop - _this.disTop - 40) {
          _this.dom.css('position') !== "fixed" && _this.dom.css({ position: 'fixed', left: _this.toolOrgRight().fl, top: _this.disTop + 40 + 'px' });
        } else {
          _this.dom.css('position') !== "absolute" && _this.dom.css(csso);
        }
      });
    }
  };
});