// miniprogram/pages/newpost/index.js
const db = wx.cloud.database()
const post = db.collection("Post")
const postImage = db.collection("PostImage")
const app = getApp()
var tempFilePaths
var postText
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    tempFilePaths=null
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

  // 获取用户输入的文字
  bindinput: function(e) {
    postText = e.detail.value
  },

  // 选取照片 1张
  addImage: function() {
    var that = this
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        tempFilePaths = res.tempFilePaths
        that.setData({
          temp_file: tempFilePaths
        })
      },
    })
  },

  // 上传照片、修改数据库
  async uploadAndAdd(tempFilePath) {
    console.log(tempFilePath)
    const postId = await this.addPost()
    //console.log(tempFilePath.length)
    if(tempFilePath!=null)
    {
      for (var i = 0; i < tempFilePath.length; i++) {
        const j = i
        const fileId = await this.uploadImage(tempFilePath[j])
        const res = await this.addPostImage(postId, fileId)
      }
    }
    
    console.log('upload done')
  },

  // 上传照片到云存储
  uploadImage(tempFilePath) {
    var randPath = Math.floor(Math.random() * 1000000).toString() + '.png'
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: randPath,
        filePath: tempFilePath,
        success: res => {
          resolve(res.fileID)
        }
      })
    })
  },

  // 往数据库里添加数据 
  // tag暂未实现
  addPost() {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);
    //获取当前时间  
    var n = timestamp * 1000;
    var date = new Date(n);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    //时  
    var h = date.getHours();
    //分  
    var m = date.getMinutes();
    //秒  
    var s = date.getSeconds(); 
    return new Promise((resolve, reject) => {
      post.add({
        data: {
          post_text: postText,
          time: timestamp,
          post_time: Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s,
        }
      }).then(res => {
        console.log(res)
        console.log("Add post successed!")
        resolve(res._id)
      })
    })
    
  },

  // 往postImage表里添加数据
  addPostImage(postId, fileId) {
    return new Promise((resolve, reject) => {
      postImage.add({
        data: {
          post_id: postId,
          file_id: fileId
        }
      }).then(res => {
        console.log("Add postImage successed!")
        resolve(res)
      })
    })
  },

  // 发post
  share: function() {
    if (tempFilePaths) {
      this.uploadAndAdd(tempFilePaths)
      wx.showToast({
        title: 'Shared!',
        icon: 'success',
        duration: 2000
      })
    }
    else {
      wx.showModal({
        title: "Share failed.",
        content: "Please at least choose 1 photo.",
        confirmText: "confirm",
        showCancel: false,
      })
    }
  }
})