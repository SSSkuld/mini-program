// miniprogram/pages/text/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pos : 0,
    a1 : [],
    array: {
      "a" : "2",
      "b" : "2"
    }
  },

  onLoad: function (options) {
    this.setData({
      a1 :this.data.a1.concat(this.data.array)
    })
  },
  
  tap: function() {
    this.a()
  },

  tap2: function() {
    this.a(true)
  },

  a(flag) {
    if(flag){
      console.log("asdasd")
    }
    var x = this.data.pos + 5
    this.setData({
      pos : x
    })
    if (x > 20){
      return
    }
    console.log(x)
  },

  // 页面移动
  scroll: function(e) {
    var px = 750 / 750 * wx.getSystemInfoSync().windowWidth;
    
    wx.pageScrollTo({
      scrollTop: 375,
      duration: 300,
    })
  }
 

})