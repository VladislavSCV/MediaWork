package api

import (
    "context"
    "encoding/json"
    "log"
    "net/http"

    "github.com/gorilla/websocket"
    "mediawork/internal/services"
    "strconv"
)

type FacadeLiveHandler struct {
    service *services.FacadeService
}

func NewFacadeLiveHandler(s *services.FacadeService) *FacadeLiveHandler {
    return &FacadeLiveHandler{service: s}
}

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func (h *FacadeLiveHandler) Stream(w http.ResponseWriter, r *http.Request) {
    idStr := r.PathValue("id")
    facadeID, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        http.Error(w, "invalid facade id", 400)
        return
    }

    // UPGRADING CONNECTION
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("WS upgrade error:", err)
        return
    }
    defer conn.Close()

    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    frames := h.service.StreamLiveFrames(ctx, facadeID)

    for frame := range frames {
        payload := map[string]interface{}{
            "type": "frame",
            "data": frame.Base64Frame,
        }

        b, _ := json.Marshal(payload)

        if err := conn.WriteMessage(websocket.TextMessage, b); err != nil {
            log.Println("WS write error:", err)
            return
        }
    }
}
