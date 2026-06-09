# SD-01: AI Copilot — SSE Streaming

Mô tả luồng **HTTP/SSE** giữa Frontend ↔ Laravel API ↔ Gemini: từ lúc gửi câu hỏi đến khi nhận đủ phản hồi qua SSE.

> Routing nội bộ (Gateway → Orchestrator → Engine → Tool) được mô tả chi tiết tại **[SD-01b](SD-01b_AI_Copilot_Routing.md)**.

> **Lý do dùng SSE + token URL**: EventSource (SSE) không gửi được Authorization header, nên API sinh một encrypted short-lived token (TTL 2 phút) trả về cùng `stream_url`. Frontend dùng token này trong query param khi mở SSE connection.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Laravel API
    participant GW as AiGateway
    participant ORC as CopilotOrchestrator
    participant ENG as Engine
    participant G as Gemini

    U->>FE: Nhap cau hoi
    FE->>API: POST /studio/ai/copilot/sessions/{uuid}/messages
    activate API
    API->>API: Luu user message + cache attachments (DB + Redis TTL 5m)
    API->>API: generateStreamToken() — Crypt::encryptString, TTL 2 phut
    API-->>FE: 202 (message_uuid, stream_token, stream_url)
    deactivate API

    FE->>API: GET /studio/ai/copilot/sessions/{uuid}/stream/{msg_uuid}?token=...
    activate API
    API->>API: validateStreamToken() — xac minh session_uuid + message_uuid + expiry

    alt Token khong hop le / het han
        API-->>FE: HTTP 403 Forbidden (stream chua mo)
        deactivate API
    else Token hop le — SSE stream mo (HTTP 200 + text/event-stream)
        API->>API: Pull attachments tu Cache + build history (10 msgs)

        Note over API,GW: Phase 1 — Intent Classification
        API->>GW: understand(question, locale, isAdmin, history)
        activate GW
        GW->>GW: Inject RAG knowledge catalog vao system prompt
        GW->>G: send() — JSON mode, temp=0.1, maxTokens=300
        activate G
        G-->>GW: task_type, intent, confidence, needs_rag
        deactivate G
        GW-->>API: GatewayTask
        deactivate GW

        Note over API,ENG: Phase 2 — Engine Routing & Streaming
        API->>ORC: dispatch(task, input, context, history, chunkEmit)
        activate ORC

        alt task_type = unknown / khong match engine
            ORC-->>API: CopilotHandlerResult (clarification — khong goi Gemini)
        else task_type matched (content_generation | analytics | video_review | ...)
            ORC->>ENG: handle(task, input, context, history, emit)
            activate ENG
            ENG->>G: streamGenerateContent()
            activate G
            loop Streaming chunks
                G-->>ENG: delta
                ENG-->>API: onChunk(delta) via chunkEmit callback
                API-->>FE: SSE data: {type:chunk, delta}
            end
            deactivate G
            ENG-->>ORC: CopilotHandlerResult
            deactivate ENG
        end

        ORC-->>API: CopilotHandlerResult
        deactivate ORC

        API->>API: Luu assistant message (intent, structured_output, follow_up_chips, token_usage)
        API->>API: Log AiUsageLog (latency_ms, provider, model)
        API-->>FE: SSE data: {type:done, message:{uuid, content, intent, task_type, token_usage}}
        deactivate API
    end

    FE->>FE: EventSource.close()
```

## Sửa so với phiên bản cũ

| Điểm sai | Đúng theo source |
|----------|-----------------|
| Token lỗi → `SSE error — đóng stream` | Token lỗi → **HTTP 403** (`abort_unless`) — stream chưa mở, không phải SSE event |
| `ORC->>G: streamGenerateContent()` trực tiếp | Gemini được gọi bởi **Engine**, không phải Orchestrator |
| `G-->>ORC: delta` → `ORC-->>API: onChunk` | Engine gọi `$chunkEmit` callback được truyền vào → API emit SSE |
| Thiếu `ENG` participant | Orchestrator route sang 5 engine riêng: `ContentGenerationEngine`, `AppKnowledgeEngine`, `NavigationEngine`, `AnalyticsEngine`, `VideoReviewEngine` |
| `AiGateway` ném exception khi Gemini lỗi | Gateway tự catch → fallback `GatewayTask::unknown()`, không throw ra ngoài |
| Done payload đơn giản | Done đầy đủ: `{uuid, content, intent, task_type, structured_output, follow_up_chips, token_usage}` |
| `understand(question, locale, history)` | Thêm tham số `isAdmin` để phân quyền scope (creator vs super_admin) |

## Ghi chú kiến trúc

- **2-phase AI**: `AiGateway` classify intent (non-streaming, JSON) → `CopilotOrchestrator` route đến đúng Engine rồi mới stream. Tách bạch *hiểu câu hỏi* và *sinh câu trả lời*.
- **`AiGateway`**: inject RAG knowledge catalog (cached 5m) vào system prompt để Gemini biết khi nào route sang `app_knowledge`. Nếu parse lỗi → fallback `GatewayTask::unknown()`, không throw.
- **`CopilotOrchestrator`**: route theo `task_type` → 5 engine. Nếu `unknown` → trả clarification text, không gọi Gemini lần thứ hai.
- **Stream token**: `Crypt::encryptString(json({session_uuid, message_uuid, user_id, exp}))` — identity decode từ token, không cần pre-auth.
- **Error path**: mọi exception trong `stream()` đều được catch → lưu error message → emit `{type:done, status:failed}`.
