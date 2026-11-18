package main

import (
	"context"
	"encoding/json"
	"errors"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"immerse/internal/auth"
	"immerse/internal/httpx"
	"immerse/internal/store"
)

type app struct {
	svc                                *auth.Service
	tpl                                *template.Template
	secureCookie                       bool
	sessionDays                        int
	ipLimiter, acctLimiter, regLimiter *httpx.Limiter
}

type pageData struct {
	Title    string
	Error    string
	Email    string
	Phone    string
	Username string
	User     *store.User
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func (a *app) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /login", a.getLogin)
	mux.HandleFunc("POST /login", a.postLogin)
	mux.HandleFunc("GET /register", a.getRegister)
	mux.HandleFunc("POST /register", a.postRegister)
	mux.HandleFunc("POST /logout", a.postLogout)
	mux.HandleFunc("GET /me", a.me)
	mux.HandleFunc("GET /{$}", a.landing)
	mux.HandleFunc("GET /styles.css", static("styles.css"))
	mux.HandleFunc("GET /assets/{file}", a.asset)
	return mux
}

func main() {
	ctx := context.Background()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL required")
	}
	days, err := strconv.Atoi(env("SESSION_DAYS", "30"))
	if err != nil || days <= 0 {
		log.Fatal("invalid SESSION_DAYS")
	}
	prod := env("APP_ENV", "development") == "production"
	appOrigin := os.Getenv("APP_ORIGIN")
	if prod && appOrigin == "" {
		log.Fatal("APP_ORIGIN required in production")
	}
	if appOrigin != "" {
		u, e := url.Parse(appOrigin)
		if e != nil || u.Scheme == "" || u.Host == "" || u.Path != "" || u.RawQuery != "" || u.Fragment != "" {
			log.Fatal("invalid APP_ORIGIN")
		}
		if prod && u.Scheme != "https" {
			log.Fatal("APP_ORIGIN must use https in production")
		}
	}

	db, err := store.Open(ctx, dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Pool.Close()
	if err := db.Pool.Ping(ctx); err != nil {
		log.Fatal(err)
	}

	tpl, err := template.ParseGlob("templates/*.html")
	if err != nil {
		log.Fatal(err)
	}

	a := &app{
		svc:          &auth.Service{DB: db, SessionTTL: time.Duration(days) * 24 * time.Hour},
		tpl:          tpl,
		secureCookie: prod,
		sessionDays:  days,
		ipLimiter:    httpx.NewLimiter(10, 15*time.Minute),
		acctLimiter:  httpx.NewLimiter(10, 15*time.Minute),
		regLimiter:   httpx.NewLimiter(10, 15*time.Minute),
	}

	mux := a.routes()

	handler := httpx.SameOrigin(appOrigin, mux)
	srv := &http.Server{
		Addr:              env("HTTP_ADDR", ":8080"),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("listening on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func static(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, name) }
}

func (a *app) asset(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("file")
	if name == "" || strings.ContainsAny(name, `/\`) || name != filepath.Base(name) {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, filepath.Join("assets", name))
}

func (a *app) render(w http.ResponseWriter, status int, name string, d pageData) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if err := a.tpl.ExecuteTemplate(w, name, d); err != nil {
		log.Printf("template %s: %v", name, err)
	}
}

func (a *app) currentUser(r *http.Request) *store.User {
	c, err := r.Cookie("immerse_session")
	if err != nil || c.Value == "" {
		return nil
	}
	u, err := a.svc.UserFromToken(r.Context(), c.Value)
	if err != nil {
		return nil
	}
	return &u
}

func (a *app) setSession(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name: "immerse_session", Value: token, Path: "/",
		HttpOnly: true, Secure: a.secureCookie, SameSite: http.SameSiteLaxMode,
		MaxAge: a.sessionDays * 24 * 3600,
	})
}

func (a *app) clearSession(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name: "immerse_session", Value: "", Path: "/", MaxAge: -1,
		HttpOnly: true, Secure: a.secureCookie, SameSite: http.SameSiteLaxMode,
	})
}

func (a *app) getLogin(w http.ResponseWriter, r *http.Request) {
	a.render(w, http.StatusOK, "login.html", pageData{Title: "Masuk"})
}

func (a *app) getRegister(w http.ResponseWriter, r *http.Request) {
	a.render(w, http.StatusOK, "register.html", pageData{Title: "Daftar"})
}

func (a *app) postLogin(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	if err := r.ParseForm(); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	identifier, password := r.PostFormValue("identifier"), r.PostFormValue("password")
	ip := httpx.ClientIP(r)
	acct := "acct:" + strings.ToLower(strings.TrimSpace(identifier))
	if a.ipLimiter.Blocked(ip) || a.acctLimiter.Blocked(acct) {
		a.render(w, http.StatusTooManyRequests, "login.html", pageData{Title: "Masuk", Error: "Terlalu banyak percobaan. Coba lagi nanti."})
		return
	}
	_, token, err := a.svc.Login(r.Context(), identifier, password)
	if err != nil {
		if errors.Is(err, auth.ErrInvalid) {
			// count failed attempts only, per-IP and per-account separately
			a.ipLimiter.Hit(ip)
			a.acctLimiter.Hit(acct)
			a.render(w, http.StatusUnauthorized, "login.html", pageData{Title: "Masuk", Error: "Email, nomor HP, atau password salah."})
			return
		}
		log.Printf("login: %v", err)
		a.render(w, http.StatusInternalServerError, "login.html", pageData{Title: "Masuk", Error: "Terjadi kesalahan. Coba lagi."})
		return
	}
	a.acctLimiter.Reset(acct)
	a.setSession(w, token)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (a *app) postRegister(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	if err := r.ParseForm(); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	email, phone, username := r.PostFormValue("email"), r.PostFormValue("phone"), r.PostFormValue("username")
	password, confirm := r.PostFormValue("password"), r.PostFormValue("confirm")
	page := func(err string) pageData {
		return pageData{Title: "Daftar", Email: email, Phone: phone, Username: username, Error: err}
	}
	ip := httpx.ClientIP(r)
	ipOK := a.regLimiter.Allow("ip:" + ip)
	acctOK := a.regLimiter.Allow("acct:" + strings.ToLower(strings.TrimSpace(email)))
	if !ipOK || !acctOK {
		a.render(w, http.StatusTooManyRequests, "register.html", page("Terlalu banyak percobaan. Coba lagi nanti."))
		return
	}
	if password != confirm {
		a.render(w, http.StatusBadRequest, "register.html", page("Konfirmasi password tidak cocok."))
		return
	}
	_, token, err := a.svc.Register(r.Context(), email, phone, username, password)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrDuplicateEmail):
			a.render(w, http.StatusConflict, "register.html", page("Email sudah terdaftar."))
		case errors.Is(err, store.ErrDuplicatePhone):
			a.render(w, http.StatusConflict, "register.html", page("Nomor HP sudah terdaftar."))
		case errors.Is(err, store.ErrDuplicateUsername):
			a.render(w, http.StatusConflict, "register.html", page("Username sudah dipakai."))
		case errors.Is(err, auth.ErrInvalidInput):
			a.render(w, http.StatusBadRequest, "register.html", page("Periksa lagi: email valid, nomor HP Indonesia (08…/62…), username 3–20 huruf kecil/angka/garis bawah, password 8–72 karakter."))
		default:
			log.Printf("register: %v", err)
			a.render(w, http.StatusInternalServerError, "register.html", page("Terjadi kesalahan. Coba lagi."))
		}
		return
	}
	a.setSession(w, token)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (a *app) postLogout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie("immerse_session"); err == nil && c.Value != "" {
		if err := a.svc.Logout(r.Context(), c.Value); err != nil {
			log.Printf("logout: %v", err)
		}
	}
	a.clearSession(w)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (a *app) me(w http.ResponseWriter, r *http.Request) {
	u := a.currentUser(r)
	if u == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(u); err != nil {
		log.Printf("me: %v", err)
	}
}

func (a *app) landing(w http.ResponseWriter, r *http.Request) {
	user := a.currentUser(r)
	b, err := os.ReadFile("index.html")
	if err != nil {
		http.Error(w, "not found", http.StatusInternalServerError)
		return
	}
	html := string(b)
	if user != nil {
		// ponytail: string swap on static landing; move to html/template if it grows.
		name := user.Username
		if name == "" {
			name = user.Email
		}
		html = strings.Replace(html,
			`<a class="btn btn--ghost" href="#coba">Coba gratis</a>`,
			`<form method="post" action="/logout" class="nav__logout"><span class="nav__user">`+template.HTMLEscapeString(name)+`</span><button class="btn btn--ghost" type="submit">Keluar</button></form>`, 1)
	} else {
		html = strings.Replace(html, `<a class="btn btn--ghost" href="#coba">Coba gratis</a>`, `<a class="btn btn--ghost" href="/login">Masuk</a>`, 1)
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(html))
}
