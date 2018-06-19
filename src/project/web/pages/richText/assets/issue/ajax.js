'use strict';

define(function () {
  var icon = '';
  var dpr = window.devicePixelRatio;
  if (dpr) {
    icon = dpr > 1 ? '' : '&icon=60';
  }
  return {
    getForm: function getForm(type) {
      return $.get('/forum.php?action=typeToForum&type=' + type);
    },
    makeTag: function makeTag(title) {
      return $.post('qcross/bbs/thread.php?action=maketag', { title: title });
    },
    searchTag: function searchTag(data) {
      return $.post('/qcross/ask/ajax.php?action=TopicMenu', data);
    },
    tagPreload: function tagPreload(data) {
      return $.post('/thread.php?action=maketag', data);
    },
    issueThread: function issueThread(data) {
      return $.post('/thread-new', data);
    },
    threadEdit: function threadEdit(data) {
      return $.post("/thread-edit", data);
    },
    getTagsByFid: function getTagsByFid(fid) {
      return $.get('/forum.php?action=tagGroup&fid=' + fid + icon);
    }
  };
});