'use strict';

define(['assets/issue/util'], function (U) {

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function  发布新帖子时获取帖子草稿
  * @Param {string} type 帖子类型
  * @Param {number} fid  主版块id
  * @Returns {jQuery defferred}
  * @Returns {Defferred} jQuery Defferred对象
  */
  /* --------------------------------------------------------------------------*/
  var getDraftBeforePub = function getDraftBeforePub(type, fid) {
    return $.get('/draft/load-new?type=' + type + '&fid=' + fid + '&' + U.now());
  };

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function 编辑帖子或楼层时时获取草稿
  * @Param {number} pid 编辑的楼层id
  * @Returns {Defferred} jQuery Defferred对象
  */
  /* --------------------------------------------------------------------------*/
  var getDraftBeforeEdit = function getDraftBeforeEdit(pid) {
    return $.get('/draft/load-modify?pid=' + pid + '&' + U.now());
  };

  var getDraftBeforeReply = function getDraftBeforeReply(tid) {
    return $.get('/draft/load-reply?tid=' + tid + '&' + U.now());
  };

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function 获取草稿
  * @Param {number} from 判断帖子来源，发布页1，编辑页0, 2: 底部回复
  * @Returns {Defferred} jQuery Defferred对象
  */
  /* --------------------------------------------------------------------------*/

  // const getDraft = ({type, fid, pid, tid} = {}, from = 1) => from ? getDraftBeforePub(type, fid) : getDraftBeforeEdit(pid);
  var getDraft = function getDraft() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        type = _ref.type,
        fid = _ref.fid,
        pid = _ref.pid,
        tid = _ref.tid;

    var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    switch (from) {
      case 0:
        return getDraftBeforeEdit(pid);
        break;
      case 1:
        return getDraftBeforePub(type, fid);
        break;
      case 2:
        return getDraftBeforeReply(tid);
        break;
      default:
        return getDraftBeforePub(type, fid);

    }
  };

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function 发布新帖时保存草稿
  *
  * @Param {string} type 帖子类型
  * @Param {number} fid 主版块id
  * @Param {object} data 帖子内容
  * @Param {boolean} async true: 异步请求 false: 同步请求
  * @Returns {Defferred} jQuery Defferred对象
  */
  /* --------------------------------------------------------------------------*/
  var saveDraftForPub = function saveDraftForPub(type, fid, data, async) {
    return $.ajax({
      type: "POST",
      url: '/draft/save-new?type=' + type + '&fid=' + fid,
      data: data,
      async: async
    });
  };

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function 编辑时保存草稿
  * @Param {number} pid 保存草稿的楼层id
  * @Param {object} data
  *   @property {string} token 从读取草稿请求中得到的token值
  *   @property {string} model 草稿使用的编辑器模式
  *   @property {object} data
  *     @property {string} subject 帖子标题
  *     @property {string} content 帖子正文（编辑器产出的内容）
  *     @property {array} attachment 附件临时key
  *     @property {number} plan_id 关联的行程单
  *     @property {array} tag tag名称
  * @Returns {Defferred} jQuery Defferred对象
  */
  /* --------------------------------------------------------------------------*/
  var saveDraftForEdit = function saveDraftForEdit(pid, data, async) {
    return $.ajax({
      type: 'POST',
      url: '/draft/save-modify?pid=' + pid,
      data: data,
      async: async
    });
  };

  var saveDraftForReply = function saveDraftForReply(tid, data, async) {
    return $.ajax({
      type: 'POST',
      url: '/draft/save-reply?tid=' + tid,
      data: data,
      async: async
    });
  };

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function 保存草稿
  * @Param {number} from 草稿来源 0: 编辑 1: 发布 2: 回复
  * @Param {object} data
  * @Returns {Defferred} jQuery Defferred对象
  */
  /* --------------------------------------------------------------------------*/

  // const saveDraft = ({type, fid, pid, data, async = true} = {}, from = 1) => from ? saveDraftForPub(type, fid, data, async) : saveDraftForEdit(pid, data, async);
  var saveDraft = function saveDraft() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        type = _ref2.type,
        tid = _ref2.tid,
        fid = _ref2.fid,
        pid = _ref2.pid,
        data = _ref2.data,
        _ref2$async = _ref2.async,
        async = _ref2$async === undefined ? true : _ref2$async;

    var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    switch (from) {
      case 0:
        return saveDraftForEdit(pid, data, async);
        break;
      case 1:
        return saveDraftForPub(type, fid, data, async);
        break;
      case 2:
        return saveDraftForReply(tid, data, async);
        break;
      default:
        return saveDraftForPub(type, fid, data, async);
    }
  };

  var deleteDraftForPub = function deleteDraftForPub(type, fid) {
    return $.post('/draft/remove-new', { type: type, fid: fid });
  };
  var deleteDraftForEdit = function deleteDraftForEdit(pid) {
    return $.post('/draft/remove-modify', { pid: pid });
  };
  var deleteDraftForReply = function deleteDraftForReply(tid) {
    return $.post('/draft/remove-reply', { tid: tid });
  };

  // const deleteDraft = ({type, fid, pid} = {}, from = 1) => from ? deleteDraftForPub(type, fid) : deleteDraftForEdit(pid);
  var deleteDraft = function deleteDraft() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        type = _ref3.type,
        fid = _ref3.fid,
        pid = _ref3.pid,
        tid = _ref3.tid;

    var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    switch (from) {
      case 0:
        return deleteDraftForEdit(pid);
        break;
      case 1:
        return deleteDraftForPub(type, fid);
        break;
      case 2:
        return deleteDraftForReply(tid);
        break;
      default:
        return deleteDraftForPub(type, fid);
    }
  };

  return { getDraft: getDraft, getDraftBeforeEdit: getDraftBeforeEdit, saveDraft: saveDraft, saveDraftForEdit: saveDraftForEdit, deleteDraft: deleteDraft };
});