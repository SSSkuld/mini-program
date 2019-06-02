// miniprogram/pages/search2/index.js
const db = wx.cloud.database()
const postImage = db.collection("PostImage")
const user = db.collection("User")
var input
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden_search_post: true,
    hidden_waterfall: false,
    hidden_search_user: true,
    hidden_search: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getPageData()
  },

  //
  async getPageData() {
    images = await this.getWaterfall()
    this.setData({
      waterfall: images
    })
  },

  // 搜集瀑布流图片
  getWaterfall() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "getPostImage"
      }).then(res => {
        console.log(res.result)
        resolve(res.result.data)
      })
    })
  },

  // 获取输入框的值
  searchInput: function(e) {
    input = e.detail.value
  },

  // 搜索
  search: function(e) {
    this.search2()
  },

  async search2() {
    console.log("search2")
    console.log(input)
    const post = await this.searchPost()
    const user = await this.searchInfo()
    // 切换前段显示
    this.setData({
      hidden_search_post: false,
      hidden_waterfall: true,
      hidden_search: false,
    })
    console.log("post", post)
    console.log("user", user)
    if (post) {
      for (var i = 0; i < post.length; i++) {
        const image = await this.getImage(post[i]._id)
        const userInfo = await this.getUserInfo(post[i]._openid)
        post[i]["image"] = image
        post[i]["avatarUrl"] = userInfo.avatarUrl
        post[i]["nickName"] = userInfo.nickName
        this.setData({
          post: post,
        })
      }
    }

    if (user) {
      this.setData({
        user: user,
      })
    }

  },

  // 搜索动态
  searchPost() {
    return new Promise((resolve, reject) => {
      db.collection('Post').where({
        //"post_text": this.data.inputValue
        post_text: {
          $regex: '.*' + input,
          $options: 'i'
        }
      }).orderBy('time', 'desc').get().then(res => {
        resolve(res.data);
      })
    })
  },


  // 搜索用户
  searchInfo() {
    return new Promise((resolve, reject) => {
      db.collection('User').where({
        //"user_info.nickName": this.data.inputValue
        user_info: {
          nickName: {
            $regex: '.*' + input,
            $options: 'i'
          }
        }
      }).get().then(res => {
        resolve(res.data)
      })
    })
  },

  // 获取用户信息
  getUserInfo(_openId) {
    return new Promise((resolve, reject) => {
      user.where({
        _openid: _openId
      }).get().then(res => {
        resolve(res.data[0].user_info)
      })
    })
  },

  // 获取post第一张图片
  getImage(_postId) {
    return new Promise((resolve, reject) => {
      postImage.where({
        post_id: _postId
      }).get().then(res => {
        resolve(res.data[0].file_id)
      })
    })
  },

  // 搜索动态
  searchPost: function(e) {
    this.setData({
      hidden_search_user: true,
      hidden_search_post: false
    })
  },

  // 搜索用户
  searchUser: function(e) {
    this.setData({
      hidden_search_user: false,
      hidden_search_post: true
    })
  }


})