from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "public/assets/posters/era"
POSTERS = [
    ("poster_01_restraint_sop", "保護性約束作業指引", "安全評估・持續觀察・解除優先", "精神科急性病房｜1997 修訂"),
    ("poster_02_auditory_hallucination_knocking", "聽見不存在的聲音？", "談複雜幻聽與反覆敲牆", "四下・停頓・九下｜請完整記錄"),
    ("poster_03_doppelganger_delusion", "身邊的人被換包了？", "替身妄想症衛教", "熟悉面孔不等於熟悉身分"),
    ("poster_04_hospital_history_1998", "半世紀精神醫療沿革", "青嶺醫療中心院史大事紀", "1998｜夜間系統重整"),
    ("poster_05_derealization_dissociation", "熟悉的空間突然變形？", "現實感喪失與解離須知", "停下・辨識時間・確認所在樓層"),
    ("poster_06_night_shift_attendance", "夜間值班與差勤登錄", "當班人員應親自完成交班", "21:17 後補登須附查哨紀錄"),
    ("poster_07_ect_identity_memory", "ECT 安全須知", "治療後記憶與身分監測", "姓名・日期・照護者需反覆確認"),
    ("poster_08_er_jane_doe_triage", "急診無身分者高危通報", "先救治，再核對身分資料", "人存在但身分不明｜不可重複建檔"),
]


def font(size, bold=False):
    names = [
        Path("C:/Windows/Fonts/msjhbd.ttc" if bold else "C:/Windows/Fonts/msjh.ttc"),
        Path("C:/Windows/Fonts/mingliu.ttc"),
    ]
    for name in names:
        if name.exists():
            return ImageFont.truetype(str(name), size)
    return ImageFont.load_default()


def make_poster(index, title, subtitle, footer):
    image = Image.new("RGB", (1200, 1700), "#ded8c6")
    draw = ImageDraw.Draw(image)
    draw.rectangle((42, 42, 1158, 1658), outline="#26483e", width=18)
    draw.rectangle((70, 70, 1130, 280), fill="#31594d")
    draw.text((105, 110), "青嶺醫療中心", font=font(62, True), fill="#f1eee2")
    draw.text((1080, 118), f"{index:02}", font=font(54, True), fill="#d5b16b", anchor="ra")
    draw.multiline_text((600, 410), title, font=font(84, True), fill="#202823", anchor="ma", align="center", spacing=18)
    draw.line((145, 585, 1055, 585), fill="#9a4738", width=10)
    draw.multiline_text((600, 705), subtitle, font=font(48), fill="#33463f", anchor="ma", align="center", spacing=16)
    for y, text in [(930, "觀察事實｜記錄時間｜確認身分"), (1055, "禁止代簽｜禁止補造｜異常立即通報")]:
        draw.rounded_rectangle((140, y - 48, 1060, y + 56), radius=18, outline="#6a756d", width=5)
        draw.text((600, y), text, font=font(38, True), fill="#39463f", anchor="mm")
    draw.rectangle((70, 1370, 1130, 1630), fill="#c8c0a9")
    draw.multiline_text((600, 1470), footer, font=font(42, True), fill="#7b322b", anchor="mm", align="center", spacing=14)
    draw.text((600, 1585), "院內文件・請勿攜出", font=font(30), fill="#4d554e", anchor="mm")
    return image


for folder in ("raw", "display", "inspect"):
    (ROOT / folder).mkdir(parents=True, exist_ok=True)

for index, (name, title, subtitle, footer) in enumerate(POSTERS, 1):
    source = make_poster(index, title, subtitle, footer)
    source.save(ROOT / "raw" / f"{name}.png", optimize=True)
    display = source.copy(); display.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    display.save(ROOT / "display" / f"{name}.webp", "WEBP", quality=84, method=6)
    inspect = source.copy(); inspect.thumbnail((1440, 2048), Image.Resampling.LANCZOS)
    inspect.save(ROOT / "inspect" / f"{name}.webp", "WEBP", quality=92, method=6)

print(f"Generated {len(POSTERS)} era poster sets in {ROOT}")
