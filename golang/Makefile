PROJ=bbclib-tester
BBCLIB_VER=v1.5.2


mod:
	go mod init ${PROJ}

all:
	rm -f go.mod go.sum
	make mod
	go build transaction_creator.go common.go
	go build transaction_reader.go common.go


rmmod:
	rm -f go.mod go.sum
