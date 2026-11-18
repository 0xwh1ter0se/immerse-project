package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrDuplicateEmail    = errors.New("duplicate email")
	ErrDuplicatePhone    = errors.New("duplicate phone")
	ErrDuplicateUsername = errors.New("duplicate username")
)

// Querier is satisfied by *pgxpool.Pool and pgx.Tx.
type Querier interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

type Store struct{ Pool *pgxpool.Pool }

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Username string `json:"username"`
}

func Open(ctx context.Context, url string) (*Store, error) {
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		return nil, err
	}
	cfg.MaxConns = 10
	cfg.ConnConfig.ConnectTimeout = 5 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	return &Store{Pool: pool}, nil
}

func mapDup(err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
		return err
	}
	switch pgErr.ConstraintName {
	case "users_phone_key":
		return ErrDuplicatePhone
	case "users_username_key":
		return ErrDuplicateUsername
	case "users_email_key":
		return ErrDuplicateEmail
	}
	return err
}

func (s *Store) CreateUser(ctx context.Context, email, phone, username, hash string) (User, error) {
	var u User
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO users (email, phone, username, password_hash) VALUES ($1,$2,$3,$4) RETURNING id::text, email::text, phone, username::text`,
		email, phone, username, hash,
	).Scan(&u.ID, &u.Email, &u.Phone, &u.Username)
	return u, mapDup(err)
}

func (s *Store) UserByEmail(ctx context.Context, email string) (User, string, error) {
	var u User
	var hash string
	err := s.Pool.QueryRow(ctx, `SELECT id::text, email::text, phone, username::text, password_hash FROM users WHERE email=$1`, email).Scan(&u.ID, &u.Email, &u.Phone, &u.Username, &hash)
	return u, hash, err
}

func (s *Store) UserByPhone(ctx context.Context, phone string) (User, string, error) {
	var u User
	var hash string
	err := s.Pool.QueryRow(ctx, `SELECT id::text, email::text, phone, username::text, password_hash FROM users WHERE phone=$1`, phone).Scan(&u.ID, &u.Email, &u.Phone, &u.Username, &hash)
	return u, hash, err
}

func (s *Store) UserByUsername(ctx context.Context, username string) (User, string, error) {
	var u User
	var hash string
	err := s.Pool.QueryRow(ctx, `SELECT id::text, email::text, phone, username::text, password_hash FROM users WHERE username=$1`, username).Scan(&u.ID, &u.Email, &u.Phone, &u.Username, &hash)
	return u, hash, err
}

func (s *Store) CreateSession(ctx context.Context, q Querier, userID string, tokenHash []byte, expires time.Time) error {
	_, err := q.Exec(ctx, `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, userID, tokenHash, expires)
	return err
}

func (s *Store) UserBySession(ctx context.Context, tokenHash []byte) (User, error) {
	var u User
	err := s.Pool.QueryRow(ctx, `SELECT u.id::text, u.email::text, u.phone, u.username::text FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now()`, tokenHash).Scan(&u.ID, &u.Email, &u.Phone, &u.Username)
	return u, err
}

func (s *Store) DeleteSession(ctx context.Context, tokenHash []byte) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM sessions WHERE token_hash=$1`, tokenHash)
	return err
}
