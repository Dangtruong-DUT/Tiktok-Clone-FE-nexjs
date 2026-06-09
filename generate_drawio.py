#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate draw.io sequence diagram XML files for Snapi system documentation.
Run: python generate_drawio.py
Output: output/ directory with 7 .drawio files.
"""

import os
from xml.sax.saxutils import escape as _xml_escape

OUTPUT_DIR = "output"

# Layout constants
MSG_STEP      = 45   # y increment per regular message
SELF_H        = 30   # height of self-call loop
SELF_GAP      = 15   # gap after self-call
FRAME_HDR     = 22   # height of frame header label
FRAME_PAD     = 18   # padding at bottom of frame
FRAME_INNER   = 10   # gap between header and first message
DIVIDER_H     = 30   # height consumed by a branch divider
PARTICIPANT_H = 40
PARTICIPANT_Y = 20
LIFELINE_Y0   = 60
FIRST_MSG_Y   = 100
P_GAP         = 40   # gap between participant boxes
MIN_W         = 120
CHAR_W        = 8    # approx pixels per char (bold 11px)

STYLES = {
    "participant": "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=11;",
    "actor":       "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontStyle=1;fontSize=11;",
    "kafka":       "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;fontStyle=1;fontSize=11;",
    "db":          "rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontStyle=1;fontSize=11;",
    "ai":          "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;fontSize=11;",
    "cache":       "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5f5e3;strokeColor=#27ae60;fontStyle=1;fontSize=11;",
    "lifeline":    "endArrow=none;html=1;dashed=1;strokeColor=#aaaaaa;",
    "msg_sync":    "endArrow=block;endFill=1;html=1;fontSize=10;",
    "msg_return":  "endArrow=open;endFill=0;dashed=1;html=1;fontSize=10;",
    "msg_self":    "endArrow=block;endFill=1;html=1;fontSize=10;",
    "f_alt_box":   "rounded=0;html=1;strokeColor=#d6b656;fillColor=none;strokeWidth=1.5;",
    "f_loop_box":  "rounded=0;html=1;strokeColor=#82b366;fillColor=none;strokeWidth=1.5;",
    "f_alt_lbl":   "text;html=1;align=left;verticalAlign=middle;fontStyle=1;fontSize=10;fillColor=#fff9c4;strokeColor=#d6b656;",
    "f_loop_lbl":  "text;html=1;align=left;verticalAlign=middle;fontStyle=1;fontSize=10;fillColor=#d5e8d4;strokeColor=#82b366;",
    "div_line":    "endArrow=none;dashed=1;html=1;strokeColor=#d6b656;",
    "div_text":    "text;html=1;align=left;fontStyle=2;fontSize=10;fillColor=none;strokeColor=none;",
    "note":        "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#fff9c4;strokeColor=#d6b656;fontSize=10;align=left;spacingLeft=5;",
}


def _pstyle(name: str) -> str:
    n = name.lower().replace('\n', ' ')
    if n.strip() == 'user':
        return 'actor'
    if 'kafka' in n or 'moderation.' in n:
        return 'kafka'
    if 'postgresql' in n or 'database' in n:
        return 'db'
    if ('redis' in n):
        return 'cache'
    if ('phobert' in n or 'ai service' in n or 'textpipeline' in n
            or 'moderationworker' in n or 'classifier' in n):
        return 'ai'
    return 'participant'


def _esc(s: str) -> str:
    return _xml_escape(str(s), {'"': '&quot;'}).replace('\n', '&#xa;')


class Generator:
    def __init__(self, spec: dict):
        self.spec = spec
        self._ctr = 2
        self.p_info: dict = {}    # label → {cx, x, width}
        self.p_order: list = []   # ordered participant labels
        self.cells: list = []     # (layer, xml_str)
        self.y: int = FIRST_MSG_Y

    # ------------------------------------------------------------------ #
    def _id(self) -> str:
        v = self._ctr; self._ctr += 1; return str(v)

    def _cx(self, name: str) -> int:
        """Find centre-x of participant by exact or partial name."""
        if name in self.p_info:
            return self.p_info[name]['cx']
        for p in self.p_order:
            first = p.split('\n')[0]
            if first == name or p.startswith(name) or name in p:
                return self.p_info[p]['cx']
        raise ValueError(f"Participant not found: {name!r}  available={self.p_order}")

    def _all_cx(self) -> list:
        return [self.p_info[p]['cx'] for p in self.p_order]

    # ------------------------------------------------------------------ #
    def _setup_participants(self) -> int:
        x = 20
        for p in self.spec['participants']:
            lines = p.split('\n')
            w = max(MIN_W, max(len(l) for l in lines) * CHAR_W + 20)
            cx = x + w // 2
            self.p_info[p] = {'cx': cx, 'x': x, 'width': w}
            self.p_order.append(p)
            x += w + P_GAP
        return x - P_GAP + 20

    def _add_participant_boxes(self):
        for p in self.p_order:
            info = self.p_info[p]
            sid = _pstyle(p)
            cid = self._id()
            self.cells.append((0,
                f'    <mxCell id="{cid}" value="{_esc(p)}" style="{STYLES[sid]}" '
                f'vertex="1" parent="1">'
                f'<mxGeometry x="{info["x"]}" y="{PARTICIPANT_Y}" '
                f'width="{info["width"]}" height="{PARTICIPANT_H}" as="geometry"/>'
                f'</mxCell>\n'))

    def _add_lifelines(self, bottom_y: int):
        for p in self.p_order:
            cx = self.p_info[p]['cx']
            cid = self._id()
            self.cells.append((1,
                f'    <mxCell id="{cid}" style="{STYLES["lifeline"]}" '
                f'edge="1" parent="1">'
                f'<mxGeometry relative="1" as="geometry">'
                f'<mxPoint x="{cx}" y="{LIFELINE_Y0}" as="sourcePoint"/>'
                f'<mxPoint x="{cx}" y="{bottom_y}" as="targetPoint"/>'
                f'</mxGeometry></mxCell>\n'))

    # ------------------------------------------------------------------ #
    def _msg(self, frm: str, to: str, label: str, mtype: str):
        cf = self._cx(frm)
        ct = self._cx(to)
        y  = self.y
        cid = self._id()
        lbl = _esc(label)

        if mtype == 'self':
            off = 35
            y2  = y + SELF_H
            self.cells.append((3,
                f'    <mxCell id="{cid}" value="{lbl}" style="{STYLES["msg_self"]}" '
                f'edge="1" parent="1">'
                f'<mxGeometry relative="1" as="geometry">'
                f'<mxPoint x="{cf}" y="{y}" as="sourcePoint"/>'
                f'<mxPoint x="{cf}" y="{y2}" as="targetPoint"/>'
                f'<Array as="points">'
                f'<mxPoint x="{cf+off}" y="{y}"/>'
                f'<mxPoint x="{cf+off}" y="{y2}"/>'
                f'</Array>'
                f'</mxGeometry></mxCell>\n'))
            self.y += SELF_H + SELF_GAP
        else:
            st = STYLES['msg_sync'] if mtype == 'sync' else STYLES['msg_return']
            self.cells.append((3,
                f'    <mxCell id="{cid}" value="{lbl}" style="{st}" '
                f'edge="1" parent="1">'
                f'<mxGeometry relative="1" as="geometry">'
                f'<mxPoint x="{cf}" y="{y}" as="sourcePoint"/>'
                f'<mxPoint x="{ct}" y="{y}" as="targetPoint"/>'
                f'</mxGeometry></mxCell>\n'))
            self.y += MSG_STEP

    # ------------------------------------------------------------------ #
    def _frame(self, spec: dict):
        ftype  = spec['type']           # 'alt' | 'loop'
        label  = spec['label']
        cxs    = self._all_cx()
        x_min  = min(cxs) - 20
        x_max  = max(cxs) + 20
        fw     = x_max - x_min

        y0 = self.y                     # frame top
        self.y += FRAME_HDR + FRAME_INNER

        # header label cell
        lbl_style = STYLES['f_alt_lbl'] if ftype == 'alt' else STYLES['f_loop_lbl']
        lw = min(len(label) * 7 + 20, fw)
        lid = self._id()
        self.cells.append((2,
            f'    <mxCell id="{lid}" value="{_esc(label)}" style="{lbl_style}" '
            f'vertex="1" parent="1">'
            f'<mxGeometry x="{x_min}" y="{y0}" width="{lw}" height="{FRAME_HDR}" as="geometry"/>'
            f'</mxCell>\n'))

        # branches
        branches = spec.get('branches')
        if branches is None:
            branches = [{'label': None, 'items': spec.get('items', [])}]

        for i, branch in enumerate(branches):
            if i > 0 and branch.get('label'):
                dy = self.y
                did1 = self._id(); did2 = self._id()
                self.cells.append((2,
                    f'    <mxCell id="{did1}" style="{STYLES["div_line"]}" '
                    f'edge="1" parent="1">'
                    f'<mxGeometry relative="1" as="geometry">'
                    f'<mxPoint x="{x_min}" y="{dy}" as="sourcePoint"/>'
                    f'<mxPoint x="{x_max}" y="{dy}" as="targetPoint"/>'
                    f'</mxGeometry></mxCell>\n'))
                self.cells.append((2,
                    f'    <mxCell id="{did2}" value="{_esc(branch["label"])}" '
                    f'style="{STYLES["div_text"]}" vertex="1" parent="1">'
                    f'<mxGeometry x="{x_min+5}" y="{dy+2}" width="220" height="18" as="geometry"/>'
                    f'</mxCell>\n'))
                self.y += DIVIDER_H

            self._items(branch.get('items', []))

        y1 = self.y + FRAME_PAD
        self.y = y1

        # border box (layer 2 so it's behind messages)
        box_style = STYLES['f_alt_box'] if ftype == 'alt' else STYLES['f_loop_box']
        bid = self._id()
        self.cells.append((2,
            f'    <mxCell id="{bid}" value="" style="{box_style}" '
            f'vertex="1" parent="1">'
            f'<mxGeometry x="{x_min}" y="{y0}" width="{fw}" height="{y1-y0}" as="geometry"/>'
            f'</mxCell>\n'))

    # ------------------------------------------------------------------ #
    def _items(self, items: list):
        for it in items:
            if isinstance(it, tuple):
                self._msg(*it)
            elif isinstance(it, dict):
                self._frame(it)

    # ------------------------------------------------------------------ #
    def _note(self, text: str):
        cxs = self._all_cx()
        x0  = min(cxs) - 20
        w   = min(max(len(l) for l in text.split('\n')) * 7 + 40, 520)
        h   = (text.count('\n') + 1) * 22 + 16
        y   = self.y + 15
        cid = self._id()
        self.cells.append((4,
            f'    <mxCell id="{cid}" value="{_esc(text)}" style="{STYLES["note"]}" '
            f'vertex="1" parent="1">'
            f'<mxGeometry x="{x0}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
            f'</mxCell>\n'))
        self.y = y + h + 20

    # ------------------------------------------------------------------ #
    def generate(self) -> str:
        total_w = self._setup_participants()
        self._add_participant_boxes()
        self._items(self.spec.get('items', []))

        bottom_y = self.y + 40
        self._add_lifelines(bottom_y)

        if self.spec.get('note'):
            self._note(self.spec['note'])

        # sort: participants(0) → lifelines(1) → frames(2) → messages(3) → notes(4)
        sorted_cells = sorted(self.cells, key=lambda c: c[0])

        pw = max(total_w + 40, 850)
        ph = self.y + 80

        parts = [
            '<?xml version="1.0" encoding="UTF-8"?>\n',
            f'<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" '
            f'tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" '
            f'pageWidth="{pw}" pageHeight="{ph}" math="0" shadow="0">\n',
            '  <root>\n',
            '    <mxCell id="0"/>\n',
            '    <mxCell id="1" parent="0"/>\n',
        ]
        for _, xml in sorted_cells:
            parts.append(xml)
        parts.append('  </root>\n</mxGraphModel>\n')
        return ''.join(parts)


# ======================================================================
# Diagram Specifications
# ======================================================================

SD01 = {
    "participants": ["Frontend", "Laravel API", "AiGateway", "CopilotOrchestrator", "Gemini"],
    "items": [
        ("Frontend",   "Laravel API", "POST /sessions/:uuid/messages", "sync"),
        ("Laravel API","Laravel API", "Lưu userMessage (DB)", "self"),
        ("Laravel API","Laravel API", "generateStreamToken() — TTL 2 phút", "self"),
        ("Laravel API","Frontend",    "202 Accepted (message_uuid, stream_url, token)", "return"),
        ("Frontend",   "Laravel API", "GET /stream/:msg_uuid?token=...", "sync"),
        ("Laravel API","Laravel API", "validateStreamToken()", "self"),
        {
            "type": "alt", "label": "alt [Token hết hạn / không hợp lệ]",
            "branches": [
                {
                    "label": None,
                    "items": [
                        ("Laravel API","Frontend", "SSE error — đóng stream", "return"),
                    ]
                },
                {
                    "label": "else [Token hợp lệ]",
                    "items": [
                        ("Laravel API",        "AiGateway",           "understand(question, locale, history)", "sync"),
                        ("AiGateway",          "Gemini",              "generateContent — JSON mode, temp=0.1", "sync"),
                        ("Gemini",             "AiGateway",           "task_type, intent, confidence", "return"),
                        ("AiGateway",          "Laravel API",         "GatewayTask", "return"),
                        ("Laravel API",        "CopilotOrchestrator", "dispatch(task, input, context)", "sync"),
                        ("CopilotOrchestrator","Gemini",              "streamGenerateContent()", "sync"),
                        {
                            "type": "loop", "label": "loop [Streaming chunks]",
                            "items": [
                                ("Gemini",             "CopilotOrchestrator", "delta", "return"),
                                ("CopilotOrchestrator","Laravel API",         "onChunk(delta)", "sync"),
                                ("Laravel API",        "Frontend",            "SSE — type:chunk, delta", "return"),
                            ]
                        },
                        {
                            "type": "alt", "label": "alt [Gemini stream lỗi]",
                            "branches": [
                                {
                                    "label": None,
                                    "items": [
                                        ("Laravel API","Frontend", "SSE — type:done, status:failed", "return"),
                                    ]
                                },
                                {
                                    "label": "else [Thành công]",
                                    "items": [
                                        ("Laravel API","Laravel API","Lưu assistant message + token_usage (DB)", "self"),
                                        ("Laravel API","Frontend",   "SSE — type:done, message, token_usage", "return"),
                                    ]
                                },
                            ]
                        },
                        ("Frontend","Frontend","EventSource.close()", "self"),
                    ]
                },
            ]
        },
    ],
    "note": "EventSource không gửi được Auth header\n→ Dùng encrypted short-lived token qua URL param (TTL 2m)",
}

SD02A = {
    "participants": ["User", "Frontend", "Laravel API", "Apache Kafka", "AI Service\n(PhoBERT)", "PostgreSQL"],
    "items": [
        ("User",          "Frontend",         "Gửi bình luận", "sync"),
        ("Frontend",      "Laravel API",      "POST /comments", "sync"),
        ("Laravel API",   "PostgreSQL",       "INSERT comment", "sync"),
        ("Laravel API",   "Laravel API",      "AiModerationService.enqueue()", "self"),
        ("Laravel API",   "Apache Kafka",     "Publish moderation.request.v1", "sync"),
        ("Laravel API",   "Frontend",         "201 Created", "return"),
        ("Apache Kafka",  "AI Service\n(PhoBERT)", "Consume moderation.request.v1", "sync"),
        ("AI Service\n(PhoBERT)", "AI Service\n(PhoBERT)", "clean → tokenize → predict", "self"),
        ("AI Service\n(PhoBERT)", "Apache Kafka", "Publish moderation.result.v1", "sync"),
        ("Apache Kafka",  "Laravel API",      "Consume moderation.result.v1", "sync"),
        ("Laravel API",   "Laravel API",      "AiModerationService.applyVerdict()", "self"),
        {
            "type": "alt", "label": "alt [Vi phạm]",
            "branches": [
                {
                    "label": None,
                    "items": [
                        ("Laravel API","PostgreSQL","Soft delete comment", "sync"),
                        ("Laravel API","PostgreSQL","Tạo AiModerationReport", "sync"),
                        ("Laravel API","User",      "Gửi notification (in-app + email)", "return"),
                    ]
                },
                {
                    "label": "else [Không vi phạm]",
                    "items": [
                        ("Laravel API","PostgreSQL","Tạo AiModerationReport (status=RESOLVED)", "sync"),
                    ]
                },
            ]
        },
    ],
    "note": "Pipeline kiểm duyệt bất đồng bộ — Laravel không block request\nAI Service xử lý riêng biệt, không liên quan đến request cycle",
}

SD02B = {
    "participants": ["moderation.request.v1", "ModerationWorker", "TextPipeline", "PhoBERTClassifier", "moderation.result.v1"],
    "items": [
        ("moderation.request.v1", "ModerationWorker",    "Consume message", "sync"),
        ("ModerationWorker",      "TextPipeline",         "clean_text(sentence)", "sync"),
        ("TextPipeline",          "TextPipeline",         "Normalize Unicode, xóa URL, chuẩn hoá khoảng trắng", "self"),
        ("TextPipeline",          "ModerationWorker",     "cleaned_text", "return"),
        ("ModerationWorker",      "ModerationWorker",     "tokenizer.encode(cleaned_text, max_length=256)", "self"),
        ("ModerationWorker",      "PhoBERTClassifier",    "forward(input_ids, attention_mask)", "sync"),
        ("PhoBERTClassifier",     "PhoBERTClassifier",    "softmax(logits)", "self"),
        ("PhoBERTClassifier",     "ModerationWorker",     "label, confidence", "return"),
        {
            "type": "alt", "label": "alt [confidence >= 0.8]",
            "branches": [
                {
                    "label": None,
                    "items": [
                        ("ModerationWorker","ModerationWorker","is_violation = true", "self"),
                    ]
                },
                {
                    "label": "else [confidence < 0.8]",
                    "items": [
                        ("ModerationWorker","ModerationWorker","is_violation = false", "self"),
                    ]
                },
            ]
        },
        ("ModerationWorker","moderation.result.v1","Publish (task_id, label, confidence, is_violation)", "sync"),
        ("ModerationWorker","ModerationWorker",     "Manual commit offset", "self"),
    ],
    "note": "Manual commit tránh mất message khi worker gặp lỗi\nThreshold 0.8 giảm thiểu false positive",
}

SD02C = {
    "participants": [
        "moderation.result.v1",
        "ModerationResultProcessorCommand",
        "AiModerationService",
        "PostRepository",
        "AdminModerationNoticeService",
        "Database",
    ],
    "items": [
        ("moderation.result.v1",             "ModerationResultProcessorCommand", "Consume message", "sync"),
        ("ModerationResultProcessorCommand", "AiModerationService",              "applyVerdict(payload)", "sync"),
        ("AiModerationService",              "PostRepository",                   "find(resource_id)", "sync"),
        {
            "type": "alt", "label": "alt [Resource không tồn tại]",
            "branches": [
                {
                    "label": None,
                    "items": [
                        ("AiModerationService","ModerationResultProcessorCommand","Bỏ qua, commit offset", "return"),
                    ]
                },
                {
                    "label": "else [Resource stale (resource_updated_at < post.updated_at)]",
                    "items": [
                        ("AiModerationService","ModerationResultProcessorCommand","Bỏ qua, commit offset", "return"),
                    ]
                },
                {
                    "label": "else [Resource hợp lệ]",
                    "items": [
                        ("AiModerationService","Database","BEGIN TRANSACTION", "sync"),
                        {
                            "type": "alt", "label": "alt [is_violation = true]",
                            "branches": [
                                {
                                    "label": None,
                                    "items": [
                                        ("AiModerationService","Database",                   "Soft delete post/comment", "sync"),
                                        ("AiModerationService","Database",                   "Tạo AiModerationReport (OPEN, appeal_deadline=now+7d)", "sync"),
                                        ("AiModerationService","AdminModerationNoticeService","send(admin, targetUser, reason)", "sync"),
                                        ("AdminModerationNoticeService","AdminModerationNoticeService","Dispatch email + in-app notification", "self"),
                                    ]
                                },
                                {
                                    "label": "else [is_violation = false]",
                                    "items": [
                                        ("AiModerationService","Database","Tạo AiModerationReport (status=RESOLVED)", "sync"),
                                    ]
                                },
                            ]
                        },
                        ("AiModerationService",              "Database",                         "COMMIT", "sync"),
                        ("ModerationResultProcessorCommand", "moderation.result.v1",             "Commit offset", "sync"),
                    ]
                },
            ]
        },
    ],
    "note": "DB transaction đảm bảo tính nguyên tử giữa ẩn nội dung và tạo moderation report",
}

SD03A = {
    "participants": ["Frontend", "Laravel API", "MinIO S3"],
    "items": [
        ("Frontend",   "Laravel API","POST /videos/upload-sessions (file_name, file_size, mime_type)", "sync"),
        ("Laravel API","Laravel API","Tạo VideoUploadSession (PENDING)", "self"),
        ("Laravel API","MinIO S3",   "initiateMultipartUpload(key, mimeType)", "sync"),
        ("MinIO S3",   "Laravel API","upload_id", "return"),
        ("Laravel API","Frontend",   "session_uuid, upload_id", "return"),
        {
            "type": "loop", "label": "loop [Mỗi chunk]",
            "items": [
                ("Frontend",   "Laravel API","GET /upload-sessions/:uuid/parts/:n", "sync"),
                ("Laravel API","MinIO S3",   "presignedPartUrl(key, upload_id, n)", "sync"),
                ("MinIO S3",   "Laravel API","presigned_url", "return"),
                ("Laravel API","Frontend",   "presigned_url", "return"),
                ("Frontend",   "MinIO S3",   "PUT chunk trực tiếp (HTTP)", "sync"),
                ("MinIO S3",   "Frontend",   "ETag", "return"),
            ]
        },
        ("Frontend",   "Laravel API","PUT /upload-sessions/:uuid/complete (parts list)", "sync"),
        ("Laravel API","Laravel API","lockForUpdate() session", "self"),
        ("Laravel API","MinIO S3",   "completeMultipartUpload(key, upload_id, parts)", "sync"),
        ("Laravel API","MinIO S3",   "objectExists(key) — xác minh", "sync"),
        ("MinIO S3",   "Laravel API","200 OK", "return"),
        ("Laravel API","Laravel API","Tạo UploadFile record", "self"),
        ("Laravel API","Laravel API","Dispatch ProcessVideoToHlsJob (queue: video-processing)", "self"),
        ("Laravel API","Laravel API","Cập nhật session → UPLOADED", "self"),
        ("Laravel API","Frontend",   "status: UPLOADED, encoding_status: PENDING", "return"),
    ],
    "note": "Chunk upload đi trực tiếp Frontend → MinIO\nLaravel chỉ cấp presigned URL và quản lý metadata",
}

SD03B = {
    "participants": [
        "Queue Worker",
        "ProcessVideoToHlsJob",
        "VideoProcessingService",
        "FFmpegService",
        "MinIO S3",
        "Event Dispatcher",
    ],
    "items": [
        ("Queue Worker",          "ProcessVideoToHlsJob",   "Nhận job (tries=3, timeout=7200s, backoff=[60,300,900]s)", "sync"),
        ("ProcessVideoToHlsJob",  "VideoProcessingService", "process(videoEncoding, sessionId)", "sync"),
        ("VideoProcessingService","VideoProcessingService",  "Cập nhật VideoEncoding → PROCESSING, progress=0%", "self"),
        ("VideoProcessingService","Event Dispatcher",        "Dispatch VideoEncodingStatusUpdatedEvent", "sync"),
        ("VideoProcessingService","MinIO S3",                "Download raw video → /tmp/uuid/input.mp4", "sync"),
        ("VideoProcessingService","FFmpegService",           "getVideoInfo(inputPath)", "sync"),
        ("FFmpegService",          "VideoProcessingService", "width, height, duration, bitrate", "return"),
        ("VideoProcessingService","VideoProcessingService",  "Chọn variants phù hợp (size <= shorter_side nguồn)", "self"),
        {
            "type": "loop", "label": "loop [Mỗi variant: 360p, 480p, 720p, 1080p...]",
            "items": [
                ("VideoProcessingService","FFmpegService",           "encodeVariant(input, outputDir, label, variant)", "sync"),
                ("FFmpegService",          "FFmpegService",           "Tạo .ts segments + index.m3u8", "self"),
                ("FFmpegService",          "VideoProcessingService",  "Done", "return"),
                ("VideoProcessingService","VideoProcessingService",   "Cập nhật progress", "self"),
                ("VideoProcessingService","Event Dispatcher",         "Dispatch VideoEncodingStatusUpdatedEvent", "sync"),
            ]
        },
        ("VideoProcessingService","VideoProcessingService","Build master.m3u8", "self"),
        ("VideoProcessingService","MinIO S3",              "Upload HLS files → hls/uuid/", "sync"),
        ("VideoProcessingService","VideoProcessingService","Cập nhật VideoEncoding → READY, progress=100%", "self"),
        ("VideoProcessingService","VideoProcessingService","Cập nhật VideoUploadSession → READY", "self"),
        ("VideoProcessingService","Event Dispatcher",      "Dispatch VideoEncodingStatusUpdatedEvent", "sync"),
        ("VideoProcessingService","VideoProcessingService","Cleanup /tmp/uuid/", "self"),
        {
            "type": "alt", "label": "alt [Lỗi xảy ra]",
            "branches": [
                {
                    "label": None,
                    "items": [
                        ("VideoProcessingService","VideoProcessingService","Cập nhật VideoEncoding → FAILED", "self"),
                        ("VideoProcessingService","Event Dispatcher",      "Dispatch VideoEncodingStatusUpdatedEvent (FAILED)", "sync"),
                        ("Queue Worker",           "Queue Worker",          "Retry theo backoff schedule", "self"),
                    ]
                }
            ]
        },
    ],
    "note": "Chỉ encode variant có size <= nguồn — tránh upscaling\nWebSocket/SSE cập nhật tiến trình encoding cho Frontend",
}

SD04 = {
    "participants": ["User", "Frontend", "Laravel API", "Redis", "Laravel Scheduler", "PostgreSQL"],
    "items": [
        ("User",       "Frontend",   "Xem video", "sync"),
        ("Frontend",   "Laravel API","POST /posts/:uuid/view", "sync"),
        ("Laravel API","Laravel API","Tính viewerKey (user:id hoặc guest:sha1(ip|ua))", "self"),
        ("Laravel API","Redis",      "SETNX post:view:lock:postId:viewerKey 1", "sync"),
        {
            "type": "alt", "label": "alt [Lock tồn tại — chống spam 60s]",
            "branches": [
                {
                    "label": None,
                    "items": [
                        ("Laravel API","Frontend","200 OK (bỏ qua)", "return"),
                    ]
                },
                {
                    "label": "else [View hợp lệ]",
                    "items": [
                        ("Laravel API","Redis",  "EXPIRE lock_key 60s", "sync"),
                        ("Laravel API","Redis",  "INCR post:view:user:postId", "sync"),
                        ("Laravel API","Redis",  "SADD post:view:posts postId", "sync"),
                        ("Laravel API","Frontend","200 OK", "return"),
                    ]
                },
            ]
        },
        ("Laravel Scheduler","Laravel Scheduler","Chạy posts:sync-views mỗi 1 phút (withoutOverlapping)", "self"),
        ("Laravel Scheduler","Redis",             "SMEMBERS post:view:posts", "sync"),
        ("Redis",            "Laravel Scheduler", "[postId1, postId2, ...]", "return"),
        {
            "type": "loop", "label": "loop [Mỗi postId]",
            "items": [
                ("Laravel Scheduler","Redis",      "GET post:view:user:postId", "sync"),
                ("Redis",            "Laravel Scheduler","view_count", "return"),
                ("Laravel Scheduler","PostgreSQL", "BEGIN TRANSACTION", "sync"),
                ("Laravel Scheduler","PostgreSQL", "PostRepository.incrementViews(postId, views)", "sync"),
                ("Laravel Scheduler","Redis",      "DEL post:view:user:postId", "sync"),
                ("Laravel Scheduler","Redis",      "SREM post:view:posts postId", "sync"),
                ("Laravel Scheduler","PostgreSQL", "COMMIT", "sync"),
            ]
        },
    ],
    "note": "Redis là fast path — API không block bởi database\nPostgreSQL cập nhật theo lô định kỳ, giảm tải ghi trực tiếp",
}


# ======================================================================
# Main
# ======================================================================

DIAGRAMS = [
    ("SD-01_AI_Copilot_SSE.drawio",       SD01),
    ("SD-02a_Moderation_Overview.drawio", SD02A),
    ("SD-02b_PhoBERT_Inference.drawio",   SD02B),
    ("SD-02c_Apply_Verdict.drawio",        SD02C),
    ("SD-03a_Upload_Multipart.drawio",    SD03A),
    ("SD-03b_HLS_Encoding.drawio",        SD03B),
    ("SD-04_Redis_View_Sync.drawio",      SD04),
]


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for filename, spec in DIAGRAMS:
        gen = Generator(spec)
        xml = gen.generate()
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(xml)
        print(f"  OK  {path}")
    print(f"\nDone — {len(DIAGRAMS)} files created in '{OUTPUT_DIR}/'")


if __name__ == "__main__":
    main()
