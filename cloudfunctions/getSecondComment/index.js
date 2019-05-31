// 云函数入口文件
// 获取动态的所有一级评论
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const postComment = db.collection("SecondComment")
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  //先取出集合总数
  const countResult = await postComment.where({ comment_id: event.commentId }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = postComment.where({
      comment_id: event.commentId
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))
}