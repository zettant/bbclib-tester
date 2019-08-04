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
	"github.com/beyond-blockchain/bbclib-go"
	"testing"
)

func TestFileAccess(t *testing.T) {
	t.Run("read file", func(t *testing.T) {
		dat := ReadIdLenConfig()
		t.Logf("IdLenConfig: %v", dat)
		if dat.TransactionID < 10 {
			t.Fatal("invalid transaction_id length")
		}
	})
}

func TestKeyInit(t *testing.T) {
	t.Run("create key (make sure that ../db/user? files are deleted before testing)", func(t *testing.T) {
		kp1, kp2 := InitKeyPair()
		if len(kp1.Privkey) != 32 {
			t.Fatal("Failed to create keypair (kp1)")
		}
		if len(kp2.Privkey) != 32 {
			t.Fatal("Failed to create keypair (kp2)")
		}
	})

	t.Run("read key", func(t *testing.T) {
		kp1, kp2 := InitKeyPair()
		if len(kp1.Privkey) != 32 {
			t.Fatal("Failed to create keypair (kp1)")
		}
		t.Logf("kp1: %v", kp1.Privkey)
		if len(kp2.Privkey) != 32 {
			t.Fatal("Failed to create keypair (kp2)")
		}
		t.Logf("kp2: %v", kp2.Privkey)
	})
}

func TestDBAccess(t *testing.T) {
	t.Run("select", func(t *testing.T) {
		handler := DataHandler{}
		handler.Open()
		result := handler.FetchSql("SELECT * from txtbl;", nil)
		if len(result) != 40 {
			t.Fatalf("unexpected number of results (%d)\n", len(result))
		}
		txobj, _ := bbclib.Deserialize(result[0].TransactionData)
		t.Logf("transaction: %v", txobj.Stringer())
		handler.close()
	})
}
