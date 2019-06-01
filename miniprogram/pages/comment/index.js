// miniprogram/pages/comment/index.js
/*
* 评论页面， 启动参数是评论的 id
*/
var input
const db = wx.cloud.database()
const user = db.collection("User")
const db_postComment = db.collection("PostComment")
const db_SecondComment = db.collection("SecondComment")
const db_post = db.collection("Post")
var postId
var userInfo
var current_comment_id
var current_user_nickName
var isFirst = true
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment_post: true,
    comment_view: 'bottom: 2rpx',
    post:{
      avatarUrl: "",
      nickName: "",
      text: "",
      time: ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // 获取userInfo
    postId = options._postid
    var that = this
    wx.cloud.callFunction({
      name: "login"
    }).then(res => {
      user.where({
        _openid: res.result.openid
      }).get().then(res => {
        userInfo = res.data[0]
        console.log(userInfo)
        if (postId) {
          that.getAllComment(postId)
        }
    })
    
    })
  },

  async getAllComment(_postid) {
    const orginPost = await this.getPost(_postid)
    const postUser = await this.getPostUser(orginPost._openid)
    const numberOfFistComment = await this.getNumberOfFistComment(_postid)
    console.log(numberOfFistComment)
    if (numberOfFistComment) {
      console.log("1")
      const firstComment = (await this.getFisrstComment(_postid))
      console.log(firstComment)
      for (var i = 0; i < firstComment.length; i++) {
        
        const secondComment = await this.getSecondComment(firstComment[i]._id)
        firstComment[i]["second_comment"] = secondComment
      }
      await this.setData({
        first_comment: firstComment,
        
      })
    }
    await this.setData({
      post: {
        avatarUrl: postUser.user_info.avatarUrl,
        nickName: postUser.user_info.nickName,
        text: orginPost.post_text,
        time: orginPost.post_time
      }
    })
  },

  // 获取源动态的test
  getPost (_postid) {
    return new Promise((resolve, reject) => {
      db_post.where({
        _id: _postid
      }).get().then(res => {
        console.log(res.data[0])
        resolve(res.data[0])
      })
    })
  },

  // 获取源动态的用户信息
  getPostUser (_post_openid) {
    return new Promise((resolve, reject) => {
      user.where({
        _openid: _post_openid
      }).get().then(res => {
        console.log(res.data[0])
        resolve(res.data[0])
      })
    })
  },

  // 获取一级评论数量
  getNumberOfFistComment(_postid) {
    return new Promise((resolve, reject) => {
      db_postComment.where({
        post_id: _postid
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 获取一级评论
  getFisrstComment(_postid) {
    console.log(_postid)
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "getPostComment",
        data: {
          postId: _postid
        }
      }).then(res => {
        resolve(res.result.data)
      })
    })
  },

  // 获取二级评论
  getSecondComment(_commentid){
    return new Promise((resolve, reject) => {
      db_SecondComment.where({
        comment_id: _commentid
      }).get().then(res => {
        console.log(res.data)
        resolve(res.data)
      })
    })
  },

  // 回复一级评论
  firstReply: function(e) {
    console.log(e.target.dataset.id)
    console.log(e.target.dataset.nickname)
    current_comment_id = e.target.dataset.id
    current_user_nickName = e.target.dataset.nickname
    this.setData({
      focus: true,
    })
    isFirst = false
  },

  // 回复二级评论
  secondReply: function(e) {
    console.log(e.target.dataset.id)
    console.log(e.target.dataset.nickname)
    current_comment_id = e.target.dataset.id
    current_user_nickName = e.target.dataset.nickname
    this.setData({
      focus: true,
    })
    // isFirst = false
  },

  // input聚焦
  inputFocus: function(e) {
    console.log(e)
    var that = this
    if(e.detail.height == 0) {
      return
    }
    else {
      str = 'bottom: ' + String(e.detail.height) + 'px'
      console.log(str)
      this.setData({
        comment_view: str
      })
    }
  },

  // input失焦
  inputBlur: function(e) {
    this.setData({
      comment_post: true,
      comment_view: 'bottom: 2rpx'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 获取评论input的值
  commentInput: function(e) {
    input = e.detail.value
  },

  // 发送评论
  // 动态评论和评论评论
  postComment: function() {
    var that = this
    if (isFirst){
      db_postComment.add({
        data: {
          post_id: postId,
          user_id: userInfo._openid,
          nickName: userInfo.user_info.nickName,
          avatarUrl: userInfo.user_info.avatarUrl,
          text: input
        }
      }).then(res => {
        console.log("Add post comment")
        that.getAllComment(postId)
      })
    }
    else {
      console.log("commentComment")
      db_SecondComment.add({
        data: {
          comment_id: current_comment_id,
          comment_nickName: current_user_nickName,
          user_id: userInfo._openid,
          nickName: userInfo.user_info.nickName,
          avatarUrl: userInfo.user_info.avatarUrl,
          text: input
        }
      }).then(res => {
        console.log("Add second comment")
        that.getAllComment(postId)
        isFirst = true
      })
    }
    
  },

})