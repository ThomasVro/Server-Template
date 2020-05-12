/**
 * @return {number} Timestamp of now in seconds
*/
exports.makeTimestamp = () => {
  return Math.floor(Date.now() / 1000)
}

/**
 * @return {string} Date in format YYYYMMDD-hhmmss
*/
exports.getDateTime = () => {
  const d = new Date()
  const year = d.getFullYear()
  let month = '' + (d.getMonth() + 1)
  let day = '' + d.getDate()

  if (month.length < 2) month = `0${month}`
  if (day.length < 2) day = `0${day}`

  let seconds = '' + d.getSeconds()
  let minutes = '' + d.getMinutes()
  let hour = '' + d.getHours()

  if (seconds.length < 2) seconds = `0${seconds}`
  if (minutes.length < 2) minutes = `0${minutes}`
  if (hour.length < 2) hour = `0${hour}`

  const date = [year, month, day].join('')
  const time = [hour, minutes, seconds].join('')
  var current = `${date}-${time}`
  return current
}
