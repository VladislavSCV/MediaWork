package handlers

import (
    "encoding/json"
    "mediawork/internal/services"
    "net/http"
    "strconv"
    "log"

    "github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

type FacadeHandler struct {
    svc *services.FacadeService
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func NewFacadeHandler(s *services.FacadeService) *FacadeHandler {
    return &FacadeHandler{svc: s}
}

func (h *FacadeHandler) Status(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

    data, err := h.svc.GetStatus(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(data)
}


func (h *FacadeHandler) List(w http.ResponseWriter, r *http.Request) {
    data, err := h.svc.List(r.Context())
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }

    json.NewEncoder(w).Encode(data)
}

func (h *FacadeHandler) LiveWS(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	facadeID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid facade id", http.StatusBadRequest)
		return
	}

	// Upgrade to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WS Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Printf("Client connected to facade %d", facadeID)

	// ------------------------
	//  Реальный стрим
	// ------------------------
	frames := h.svc.StreamLiveFrames(r.Context(), facadeID)

	for frame := range frames {
		msg := map[string]any{
			"type": "frame",
			"data": frame.Base64Frame,
		}

		b, _ := json.Marshal(msg)
		err := conn.WriteMessage(websocket.TextMessage, b)
		if err != nil {
			log.Println("WS write error:", err)
			return
		}
	}
}