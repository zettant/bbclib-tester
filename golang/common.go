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
	"encoding/json"
	"fmt"
	"github.com/beyond-blockchain/bbclib-go"
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"io/ioutil"
	"log"
	"os"
)

var (
	UserID1 = bbclib.GetIdentifier("user_id1", 32)
	UserID2 = bbclib.GetIdentifier("user_id2", 32)
	AssetGroupID1 = bbclib.GetIdentifier("asset_group_id1", 32)
	AssetGroupID2 = bbclib.GetIdentifier("asset_group_id2", 32)
	DomainID = bbclib.GetIdentifier("domain_id", 32)
	keypair1, _ = bbclib.GenerateKeypair(bbclib.KeyTypeEcdsaP256v1, 4)
	keypair2, _ = bbclib.GenerateKeypair(bbclib.KeyTypeEcdsaP256v1, 4)
)

type (
	IdLenConfig struct {
		TransactionID		int  `json:"transaction_id"`
		UserID				int  `json:"user_id"`
		AssetGroupID		int  `json:"asset_group_id"`
		AssetID		    	int  `json:"asset_id"`
		Nonce			    int  `json:"nonce"`
	}

	DataHandler struct {
		db					*sql.DB
	}

	BBcTransactionData struct {
		TransactionID		[]byte
		TransactionData		[]byte
	}
)


func ReadIdLenConfig() IdLenConfig {
	raw, err := ioutil.ReadFile("../id_len.json")
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	var fc IdLenConfig
	json.Unmarshal(raw, &fc)
	return fc
}

func CreatePrivateKey(name string, keypair *bbclib.KeyPair) {
	kp, _ := bbclib.GenerateKeypair(bbclib.KeyTypeEcdsaP256v1, bbclib.DefaultCompressionMode)
	pem, _ := kp.OutputPem()
	err := ioutil.WriteFile("../db/"+name, ([]byte)(pem), 0644)
	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}

	keypair.Privkey = kp.Privkey
	keypair.Pubkey = kp.Pubkey
	keypair.PublicKeyStructure = kp.PublicKeyStructure
	keypair.PrivateKeyStructure = kp.PrivateKeyStructure
	keypair.CurveType = kp.CurveType
	keypair.CompressionType = kp.CompressionType
}

func ReadPrivateKey(name string, kp *bbclib.KeyPair) {

	raw, err := ioutil.ReadFile("../db/"+name)
	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
	kp.ConvertFromPem(string(raw), 4)
}

func InitKeyPair() (bbclib.KeyPair, bbclib.KeyPair) {
	kp1 := bbclib.KeyPair{}
	if _, err := os.Stat("../db/user1"); err != nil {
		CreatePrivateKey("user1", &kp1)
	} else {
		ReadPrivateKey("user1", &kp1)
	}

	kp2 := bbclib.KeyPair{}
	if _, err := os.Stat("../db/user2"); err != nil {
		CreatePrivateKey("user2", &kp2)
	} else {
		ReadPrivateKey("user2", &kp2)
	}

	return kp1, kp2
}

func (d *DataHandler) Open() {
	db, err := sql.Open("sqlite3", "../db/txdb.sqlite")
	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
	d.db = db
}

func (d *DataHandler) Sql(q string, args ...interface{}) {
	if _, err := d.db.Exec(q, args...); err != nil {
		log.Fatal(err)
	}
}

func (d *DataHandler) FetchSql(q string, args ...interface{}) []BBcTransactionData {
	rows, err := d.db.Query(q, args...)
	if err != nil {
		log.Fatal(err)
		return nil
	}
	defer rows.Close()
	var result []BBcTransactionData
	for rows.Next() {
		var txid []byte
		var tx []byte
		if err := rows.Scan(&txid, &tx); err != nil {
			log.Fatal("rows.Scan()", err)
			return nil
		}
		//fmt.Printf("txid: %v, tx: %v\n", txid, tx)
		result = append(result, BBcTransactionData{txid, tx})
	}
	return result
}

func (d *DataHandler) close() {
	d.db.Close()
}
