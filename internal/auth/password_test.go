package auth

import "testing"

func TestPassword(t *testing.T) {
	h, e := HashPassword("correct horse")
	if e != nil || !CheckPassword("correct horse", h) || CheckPassword("wrong", h) {
		t.Fatal("password verification failed")
	}
}

func TestHashPasswordLength(t *testing.T) {
	for _, p := range []string{"", "short", string(make([]byte, 73))} {
		if _, err := HashPassword(p); err == nil {
			t.Fatalf("expected error for length %d", len(p))
		}
	}
}

func TestCheckPasswordMalformed(t *testing.T) {
	cases := []string{
		"",
		"plaintext",
		"argon2id$v=19$m=65536,t=3,p=2$onlyfour",
		"argon2id$v=19$m=999999999,t=3,p=2$c2FsdHNhbHRzYWx0c2E$aGFzaA",
		"argon2id$v=19$m=65536,t=3,p=2$!!!$aGFzaA",
		"argon2id$v=19$m=65536,t=3,p=2$c2FsdHNhbHRzYWx0c2E$aGFzaA",
		"bcrypt$v=19$m=65536,t=3,p=2$c2FsdA$aGFzaA",
	}
	for _, c := range cases {
		if CheckPassword("password", c) {
			t.Fatalf("accepted malformed hash: %q", c)
		}
	}
}
