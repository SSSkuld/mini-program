// 云函数入口文件
// 获取用户个人的所有动态
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const postImage = db.collection("PostImage")
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {

  const batchTimes = 1
  // 承载所有读操作的 promise 的数组
  const tasks = []
  const promise = postImage.skip(0).limit(MAX_LIMIT).get()
  tasks.push(promise)
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))
}