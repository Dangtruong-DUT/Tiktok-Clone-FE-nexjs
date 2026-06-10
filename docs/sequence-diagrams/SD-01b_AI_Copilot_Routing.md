# SD-01b: AI Copilot — Engine Routing & Tool Dispatch

Mô tả luồng điều phối nội bộ của AI Copilot: từ khi nhận câu hỏi, qua Gateway phân loại intent, Orchestrator route sang đúng Engine, mỗi Engine gọi tool/AI theo cách riêng.

> Diagram này là chi tiết bên trong bước **Phase 1 & 2** của [SD-01](SD-01_AI_Copilot_SSE.md).

```mermaid
flowchart TD
    START([Nhan user message\nkèm context + history]) --> GW_BOX

    subgraph GW_BOX [AiGateway — Phan loai intent]
        GW[Gemini structured output\nJSON mode · temp=0.1 · max 300 tokens]
        GW_INJECT[Inject RAG knowledge catalog\nvao system prompt]
        GW_INJECT --> GW
        GW --> PARSE{Parse JSON thanh cong?}
        PARSE -- Loi / khong parse duoc --> UNKNOWN[GatewayTask::unknown\nneeds_clarification = true]
        PARSE -- OK --> TASK[GatewayTask\ntask_type · intent · confidence\nscope · needs_tools · needs_rag]
    end

    UNKNOWN --> ORC
    TASK --> ORC

    subgraph ORC_BOX [CopilotOrchestrator — Routing]
        ORC{task_type?}
    end

    ORC -- content_generation --> CE_BOX
    ORC -- analytics --> AE_BOX
    ORC -- app_knowledge --> AKE_BOX
    ORC -- video_review --> VRE_BOX
    ORC -- navigation --> NE_BOX
    ORC -- unknown / khong match --> CLARIFY[Tra clarification text\nkhong goi Gemini]

    subgraph CE_BOX [ContentGenerationEngine]
        CE{Generative intent?\nwrite_caption · write_title · write_description\ngenerate_hashtags · rewrite_content · suggest_cta}
        CE -- Yes: buffer JSON --> CE_JSON[Gemini stream\nbuffer toan bo\nparse content_card variants]
        CE -- No - analysis: stream text --> CE_TEXT[Gemini stream\nplain text truc tiep]
    end

    subgraph AE_BOX [AnalyticsEngine - Planner-Tool-Builder pipeline]
        AE_PLAN[AnalyticsPlannerService\nchon tools tu catalog dua tren GatewayTask]
        AE_PLAN --> AE_CL{needs_clarification?}
        AE_CL -- Yes --> AE_Q[Tra clarification\nkhong goi tool]
        AE_CL -- No --> AE_EX[AnalyticsToolExecutor\nthuc thi tools chon duoc - DB/API]
        AE_EX --> AE_EMPTY{Ket qua rong?}
        AE_EMPTY -- Yes --> AE_FB[Fallback message]
        AE_EMPTY -- No --> AE_BUILD[AnalyticsAnswerBuilder\nGemini tong hop tool results\nthanh natural language]
    end

    subgraph AKE_BOX [AppKnowledgeEngine - RAG pipeline]
        AKE_EMBED[GeminiEmbeddingService\nembed cau hoi - RETRIEVAL_QUERY mode]
        AKE_EMBED --> AKE_SEARCH[PgVectorSearchService\nfull-text search similarity >= 0.70\nlimit 5 chunks]
        AKE_SEARCH --> AKE_FOUND{Tim duoc chunks?}
        AKE_FOUND -- Yes --> RAG[RagService::answerWithChunks\nGemini synthesis + citations]
        AKE_FOUND -- No --> STATIC[Static fallback message\nkhong goi Gemini]
    end

    subgraph VRE_BOX [VideoReviewEngine]
        VRE[Gemini stream\nPhan tich theo intent:\nhook · viral · retention · frames · segment\nCoAt the dinh kem frames/video clip tu attachments]
    end

    subgraph NE_BOX [NavigationEngine]
        NE_MATCH[Keyword matching\ntren route config - khong goi AI]
        NE_MATCH --> NE_FOUND{Co routes khop?}
        NE_FOUND -- Yes --> NE_POLISH[Gemini send non-streaming\npolish answer text\ntemp=0.25 · max 220 tokens]
        NE_FOUND -- No --> NE_ALL[Tra toan bo routes\n+ Gemini polish]
        NE_POLISH --> NE_OUT[nav_card structured output\nroute list + label + path]
        NE_ALL --> NE_OUT
    end

    CE_JSON --> RESULT
    CE_TEXT --> RESULT
    AE_Q --> RESULT
    AE_FB --> RESULT
    AE_BUILD --> RESULT
    RAG --> RESULT
    STATIC --> RESULT
    VRE --> RESULT
    NE_OUT --> RESULT
    CLARIFY --> RESULT

    RESULT([CopilotHandlerResult\ntext · structured_output · follow_up_chips · token_usage])
```

## Mô tả từng Engine

| Engine | Gọi Gemini | Streaming | Output đặc biệt |
|--------|-----------|-----------|-----------------|
| **ContentGenerationEngine** | `stream()` | Có (plain text) hoặc buffer JSON | `content_card` với variants cho generative intent |
| **AnalyticsEngine** | Không trực tiếp (AnswerBuilder gọi) | Không | `analytics_result` với tool_results |
| **AppKnowledgeEngine** | `stream()` qua RagService | Có (nếu RAG hit) | `citations` kèm nguồn tài liệu |
| **VideoReviewEngine** | `stream()` | Có | Plain text (hook/retention/viral analysis) |
| **NavigationEngine** | `send()` non-streaming | Không | `nav_card` với danh sách route |

## Ghi chú kiến trúc

- **AnalyticsEngine** là engine phức tạp nhất: 3 bước độc lập (Planner → Executor → Builder), tools được chọn từ catalog động — engine không hardcode tên tool.
- **AppKnowledgeEngine**: pgvector similarity search trước, chỉ gọi Gemini nếu tìm được chunks phù hợp (threshold 0.70). Không có chunks → trả static message, không tốn token.
- **NavigationEngine**: route matching hoàn toàn deterministic (keyword), Gemini chỉ được gọi để polish câu trả lời — đảm bảo route chính xác, không hallucinate.
- **GatewayTask::unknown** không dừng pipeline — Orchestrator xử lý bằng cách trả clarification text, không gọi Gemini lần thứ hai.
