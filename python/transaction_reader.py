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
import json
import common
this_directory = os.path.dirname(os.path.abspath(__file__))

user_id1 = common.user_id1
user_id2 = common.user_id2
asset_group_id1 = common.asset_group_id1
asset_group_id2 = common.asset_group_id2

keypair1 = bbclib.KeyPair()
keypair2 = bbclib.KeyPair()


def check_transaction(idx, txobj, id_conf):
    idx = idx % 20
    if idx == 0:
        assert len(txobj.transaction_id) == id_conf["transaction_id"]
        assert len(txobj.relations) == 1
        assert len(txobj.events) == 1
        assert txobj.relations[0].asset_group_id == asset_group_id1[:id_conf["asset_group_id"]]
        assert txobj.relations[0].asset.user_id == user_id1[:id_conf["user_id"]]
        assert txobj.relations[0].asset.asset_body == b'relation:asset_0-0'
        assert len(txobj.relations[0].asset.nonce) == id_conf["nonce"]
        assert txobj.events[0].asset_group_id == asset_group_id1[:id_conf["asset_group_id"]]
        assert txobj.events[0].mandatory_approvers[0] == user_id1[:id_conf["user_id"]]
        assert txobj.events[0].asset.user_id == user_id1[:id_conf["user_id"]]
        assert txobj.events[0].asset.asset_body == b'event:asset_0-0'
        assert len(txobj.events[0].asset.nonce) == id_conf["nonce"]
        assert len(txobj.witness.user_ids) == 1
        assert len(txobj.witness.sig_indices) == 1
        assert txobj.signatures[0].verify(txobj.digest())

    else:
        assert len(txobj.transaction_id) == id_conf["transaction_id"]
        assert len(txobj.relations) == 2
        assert len(txobj.events) == 1
        assert len(txobj.references) == 1
        assert txobj.relations[0].asset_group_id == asset_group_id1[:id_conf["asset_group_id"]]
        assert txobj.relations[0].asset.user_id == user_id1[:id_conf["user_id"]]
        assert txobj.relations[0].asset.asset_body == b'relation:asset_1-%d' % idx
        assert len(txobj.relations[0].asset.nonce) == id_conf["nonce"]
        assert txobj.relations[1].asset_group_id == asset_group_id2[:id_conf["asset_group_id"]]
        assert txobj.relations[1].asset.user_id == user_id2[:id_conf["user_id"]]
        assert txobj.relations[1].asset.asset_body == b'relation:asset_2-%d' % idx
        assert len(txobj.relations[1].asset.nonce) == id_conf["nonce"]
        assert txobj.events[0].asset_group_id == asset_group_id1[:id_conf["asset_group_id"]]
        assert txobj.events[0].mandatory_approvers[0] == user_id1[:id_conf["user_id"]]
        assert txobj.events[0].asset.user_id == user_id1[:id_conf["user_id"]]
        assert txobj.events[0].asset.asset_body == b'event:asset_3-%d' % idx
        assert txobj.references[0].asset_group_id == asset_group_id1[:id_conf["asset_group_id"]]
        assert len(txobj.events[0].asset.nonce) == id_conf["nonce"]
        assert len(txobj.witness.user_ids) == 2
        assert len(txobj.witness.sig_indices) == 2
        if txobj.signatures[0].pubkey is None:
            print("no pubkey")
        else:
            assert txobj.signatures[0].verify(txobj.digest())
        if txobj.signatures[1].pubkey is None:
            print("no_pubkey")
        else:
            assert txobj.signatures[1].verify(txobj.digest())


if __name__ == '__main__':
    common.init_keypair()
    id_len_conf = common.read_idlen_config()
    db = common.DataHandler()
    ret = db.fetch_sql("SELECT tx from txtbl")
    for i, dat in enumerate(ret):
        if dat is None:
            continue
        txobj, fmt_type = bbclib.deserialize(dat[0])
        check_transaction(i, txobj, id_len_conf)
