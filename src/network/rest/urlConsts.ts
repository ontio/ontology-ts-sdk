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

/**
 * Restful api
 */
export default {
    Url_send_transaction : '/api/v1/transaction',
    Url_get_transaction : '/api/v1/transaction/',
    Url_get_generate_block_time : '/api/v1/node/generateblocktime',
    Url_get_node_count : '/api/v1/node/connectioncount',
    Url_get_block_height : '/api/v1/block/height',
    Url_get_block_by_height : '/api/v1/block/details/height/',
    Url_get_block_by_hash : '/api/v1/block/details/hash/',
    Url_get_account_balance : '/api/v1/balance/',
    Url_get_contract_state : '/api/v1/contract/',
    Url_get_smartcodeevent_txs_by_height : '/api/v1/smartcode/event/transactions/',
    Url_get_smartcodeevent_by_txhash : '/api/v1/smartcode/event/txhash/',
    Url_get_block_height_by_txhash : '/api/v1/block/height/txhash/',
    Url_get_storage : '/api/v1/storage/',
    Url_get_merkleproof : '/api/v1/merkleproof/',
    Url_get_allowance: '/api/v1/allowance/',
    Url_get_block_txs_by_height: '/api/v1/block/transactions/height/',
    Url_get_unbound_ong: '/api/v1/unboundong/',
    Url_get_grant_ong: '/api/v1/grantong/',
    Url_get_mempool_txcount: '/api/v1/mempool/txcount',
    Url_get_mempool_txstate: '/api/v1/mempool/txstate/',
    Url_get_version: '/api/v1/version',
    Url_get_networkid: '/api/v1/networkid',
    Url_get_gasprice: '/api/v1/gasprice'
};
