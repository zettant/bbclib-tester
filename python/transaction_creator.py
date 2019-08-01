#
#

import bbclib
import os
import common
this_directory = os.path.dirname(os.path.abspath(__file__))

user_id1 = common.user_id1
user_id2 = common.user_id2
asset_group_id1 = common.asset_group_id1
asset_group_id2 = common.asset_group_id2

keypair1 = bbclib.KeyPair()
keypair2 = bbclib.KeyPair()


def make_transactions(id_len_conf=None, idlen=None, no_pubkey=False):
    transactions = list()
    if id_len_conf is not None:
        bbclib.configure_id_length(id_len_conf)
    elif idlen is not None:
        bbclib.configure_id_length_all(idlen)
    transactions.append(bbclib.make_transaction(relation_num=1, event_num=1, witness=True))
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
        transactions.append(bbclib.make_transaction(relation_num=2, event_num=1, witness=True))
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
                               user_id=user_id1, asset_body=b'event:asset_3-%d' % i)
        transactions[i].events[0].add(mandatory_approver=user_id1)
        bbclib.add_reference_to_transaction(transactions[i], asset_group_id1, transactions[i-1], 0)

        transactions[i].witness.add_witness(user_id1)
        transactions[i].witness.add_witness(user_id2)
        sig1 = transactions[i].sign(keypair=keypair1, no_pubkey=no_pubkey)
        sig2 = transactions[i].sign(keypair=keypair2, no_pubkey=no_pubkey)
        transactions[i].witness.add_signature(user_id1, sig1)
        transactions[i].witness.add_signature(user_id2, sig2)

    return transactions


if __name__ == '__main__':
    common.init_keypair()
    id_len_conf = common.read_idlen_config()
    db = common.DataHandler(del_flag=True)
    db.sql("CREATE TABLE txtbl(txid BLOB PRIMARY KEY, tx BLOB)")
    txobjs = make_transactions(id_len_conf=id_len_conf)
    for tx in txobjs:
        txdat = bbclib.serialize(tx)
        db.sql("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", args=(tx.transaction_id, txdat))
    txobjs = make_transactions(id_len_conf=id_len_conf, no_pubkey=True)
    for tx in txobjs:
        txdat = bbclib.serialize(tx)
        db.sql("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", args=(tx.transaction_id, txdat))
