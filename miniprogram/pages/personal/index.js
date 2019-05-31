// pages/personal/index.js
/*
 * 小程序个人页面，页面启动参数是用户的_openid
 * 
 */
const db = wx.cloud.database()
const user = db.collection("User")
const postLike = db.collection("PostLike")
const post = db.collection("Post")
const follow = db.collection("Follow")
const postImage = db.collection("PostImage")
const _this = this
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden_thumbnail: false,
    hidden_detail: true,
    post_cnt: 0,
    follower_cnt: 0,
    following_cnt: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getPageData()
  },

  // 同步函数，页面渲染，获取数据
  async getPageData() {
    var post_likes = []
    var personalPost
    const openId = await this.getPersonalOpenid()
    const userInfo = await this.getUserInfo(openId)
    const numberOfPost = await this.getNumberOfPost(openId)
    const numberOfFollower = await this.getUserFollower(openId)
    const numberOfFollowing = await this.getUserFollowing(openId)
    if (numberOfPost != 0) {
      personalPost = await this.getPersonalPost(openId);
      // 获取每一条post的like
      for (var i = 0; i < personalPost.length; i++) {
        const likes =  await this.getPostLike(personalPost[i]._id)
        const images =  await this.getPostImages(personalPost[i]._id)
        personalPost[i]["images"] = images
        // console.log(images)
        personalPost[i]["likes"] = likes
        this.setData({
          post_array: personalPost
        })
      }
    }

    // console.log(personalPost)
    // if (numberOfPost != 0) {
    //   console.log("2")
    //   this.setData({
    //     post_array: personalPost
    //   })
    // }
    this.setData({
      user_info: userInfo.user_info,
      post_cnt: numberOfPost,
      follower_cnt: numberOfFollower,
      following_cnt: numberOfFollowing
    })
  },

  // 获取个人页面需要的openid
  getPersonalOpenid() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        resolve(res.result.openid)
      })
    })
  },

  // 用户信息
  getUserInfo(openId) {
    return new Promise((resolve, reject) => {
      user.where({
        _openid: openId
      }).get().then(resUserInfo => {
        console.log("obtained userInfo")
        console.log(resUserInfo)
        resolve(resUserInfo.data[0])
      })
    })
  },

  // 获取用户post数量，数量不为1才使用云函数，如为0时掉用云函数会报错
  getNumberOfPost(openId) {
    return new Promise((resolve, reject) => {
      post.where({
        _openid: openId
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 获取用户的follower 关注当前用户的人
  getUserFollower(openId) {
    return new Promise((resolve, reject) => {
      follow.where({
        recommend_openid: openId
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 获取用户的following 用户关注的人的数量
  getUserFollowing(openId) {
    return new Promise((resolve, reject) => {
      follow.where({
        current_user_openid: openId
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 获取用户全部post
  getPersonalPost(open_Id) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "getPersonalPost",
        data: {
          openId: open_Id
        }
      }).then(resPost => {
        console.log("obtained PersonalPost")
        resolve(resPost.result.data)
      })

      // post.where({
      //   _openid: openId
      // }).get().then(res => {
      //   console.log("obtained PersonalPost")
      //   resolve(res.data)
      // })
    })
  },

  //获取用户每条post点赞数
  getPostLike(post_Id) {
    return new Promise((resolve, reject) => {
      postLike.where({
        post_id: post_Id
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 获取用户每条post的所有图片
  getPostImages(post_Id) {
    return new Promise((resolve, reject) => {
      postImage.where({
        post_id: post_Id
      }).get().then(res => {
        resolve(res.data)
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  //点击导航栏的缩略图按钮
  tapThumbnail: function() {
    this.setData({
      hidden_thumbnail: false,
      hidden_detail: true,
    })
  },

  //点击导航栏的详细按钮
  tapDetail: function() {
    this.setData({
      hidden_thumbnail: true,
      hidden_detail: false,
    })
  },

  // 页面滑动到详细位置
  scrollToDetail: function(e) {
    var index = e.target.dataset.index
    this.setData({
      hidden_thumbnail: true,
      hidden_detail: false,
    })
    var rpx = 300 + 80
    rpx += index * 930
    var px = rpx / 750 * wx.getSystemInfoSync().windowWidth;
    wx.pageScrollTo({
      scrollTop: px,
      duration: 300,
    })
  }
})