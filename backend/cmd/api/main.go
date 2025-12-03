package main

import (
    "log"
    "net/http"

    // подстрой под свой модуль
    "mediawork/internal/api"
    "mediawork/internal/db"
)

func main() {
    // init DB (если ты уже делаешь это в api.NewRouter, можешь убрать отсюда)
    if err := db.Init(); err != nil {
        log.Fatalf("db init error: %v", err)
    }
    defer db.DB.Close()

    r, err := api.NewRouter()
    if err != nil {
        log.Fatalf("router init error: %v", err)
    }

    addr := ":8080"
    log.Printf("MediaWork backend listening on %s", addr)
    if err := http.ListenAndServe(addr, r); err != nil {
        log.Fatalf("server error: %v", err)
    }
}
