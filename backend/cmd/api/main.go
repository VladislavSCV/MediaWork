package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"github/VladislavSCV/MediaWork/internal/api"
	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/ws"
)

func main() {
	if err := db.Init(); err != nil {
		log.Fatal(err)
	}
	defer db.DB.Close()

	hub := ws.NewHub()

	facadeHandler := &api.FacadeHandler{Hub: hub}

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "PATCH"},
		AllowedHeaders: []string{"Content-Type"},
	}))

	// REST
	r.Post("/api/facades/{id}/content", facadeHandler.UpdateFacadeContent)

	// Остальные API
	r.Get("/api/facades", api.GetFacades)
	r.Post("/api/facades", api.CreateFacade)
	r.Delete("/api/facades/{id}", api.DeleteFacade)
	r.Post("/api/facades/{id}/content", facadeHandler.UpdateFacadeContent)
	r.Get("/api/facades", api.GetFacades)
	r.Get("/api/screens", api.GetScreens)
	r.Post("/api/screens", api.CreateScreen)
	r.Delete("/api/screens/{id}", api.DeleteScreen)
	r.Get("/api/formats", api.GetFormats)
	r.Get("/api/operators", api.GetOperators)

	// WS
	r.Get("/ws/facade/{id}", hub.HandleWS)

	log.Println("🚀 Server running on :8080")
	http.ListenAndServe(":8080", r)
}
