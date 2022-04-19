export const monthHasDays = (month, year) => {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 1 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    return 29
  } else {
    return days[month]
  }
}

export const getPrevMonth = (currMonth, currYear) => {
  const temp = currMonth - 1
  if (temp >= 0) {
    return [temp, currYear]
  } else {
    return [(temp + 12) % 12, currYear - 1]
  }
}

export const getNextMonth = (currMonth, currYear) => {
  const temp = currMonth + 1
  if (temp < 12) {
    return [temp, currYear]
  } else {
    return [temp % 12, currYear + 1]
  }
}

// 返回一个矩阵，用于描述某一年某一月的分布情况
export const getDaysMatrix = (month, year) => {
  const date = new Date(year, month, 1)
  const weekday = date.getDay()
  const currMonthLength = monthHasDays(month, year) // 本月天数
  const prevMonthLength = monthHasDays(...getPrevMonth(month, year)) // 上个月天数
  const totalLength = Math.ceil((weekday + currMonthLength) / 7) * 7 // 本月在日历中占据的位置数量

  const rows = totalLength / 7 // 列数

  const matrix = Array.from({ length: rows }) // 使用二维数组描述日历排布
  matrix.forEach((it, index) => {
    matrix[index] = Array.from({ length: 7 })
  })

  let index = 0 // 填充
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < 7; j++) {
      index++
      // 填充上一个月
      if (index <= weekday) {
        matrix[i][j] = {
          day: index + prevMonthLength - weekday,
          monthBase: -1
        }
      } else if (index - weekday <= currMonthLength) {
        // 填充本月
        matrix[i][j] = {
          day: index - weekday,
          monthBase: 0
        }
      } else {
        // 填充下一个月
        matrix[i][j] = {
          day: index - (currMonthLength + weekday),
          monthBase: 1
        }
      }
    }
  }
  return matrix
}
