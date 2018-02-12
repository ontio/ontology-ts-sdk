export const ADDR_VERSION = '41'

export const DEFAULT_SCRYPT = {
    cost: 16384,
    blockSize: 8,
    parallel: 8,
    size: 64
  }

  // specified by oep, same as bip38
export const OEP_HEADER = '0142'

export const OEP_FLAG = 'e0'


// Ont://nativeMethod?param1=xxx&param2=yyy
export const WEBVIEW_SCHEME = 'Ont'

export const DEFAULT_ALGORITHM = {
  algorithm : "ECDSA",
  parameters : {
    "curve": "secp256r1"
  }
}