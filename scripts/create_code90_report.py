from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "output" / "pdf" / "CODE90_프로그래밍기능사_웹학습도구_포트폴리오.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FONT_DIR = Path(r"C:\Windows\Fonts")
pdfmetrics.registerFont(TTFont("Malgun", str(FONT_DIR / "malgun.ttf")))
pdfmetrics.registerFont(TTFont("MalgunBold", str(FONT_DIR / "malgunbd.ttf")))

PAGE_W, PAGE_H = A4
FOREST = colors.HexColor("#0D5F42")
FOREST_DEEP = colors.HexColor("#073D2C")
LIME = colors.HexColor("#D8F15D")
MINT = colors.HexColor("#BFE8D0")
PAPER = colors.HexColor("#F4F1E9")
PANEL = colors.HexColor("#FFFDF8")
INK = colors.HexColor("#19221D")
MUTED = colors.HexColor("#68736D")
LINE = colors.HexColor("#D8D5CC")
AMBER = colors.HexColor("#F2B84B")
RED = colors.HexColor("#C54A3A")


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="KBody",
        fontName="Malgun",
        fontSize=9.4,
        leading=15,
        textColor=INK,
        spaceAfter=7,
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="KSmall",
        parent=styles["KBody"],
        fontSize=7.8,
        leading=12,
        textColor=MUTED,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="KEyebrow",
        parent=styles["KSmall"],
        fontName="MalgunBold",
        fontSize=7.2,
        leading=10,
        textColor=FOREST,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="KTitle",
        parent=styles["KBody"],
        fontName="MalgunBold",
        fontSize=23,
        leading=31,
        textColor=INK,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="KH1",
        parent=styles["KBody"],
        fontName="MalgunBold",
        fontSize=17,
        leading=23,
        textColor=INK,
        spaceBefore=4,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="KH2",
        parent=styles["KBody"],
        fontName="MalgunBold",
        fontSize=11.5,
        leading=17,
        textColor=FOREST_DEEP,
        spaceBefore=8,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="KMetric",
        parent=styles["KBody"],
        fontName="MalgunBold",
        fontSize=19,
        leading=23,
        alignment=TA_CENTER,
        textColor=FOREST_DEEP,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="KMetricLabel",
        parent=styles["KSmall"],
        alignment=TA_CENTER,
        textColor=FOREST,
    )
)
styles.add(
    ParagraphStyle(
        name="KCode",
        fontName="Courier",
        fontSize=7.4,
        leading=11,
        textColor=colors.HexColor("#D9F7E8"),
        backColor=FOREST_DEEP,
        borderPadding=10,
        leftIndent=4,
        rightIndent=4,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="KCoverTitle",
        fontName="MalgunBold",
        fontSize=27,
        leading=37,
        textColor=colors.white,
        spaceAfter=13,
        wordWrap="CJK",
    )
)
styles.add(
    ParagraphStyle(
        name="KCoverSub",
        fontName="Malgun",
        fontSize=10,
        leading=17,
        textColor=colors.HexColor("#D9F7E8"),
        wordWrap="CJK",
    )
)


def page_decor(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFont("Malgun", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - 18 * mm, 10 * mm, f"{doc.page} / 4")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, PAGE_W - 18 * mm, 14 * mm)
    canvas.restoreState()


doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=22 * mm,
    bottomMargin=19 * mm,
    title="CODE:90 프로그래밍기능사 웹 학습도구 포트폴리오",
    author="송지율",
    subject="프로그래밍기능사 작업형 대비 웹 학습도구 구현 및 검증",
)


def P(text, style="KBody"):
    return Paragraph(text, styles[style])


def metric(value, label):
    return P(f'<font name="MalgunBold" size="19">{value}</font><br/><font size="8">{label}</font>', "KMetricLabel")


def card_table(rows, widths=None, background=PANEL):
    table = Table(rows, colWidths=widths, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


story = []

# Page 1 — cover
cover = Table(
    [
        [
            P("CODE:90", "KEyebrow"),
            P("2026 · WEB LEARNING TOOL", "KSmall"),
        ],
        [
            P("프로그래밍기능사 작업형 대비<br/>50문제 웹 학습도구", "KCoverTitle"),
            "",
        ],
        [
            P(
                "SQL·Python·Java·Linux 학습 내용을 90분 모의시험과 문제별 즉시 채점으로 연결하고, 자동 저장·영역별 분석·약점보정·결과 출력을 구현한 설치 없는 웹 프로젝트",
                "KCoverSub",
            ),
            "",
        ],
    ],
    colWidths=[125 * mm, 45 * mm],
    rowHeights=[18 * mm, 45 * mm, 33 * mm],
)
cover.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), FOREST_DEEP),
            ("SPAN", (0, 1), (1, 1)),
            ("SPAN", (0, 2), (1, 2)),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ]
    )
)
story += [cover, Spacer(1, 8 * mm)]

