package main

import (
	"html/template"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"immerse/internal/auth"
	"immerse/internal/httpx"
)

// newTestApp builds an app without a DB. Handlers that touch svc.DB are not exercised here.
func newTestApp(t *testing.T) *app {
	t.Helper()
	tpl, err := template.ParseGlob(filepath.Join("templates", "*.html"))
	if err != nil {
		t.Fatal(err)
	}
	return &app{
		svc:         &auth.Service{SessionTTL: time.Hour},
		tpl:         tpl,
		sessionDays: 30,
		ipLimiter:   httpx.NewLimiter(10, time.Minute),
		acctLimiter: httpx.NewLimiter(10, time.Minute),
		regLimiter:  httpx.NewLimiter(10, time.Minute),
	}
}

func chdir(t *testing.T) {
	t.Helper()
	if err := os.Chdir(filepath.Join("..", "..")); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Chdir(filepath.Join("cmd", "server")) })
}

func TestGetLoginRenders(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	w := httptest.NewRecorder()
	a.routes().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/login", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), `<h1>Masuk</h1>`) {
		t.Fatalf("got %d", w.Code)
	}
}

func TestGetRegisterRenders(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	w := httptest.NewRecorder()
	a.routes().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/register", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), `<h1>Daftar</h1>`) {
		t.Fatalf("got %d", w.Code)
	}
}

// Landing must not expose root/docs/env; only index.html + explicit assets/styles.
func TestOnlyExplicitFilesServed(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	h := a.routes()
	blocked := []string{"/docs/auth-architecture.md", "/.env", "/go.mod", "/README.auth.md", "/cmd/server/main.go", "/SOUL.md", "/HANDOFF.md"}
	for _, p := range blocked {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest(http.MethodGet, p, nil))
		if w.Code != http.StatusNotFound {
			t.Errorf("%s: got %d want 404", p, w.Code)
		}
	}
	ok := []string{"/", "/styles.css", "/assets/logo.svg", "/assets/favicon.svg", "/assets/mascot.svg"}
	for _, p := range ok {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest(http.MethodGet, p, nil))
		if w.Code != http.StatusOK {
			t.Errorf("%s: got %d want 200", p, w.Code)
		}
	}
}

func TestAssetTraversalRejected(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	for _, p := range []string{"/assets/..%2f.env", "/assets/%2e%2e%2fgo.mod", "/assets/nope.svg"} {
		w := httptest.NewRecorder()
		a.routes().ServeHTTP(w, httptest.NewRequest(http.MethodGet, p, nil))
		if w.Code == http.StatusOK {
			t.Errorf("%s: should not be served", p)
		}
	}
}

func TestLandingAnonymousShowsMasuk(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	w := httptest.NewRecorder()
	a.routes().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/", nil))
	body := w.Body.String()
	if w.Code != 200 || !strings.Contains(body, `href="/login"`) {
		t.Fatalf("anonymous landing missing Masuk link (code %d)", w.Code)
	}
	if strings.Contains(body, `action="/logout"`) {
		t.Fatal("anonymous landing must not show logout")
	}
}

func TestMeUnauthorizedWithoutCookie(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	w := httptest.NewRecorder()
	a.routes().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/me", nil))
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("got %d want 401", w.Code)
	}
}

func TestPostLoginRejectsCrossOrigin(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	h := httpx.SameOrigin("https://immerse.app", a.routes())
	r := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader("email=a@b.com&password=xxxxxxxx"))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Set("Origin", "https://evil.test")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	if w.Code != http.StatusForbidden {
		t.Fatalf("got %d want 403", w.Code)
	}
}

func TestPostLoginMissingOriginRejected(t *testing.T) {
	chdir(t)
	a := newTestApp(t)
	h := httpx.SameOrigin("", a.routes())
	r := httptest.NewRequest(http.MethodPost, "http://example.com/login", strings.NewReader("email=a@b.com&password=xxxxxxxx"))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	if w.Code != http.StatusForbidden {
		t.Fatalf("got %d want 403", w.Code)
	}
}
