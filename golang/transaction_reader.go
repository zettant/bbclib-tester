/*
Copyright (c) 2019 Zettant Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"bytes"
	"fmt"
	"github.com/beyond-blockchain/bbclib-go"
	_ "github.com/mattn/go-sqlite3"
)


func checkTransaction(conf *IdLenConfig, transactions []*bbclib.BBcTransaction, txids [][]byte) {
	asgid1 := make([]byte, conf.AssetGroupID)
	asgid2 := make([]byte, conf.AssetGroupID)
	copy(asgid1, AssetGroupID1)
	copy(asgid2, AssetGroupID2)
	user1 := make([]byte, conf.UserID)
	user2 := make([]byte, conf.UserID)
	copy(user1, UserID1)
	copy(user2, UserID2)

	for idx:=0; idx<40; idx++ {
		txobj := transactions[idx]
		//fmt.Printf("idx=%d\n", idx)
		if len(txobj.TransactionID) != conf.TransactionID {
			panic("transaction_id length is invalid")
		}
		if bytes.Compare(txobj.TransactionID, txids[idx]) != 0 {
			panic("transaction_id is invalid")
		}

		if idx % 20 == 0 {
			if len(txobj.Relations) != 1 {
				panic("Relations is invalid")
			}
			if len(txobj.Events) != 1 {
				panic("Events is invalid")
			}
			if bytes.Compare(txobj.Relations[0].AssetGroupID, asgid1) != 0 {
				panic("AssetGroupID in Relations[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[0].Asset.UserID, user1) != 0 {
				panic("UserID in Relations[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[0].Asset.AssetBody, ([]byte)("relation:asset_0-0")) != 0 {
				panic("UserID in Relations[0] is invalid")
			}
			if len(txobj.Relations[0].Asset.Nonce) != conf.Nonce {
				panic("Nonce length in Relations[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].AssetGroupID, asgid1) != 0 {
				panic("AssetGroupID in Events[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].Asset.UserID, user1) != 0 {
				panic("UserID in Events[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].MandatoryApprovers[0], user1) != 0 {
				panic("MandatoryApprovers in Events[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].Asset.AssetBody, ([]byte)("event:asset_0-0")) != 0 {
				panic("UserID in Events[0] is invalid")
			}
			if len(txobj.Events[0].Asset.Nonce) != conf.Nonce {
				panic("Nonce length in Events[0] is invalid")
			}
			if len(txobj.Witness.UserIDs) != 1 {
				panic("Num of users in witness is invalid")
			}
			if len(txobj.Witness.SigIndices) != 1 {
				panic("Num of sigindex in witness is invalid")
			}

			if len(txobj.Signatures) != 1 {
				panic("Num of Signatures is invalid")
			}
			if _, errSigIdx := txobj.VerifyAll(); errSigIdx != -1 {
				panic(fmt.Sprintf("Signature of %d is invalid", errSigIdx))
			}

		} else {
			if len(txobj.Relations) != 4 {
				panic("Relations is invalid")
			}
			if len(txobj.Events) != 1 {
				panic("Events is invalid")
			}
			if len(txobj.Relations[0].Pointers) != 1 {
				panic("Pointers of Relations[0] is invalid")
			}
			if len(txobj.Relations[1].Pointers) != 2 {
				panic("Pointers of Relations[0] is invalid")
			}

			if bytes.Compare(txobj.Relations[0].AssetGroupID, asgid1) != 0 {
				panic("AssetGroupID in Relations[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[0].Asset.UserID, user1) != 0 {
				panic("UserID in Relations[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[0].Asset.AssetBody, ([]byte)(fmt.Sprintf("relation:asset_1-%d", idx%20))) != 0 {
				panic("UserID in Relations[0] is invalid")
			}
			if len(txobj.Relations[0].Asset.Nonce) != conf.Nonce {
				panic("Nonce length in Relations[0] is invalid")
			}
			if len(txobj.Relations[0].Pointers[0].TransactionID) != conf.TransactionID {
				panic("TransactionID length in Relations[0].Pointers[0] is invalid")
			}
			if len(txobj.Relations[0].Pointers[0].AssetID) != conf.AssetID {
				panic("AssetID length in Relations[0].Pointers[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[0].Pointers[0].TransactionID, transactions[idx-1].TransactionID) != 0 {
				panic("TransactionID in Relations[0].Pointers[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[0].Pointers[0].AssetID, transactions[idx-1].Relations[0].Asset.AssetID) != 0 {
				panic("AssetID in Relations[0].Pointers[0] is invalid")
			}

			if bytes.Compare(txobj.Relations[1].AssetGroupID, asgid2) != 0 {
				panic("AssetGroupID in Relations[1] is invalid")
			}
			if bytes.Compare(txobj.Relations[1].Asset.UserID, user2) != 0 {
				panic("UserID in Relations[1] is invalid")
			}
			if bytes.Compare(txobj.Relations[1].Asset.AssetBody, ([]byte)(fmt.Sprintf("relation:asset_2-%d", idx%20))) != 0 {
				panic("UserID in Relations[1] is invalid")
			}
			if len(txobj.Relations[1].Asset.Nonce) != conf.Nonce {
				panic("Nonce length in Relations[1] is invalid")
			}
			if len(txobj.Relations[1].Pointers[0].TransactionID) != conf.TransactionID {
				panic("TransactionID length in Relations[1].Pointers[0] is invalid")
			}
			if len(txobj.Relations[1].Pointers[0].AssetID) != conf.AssetID {
				panic("AssetID length in Relations[1].Pointers[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[1].Pointers[0].TransactionID, transactions[idx-1].TransactionID) != 0 {
				panic("TransactionID in Relations[1].Pointers[0] is invalid")
			}
			if bytes.Compare(txobj.Relations[1].Pointers[0].AssetID, transactions[idx-1].Relations[0].Asset.AssetID) != 0 {
				panic("AssetID in Relations[1].Pointers[0] is invalid")
			}

			if bytes.Compare(txobj.Relations[2].AssetGroupID, asgid1) != 0 {
				panic("AssetGroupID in Relations[2] is invalid")
			}
			if bytes.Compare(txobj.Relations[2].AssetRaw.AssetBody, ([]byte)(fmt.Sprintf("relation:asset_4-%d", idx%20))) != 0 {
				panic("UserID in Relations[2] is invalid")
			}
			if len(txobj.Relations[2].Pointers[0].TransactionID) != conf.TransactionID {
				panic("TransactionID length in Relations[0].Pointers[0] is invalid")
			}
			if len(txobj.Relations[2].Pointers[0].AssetID) != conf.AssetID {
				panic("AssetID length in Relations[2].Pointers[0] is invalid")
			}
			if len(txobj.Relations[2].Pointers[1].TransactionID) != conf.TransactionID {
				panic("TransactionID length in Relations[0].Pointers[1] is invalid")
			}
			if txobj.Relations[2].Pointers[1].AssetID != nil {
				panic("AssetID length in Relations[2].Pointers[1] is invalid")
			}

			if bytes.Compare(txobj.Relations[3].AssetGroupID, asgid2) != 0 {
				panic("AssetGroupID in Relations[2] is invalid")
			}
			if len(txobj.Relations[3].AssetHash.AssetIDs) != 4 {
				panic("TransactionID length in Relations[0].Pointers[0] is invalid")
			}
			if len(txobj.Relations[3].Pointers[0].TransactionID) != conf.TransactionID {
				panic("TransactionID length in Relations[0].Pointers[0] is invalid")
			}
			if len(txobj.Relations[3].Pointers[0].AssetID) != conf.AssetID {
				panic("AssetID length in Relations[2].Pointers[0] is invalid")
			}

			if idx < 20 {
				if bytes.Compare(txobj.Relations[1].Pointers[1].TransactionID, transactions[0].TransactionID) != 0 {
					panic("TransactionID in Relations[0].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[1].Pointers[1].AssetID, transactions[0].Relations[0].Asset.AssetID) != 0 {
					panic("AssetID in Relations[0].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[2].Pointers[0].TransactionID, transactions[0].TransactionID) != 0 {
					panic("TransactionID in Relations[2].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[2].Pointers[0].AssetID, transactions[0].Relations[0].Asset.AssetID) != 0 {
					panic("AssetID in Relations[2].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[2].Pointers[1].TransactionID, transactions[0].TransactionID) != 0 {
					panic("TransactionID in Relations[2].Pointers[1] is invalid")
				}
				if bytes.Compare(txobj.Relations[3].Pointers[0].TransactionID, transactions[0].TransactionID) != 0 {
					panic("TransactionID in Relations[3].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[3].Pointers[0].AssetID, transactions[0].Relations[0].Asset.AssetID) != 0 {
					panic("AssetID in Relations[3].Pointers[0] is invalid")
				}
			} else {
				if bytes.Compare(txobj.Relations[1].Pointers[1].TransactionID, transactions[20].TransactionID) != 0 {
					panic("TransactionID in Relations[0].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[1].Pointers[1].AssetID, transactions[20].Relations[0].Asset.AssetID) != 0 {
					panic("AssetID in Relations[0].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[2].Pointers[0].TransactionID, transactions[20].TransactionID) != 0 {
					panic("TransactionID in Relations[2].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[2].Pointers[0].AssetID, transactions[20].Relations[0].Asset.AssetID) != 0 {
					panic("AssetID in Relations[2].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[2].Pointers[1].TransactionID, transactions[20].TransactionID) != 0 {
					panic("TransactionID in Relations[2].Pointers[1] is invalid")
				}
				if bytes.Compare(txobj.Relations[3].Pointers[0].TransactionID, transactions[20].TransactionID) != 0 {
					panic("TransactionID in Relations[3].Pointers[0] is invalid")
				}
				if bytes.Compare(txobj.Relations[3].Pointers[0].AssetID, transactions[20].Relations[0].Asset.AssetID) != 0 {
					panic("AssetID in Relations[3].Pointers[0] is invalid")
				}
			}

			if bytes.Compare(txobj.Events[0].AssetGroupID, asgid1) != 0 {
				panic("AssetGroupID in Events[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].MandatoryApprovers[0], user1) != 0 {
				panic("MandatoryApprovers in Events[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].Asset.UserID, user2) != 0 {
				panic("UserID in Events[0] is invalid")
			}
			if bytes.Compare(txobj.Events[0].Asset.AssetBody, ([]byte)(fmt.Sprintf("event:asset_3-%d", idx%20))) != 0 {
				panic("UserID in Events[0] is invalid")
			}
			if len(txobj.Events[0].Asset.Nonce) != conf.Nonce {
				panic("Nonce length in Events[0] is invalid")
			}

			if bytes.Compare(txobj.References[0].AssetGroupID, asgid1) != 0 {
				panic("Nonce length in Events[0] is invalid")
			}
			if txobj.References[0].EventIndexInRef != 0 {
				panic("EventIndexInRef in References[0] is invalid")
			}
			if len(txobj.References[0].SigIndices) != 1 {
				panic("SigIndices in References[0] is invalid")
			}

			if bytes.Compare(txobj.Crossref.DomainID, DomainID) != 0 {
				panic("DomainID in Crossref is invalid")
			}
			if idx < 20 {
				if bytes.Compare(txobj.Crossref.TransactionID, txids[0]) != 0 {
					panic("DomainID in Crossref is invalid")
				}
			} else {
				if bytes.Compare(txobj.Crossref.TransactionID, txids[20]) != 0 {
					panic("DomainID in Crossref is invalid")
				}
			}

			if len(txobj.Witness.UserIDs) != 2 {
				panic("Num of users in witness is invalid")
			}
			if len(txobj.Witness.SigIndices) != 2 {
				panic("Num of sigindex in witness is invalid")
			}

			if len(txobj.Signatures) != 2 {
				panic("Num of Signatures is invalid")
			}
			if txobj.Signatures[0].PubkeyLen == 0 && txobj.Signatures[0].Pubkey == nil {
				//fmt.Println("no pubkey")
			}
			if _, errSigIdx := txobj.VerifyAll(); errSigIdx != -1 {
				panic(fmt.Sprintf("Signature of %d is invalid", errSigIdx))
			}
		}
	}
}


func main() {
	idlenconf := ReadIdLenConfig()

	handler := DataHandler{}
	handler.Open()

	result := handler.FetchSql("SELECT * from txtbl;", nil)
	transactions := make([]*bbclib.BBcTransaction, 40)
	txids := make([][]byte, 40)
	for i:=0; i<len(result); i++ {
		transactions[i], _ = bbclib.Deserialize(result[i].TransactionData)
		txids[i] = result[i].TransactionID
	}

	checkTransaction(&idlenconf, transactions, txids)
	fmt.Println("Passed.")
}
