package httpx

import (
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

// SameOrigin rejects unsafe cross-site requests. APP_ORIGIN wins when set.
func SameOrigin(appOrigin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}
		src := r.Header.Get("Origin")
		if src == "" {
			src = r.Header.Get("Referer")
		}
		u, err := url.Parse(src)
		if err != nil || u.Host == "" {
			http.Error(w, "invalid origin", http.StatusForbidden)
			return
		}
		allowed := appOrigin
		if allowed == "" {
			allowed = "http://" + r.Host
		}
		a, err := url.Parse(allowed)
		if err != nil || !strings.EqualFold(u.Scheme, a.Scheme) || !strings.EqualFold(u.Host, a.Host) {
			http.Error(w, "invalid origin", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Limiter is a bounded fixed-window counter. ponytail: in-memory; Redis when multi-instance.
type Limiter struct {
	mu        sync.Mutex
	hits      map[string]*bucket
	max       int
	window    time.Duration
	lastClean time.Time
}
type bucket struct {
	n     int
	reset time.Time
}

func NewLimiter(max int, window time.Duration) *Limiter {
	return &Limiter{hits: map[string]*bucket{}, max: max, window: window}
}

// Allow records a hit for key and reports whether it stays under the limit.
func (l *Limiter) Allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	b := l.bucketLocked(key, time.Now())
	b.n++
	return b.n <= l.max
}

// Blocked reports whether key already used up its budget, without recording a hit.
func (l *Limiter) Blocked(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	b := l.bucketLocked(key, time.Now())
	return b.n >= l.max
}

// Hit records one attempt for key.
func (l *Limiter) Hit(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.bucketLocked(key, time.Now()).n++
}

// Reset clears the budget for key.
func (l *Limiter) Reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.hits, key)
}

// bucketLocked returns the live bucket for key, creating or recycling it. Caller holds mu.
func (l *Limiter) bucketLocked(key string, now time.Time) *bucket {
	if now.Sub(l.lastClean) > l.window { // bounded cleanup, amortized
		for k, b := range l.hits {
			if now.After(b.reset) {
				delete(l.hits, k)
			}
		}
		l.lastClean = now
	}
	b := l.hits[key]
	if b == nil || now.After(b.reset) {
		b = &bucket{reset: now.Add(l.window)}
		l.hits[key] = b
	}
	return b
}

// ClientIP prefers RemoteAddr; X-Forwarded-For only trusted behind a proxy (not configured here).
func ClientIP(r *http.Request) string {
	h, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return h
}
