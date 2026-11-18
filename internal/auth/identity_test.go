package auth

import "testing"

func TestNormalizePhone(t *testing.T) {
	cases := []struct {
		in, want string
		ok       bool
	}{
		{"08123456789", "628123456789", true},
		{"+62 812-3456-789", "628123456789", true},
		{"628123456789", "628123456789", true},
		{"8123456789", "", false},
		{"+1 555 0100", "", false},
		{"", "", false},
		{"abc", "", false},
		{"0812", "", false},
	}
	for _, c := range cases {
		got, err := NormalizePhone(c.in)
		if (err == nil) != c.ok {
			t.Errorf("%q: ok=%v err=%v", c.in, c.ok, err)
			continue
		}
		if err == nil && got != c.want {
			t.Errorf("%q: got %q want %q", c.in, got, c.want)
		}
	}
}

func TestNormalizeUsername(t *testing.T) {
	cases := []struct {
		in, want string
		ok       bool
	}{
		{"  Alya_Dev ", "alya_dev", true},
		{"abc", "abc", true},
		{"ab", "", false},
		{"has space", "", false},
		{"tanda-baca!", "", false},
		{"012345678901234567890", "", false},
	}
	for _, c := range cases {
		got, err := NormalizeUsername(c.in)
		if (err == nil) != c.ok {
			t.Errorf("%q: ok=%v err=%v", c.in, c.ok, err)
			continue
		}
		if err == nil && got != c.want {
			t.Errorf("%q: got %q want %q", c.in, got, c.want)
		}
	}
}

func TestDetectIdentifier(t *testing.T) {
	cases := []struct {
		in    string
		kind  string
		value string
		ok    bool
	}{
		{"User@Example.com", KindEmail, "user@example.com", true},
		{"08123456789", KindPhone, "628123456789", true},
		{"+628123456789", KindPhone, "628123456789", true},
		{"alya_dev", KindUsername, "alya_dev", true},
		{"", "", "", false},
		{"ab", "", "", false},
		{"bad mail@", "", "", false},
	}
	for _, c := range cases {
		kind, value, err := DetectIdentifier(c.in)
		if (err == nil) != c.ok {
			t.Errorf("%q: ok=%v err=%v", c.in, c.ok, err)
			continue
		}
		if err == nil && (kind != c.kind || value != c.value) {
			t.Errorf("%q: got (%q,%q) want (%q,%q)", c.in, kind, value, c.kind, c.value)
		}
	}
}
