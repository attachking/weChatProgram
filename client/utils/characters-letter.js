import source from './characters-source'

export default function (text) {
  for (let key in source) {
    if (source[key].indexOf(text) !== -1) {
      return key.charAt(0)
    }
  }
  return text
}
