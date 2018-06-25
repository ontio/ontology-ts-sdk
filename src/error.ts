/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */

export enum ERROR_CODE {
    SUCCESS	            =     0, // 成功
    SESSION_EXPIRED     = 41001,   // 会话无效或已过期（ 需要重新登录） |
    SERVICE_CEILING     = 41002,   // 达到服务上限 |
    ILLEGAL_DATAFORMAT  = 41003,   // 不合法数据格式 |
    INVALID_VERSION     = 41004,   // 不合法的版本 |
    INVALID_METHOD      = 42001,   // 无效的方法 |
    INVALID_PARAMS      = 42002,   // 无效的参数 |
    INVALID_TRANSACTION = 43001,   // 无效的交易 |
    INVALID_ASSET       = 43002,   // 无效的资产 |
    INVALID_BLOCK       = 43003,   // 无效的块 |
    UNKNOWN_TRANSACTION = 44001,   // 找不到交易 |
    UNKNOWN_ASSET       = 44002,   // 找不到资产 |
    UNKNOWN_BLOCK       = 44003,   // 找不到块 |
    UNKNWN_CONTRACT     = 44004,   // 找不到合约 |
    INTERNAL_ERROR      = 45001,   // 内部错误 |
    SMARTCODE_ERROR     = 47001,   // 智能合约错误 |

    UNKNOWN_ONTID       = 51000,   // 不存在的ONT ID,
    NETWORK_ERROR       = 52000,   // 网络错误,
    Decrypto_ERROR      = 53000,    // 解密错误,
    INVALID_ADDR        = 53001,   // 地址验证失败

    PreExec_ERROR = 54000   // 预执行错误
}
