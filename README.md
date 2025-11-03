mediafacade-backend/
  cmd/
    api/
      main.go           // точка входа HTTP
  internal/
    config/
      config.go         // чтение env, порты, DSN
    http/
      router.go         // сборка chi-роутера
      middleware.go
      screens_handler.go
      formats_handler.go
      operators_handler.go
      media_handler.go
    domain/
      screen.go         // модели домена (struct-и без зависимостей)
      format.go
      operator.go
      media.go
    services/
      screens_service.go
      formats_service.go
      operators_service.go
      media_service.go
    storage/
      postgres/
        screens_repo.go
        formats_repo.go
        operators_repo.go
        media_repo.go
      // тут можно иметь интерфейсы репозиториев
    logger/
      logger.go
