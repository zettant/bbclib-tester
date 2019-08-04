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
this_directory = os.path.dirname(os.path.abspath(__file__))

user_id1 = bbclib.bbclib_utils.get_new_id("user_id1", include_timestamp=False)
user_id2 = bbclib.bbclib_utils.get_new_id("user_id2", include_timestamp=False)
asset_group_id1 = bbclib.bbclib_utils.get_new_id("asset_group_id1", include_timestamp=False)
asset_group_id2 = bbclib.bbclib_utils.get_new_id("asset_group_id2", include_timestamp=False)
domain_id = bbclib.bbclib_utils.get_new_id("domain_id", include_timestamp=False)

keypair1 = bbclib.KeyPair()
keypair2 = bbclib.KeyPair()


def read_idlen_config():
    with open(os.path.join(this_directory, "../id_len.json"), "r") as f:
        lenconf = json.loads(f.read())
    return lenconf


def create_privatekey(name, kp):
    kp.generate()
    with open(os.path.join(this_directory, "../db/", name), "wb") as f:
        f.write(kp.get_private_key_in_pem())


def read_privatekey(name, kp):
    with open(os.path.join(this_directory, "../db/", name), "r") as f:
        privkey = f.read()
    kp.mk_keyobj_from_private_key_pem(privkey)


def init_keypair():
    if os.path.exists(os.path.join(this_directory, "../db/", "user1")):
        read_privatekey("user1", keypair1)
    else:
        create_privatekey("user1", keypair1)
    if os.path.exists(os.path.join(this_directory, "../db/", "user2")):
        read_privatekey("user2", keypair2)
    else:
        create_privatekey("user2", keypair2)


class DataHandler:
    def __init__(self, del_flag=False):
        self.db = None
        self.db_cur = None
        self.open_db(del_flag)

    def open_db(self, del_flag):
        """Open the DB (create DB file if not exists)"""
        if del_flag and os.path.exists("../db/txdb.sqlite"):
            os.remove("../db/txdb.sqlite")
        import sqlite3
        self.db = sqlite3.connect("../db/txdb.sqlite", isolation_level=None)
        self.db_cur = self.db.cursor()

    def sql(self, sql, args=None):
        if args is not None:
            self.db_cur.execute(sql, args)
        else:
            self.db_cur.execute(sql)
        self.db.commit()

    def fetch_sql(self, sql, args=None):
        if args is not None:
            self.db_cur.execute(sql, args)
        else:
            self.db_cur.execute(sql)
        self.db.commit()
        return self.db_cur.fetchall()

    def close_db(self):
        self.db_cur.close()
        self.db.close()
