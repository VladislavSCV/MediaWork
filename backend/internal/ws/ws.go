// internal/ws/hub.go
package ws

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

type Hub struct {
	mu      sync.Mutex
	clients map[*websocket.Conn]int
}

func NewHub() *Hub {
	return &Hub{clients: make(map[*websocket.Conn]int)}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.Atoi(idStr)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade error:", err)
		return
	}

	h.mu.Lock()
	h.clients[conn] = id
	total := len(h.clients)
	h.mu.Unlock()

	fmt.Printf("✅ Client connected to facade %d (now %d total)\n", id, total)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			h.mu.Lock()
			delete(h.clients, conn)
			h.mu.Unlock()

			fmt.Println("❌ Client disconnected:", err)
			conn.Close()
			break
		}
	}
}

func (h *Hub) Broadcast(facadeID int, msg []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	fmt.Printf("🎥 Broadcasting to facade %d (%d clients)\n", facadeID, len(h.clients))
	for c, id := range h.clients {
		if id != facadeID {
			continue
		}

		fmt.Printf("→ sending message to client of facade %d\n", id)
		if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
			fmt.Println("❌ WS send error:", err)
			c.Close()
			delete(h.clients, c)
		}
	}
}
