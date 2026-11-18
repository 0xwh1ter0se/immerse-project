package httpx

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestSameOrigin(t *testing.T) {
	h := SameOrigin("https://immerse.app", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	cases := []struct {
		name, origin, referer string
		want                  int
	}{
		{"missing", "", "", 403},
		{"cross", "https://evil.test", "", 403},
		{"origin ok", "https://immerse.app", "", 204},
		{"referer ok", "", "https://immerse.app/login", 204},
		{"scheme mismatch", "http://immerse.app", "", 403},
	}
	for _, c := range cases {
		r := httptest.NewRequest(http.MethodPost, "https://immerse.app/login", nil)
		if c.origin != "" {
			r.Header.Set("Origin", c.origin)
		}
		if c.referer != "" {
			r.Header.Set("Referer", c.referer)
		}
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != c.want {
			t.Errorf("%s: got %d want %d", c.name, w.Code, c.want)
		}
	}
}

func TestSameOriginGETAllowed(t *testing.T) {
	h := SameOrigin("https://immerse.app", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/login", nil))
	if w.Code != 204 {
		t.Fatalf("GET blocked: %d", w.Code)
	}
}

func TestLimiter(t *testing.T) {
	l := NewLimiter(2, time.Hour)
	if !l.Allow("a") || !l.Allow("a") || l.Allow("a") {
		t.Fatal("limit not enforced")
	}
	if !l.Allow("b") {
		t.Fatal("keys not independent")
	}
}

func TestLimiterCleanup(t *testing.T) {
	l := NewLimiter(1, time.Millisecond)
	if !l.Allow("x") {
		t.Fatal("first allowed")
	}
	time.Sleep(3 * time.Millisecond)
	l.Allow("y") // triggers cleanup window
	l.mu.Lock()
	n := len(l.hits)
	l.mu.Unlock()
	if n > 2 {
		t.Fatalf("map not bounded: %d entries", n)
	}
}
