// 静态托管环境下的mock配置
window.isStaticHosting = true
console.log('🚀 运行在静态托管环境（GitHub Pages）')

// 覆盖console.error避免API错误干扰
const originalError = console.error
console.error = function(...args) {
  // 过滤掉某些已知的API错误
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Network Error')) {
    console.warn('📡 API请求失败（预期中，因为这是静态托管）:', args[1] || '')
    return
  }
  originalError.apply(console, args)
}