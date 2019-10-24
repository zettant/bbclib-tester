# Copyright (c) 2019 Zettant Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import bbclib
import os
import common
this_directory = os.path.dirname(os.path.abspath(__file__))

user_id1 = common.user_id1
user_id2 = common.user_id2
asset_group_id1 = common.asset_group_id1
asset_group_id2 = common.asset_group_id2
domain_id = common.domain_id

keypair1 = bbclib.KeyPair()
keypair2 = bbclib.KeyPair()


def make_transactions(id_len_conf=None, idlen=None, no_pubkey=False):
    transactions = list()
    if id_len_conf is not None:
        bbclib.configure_id_length(id_len_conf)
    elif idlen is not None:
        bbclib.configure_id_length_all(idlen)
    transactions.append(bbclib.make_transaction(relation_num=1, event_num=1, witness=True, version=2))
    bbclib.add_relation_asset(transactions[0], relation_idx=0, asset_group_id=asset_group_id1,
                              user_id=user_id1, asset_body=b'relation:asset_0-0')
    bbclib.add_event_asset(transactions[0], event_idx=0, asset_group_id=asset_group_id1,
                           user_id=user_id1, asset_body=b'event:asset_0-0')
    transactions[0].events[0].add(mandatory_approver=user_id1)
    transactions[0].witness.add_witness(user_id1)
    sig = transactions[0].sign(keypair=keypair1)
    transactions[0].witness.add_signature(user_id1, sig)

    for i in range(1, 20):
        k = i - 1
        transactions.append(bbclib.make_transaction(relation_num=2, event_num=1, witness=True, version=2))
        bbclib.add_relation_asset(transactions[i], 0, asset_group_id=asset_group_id1, user_id=user_id1,
                                  asset_body=b'relation:asset_1-%d' % i)
        bbclib.add_relation_pointer(transactions[i], 0, ref_transaction_id=transactions[k].transaction_id,
                                    ref_asset_id=transactions[k].relations[0].asset.asset_id)
        bbclib.add_relation_asset(transactions[i], 1, asset_group_id=asset_group_id2, user_id=user_id2,
                                  asset_body=b'relation:asset_2-%d' % i)
        bbclib.add_relation_pointer(transactions[i], 1, ref_transaction_id=transactions[k].transaction_id,
                                    ref_asset_id=transactions[k].relations[0].asset.asset_id)
        bbclib.add_relation_pointer(transactions[i], 1, ref_transaction_id=transactions[0].transaction_id,
                                    ref_asset_id=transactions[0].relations[0].asset.asset_id)
        bbclib.add_event_asset(transactions[i], event_idx=0, asset_group_id=asset_group_id1,
                               user_id=user_id2, asset_body=b'event:asset_3-%d' % i)

        ash = [bbclib.get_new_id("assethash%d" % i)[:bbclib.id_length_conf["asset_id"]] for i in range(5)]
        rtn2 = bbclib.make_relation_with_asset_raw(asset_group_id1, asset_id=ash[0], asset_body=b'relation:asset_4-%d' % i)
        rtn3 = bbclib.make_relation_with_asset_hash(asset_group_id2, asset_ids=ash[1:])
        transactions[i].add(relation=[rtn2, rtn3])
        bbclib.add_relation_pointer(transactions[i], 2, ref_transaction_id=transactions[0].transaction_id,
                                    ref_asset_id=transactions[0].relations[0].asset.asset_id)
        bbclib.add_relation_pointer(transactions[i], 2, ref_transaction_id=transactions[0].transaction_id, ref_asset_id=None)
        bbclib.add_relation_pointer(transactions[i], 3, ref_transaction_id=transactions[0].transaction_id,
                                    ref_asset_id=transactions[0].relations[0].asset.asset_id)

        transactions[i].events[0].add(mandatory_approver=user_id1)
        bbclib.add_reference_to_transaction(transactions[i], asset_group_id1, transactions[i-1], 0)
        transactions[i].add(cross_ref=bbclib.BBcCrossRef(domain_id=domain_id, transaction_id=transactions[0].transaction_id))
        transactions[i].witness.add_witness(user_id1)
        transactions[i].witness.add_witness(user_id2)
        sig1 = transactions[i].sign(keypair=keypair1, no_pubkey=no_pubkey)
        sig2 = transactions[i].sign(keypair=keypair2, no_pubkey=no_pubkey)
        transactions[i].witness.add_signature(user_id1, sig1)
        transactions[i].witness.add_signature(user_id2, sig2)

    return transactions


if __name__ == '__main__':
    keypair1, keypair2 = common.init_keypair()
    id_len_conf = common.read_idlen_config()
    db = common.DataHandler(del_flag=True)
    try:
        db.sql("DROP TABLE txtbl")
    except:
        pass
    db.sql("CREATE TABLE txtbl(txid BLOB PRIMARY KEY, tx BLOB)")
    txobjs = make_transactions(id_len_conf=id_len_conf)
    for tx in txobjs:
        txdat = bbclib.serialize(tx)
        db.sql("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", args=(tx.transaction_id, txdat))
    txobjs = make_transactions(id_len_conf=id_len_conf, no_pubkey=True)
    for tx in txobjs:
        txdat = bbclib.serialize(tx)
        db.sql("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", args=(tx.transaction_id, txdat))
