package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"golang.org/x/crypto/argon2"
	"strconv"
	"strings"
)

const (
	memory     uint32 = 64 * 1024
	iterations uint32 = 3
	threads    uint8  = 2
	keyLen     uint32 = 32
	saltLen           = 16
)

func HashPassword(password string) (string, error) {
	if len(password) < 8 || len(password) > 72 {
		return "", fmt.Errorf("password length")
	}
	salt := make([]byte, saltLen)
	if _, e := rand.Read(salt); e != nil {
		return "", e
	}
	h := argon2.IDKey([]byte(password), salt, iterations, memory, threads, keyLen)
	return fmt.Sprintf("argon2id$v=19$m=65536,t=3,p=2$%s$%s", base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(h)), nil
}
func CheckPassword(password, encoded string) bool {
	p := strings.Split(encoded, "$")
	if len(p) != 5 || p[0] != "argon2id" || p[1] != "v=19" || len(p[2]) > 64 || len(p[3]) > 64 || len(p[4]) > 128 {
		return false
	}
	params := strings.Split(p[2], ",")
	if len(params) != 3 {
		return false
	}
	var m uint32
	var t uint32
	var q uint64
	for _, x := range params {
		v := strings.SplitN(x, "=", 2)
		if len(v) != 2 {
			continue
		}
		n, e := strconv.ParseUint(v[1], 10, 32)
		if e != nil {
			return false
		}
		switch v[0] {
		case "m":
			m = uint32(n)
		case "t":
			t = uint32(n)
		case "p":
			q = n
		default:
			return false
		}
	}
	if m == 0 || m > 256*1024 || t == 0 || t > 10 || q == 0 || q > 8 {
		return false
	}
	salt, e1 := base64.RawStdEncoding.DecodeString(p[3])
	expected, e2 := base64.RawStdEncoding.DecodeString(p[4])
	if e1 != nil || e2 != nil || len(salt) < 8 || len(salt) > 32 || len(expected) != int(keyLen) {
		return false
	}
	actual := argon2.IDKey([]byte(password), salt, t, m, uint8(q), uint32(len(expected)))
	return subtle.ConstantTimeCompare(actual, expected) == 1
}
