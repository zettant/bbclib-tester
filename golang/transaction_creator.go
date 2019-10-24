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
	"fmt"
	"github.com/beyond-blockchain/bbclib-go"
	_ "github.com/mattn/go-sqlite3"
)

var (
	keyp1 		bbclib.KeyPair
	keyp2 		bbclib.KeyPair
)

func makeTransactions(conf IdLenConfig, noPubkey bool) []*bbclib.BBcTransaction {
	idConf := bbclib.BBcIdConfig{conf.TransactionID, conf.UserID, conf.AssetGroupID, conf.AssetID, conf.Nonce}
	bbclib.ConfigureIdLength(&idConf)
	transactions := make([]*bbclib.BBcTransaction, 20)

	txobj := bbclib.MakeTransaction(1, 1, true)
	bbclib.AddRelationAssetBodyString(txobj, 0, &AssetGroupID1, &UserID1, "relation:asset_0-0")
	bbclib.AddEventAssetBodyString(txobj, 0, &AssetGroupID1, &UserID1, "event:asset_0-0")
	txobj.Events[0].AddMandatoryApprover(&UserID1)
	txobj.Witness.AddWitness(&UserID1)
	txobj.SignAndAdd(&keyp1, UserID1, noPubkey)
	transactions[0] = txobj
	//fmt.Println(txobj.Stringer())

	for i:=1; i<20; i++ {
		txobj = bbclib.MakeTransaction(1, 4, true)
		bbclib.AddRelationAssetBodyString(txobj, 0, &AssetGroupID1, &UserID1, fmt.Sprintf("relation:asset_1-%d", i))
		bbclib.AddRelationPointer(txobj, 0, &transactions[i-1].TransactionID, &transactions[i-1].Relations[0].Asset.AssetID)
		bbclib.AddRelationAssetBodyString(txobj, 1, &AssetGroupID2, &UserID2, fmt.Sprintf("relation:asset_2-%d", i))
		bbclib.AddRelationPointer(txobj, 1, &transactions[i-1].TransactionID, &transactions[i-1].Relations[0].Asset.AssetID)
		bbclib.AddRelationPointer(txobj, 1, &transactions[0].TransactionID, &transactions[0].Relations[0].Asset.AssetID)
		bbclib.AddEventAssetBodyString(txobj, 0, &AssetGroupID1, &UserID2, fmt.Sprintf("event:asset_3-%d", i))
		txobj.Events[0].AddMandatoryApprover(&UserID1)
		bbclib.AddReference(txobj, &AssetGroupID1, transactions[i-1], 0)

		asid := bbclib.GetIdentifier(fmt.Sprintf("asset_id_%d", i), conf.AssetID)
		bbclib.AddRelationAssetRaw(txobj, 2, &AssetGroupID1, &asid, fmt.Sprintf("relation:asset_4-%d", i))
		bbclib.AddRelationPointer(txobj, 2, &transactions[0].TransactionID, &transactions[0].Relations[0].Asset.AssetID)
		bbclib.AddRelationPointer(txobj, 2, &transactions[0].TransactionID, nil)

		bbclib.AddRelationAssetHash(txobj, 3, &AssetGroupID2)
		for k:=0; k<4; k++ {
			aid := bbclib.GetIdentifier(fmt.Sprintf("asset_id_%d-%d", i, k), conf.AssetID)
			txobj.Relations[3].AssetHash.AddAssetId(&aid)
		}
		bbclib.AddRelationPointer(txobj, 3, &transactions[0].TransactionID, &transactions[0].Relations[0].Asset.AssetID)

		crossref := bbclib.BBcCrossRef{}
		txobj.AddCrossRef(&crossref)
		crossref.Add(&DomainID, &transactions[0].TransactionID)

		txobj.Witness.AddWitness(&UserID1)
		txobj.Witness.AddWitness(&UserID2)
		txobj.SignAndAdd(&keyp1, UserID1, noPubkey)
		txobj.SignAndAdd(&keyp2, UserID2, noPubkey)

		transactions[i] = txobj
		//fmt.Println(txobj.Stringer())
	}
	return transactions
}

func main() {
	keyp1, keyp2 = InitKeyPair()
	idlenconf := ReadIdLenConfig()
	handler := DataHandler{}
	handler.Open()
	handler.Sql("DROP TABLE IF EXISTS txtbl")
	handler.Sql("CREATE TABLE txtbl(txid BLOB PRIMARY KEY, tx BLOB)")

	txobjs := makeTransactions(idlenconf, false)

	for i:=0; i<len(txobjs); i++ {
		txdata, _ := bbclib.Serialize(txobjs[i], bbclib.FormatZlib)
		handler.Sql("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", txobjs[i].TransactionID, txdata)
	}
	//fmt.Println(txobjs[1].Stringer())
	txobjs = makeTransactions(idlenconf, true)
	for i:=0; i<len(txobjs); i++ {
		txdata, _ := bbclib.Serialize(txobjs[i], bbclib.FormatZlib)
		handler.Sql("INSERT INTO txtbl(txid, tx) VALUES (?, ?)", txobjs[i].TransactionID, txdata)
	}
}
