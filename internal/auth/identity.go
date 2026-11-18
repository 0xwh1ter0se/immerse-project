package auth

import (
	"regexp"
	"strings"
)

// Identifier kinds accepted by login.
const (
	KindEmail    = "email"
	KindPhone    = "phone"
	KindUsername = "username"
)

var usernameRe = regexp.MustCompile(`^[a-z0-9_]{3,20}$`)

// NormalizePhone converts an Indonesian phone number to a 62-prefixed digit string.
// Accepts "+62…", "62…", "0…". Returns ErrInvalidInput for anything else.
func NormalizePhone(raw string) (string, error) {
	s := strings.TrimSpace(raw)
	if s == "" {
		return "", ErrInvalidInput
	}
	plus := strings.HasPrefix(s, "+")
	var digits strings.Builder
	for i, r := range s {
		if r == '+' && i == 0 {
			continue
		}
		if r >= '0' && r <= '9' {
			digits.WriteRune(r)
		}
	}
	d := digits.String()
	if d == "" {
		return "", ErrInvalidInput
	}
	switch {
	case strings.HasPrefix(d, "62"):
		d = d[2:]
	case !plus && strings.HasPrefix(d, "0"):
		d = d[1:]
	default:
		// "+1…" or a national number without the leading 0 is ambiguous with a username.
		return "", ErrInvalidInput
	}
	d = strings.TrimLeft(d, "0")
	out := "62" + d
	if len(out) < 10 || len(out) > 15 {
		return "", ErrInvalidInput
	}
	return out, nil
}

// NormalizeUsername trims, lowercases and validates a username.
func NormalizeUsername(raw string) (string, error) {
	u := strings.ToLower(strings.TrimSpace(raw))
	if !usernameRe.MatchString(u) {
		return "", ErrInvalidInput
	}
	return u, nil
}

// DetectIdentifier maps a single login field to a normalized value.
// "@" -> email, "0…"/"+62…"/"62…" -> phone, otherwise username.
func DetectIdentifier(raw string) (kind, value string, err error) {
	s := strings.TrimSpace(raw)
	if s == "" {
		return "", "", ErrInvalidInput
	}
	switch {
	case strings.Contains(s, "@"):
		e, e2 := NormalizeEmail(s)
		if e2 != nil {
			return "", "", ErrInvalidInput
		}
		return KindEmail, e, nil
	case strings.HasPrefix(s, "0"), strings.HasPrefix(s, "+"), strings.HasPrefix(s, "62"):
		p, e2 := NormalizePhone(s)
		if e2 != nil {
			return "", "", ErrInvalidInput
		}
		return KindPhone, p, nil
	default:
		u, e2 := NormalizeUsername(s)
		if e2 != nil {
			return "", "", ErrInvalidInput
		}
		return KindUsername, u, nil
	}
}
