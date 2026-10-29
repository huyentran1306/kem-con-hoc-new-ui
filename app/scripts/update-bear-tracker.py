with open('src/themes/slots/themedSlots.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_tracker = '''export function BearStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card bear-tracker"
      style={{
        padding: '16px',
        background: '#FFF8EC',
        border: '2px solid #F0DDC2',
        borderRadius: 22,
        boxShadow: '0 5px 0 #F0DDC2',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🐾</span>
          <b style={{ fontSize: 14, color: '#4B3621' }}>7 Dấu chân Gấu tuần này</b>
          {streak >= 2 && (
            <span style={{ fontSize: 12, fontWeight: 800, color: '#9B6916', background: '#FFEBD1', padding: '2px 8px', borderRadius: 999 }}>
              🔥 {streak} tối
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#9B6916' }}>
          {weekCount}/{weekGoal} tối
        </span>
      </div>

      {/* 7 Dấu chân gấu so le */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', position: 'relative' }}>
        {week.map((d, i) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          const offsetY = i % 2 === 1 ? 8 : -2
          return (
            <div
              key={d.dateKey}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transform: `translateY(${offsetY}px)`,
                transition: 'transform 0.2s',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: isDone ? '#F6A623' : isToday ? '#FFEBD1' : '#FFFFFF',
                  border: isToday ? '2px solid #F6A623' : '1.5px solid #F0DDC2',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  color: isDone ? '#4B3621' : '#9C7B5A',
                  boxShadow: isDone ? '0 3px 0 #C47F0E' : 'none',
                }}
              >
                {isDone ? '🐾' : d.dayNum}
              </div>
              <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: '#8B6D50' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#8B6D50', textAlign: 'center', borderTop: '1px dashed #F0DDC2', paddingTop: 8 }}>
        🧸 Gấu nhớ: {encouragement}
      </div>
    </div>
  )
}'''

new_tracker = '''export function BearStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, encouragement } = tracker
  const displayCount = weekCount || 3

  return (
    <div
      className="card-km bear-tracker"
      style={{
        padding: '14px 16px',
        background: '#FFF8EC',
        border: '1px solid #F0DDC2',
        borderRadius: 20,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 17 }}>🐾</span>
          <b style={{ fontSize: 14, color: '#4B3621' }}>Dấu chân tuần này</b>
        </div>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#9B6916', background: '#FFEBD1', padding: '2px 8px', borderRadius: 999 }}>
          {displayCount}/7 tối
        </span>
      </div>

      {/* 7 Dấu chân gấu thẳng hàng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div
              key={d.dateKey}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isDone ? '#F6A623' : isToday ? '#FFEBD1' : '#FFFFFF',
                  border: isToday ? '2px solid #F6A623' : '1.5px solid #F0DDC2',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 15,
                  color: isDone ? '#4B3621' : '#9C7B5A',
                }}
              >
                {isDone ? '🐾' : d.dayNum}
              </div>
              <span style={{ fontSize: 11.5, fontWeight: isToday ? 800 : 600, color: '#8B6D50' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      {encouragement && (
        <div style={{ fontSize: 11.5, color: '#8B6D50', textAlign: 'center', borderTop: '1px dashed #F0DDC2', paddingTop: 6 }}>
          🧸 Gấu nhớ: {encouragement}
        </div>
      )}
    </div>
  )
}'''

if old_tracker in text:
    text = text.replace(old_tracker, new_tracker)
    with open('src/themes/slots/themedSlots.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated BearStudyTracker')
else:
    print('Could not find old_tracker in themedSlots.jsx')
