package api

import (
    "net/http"
    "os"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    "github.com/go-chi/cors"

    // подстрой пути под свой модуль
    "mediawork/internal/db"
    "mediawork/internal/repositories"
    "mediawork/internal/services"
    "mediawork/internal/handlers"
)

// AppRouter собирает все зависимости и возвращает готовый http.Handler
func NewRouter() (http.Handler, error) {
    // ───────────────── DB ─────────────────
    if err := db.Init(); err != nil {
        return nil, err
    }
    sqlDB := db.DB

    // ───────────────── Repositories ─────────────────
    userRepo := repositories.NewUserRepository(sqlDB)
    companyRepo := repositories.NewCompanyRepository(sqlDB)
    facadeRepo := repositories.NewFacadeRepository(sqlDB)
    campaignRepo := repositories.NewCampaignRepository(sqlDB)
    slotRepo := repositories.NewCampaignSlotRepository(sqlDB)
    invoiceRepo := repositories.NewInvoiceRepository(sqlDB)
    playHistoryRepo := repositories.NewPlayHistoryRepository(sqlDB)
    liveStreamRepo := repositories.NewLiveStreamRepository(sqlDB)
	membershipRepo := repositories.NewCompanyMembershipRepository(sqlDB)
    // если есть ещё репозитории — добавляй тут

    // ───────────────── Services ─────────────────
    jwtSecret := os.Getenv("JWT_SECRET")
    if jwtSecret == "" {
        jwtSecret = "dev-secret-change-me"
    }

    authSvc := services.NewAuthService(userRepo, jwtSecret)
    userSvc := services.NewUserService(userRepo)
    companySvc := services.NewCompanyService(companyRepo, membershipRepo)
    facadeSvc := services.NewFacadeService(facadeRepo, liveStreamRepo)
    campaignSvc := services.NewCampaignService(campaignRepo, slotRepo)
    billingSvc := services.NewBillingService(invoiceRepo, playHistoryRepo)
    liveSvc := services.NewLiveStreamService(liveStreamRepo)
    adminSvc := services.NewAdminService(userRepo, companyRepo)

    // ───────────────── Handlers ─────────────────
    authH := handlers.NewAuthHandler(authSvc)
    userH := handlers.NewUserHandler(userSvc)
    companyH := handlers.NewCompanyHandler(companySvc)
    campaignH := handlers.NewCampaignHandler(campaignSvc)
    invoiceH := handlers.NewInvoiceHandler(billingSvc)
    facadeH := handlers.NewFacadeHandler(facadeSvc)
    liveH := handlers.NewLiveHandler(liveSvc)
    adminH := handlers.NewAdminHandler(adminSvc)

    // ───────────────── Router ─────────────────
    r := chi.NewRouter()

    // Базовые middlewares
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Timeout(30 * time.Second))

    // CORS — разрешаем фронту ходить на бэк
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000", "*"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
        ExposedHeaders:   []string{"Link"},
        AllowCredentials: true,
        MaxAge:           300,
    }))

    // ───────────────── API ─────────────────
    r.Route("/api", func(api chi.Router) {
        // -------- Public auth --------
        api.Post("/auth/login", authH.Login)
        api.Post("/auth/register", authH.Register)

        // -------- Live (для плееров/фасадов) --------
        // тут можно потом сделать отдельный токен или IP-фильтр
        api.Post("/live/heartbeat", liveH.Heartbeat)
        api.Post("/live/play-event", liveH.PlayEvent)

        // -------- Authenticated area --------
        api.Group(func(pr chi.Router) {
            pr.Use(handlers.AuthMiddleware(authSvc))

            // Профиль текущего пользователя
            pr.Get("/me", userH.Profile)

            // Компании
            pr.Route("/companies", func(cr chi.Router) {
                cr.Get("/", companyH.List)
                cr.Post("/", companyH.Create)
                cr.Get("/{id}", companyH.GetDetailed)
            })

            // Кампании
            pr.Route("/campaigns", func(cr chi.Router) {
                cr.Post("/", campaignH.Create)
                cr.Get("/", campaignH.List)
                cr.Get("/{id}", campaignH.Get)
            })

            // Фасады
            pr.Route("/facades", func(fr chi.Router) {
                fr.Get("/", facadeH.List)
                fr.Get("/{id}/status", facadeH.Status)
            })

            // Инвойсы
            pr.Route("/invoices", func(ir chi.Router) {
                ir.Get("/", invoiceH.List) 
                ir.Get("/{id}/pdf-data", invoiceH.GetPDF)
            })

            // -------- Admin-only --------
            pr.Route("/admin", func(ar chi.Router) {
                ar.Use(handlers.RoleGuard("admin"))

                ar.Get("/users", adminH.Users)
                ar.Get("/companies", adminH.Companies)
            })
        })
    })

    return r, nil
}
