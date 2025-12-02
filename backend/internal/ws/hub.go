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
    mu sync.Mutex

    facadeClients  map[*websocket.Conn]int
    monitorClients map[*websocket.Conn]bool
}

func NewHub() *Hub {
    return &Hub{
        facadeClients:  make(map[*websocket.Conn]int),
        monitorClients: make(map[*websocket.Conn]bool),
    }
}

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}

// ----------------- FACADE WS ----------------------
func (h *Hub) HandleFacadeWS(w http.ResponseWriter, r *http.Request) {
    idStr := chi.URLParam(r, "id")
    id, _ := strconv.Atoi(idStr)

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("Upgrade error:", err)
        return
    }

    h.mu.Lock()
    h.facadeClients[conn] = id
    total := len(h.facadeClients)
    h.mu.Unlock()

    fmt.Printf("🎥 Facade client %d connected (%d total)\n", id, total)

    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            h.mu.Lock()
            delete(h.facadeClients, conn)
            h.mu.Unlock()
            conn.Close()
            fmt.Println("❌ Facade WS disconnected")
            break
        }
    }
}

func (h *Hub) BroadcastToFacade(facadeID int, msg []byte) {
    h.mu.Lock()
    defer h.mu.Unlock()

    fmt.Printf("📤 Broadcasting update to facade %d\n", facadeID)

    for c, id := range h.facadeClients {
        if id != facadeID {
            continue
        }

        if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
            fmt.Println("❌ WS send failed:", err)
            c.Close()
            delete(h.facadeClients, c)
        }
    }
}

// ---------------- MONITOR WS -----------------------
func (h *Hub) HandleMonitorWS(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("monitor upgrade error:", err)
        return
    }

    h.mu.Lock()
    h.monitorClients[conn] = true
    h.mu.Unlock()

    fmt.Println("📡 Monitor connected")

    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            h.mu.Lock()
            delete(h.monitorClients, conn)
            h.mu.Unlock()
            conn.Close()
            fmt.Println("📴 Monitor disconnected")
            break
        }
    }
}

func (h *Hub) BroadcastMonitor(msg []byte) {
    h.mu.Lock()
    defer h.mu.Unlock()

    for c := range h.monitorClients {
        if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
            fmt.Println("❌ Monitor WS error:", err)
            c.Close()
            delete(h.monitorClients, c)
        }
    }
}