metric_cells = [metric("50", "자체 구성 문제"), metric("90분", "모의시험 시간"), metric("4", "학습 영역"), metric("4/4", "자동 테스트 통과")]
metric_row = [metric_cells]
metrics = card_table(metric_row, widths=[42.5 * mm] * 4, background=PANEL)
story += [metrics, Spacer(1, 8 * mm)]

story += [P("학습 흐름", "KH2")]
flow = card_table(
    [[P("답안 입력", "KMetricLabel"), P("자동 저장", "KMetricLabel"), P("채점·분석", "KMetricLabel"), P("약점보정", "KMetricLabel"), P("결과 출력", "KMetricLabel")]],
    widths=[34 * mm] * 5,
    background=MINT,
)
story += [flow, Spacer(1, 7 * mm)]
story += [
    P(
        "공식 기출문제를 복제하지 않은 학습용 자체 구성 문제입니다. Q-Net 종목 정보에서 실기 검정방법이 작업형 1시간 30분임을 확인했으며, 합격·성적 향상·실제 시험 난도 일치를 주장하지 않습니다.",
        "KSmall",
    ),
    PageBreak(),
]

# Page 2 — problem and process
story += [P("01 · 문제 정의와 개선 과정", "KEyebrow"), P("마지막에 한 번 채점하는 문제집을, 반복 학습 도구로 바꾸다", "KH1")]
story += [
    P(
        "프로그래밍기능사 실기를 준비하면서 SQL·Python·Java·Linux 내용을 여러 문서에서 다시 찾는 과정이 번거로웠다. 전체 문제를 다 푼 뒤 마지막에만 채점하면 틀린 이유를 즉시 확인하기 어렵고, 페이지를 닫았을 때 학습 위치가 사라지는 문제도 있었다.",
        "KBody",
    )
]

before_after = card_table(
    [
        [P("초기 문제", "KEyebrow"), P("v1.0 해결", "KEyebrow")],
        [P("자료가 SQL 문서 중심으로 분산", "KBody"), P("SQL 20·Python 10·Java 10·Linux 10문제로 통합", "KBody")],
        [P("40문제·전체 채점 중심의 옛 기획", "KBody"), P("최종 공유안에 맞춰 50문제·90분·즉시 채점으로 확장", "KBody")],
        [P("새로고침하면 답안과 위치 손실", "KBody"), P("답안·현재 번호·남은 시간·채점 상태를 localStorage에 저장", "KBody")],
        [P("점수만 보여 주어 재학습 연결이 약함", "KBody"), P("영역별 분석 후 오답 ID만 모아 약점보정 세트 생성", "KBody")],
    ],
    widths=[85 * mm, 85 * mm],
)
story += [before_after, Spacer(1, 7 * mm)]

story += [P("모드 분리", "KH2")]
mode_table = card_table(
    [
        [P("90분 모의", "KEyebrow"), P("즉시 채점", "KEyebrow")],
        [P("해설 노출을 막고 최종 제출에서 전체 채점한다. 남은 시간이 0이 되면 자동 제출한다.", "KBody"), P("현재 문제 아래에서 정답 여부와 해설을 바로 확인해 개념을 교정한다.", "KBody")],
    ],
    widths=[85 * mm, 85 * mm],
    background=colors.HexColor("#EAF5EE"),
)
story += [mode_table, Spacer(1, 5 * mm)]
story += [
    P("Q-Net 확인값", "KH2"),
    P("검정방법: 실기 작업형 · 시험시간: 1시간 30분 · 합격기준: 100점 만점 60점 이상", "KBody"),
    P("출처: q-net.or.kr · 프로그래밍기능사 종목 정보(jmCd=6921) · 확인일 2026-09-02", "KSmall"),
    PageBreak(),
]

# Page 3 — architecture
story += [P("02 · 구현 구조", "KEyebrow"), P("문제 데이터, 순수 채점 함수, 화면 상태를 분리하다", "KH1")]

architecture = card_table(
    [
        [P("questions.js", "KEyebrow"), P("core.mjs", "KEyebrow"), P("app.js", "KEyebrow"), P("index.html + CSS", "KEyebrow")],
        [P("50문제·정답·해설", "KSmall"), P("판정·점수·CSV·검증", "KSmall"), P("타이머·저장·이동·출력", "KSmall"), P("접근성·반응형·인쇄", "KSmall")],
    ],
    widths=[42.5 * mm] * 4,
    background=PANEL,
)
story += [architecture, Spacer(1, 7 * mm)]

