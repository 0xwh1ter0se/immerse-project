package auth

import "testing"

func TestNormalizeEmail(t *testing.T) {
	cases := []struct {
		in string
		ok bool
	}{
		{"  User@Example.COM ", true},
		{"not-an-email", false},
		{"", false},
		{"a@b", true},
		{"<script>@x.com", false},
	}
	for _, c := range cases {
		got, err := NormalizeEmail(c.in)
		if (err == nil) != c.ok {
			t.Errorf("%q: ok=%v err=%v", c.in, c.ok, err)
		}
		if err == nil && got != "user@example.com" && c.in == "  User@Example.COM " {
			t.Errorf("normalize: %q", got)
		}
	}
}

func TestHashTokenStable(t *testing.T) {
	a, b := HashToken("abc"), HashToken("abc")
	if string(a) != string(b) || len(a) != 32 {
		t.Fatal("hash token mismatch")
	}
	if string(HashToken("abc")) == "abc" {
		t.Fatal("token stored plaintext")
	}
}
