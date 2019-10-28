PROJ=bbclib-tester
BBCLIB_VER=v1.5.2


mod:
	go mod init ${PROJ}

all:
	go build transaction_creator.go common.go
	go build transaction_reader.go common.go


rmmod:
	rm go.mod go.sum