story += [P("채점 흐름", "KH2")]
story += [
    P(
        "문제별 답안을 ID 기준 객체에 저장하고, 제출 시 50문제를 순회해 응답 여부와 정답 여부를 계산한다. 같은 결과 배열을 영역별 점수, 오답 목록, CSV 출력에 재사용해 화면마다 다른 계산식이 생기지 않도록 했다.",
        "KBody",
    ),
    P(
        "gradeAnswers(questions, answers)<br/>→ details: answered / correct<br/>→ categories: total / correct / percent<br/>→ overall: total / answered / correct / percent",
        "KCode",
    ),
    Spacer(1, 6 * mm),
]

story += [P("안전한 로컬 저장", "KH2")]
storage_table = card_table(
    [
        [P("저장 항목", "KEyebrow"), P("저장하지 않는 항목", "KEyebrow")],
        [P("답안·현재 문제·남은 시간·모드·채점 상태", "KBody"), P("이름·학번·계정·학교 성적·서버 로그", "KBody")],
    ],
    widths=[85 * mm, 85 * mm],
    background=colors.HexColor("#EAF5EE"),
)
story += [storage_table, Spacer(1, 6 * mm)]
story += [
    P("접근성과 반응형", "KH2"),
    P(
        "문제로 바로 이동하는 건너뛰기 링크, 키보드 포커스, radio/label 연결, aria-live 결과 안내를 적용했다. 920px 이하에서는 사이드바가 상단으로 이동하고, 620px 이하에서는 문제 카드와 버튼을 한 열 중심으로 재배치한다. 인쇄 시에는 문제 입력 UI를 숨기고 결과만 출력한다.",
        "KBody",
    ),
    PageBreak(),
]

# Page 4 — validation and honesty
story += [P("03 · 검증, 한계, AI 활용", "KEyebrow"), P("측정한 것과 아직 확인하지 않은 것을 구분하다", "KH1")]

validation = card_table(
    [
        [P("검사", "KEyebrow"), P("기대", "KEyebrow"), P("결과", "KEyebrow")],
        [P("전체·영역별 문제 수", "KSmall"), P("50 / 20·10·10·10", "KSmall"), P("통과", "KSmall")],
        [P("중복 ID·정답 인덱스", "KSmall"), P("오류 0", "KSmall"), P("통과", "KSmall")],
        [P("전체 정답·미응답", "KSmall"), P("100점 / 0점", "KSmall"), P("통과", "KSmall")],
        [P("단답형 정규화", "KSmall"), P("공백·대소문자 처리", "KSmall"), P("통과", "KSmall")],
        [P("타이머 경계", "KSmall"), P("90:00 / 00:00", "KSmall"), P("통과", "KSmall")],
        [P("CSV 특수문자", "KSmall"), P("쉼표·따옴표 이스케이프", "KSmall"), P("통과", "KSmall")],
    ],
    widths=[72 * mm, 60 * mm, 38 * mm],
)
validation.setStyle(TableStyle([("TEXTCOLOR", (2, 1), (2, -1), FOREST), ("FONTNAME", (2, 1), (2, -1), "MalgunBold")]))
story += [validation, Spacer(1, 7 * mm)]

story += [P("AI 활용 공개", "KH2")]
story += [
    P(
        "기존 학습자료와 최종 요구사항을 정리하고 HTML/CSS/JavaScript 코드 및 자동 테스트 초안을 만드는 데 Codex를 활용했다. 공식 시험 시간은 Q-Net으로 재확인했고, 공식 기출문제 복제가 아닌 자체 구성 문제임을 명시했다. 사용자는 공개 전 문제 내용과 실제 실행 화면을 직접 검토해야 한다.",
        "KBody",
    )
]

limits = card_table(
    [
        [P("확인된 결과", "KEyebrow"), P("아직 주장하지 않는 결과", "KEyebrow")],
        [P("기능 구현·자동 테스트·문제 구성·공식 시간", "KBody"), P("합격·성적 향상·장기간 사용 효과·실제 시험 난도 일치", "KBody")],
    ],
    widths=[85 * mm, 85 * mm],
    background=colors.HexColor("#F8EDE8"),
)
story += [limits, Spacer(1, 7 * mm)]

story += [P("증빙과 다음 단계", "KH2")]
story += [
    P("GitHub: github.com/DK8832/programming-cert-practical-study-tool", "KBody"),
    P("첨부: 저장소 ZIP · 이 검증 보고서 · 자동 테스트 소스", "KBody"),
    P(
        "다음에는 사용자가 직접 반복 사용하며 자주 틀리는 문제 표현을 교정하고, 실제 터미널·코드 실행 결과를 입력하는 실습형 세트를 별도로 확장한다. 확인되지 않은 학습 효과 수치는 추가하지 않는다.",
        "KBody",
    ),
]

doc.build(story, onFirstPage=page_decor, onLaterPages=page_decor)
print(OUTPUT)

