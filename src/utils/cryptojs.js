/**
 * 工具类
 */
import CryptoJS from 'crypto-js'
export default {
  // 加密
  encrypt(word, keyStr) {
    keyStr = keyStr || 'abcdefgabcdefg12'
    var key = CryptoJS.enc.Utf8.parse(keyStr)
    var srcs = CryptoJS.enc.Utf8.parse(word)
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: CryptoJS.enc.Utf8.parse(keyStr),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.ciphertext.toString().toLowerCase()
  },
  // 解密
  decrypt(word, keyStr) {
    keyStr = keyStr || 'abcdefgabcdefg12'
    const encryptedHexStr = CryptoJS.enc.Hex.parse(word)
    const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
    const decrypt = CryptoJS.AES.decrypt(srcs, CryptoJS.enc.Utf8.parse(keyStr), {
      iv: CryptoJS.enc.Utf8.parse(keyStr),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
    return decryptedStr.toString()
  }
}
