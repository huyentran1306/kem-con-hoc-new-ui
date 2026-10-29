import re

with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Kiểm tra xem đã import KhuonMoi chưa
if 'from "./ui/KhuonMoi"' not in text and "from './ui/KhuonMoi'" not in text:
    # Thêm import ở đầu file
    import_stmt = "import { TopBarT3, TopBarT4, Progress4, HoldBtn, BtnKm, CardKm } from './ui/KhuonMoi'\n"
    text = import_stmt + text
    print('Added import KhuonMoi')

# Tìm hàm Home
home_start = text.find('export function Home() {')
home_end = text.find('export function SnapHomework() {')

if home_start != -1 and home_end != -1:
    new_home = '''export function Home() {
  const { S, patch, stats, go, openSheet, toast, soundOn, toggleSound, tracker } = useContext(AppCtx)
  const wide = useWide()
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const theme = S.theme || 'bear'
  const StudyTrackerSlot = getSlot(theme, 'StudyTracker')
  const StartActionSlot = getSlot(theme, 'StartAction')
  const CheckWorkEntrySlot = getSlot(theme, 'CheckWorkEntry')
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const parentLower = S.parent.toLowerCase()

  const dayCodeMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const todayCode = dayCodeMap[now.getDay()]
  const shortDate = `${todayCode} ${now.getDate()}/${now.getMonth() + 1} · Lớp ${child.grade}`

  const hero = (
    <div className="home-hero-km" style={{ marginBottom: 12 }}>
      <TopBarT3
        dateText={shortDate}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onOpenCalm={() => openSheet('calm')}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8, padding: '0 4px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--c-sub, #6E5D4E)' }}>{greet}, {parentLower}!</p>
          <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            Tối nay {child.name} học gì?
          </h2>
        </div>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <BuddyGreeter size={60} />
          <button
            type="button"
            onClick={() => openSheet('stickerBook')}
            className="sticker-badge-mascot"
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: 'var(--c-accent, #F6A623)',
              color: 'var(--c-on-accent, #fff)',
              fontSize: 11,
              fontWeight: 900,
              padding: '2px 6px',
              borderRadius: 999,
              border: '2px solid var(--c-surface, #fff)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
            title="Mở sổ dán sticker"
          >
            <span>⭐</span>
            <span>{stats.stickers || 0}</span>
          </button>
        </div>
      </div>

      {S.children.length > 1 && (
        <div className="seg-km" style={{ marginTop: 10, width: '100%', height: 36 }}>
          {S.children.map((c) => {
            const active = c.id === S.activeId
            return (
              <button
                key={c.id}
                type="button"
                className={`seg-km-item ${active ? 'active' : ''}`}
                style={{ height: 32 }}
                onClick={() => {
                  patch({ activeId: c.id })
                  toast(`Đổi sang ${/^bé\s/i.test(c.name) ? c.name : "bé " + c.name} ${c.emoji}`)
                }}
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  const blocks = []
  const add = (key, side, node) => { if (node) blocks.push({ key, side, node }) }

  add('season', false, <SeasonHomeLayer />)

  // 1. Nút chính Bắt đầu bài tối nay (Lớn 56px) + Gõ đề, Đọc đề (Phụ 44px)
  add(
    'start',
    false,
    StartActionSlot ? (
      <div>
        <StartActionSlot
          onStart={(mode) => {
            if (mode === 'photo' || mode === 'snap') {
              go('snap')
            } else if (mode === 'type') {
              openSheet('typeProblem')
            } else if (mode === 'voice') {
              openSheet('typeProblem', { mode: 'voice', autoMic: true })
            } else {
              go('snap')
            }
          }}
        />
      </div>
    ) : null
  )

  // Làm tiếp bài hôm qua
  add(
    'resume',
    false,
    S.pendingProblemResume && (
      <div
        className="card-km card-km-action"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <b style={{ color: 'var(--c-text)', fontSize: 14.5, display: 'block' }}>📖 Làm tiếp bài hôm qua</b>
          <span style={{ color: 'var(--c-sub, #6E5D4E)', fontSize: 12.5 }}>
            Đang ở bậc {(S.pendingProblemResume.step || 0) + 1} · {S.pendingProblemResume.problem?.dang_bai || S.pendingProblemResume.problem?.type || 'Bài tập'}
          </span>
        </div>
        <button
          className="btn-km btn-km-s btn-km-primary"
          style={{ minHeight: 34, padding: '0 12px' }}
          onClick={() => {
            patch({
              problem: S.pendingProblemResume.problem,
              flow: {
                ...S.flow,
                step: S.pendingProblemResume.step || 0,
                unlocked: S.pendingProblemResume.unlocked || false,
                stuck: 0,
              },
              pendingProblemResume: null,
            })
            go('scaffold')
          }}
        >
          Làm tiếp
        </button>
      </div>
    )
  )

  // Cô nhắc
  add(
    'teacher',
    true,
    <>
      <TeacherReminderBanner child={child} S={S} patch={patch} go={go} openSheet={openSheet} toast={toast} />
      <FamilyAnnouncements childId={child?.id} toast={toast} />
      <TeacherAssignmentBanner child={child} S={S} patch={patch} go={go} />
    </>
  )

  // Thẻ Chấm vở con đã làm (Thẻ hành động T2)
  add(
    'check',
    false,
    CheckWorkEntrySlot && (
      <div>
        <CheckWorkEntrySlot childName={child.name} onStart={() => go('check')} />
      </div>
    )
  )

  // Thẻ "Tối nay" gộp ca trực và 7 dấu chân/ngày thẳng hàng, hiển thị 1 con số duy nhất 3/7 tối
  add(
    'tracker',
    true,
    StudyTrackerSlot && (
      <div>
        <StudyTrackerSlot tracker={tracker} onOpenReport={() => go('report')} />
      </div>
    )
  )

  // Ôn đồ chơi & Hẹn giờ
  add(
    'extras',
    false,
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <button
        type="button"
        className="card-km"
        style={{ margin: 0, padding: '12px', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
        onClick={() => go('toy')}
      >
        <span style={{ fontSize: 20, display: 'block', marginBottom: 2 }} aria-hidden="true">🧸</span>
        <b style={{ fontSize: 13.5, display: 'block', color: 'var(--c-text)' }}>Chụp đồ chơi</b>
        <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>Ôn vui 10 phút</span>
      </button>

      <button
        type="button"
        className="card-km"
        style={{ margin: 0, padding: '12px', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
        onClick={() => openSheet('timer')}
      >
        <span style={{ fontSize: 20, display: 'block', marginBottom: 2 }} aria-hidden="true">⏱</span>
        <b style={{ fontSize: 13.5, display: 'block', color: 'var(--c-text)' }}>Hẹn giờ học</b>
        <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>15 phút vừa đủ</span>
      </button>
    </div>
  )

  // Gợi ý cho mẹ
  add(
    'tip',
    false,
    <div className="card-km card-km-note" style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)', letterSpacing: '.04em', marginBottom: 2 }}>
        💡 GỢI Ý CHO {parentLower.toUpperCase()}
      </div>
      <span style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.4 }}>
        Hôm nay để con tự làm trước 10 phút, {parentLower} chỉ vào khi con gọi. Ít nói hơn, con nhớ lâu hơn.
      </span>
    </div>
  )

  const renderBlocks = (list) => list.map((b) => <Fragment key={b.key}>{b.node}</Fragment>)

  return (
    <div className="home-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {hero}
      {wide ? (
        <div className="pg-cols">
          <div className="pg-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderBlocks(blocks.filter((b) => !b.side))}
          </div>
          <div className="pg-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderBlocks(blocks.filter((b) => b.side))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {renderBlocks(blocks)}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   3. CHỤP BÀI TẬP
   ============================================================ */'''

    text = text[:home_start] + new_home + '\n' + text[home_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated HomeScreen in screens.jsx')
else:
    print('Failed to find HomeScreen start or end')
