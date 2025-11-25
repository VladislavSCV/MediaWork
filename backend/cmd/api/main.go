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
	billing := api.NewBillingHandler()

	r := chi.NewRouter()

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "PATCH"},
		AllowedHeaders: []string{"Content-Type"},
	}))

	//
	// ─── API v1 ────────────────────────────────────────────────────────────────
	//

	r.Route("/api", func(r chi.Router) {

		// Billing module
		r.Route("/billing", func(r chi.Router) {
			// Advertisers
			r.Get("/advertisers", billing.GetAdvertisers)
			r.Post("/advertisers", billing.CreateAdvertiser)

			// Tariffs
			r.Post("/tariffs", billing.CreateTariff)

			// Campaigns
			r.Post("/campaigns", billing.CreateCampaign)
			r.Post("/campaigns/{id}/invoice", billing.IssueInvoice)
		})

		// Portal (личный кабинет рекламодателя)
		r.Route("/portal", func(r chi.Router) {
			r.Post("/login", api.PortalLogin)
			r.Get("/me", api.PortalMe)
			r.Get("/campaigns", api.PortalCampaigns)
			r.Get("/campaigns/{id}", api.PortalCampaignByID)
			r.Get("/invoices", api.PortalInvoices)
			r.Get("/stats", api.PortalStats)
			r.Get("/stats/chart", api.PortalStatsChart)
			r.Post("/upload", api.PortalUpload)
			r.Post("/invoices/{id}/pay", api.PortalPayInvoice)
			r.Post("/campaigns", api.PortalCreateCampaign)

		})

		// Facades
		r.Get("/facades", api.GetFacades)
		r.Post("/facades", api.CreateFacade)
		r.Delete("/facades/{id}", api.DeleteFacade)
		r.Post("/facades/{id}/content", facadeHandler.UpdateFacadeContent)

		// Screens
		r.Get("/screens", api.GetScreens)
		r.Post("/screens", api.CreateScreen)
		r.Delete("/screens/{id}", api.DeleteScreen)

		// Formats & Operators
		r.Get("/formats", api.GetFormats)
		r.Get("/operators", api.GetOperators)
	})

	//
	// ─── WebSocket ─────────────────────────────────────────────────────────────
	//
	r.Get("/ws/facade/{id}", hub.HandleWS)

	log.Println("🚀 Server running on :8080")
	http.ListenAndServe(":8080", r)
}
