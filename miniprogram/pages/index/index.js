//index.js
const app = getApp()
const db = wx.cloud.database()
const user = db.collection("User")
Page({
  data: {
    isAuthorized: false
  },

  onLoad: function() {
    this.isAuthorized()
  },

  // 判断TA是否授权
  async isAuthorized() {
    const userOpenid = await this.getUserOpenid();
    const flag = await this.getFlag(userOpenid);
    if (flag){
      wx.reLaunch({
        url: '../base/base',
      })
    }
    
  },

  // 获取用户的openid 
  getUserOpenid() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "login"
      }).then(res => {
        resolve(res.result.openid)
      })
    })
  },

  // 搜索user表里是否有该openid的信息
  getFlag(userOpenid) {
    return new Promise((resolve, reject) => {
      user.where({
        _openid: userOpenid
      }).count().then(res => {
        console.log(res.total)
        resolve(res.total)
      })
    })
  },

  // 获取用户信息，并且上传到user表里
  onGotUserInfo: function(e) {
    user.add({
      data:{
        user_info: e.detail.userInfo
      }
    }).then(res => {
      console.log("Add user info successed!")
      wx.reLaunch({
        url: '../base/base',
      })
    })
  }
})
