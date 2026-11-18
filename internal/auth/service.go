package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"net/mail"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"immerse/internal/store"
)

var (
	ErrInvalid      = errors.New("identitas atau password salah")
	ErrInvalidInput = errors.New("input tidak valid")
)

// dummyHash keeps unknown-identifier logins as slow as real ones (anti enumeration).
var dummyHash, _ = HashPassword("dummy-password-not-used")

type Service struct {
	DB         *store.Store
	SessionTTL time.Duration
}

func NormalizeEmail(raw string) (string, error) {
	e := strings.ToLower(strings.TrimSpace(raw))
	if len(e) == 0 || len(e) > 254 {
		return "", ErrInvalidInput
	}
	if _, err := mail.ParseAddress(e); err != nil || !strings.Contains(e, "@") {
		return "", ErrInvalidInput
	}
	return e, nil
}

func newToken() (string, []byte, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", nil, err
	}
	token := base64.RawURLEncoding.EncodeToString(b)
	return token, HashToken(token), nil
}

func HashToken(token string) []byte { s := sha256.Sum256([]byte(token)); return s[:] }

// Register creates a user and a session. Returns plaintext token for the cookie.
// Email, phone and username are all required and unique.
func (s *Service) Register(ctx context.Context, email, phone, username, password string) (store.User, string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	e, err := NormalizeEmail(email)
	if err != nil {
		return store.User{}, "", err
	}
	p, err := NormalizePhone(phone)
	if err != nil {
		return store.User{}, "", err
	}
	un, err := NormalizeUsername(username)
	if err != nil {
		return store.User{}, "", err
	}
	hash, err := HashPassword(password)
	if err != nil {
		return store.User{}, "", ErrInvalidInput
	}
	u, err := s.DB.CreateUser(ctx, e, p, un, hash)
	if err != nil {
		return store.User{}, "", err
	}
	token, sum, err := newToken()
	if err != nil {
		return store.User{}, "", err
	}
	if err := s.DB.CreateSession(ctx, s.DB.Pool, u.ID, sum, time.Now().Add(s.SessionTTL)); err != nil {
		return store.User{}, "", err
	}
	return u, token, nil
}

// Login accepts email, phone or username in a single field.
// Unknown identifiers still run a hash check (dummy).
func (s *Service) Login(ctx context.Context, identifier, password string) (store.User, string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	kind, value, err := DetectIdentifier(identifier)
	if err != nil {
		CheckPassword(password, dummyHash)
		return store.User{}, "", ErrInvalid
	}
	var u store.User
	var hash string
	switch kind {
	case KindEmail:
		u, hash, err = s.DB.UserByEmail(ctx, value)
	case KindPhone:
		u, hash, err = s.DB.UserByPhone(ctx, value)
	default:
		u, hash, err = s.DB.UserByUsername(ctx, value)
	}
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			CheckPassword(password, dummyHash)
			return store.User{}, "", ErrInvalid
		}
		return store.User{}, "", err
	}
	if !CheckPassword(password, hash) {
		return store.User{}, "", ErrInvalid
	}
	token, sum, err := newToken()
	if err != nil {
		return store.User{}, "", err
	}
	if err := s.DB.CreateSession(ctx, s.DB.Pool, u.ID, sum, time.Now().Add(s.SessionTTL)); err != nil {
		return store.User{}, "", err
	}
	return u, token, nil
}

func (s *Service) UserFromToken(ctx context.Context, token string) (store.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	return s.DB.UserBySession(ctx, HashToken(token))
}

func (s *Service) Logout(ctx context.Context, token string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	return s.DB.DeleteSession(ctx, HashToken(token))
}
