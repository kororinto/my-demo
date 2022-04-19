export function formatDate (date, fmt = 'yyyy-MM-dd hh:mm') {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  console.dir("date",date);
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero (str) {
  return ('00' + str).substr(str.length)
}

export function formatDate4Str (str, fmt = 'yyyy-MM-dd hh:mm') {
  if (typeof str === 'string') {
    str = str.replace(/-/g, '/')
  }
  if (!str) {
    return str
  }
  let date = new Date(str)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

export function handleFormatDate (time, fmt = 'yyyy-MM-dd hh:mm') {
  // [new Date() 在Safari下的 Invalid Date问题 - 知乎](https://zhuanlan.zhihu.com/p/63298247)
  if (typeof time === 'string') {
    time = time.replace(/-/g, '/')
  }
  return time ? formatDate(new Date(time), fmt) : time
}
