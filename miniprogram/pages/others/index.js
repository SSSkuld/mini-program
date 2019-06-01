// pages/personal/index.js
/*
 * 其他用户界面，启动参数是该用户的_openid
 */
const db = wx.cloud.database()
const user = db.collection("User")
const postLike = db.collection("PostLike")
const follow = db.collection("Follow")
const post = db.collection("Post")
const postImage = db.collection("PostImage")
const _this = this
var index_open_id
var user_id
var userOpenId
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
    var openId = options._id
    user_id = options._id
    userOpenId = user_id
    // console.log(openId)
    this.getPageData(openId);
  },

  // 同步函数，页面渲染，获取数据
  async getPageData(openId) {
    var post_likes = []
    var personalPost
    // 获取操作人的open_id
    console.log(openId)
    index_open_id = await this.getIndexId()
    const userInfo = await this.getUserInfo(openId)
    const isFollow = await this.getIsFollow(openId)
    const numberOfPost = await this.getNumberOfPost(openId)
    const numberOfFollower = await this.getUserFollower(openId)
    const numberOfFollowing = await this.getUserFollowing(openId)
    console.log("numberOfPost", numberOfPost)
    console.log("numberOfFollowing", numberOfFollowing)
    console.log("numberOfFollower", numberOfFollower)
    this.setData({
      user_info: userInfo.user_info,
      is_follow: isFollow,
      follow_color: isFollow ? "lightgrey": "#008ddd",
      post_cnt: numberOfPost,
      follower_cnt: numberOfFollower,
      following_cnt: numberOfFollowing
    })
    if (numberOfPost != 0) {
      personalPost = await this.getPersonalPost(openId);
      // 获取每一条post的like
      for (var i = 0; i < personalPost.length; i++) {
        const likes = await this.getPostLike(personalPost[i]._id)
        const images = await this.getPostImages(personalPost[i]._id)
        const isLike = await this.getIsLike(personalPost[i]._id)
        console.log("isLike", isLike)
        if (isLike != 0) {
          personalPost[i]["isLike"] = true
        } else {
          personalPost[i]["isLike"] = false
        }
        personalPost[i]["images"] = images
        // console.log(images)
        personalPost[i]["likes"] = likes
        this.setData({
          post_array: personalPost
        })
      }
    }
    // if (numberOfPost != 0) {
    //   this.setData({
    //     post_array: personalPost
    //   })
    // }
    
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

  // 获取操作用户的open_id
  getIndexId() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        resolve(res.result.openid)
      })
    })
  },

  // 他人用户信息
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

  // 获取用户是否对目标用户的post点赞
  getIsLike(post_Id) {
    return new Promise((resolve, reject) => {
      postLike.where({
        post_id: post_Id,
        _openid: index_open_id
      }).count().then(res => {
        resolve(res.total)
      })
    })
  },

  // 给用户post点赞
  tapLike: function(e) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var postArray = this.data.post_array
    console.log(e.target.dataset.id)
    const index = e.target.dataset.id
    const postId = e.target.dataset.postid
    
    if (!postArray[index].isLike) {
      // 如果没有点赞、点赞
      postLike.add({
        data: {
          post_id: postId,
          user_id: index_open_id,
          time: timestamp,
          beliked_user: userOpenId
        }
      }).then(res => {
        console.log("Like post")
        postArray[index]["isLike"] = true
        postArray[index]["likes"] += 1
        this.setData({
          post_array: postArray
        })
      })
    }
    else {
      // 如果点赞了取消点赞，并且删除数据库记录
      postLike.where({
        post_id: postId,
        user_id: index_open_id
      }).get().then(res => {
        // 搜出后删除记录
        postLike.doc(res.data[0]._id).remove().then(res => {
          console.log("Delete post like record")
          // 向前段传送数据
          postArray[index]["isLike"] = false
          postArray[index]["likes"] -= 1
          this.setData({
            post_array: postArray
          })
        })
      })
    }
  },

  // 关注该用户、以及取关该用户
  followUser: function() {
    isFollow = this.data.is_follow
    var that = this
    if(!isFollow){
      follow.add({
        data: {
          current_user_openid: index_open_id,
          recommend_openid: user_id
        }
      }).then(res => {
        console.log("Follow user")
        this.setData({
          is_follow: true,
          follow_color: "lightgrey"
        })
      })
    }
    else {
      follow.where({
        current_user_openid: index_open_id,
        recommend_openid: user_id
      }).get().then(res => {
        console.log(res.data[0]._id)
        follow.doc(res.data[0]._id).remove().then(
          console.log("Unfollow user"),
          that.setData({
            is_follow: false,
            follow_color: "#008ddd"
          })
        )
      })
    }
    
  },

  getIsFollow: function() {
    return new Promise((resolve, reject) => [
      follow.where({
        current_user_openid: index_open_id,
        recommend_openid: user_id
      }).count().then(res => {
        resolve(res.total)
      })
    ])
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
  scrollToDetail: function (e) {
    console.log(e)
    var index = e.target.dataset.index
    this.setData({
      hidden_thumbnail: true,
      hidden_detail: false,
    })
    var rpx = 300 + 80
    rpx += index * 930
    var px = rpx / 750 * wx.getSystemInfoSync().windowWidth;
    console.log("index", index, "px", px)
    wx.pageScrollTo({
      scrollTop: px,
      duration: 300,
    })
  }


})