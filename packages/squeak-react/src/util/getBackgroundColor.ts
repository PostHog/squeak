export default function getBackgroundColor(el) {
  const color = window.getComputedStyle(el).backgroundColor
  if (color !== 'rgba(0, 0, 0, 0)' || el.tagName.toLowerCase() === 'body') {
    return color
  } else {
    return getBackgroundColor(el.parentElement)
  }
}
