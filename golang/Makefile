PROJ=bbclib-tester
BBCLIB_VER=v1.4.4


mod:
	go mod init ${PROJ}

prepare:
	bash ./prepare_bbclib.sh ${BBCLIB_VER}

all:
	go build transaction_creator.go common.go
	go build transaction_reader.go common.go

