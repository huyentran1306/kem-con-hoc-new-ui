import { syncPublicConfig } from './api';
/**
 * CỔNG GIÁO VIÊN BẢN GẤU (PROMPT 11 - PHẦN A, B, C)
 * 29/10/2026: giao diện kính mờ như admin (ảnh nền, thẻ kính, xanh ngọc, Be Vietnam Pro),
 * xem src/teacher/teacher-glass.css và src/teacher/chrome.jsx. Logic và API không đổi.
 */

import { appConfirm, appPrompt } from './dialog'
import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Bell, Settings, Plus, X,
  Share2, Copy, Sparkles, ChevronRight, LogOut, ArrowLeft, ArrowRight,
  AlertCircle, Lock, Calendar, CalendarDays, RefreshCw, Send, QrCode,
  BarChart3, FileText, School, Megaphone, AlarmClock, Pencil, Pin, PinOff, Eye, EyeOff, Trash2,
  MoreHorizontal, Lightbulb, Info, ClipboardList, Shirt, Backpack, PencilLine, TreePalm, Image as ImageIcon
} from 'lucide-react';
import { toast } from './utils';
import { REMINDER_TEMPLATES, MAX_REMINDERS_PER_DAY, getQuickReminderDates } from './teacherReminderData.js';
import { EXPIRY_PRESETS, DEFAULT_EXPIRY_PRESET, expiryFromPreset, presetFromExpiry, hasDateWords, announcementStatus, STATUS_LABEL, expiryLabel } from './teacher/announcementStatus.js';
import {
  BearMascot, Card, Button, StatusPill, EmptyState,
  StaffShell, Select, KpiCard
} from './ui/staff';
import './ui/staff/tokens.css';
import './teacher/teacher.css';
import './teacher/teacher-glass.css';
import { useTeacherWallpaper } from './teacher/teacherWallpaper.js';
import { TeacherHero, WallpaperPicker, TToggle, TSegmented, TLoading, SectionTitle, TeacherQrModal } from './teacher/chrome.jsx';
import { formatClassName, formatTeacherName, rosterNameOf } from './teacher/format.js';
import { ClassTabs, StepChart, BearAssistant, TPill, buildAssistantTips, useStepStats, stepRowsFrom } from './teacher/parts.jsx';

const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev';
const TEACHER_TOKEN_KEY = 'kem-con-hoc:teacher:token';

function TeacherCardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }} data-testid="teacher-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="tp-asg-card"
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 64, height: 20, borderRadius: 999, background: "rgba(20, 45, 50, 0.1)", animation: "pulse 1.5s infinite ease-in-out" }} />
            <div style={{ width: 80, height: 16, borderRadius: 4, background: "rgba(20, 45, 50, 0.07)" }} />
          </div>
          <div style={{ width: "75%", height: 18, borderRadius: 6, background: "rgba(20, 45, 50, 0.1)", animation: "pulse 1.5s infinite ease-in-out" }} />
          <div style={{ width: "45%", height: 14, borderRadius: 4, background: "rgba(20, 45, 50, 0.07)" }} />
        </div>
      ))}
    </div>
  );
}


// Giữ tên xuất cũ để chỗ khác lỡ import vẫn chạy; hàm thật nằm ở src/teacher/format.js
export { formatClassName };

export default function TeacherPortal({ onExit }) {
  // Hình nền kính mờ (ảnh vườn, sáng, be, tối): riêng từng máy
  const [wallpaper, setWallpaper] = useTeacherWallpaper();
  useEffect(() => {
    syncPublicConfig(false);
    let lastActive = Date.now();
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActive;
        if (elapsed > 10 * 60 * 1000) {
          syncPublicConfig(true);
        }
        lastActive = Date.now();
      } else {
        lastActive = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const [token, setToken] = useState(() => localStorage.getItem(TEACHER_TOKEN_KEY) || '');
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/teacher/dang-ky' || p.startsWith('/teacher/dang-ky') || h.includes('dang-ky')) {
        return 'register';
      }
    }
    return 'login';
  });
  const [currentNav, setCurrentNav] = useState('classes'); // 'classes' | 'assignments' | 'students' | 'announcements' | 'results' | 'settings'
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navNonce, setNavNonce] = useState(0);

  // Load teacher profile & classes
  useEffect(() => {
    if (!token) {
      setTeacher(null);
      setLoading(false);
      return;
    }
    fetchProfile();
    loadClasses();
  }, [token]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTeacher(data.teacher);
      } else {
        localStorage.removeItem(TEACHER_TOKEN_KEY);
        setToken('');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadClasses() {
    try {
      setLoadingClasses(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setClasses(data.classes || []);
      }
    } catch {
    } finally {
      setLoadingClasses(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TEACHER_TOKEN_KEY);
    setToken('');
    setTeacher(null);
    toast('Đã đăng xuất', 'info');
  }

  if (loading) {
    return (
      <div className="tg-wall" style={styles.loadingContainer}>
        <TLoading>Đang mở cổng giáo viên...</TLoading>
      </div>
    );
  }

  // Not logged in or pending/rejected status
  if (!token || !teacher) {
    return (
      <TeacherAuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onLoginSuccess={(tok, t) => {
          localStorage.setItem(TEACHER_TOKEN_KEY, tok);
          setToken(tok);
          setTeacher(t);
        }}
      />
    );
  }

  // Status check: pending / rejected / suspended
  if (teacher.status !== 'approved') {
    return (
      <TeacherStatusNotice
        teacher={teacher}
        token={token}
        onLogout={handleLogout}
        onRefresh={fetchProfile}
      />
    );
  }

  const totalStudents = classes.reduce((acc, c) => acc + (c.active_students_count || 0), 0);
  const totalActiveAssignments = classes.reduce((acc, c) => acc + (c.published_assignments_count || 0), 0);
  const totalPendingStudents = classes.reduce((acc, c) => acc + (c.pending_students_count || 0), 0);

  // Nhãn ngắn để không bị cắt ở thanh bên 220px và thanh tab dưới điện thoại
  const navItems = [
    { id: 'classes', label: 'Lớp của cô', shortLabel: 'Lớp', icon: <School size={20} strokeWidth={2} /> },
    { id: 'assignments', label: 'Bài tập', shortLabel: 'Bài tập', icon: <BookOpen size={20} strokeWidth={2} /> },
    { id: 'students', label: 'Học sinh', shortLabel: 'Học sinh', icon: <Users size={20} strokeWidth={2} />, badge: totalPendingStudents },
    { id: 'announcements', label: 'Thông báo', shortLabel: 'Thông báo', icon: <Megaphone size={20} strokeWidth={2} /> },
    { id: 'results', label: 'Kết quả', shortLabel: 'Kết quả', icon: <BarChart3 size={20} strokeWidth={2} /> },
    { id: 'settings', label: 'Cài đặt của cô', shortLabel: 'Cô', icon: <Settings size={20} strokeWidth={2} /> },
  ];
  // Điện thoại: 5 mục một dòng, mục cuối "Cô" là cài đặt của cô và đăng xuất
  const mobileNavItems = ['classes', 'assignments', 'students', 'announcements', 'settings']
    .map((id) => navItems.find((n) => n.id === id));

  function handleNavSelect(itemId) {
    setNavNonce((n) => n + 1);
    setCurrentNav(itemId);
    if (itemId === 'classes') {
      setSelectedClassId(null);
    } else if (itemId !== 'settings') {
      if (!selectedClassId && classes.length > 0) {
        setSelectedClassId(classes[0].id);
      }
    }
  }

  function renderContent() {
    if (currentNav === 'settings') {
      return (
        <TeacherSettingsScreen
          token={token}
          teacher={teacher}
          onUpdateSuccess={fetchProfile}
          onLogout={handleLogout}
          wallpaper={wallpaper}
          onWallpaper={setWallpaper}
        />
      );
    }

    if (!selectedClassId || currentNav === 'classes') {
      if (!selectedClassId) {
        return (
          <TeacherClassesList
            token={token}
            teacher={teacher}
            classes={classes}
            loading={loadingClasses}
            onSelectClass={(id, targetTab) => {
              setSelectedClassId(id);
              if (targetTab) setCurrentNav(targetTab);
            }}
            onRefreshClasses={loadClasses}
            onOpenCreateModal={() => setShowCreateClassModal(true)}
          />
        );
      }
    }

    const activeTab = ['assignments', 'students', 'announcements', 'results'].includes(currentNav)
      ? currentNav
      : 'assignments';

    return (
      <TeacherClassDetail
        token={token}
        classId={selectedClassId}
        initialTab={activeTab}
        navNonce={navNonce}
        summary={classes.find((c) => c.id === selectedClassId) || null}
        onTabChange={(t) => {
          if (['assignments', 'students', 'announcements', 'results'].includes(t)) setCurrentNav(t);
        }}
        onBack={() => {
          setSelectedClassId(null);
          setCurrentNav('classes');
        }}
      />
    );
  }

  return (
    <StaffShell
      className="tp-root tg-wall"
      items={navItems}
      mobileItems={mobileNavItems}
      activeItem={currentNav}
      onSelect={handleNavSelect}
      classes={classes}
      activeClassId={selectedClassId}
      onSelectClass={(id) => {
        setSelectedClassId(id);
      }}
      onAddClass={() => setShowCreateClassModal(true)}
      teacherName={teacher.display_name}
      schoolName={teacher.school_name || ''}
      onLogout={handleLogout}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      unreadCount={totalPendingStudents}
    >
      {renderContent()}

      {showCreateClassModal && (
        <CreateClassModal
          token={token}
          teacher={teacher}
          onClose={() => setShowCreateClassModal(false)}
          onCreated={() => {
            setShowCreateClassModal(false);
            loadClasses();
          }}
        />
      )}
    </StaffShell>
  );
}

const DUE_OPTIONS = [
  { value: 1, label: 'Hôm sau (1 ngày)' },
  { value: 2, label: 'Sau 2 ngày' },
  { value: 7, label: 'Cuối tuần (7 ngày)' },
];
const SHARE_ANSWER_OPTIONS = [
  { value: 1, label: 'Có, bố mẹ giữ nút để xem' },
  { value: 0, label: 'Không gửi đáp án' },
];
const SUBJECT_OPTIONS = ['Toán', 'Tiếng Việt', 'Tiếng Anh'];
const PROBLEM_TYPE_OPTIONS = [
  { value: 'word_problem_multistep', label: 'Toán lời văn' },
  { value: 'arithmetic', label: 'Phép tính, bảng nhân chia' },
  { value: 'geometry', label: 'Hình học' },
  { value: 'vietnamese', label: 'Tiếng Việt' },
];

// ---------------------------------------------------------------------------
// 1. TEACHER AUTH (LOGIN & REGISTER)
// ---------------------------------------------------------------------------
function TeacherAuthScreen({ mode, setMode, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [grades, setGrades] = useState('Khối 3');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        if (!consent) {
          setFormError('Vui lòng tích chọn đồng ý cam kết dành cho giáo viên');
          toast('Vui lòng đồng ý điều khoản dành cho giáo viên', 'warn');
          setSubmitting(false);
          return;
        }
        const res = await fetch(`${API_BASE}/api/v1/teacher/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email, password, displayName, phone, schoolName, province, grades, consent
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          toast('Đăng ký thành công! Hồ sơ đang chờ duyệt', 'success');
          onLoginSuccess(data.token, data.teacher);
        } else {
          const errMsg = data.error?.message || (res.status === 409 ? 'Email này đã được đăng ký tài khoản giáo viên' : 'Đăng ký thất bại');
          setFormError(errMsg);
          toast(errMsg, 'error');
        }
      } else {
        const res = await fetch(`${API_BASE}/api/v1/teacher/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          toast('Đăng nhập thành công', 'success');
          onLoginSuccess(data.token, data.teacher);
        } else {
          const errMsg = data.error?.message || 'Sai email hoặc mật khẩu';
          setFormError(errMsg);
          toast(errMsg, 'error');
        }
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tg-wall tg-auth" style={styles.authWrapper}>
      <TeacherHero
        className="tg-hero-center"
        eyebrow="Kèm Con Học"
        title="Cổng giáo viên"
        desc="Kèm con học theo đúng cách cô dạy ở lớp"
      />
      <div style={styles.authCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <BearMascot mood="welcome" size={52} />
          <div style={{ minWidth: 0 }}>
            <h2 style={styles.authTitle}>
              {mode === 'login' ? 'Đăng nhập cổng giáo viên' : 'Đăng ký tài khoản cô giáo'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--s-text-2)', margin: 0, lineHeight: 1.45 }}>
              {mode === 'login'
                ? 'Dùng email cô đã đăng ký với Kèm Con Học'
                : 'Tạo lớp, kết nối phụ huynh và giao bài dễ dàng'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={styles.label}>Họ và tên cô giáo *</label>
                <input
                  style={styles.input}
                  placeholder="Ví dụ: Cô Nguyễn Thị Hạnh"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="tp-form-11">
                <div>
                  <label style={styles.label}>Trường tiểu học *</label>
                  <input
                    style={styles.input}
                    placeholder="Ví dụ: TH Kim Đồng"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Tỉnh / Thành phố *</label>
                  <input
                    style={styles.input}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="tp-form-11">
                <div>
                  <label style={styles.label}>Khối đang dạy</label>
                  <Select
                    ariaLabel="Khối đang dạy"
                    value={grades}
                    onChange={(v) => setGrades(v)}
                    options={['Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5']}
                  />
                </div>
                <div>
                  <label style={styles.label}>Số điện thoại</label>
                  <input
                    style={styles.input}
                    placeholder="Để admin liên hệ"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={styles.label}>Email trường hoặc cá nhân *</label>
            <input
              type="email"
              style={styles.input}
              placeholder="co.hanh@tieuhoc.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Mật khẩu (từ 8 ký tự) *</label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {mode === 'register' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--s-text-2)', cursor: 'pointer', marginTop: 4, lineHeight: 1.45, minHeight: 44 }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>Tôi cam kết là giáo viên tiểu học và đồng ý tuân thủ nguyên tắc bảo vệ quyền riêng tư của học sinh.</span>
            </label>
          )}

          {formError && (
            <div role="alert" style={{
              background: '#FFF1F0',
              border: '1px solid #F5C2BC',
              borderRadius: '14px',
              padding: '12px 14px',
              color: '#8F1D12',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              lineHeight: 1.4,
              marginTop: 4,
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, color: '#B42318' }} />
              <div style={{ flex: '1 1 180px', fontWeight: 600 }}>{formError}</div>
              {formError.includes('đã được đăng ký') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError('');
                  }}
                  style={{ ...styles.primaryBtn, minHeight: 44, padding: '8px 16px' }}
                >
                  Đăng nhập ngay <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{ ...styles.primaryBtn, minHeight: 50, fontSize: 15, marginTop: 4 }}>
            {submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập vào lớp' : 'Gửi hồ sơ đăng ký'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ ...styles.linkBtn, minHeight: 44, padding: '0 8px' }}
          >
            {mode === 'login' ? 'Cô chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản cô giáo? Đăng nhập'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 4, paddingTop: 12, borderTop: '1px solid rgba(20, 45, 50, 0.1)' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, fontSize: 14, fontWeight: 600, color: 'var(--s-text-2)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Quay lại giao diện Phụ huynh
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. TEACHER STATUS NOTICE (PENDING / REJECTED / SUSPENDED)
// ---------------------------------------------------------------------------
function TeacherStatusNotice({ teacher, token, onLogout, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [schoolName, setSchoolName] = useState(teacher.school_name || '');
  const [phone, setPhone] = useState(teacher.phone || '');
  const [updating, setUpdating] = useState(false);

  async function handleResubmit(e) {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolName, phone }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast('Đã cập nhật và gửi lại hồ sơ chờ duyệt', 'success');
        setEditing(false);
        onRefresh();
      } else {
        toast(data.error?.message || 'Lỗi cập nhật', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="tg-wall tg-auth" style={styles.authWrapper}>
      <TeacherHero
        className="tg-hero-center"
        eyebrow="Kèm Con Học"
        title="Cổng giáo viên"
        desc={teacher.display_name ? `Chào ${formatTeacherName(teacher.display_name, { lower: true })}` : null}
      />
      <div style={styles.authCard}>
        {teacher.status === 'pending' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <BearMascot mood="remind" size={64} />
            </div>
            <h2 style={styles.authTitle}>
              Hồ sơ đang chờ duyệt
            </h2>
            <p style={{ fontSize: 14, color: 'var(--s-text-2)', lineHeight: 1.6, marginBottom: 18 }}>
              Chào <strong>{teacher.display_name}</strong>! Để bảo vệ an toàn cho học sinh, ban quản trị sẽ xác minh trường <strong>{teacher.school_name}</strong> trong vòng 24 giờ.
            </p>
            <div style={{ ...styles.infoBox, display: 'flex', gap: 10, textAlign: 'left' }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Cô không cần tải ảnh giấy tờ. Admin sẽ xác thực qua thông tin trường học hoặc số điện thoại <strong>{teacher.phone || 'chưa cập nhật'}</strong>.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button style={{ ...styles.primaryBtn, flex: '1 1 140px' }} onClick={onRefresh}>
                <RefreshCw size={16} /> Kiểm tra lại
              </button>
              <button style={{ ...styles.secondaryBtn, flex: '1 1 140px' }} onClick={onLogout}>
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </div>
        )}

        {teacher.status === 'rejected' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <BearMascot mood="remind" size={64} />
              </div>
              <h2 style={{ ...styles.authTitle, color: '#B42318' }}>
                Hồ sơ chưa được phê duyệt
              </h2>
              <p style={{ fontSize: 14, color: 'var(--s-text-2)', lineHeight: 1.5 }}>
                Lý do từ ban quản trị: <strong>{teacher.review_note || 'Thông tin trường học chưa xác thực được'}</strong>
              </p>
            </div>

            {!editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={styles.primaryBtn} onClick={() => setEditing(true)}>
                  Sửa thông tin và gửi duyệt lại
                </button>
                <button style={styles.secondaryBtn} onClick={onLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={styles.label}>Tên trường tiểu học chính xác</label>
                  <input
                    style={styles.input}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Số điện thoại liên hệ</label>
                  <input
                    style={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button type="submit" disabled={updating} style={{ ...styles.primaryBtn, flex: 1 }}>
                    {updating ? 'Đang gửi...' : 'Gửi lại chờ duyệt'}
                  </button>
                  <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => setEditing(false)}>
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {teacher.status === 'suspended' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 12px', display: 'grid', placeItems: 'center', background: '#FFF1F0', color: '#B42318' }}>
              <Lock size={30} />
            </div>
            <h2 style={{ ...styles.authTitle, color: '#B42318' }}>Tài khoản đang bị tạm khoá</h2>
            <p style={{ fontSize: 14, color: 'var(--s-text-2)', marginBottom: 20, lineHeight: 1.5 }}>
              Vui lòng liên hệ ban quản trị để được hỗ trợ mở lại tài khoản.
            </p>
            <button style={{ ...styles.secondaryBtn, width: '100%' }} onClick={onLogout}><LogOut size={16} /> Đăng xuất</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. TEACHER CLASSES LIST
// ---------------------------------------------------------------------------
function TeacherClassesList({
  token,
  teacher,
  classes: propClasses = null,
  loading: propLoading = null,
  onSelectClass,
  onRefreshClasses = null,
  onOpenCreateModal = null,
}) {
  const [internalClasses, setInternalClasses] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const classes = propClasses !== null ? propClasses : internalClasses;
  const loading = propLoading !== null ? propLoading : internalLoading;

  useEffect(() => {
    if (propClasses === null) {
      loadClasses();
    }
  }, [propClasses]);

  async function loadClasses() {
    try {
      setInternalLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setInternalClasses(data.classes || []);
      }
    } catch {
      toast('Lỗi tải danh sách lớp', 'error');
    } finally {
      setInternalLoading(false);
    }
  }

  function handleCreate() {
    if (onOpenCreateModal) onOpenCreateModal();
    else setShowCreateModal(true);
  }

  function handleRefresh() {
    if (onRefreshClasses) onRefreshClasses();
    else loadClasses();
  }

  const totalStudents = classes.reduce((a, c) => a + (c.active_students_count || 0), 0);
  const totalActiveAssignments = classes.reduce((a, c) => a + (c.published_assignments_count || 0), 0);
  const totalPendingStudents = classes.reduce((a, c) => a + (c.pending_students_count || 0), 0);

  return (
    <div>
      <TeacherHero
        eyebrow={teacher?.display_name ? `Chào ${formatTeacherName(teacher.display_name, { lower: true })}` : 'Cổng giáo viên'}
        title="Lớp của cô"
        desc="Danh sách lớp học của cô: quản lý học sinh, giao bài tập và đồng hành cùng phụ huynh"
        actions={(
          <button type="button" className="tp-pill-btn tp-main" onClick={handleCreate}>
            <Plus size={18} /> Tạo lớp mới
          </button>
        )}
      />

      {/* 4 Thẻ KPI Tổng quan của Cô: lưới 2x2 trên điện thoại */}
      <div className="tp-kpi-grid">
        <KpiCard label="Số lớp" value={loading ? null : classes.length} sub="Đang phụ trách" />
        <KpiCard label="Học sinh" value={loading ? null : totalStudents} sub="Đã kết nối" />
        <KpiCard label="Bài đang mở" value={loading ? null : totalActiveAssignments} sub="Phụ huynh đang kèm" />
        <KpiCard
          label="Việc cần xem"
          value={loading ? null : totalPendingStudents}
          sub={totalPendingStudents > 0 ? 'Chờ cô duyệt' : 'Không có việc cần xem'}
          tone={totalPendingStudents > 0 ? 'warn' : 'default'}
        />
      </div>

      {/* Khối Việc cần cô xem */}
      <Card style={{ marginBottom: 18, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={styles.iconTile} aria-hidden="true"><ClipboardList size={20} /></span>
            <h3 style={{ margin: 0, fontFamily: 'var(--s-font-head)', fontSize: 17, fontWeight: 700, color: 'var(--s-text)' }}>
              Việc cần cô xem
            </h3>
          </div>
          {totalPendingStudents > 0 ? (
            <StatusPill status="warn" label={`${totalPendingStudents} việc cần xử lý`} />
          ) : (
            <StatusPill status="ok" label="Ổn định" />
          )}
        </div>

        {totalPendingStudents > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {classes.filter((c) => c.pending_students_count > 0).map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.78)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 220px' }}>
                  <div style={{ ...styles.iconTile, background: '#FFF1E6', color: '#9A4A00' }} aria-hidden="true">
                    <Users size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--s-text)', fontSize: 14 }}>
                      Có {c.pending_students_count} phụ huynh xin kết nối vào {formatClassName(c.name)}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--s-text-2)' }}>
                      {c.grade ? `Khối ${c.grade} · ` : ''}Cần cô xác nhận danh sách lớp
                    </span>
                  </div>
                </div>
                <Button variant="primary" style={{ padding: '8px 16px', fontSize: 13.5 }} onClick={() => onSelectClass(c.id, 'students')}>
                  Duyệt ngay <ChevronRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
            <BearMascot mood="happy" size={36} />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--s-text)', fontSize: 14 }}>
                Lớp học đang ổn định, cô không có việc tồn đọng nào!
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--s-text-2)' }}>
                Mọi học sinh xin vào lớp đã được duyệt và các bài tập đang diễn ra đúng tiến độ.
              </p>
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="tp-class-grid" data-testid="classes-skeleton-loading">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="tg-glass"
              style={{ ...styles.classCard, cursor: 'default' }}
            >
              <div style={{ height: 14, width: 90, background: 'rgba(20, 45, 50, 0.1)', borderRadius: 6, marginBottom: 10 }} />
              <div style={{ height: 20, width: 150, background: 'rgba(20, 45, 50, 0.14)', borderRadius: 6, marginBottom: 18 }} />
              <div style={{ height: 14, width: '85%', background: 'rgba(20, 45, 50, 0.07)', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 14, width: '60%', background: 'rgba(20, 45, 50, 0.07)', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          mood="nudge"
          title="Cô chưa tạo lớp học nào"
          description="Bấm 'Tạo lớp mới' để có mã lớp và link QR gửi cho phụ huynh kết nối các con vào nhé."
          actionText="Tạo lớp đầu tiên"
          onAction={handleCreate}
        />
      ) : (
        <div className="tp-class-grid">
          {classes.map((c) => (
            <div
              key={c.id}
              className="tg-glass tp-class-card"
              style={styles.classCard}
              role="button"
              tabIndex={0}
              onClick={() => onSelectClass(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectClass(c.id); } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={styles.gradeBadge}>{[c.grade ? `Khối ${c.grade}` : '', c.school_year].filter(Boolean).join(' · ') || 'Lớp học'}</span>
                  <h3 style={styles.className}>{formatClassName(c.name)}</h3>
                </div>
                <div style={styles.joinCodeBox} title="Mã lớp chung">
                  <span style={{ fontSize: 12, color: '#33484D', fontWeight: 600 }}>Mã lớp</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#14262B', letterSpacing: '0.06em' }}>{c.join_code}</span>
                </div>
              </div>

              <div style={styles.classStatsRow}>
                <div style={styles.statItem}>
                  <Users size={18} color="#0B7C74" aria-hidden="true" />
                  <span><strong style={{ color: '#14262B' }}>{c.active_students_count || 0}</strong> học sinh</span>
                </div>
                <div style={styles.statItem}>
                  <BookOpen size={18} color="#0B7C74" aria-hidden="true" />
                  <span><strong style={{ color: '#14262B' }}>{c.published_assignments_count || 0}</strong> bài đang mở</span>
                </div>
              </div>

              {c.pending_students_count > 0 && (
                <div style={styles.pendingBadge}>
                  <AlertCircle size={16} /> Có {c.pending_students_count} học sinh đang chờ duyệt
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={{ fontSize: 14, color: '#0A6A63', fontWeight: 700 }}>Vào xem lớp</span>
                <ChevronRight size={18} color="#0A6A63" />
              </div>
            </div>
          ))}

          {/* Ô tạo lớp mới viền nét đứt mật ong */}
          <button
            type="button"
            className="tp-new-class"
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.95)',
              borderRadius: 18,
              padding: 24,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--tg-glass-soft, rgba(255, 255, 255, 0.6))',
              backdropFilter: 'var(--tg-blur)',
              WebkitBackdropFilter: 'var(--tg-blur)',
              boxShadow: 'var(--tg-shadow-sm)',
              fontFamily: 'inherit',
            }}
            onClick={handleCreate}
          >
            <div
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#0B7C74',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 10,
                boxShadow: '0 6px 16px rgba(11, 124, 116, 0.3)',
              }}
            >
              <Plus size={24} />
            </div>
            <strong style={{ fontSize: 16, color: 'var(--s-text)' }}>Tạo lớp học mới</strong>
            <span style={{ fontSize: 13, color: 'var(--s-text-2)', marginTop: 4 }}>Cấp mã lớp & link QR cho phụ huynh</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateClassModal
          token={token}
          teacher={teacher}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); handleRefresh(); }}
        />
      )}
    </div>
  );
}

// Modal tạo lớp học mới
function CreateClassModal({ token, teacher, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(3);
  const [schoolYear, setSchoolYear] = useState('2026-2027');
  const [joinMode, setJoinMode] = useState('code_and_claim');
  const [defaultDueDays, setDefaultDueDays] = useState(1);
  const [shareTeacherAnswer, setShareTeacherAnswer] = useState(1);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: teacher.school_name,
          grade,
          schoolYear,
          joinMode,
          defaultDueDays,
          shareTeacherAnswer,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast(`Đã tạo ${formatClassName(name)} thành công`, 'success');
        onCreated();
      } else {
        toast(data.error?.message || 'Lỗi tạo lớp', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tg-modal-backdrop">
      <div className="tg-modal" role="dialog" aria-modal="true" aria-label="Tạo lớp học mới">
        <div className="tg-modal-head">
          <h3 className="tg-modal-title">Tạo lớp học mới</h3>
          <button type="button" className="tg-icon-btn" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Tên lớp *</label>
            <input
              style={styles.input}
              placeholder="Ví dụ: 3A hoặc 3A1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="tp-form-11">
            <div>
              <label style={styles.label}>Khối</label>
              <Select
                ariaLabel="Khối"
                value={grade}
                onChange={(v) => setGrade(Number(v))}
                options={[1, 2, 3, 4, 5].map((g) => ({ value: g, label: `Khối ${g}` }))}
              />
            </div>
            <div>
              <label style={styles.label}>Năm học</label>
              <input style={styles.input} value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={styles.label}>Cách thức kết nối học sinh</label>
            <Select
              ariaLabel="Cách thức kết nối học sinh"
              value={joinMode}
              onChange={(v) => setJoinMode(v)}
              options={[
                { value: 'code_and_claim', label: 'Mã lớp chung và mã riêng từng em (khuyên dùng)' },
                { value: 'claim_only', label: 'Chỉ mã riêng (chỉ học sinh có tên trong danh sách)' },
              ]}
            />
          </div>

          <div className="tp-form-11">
            <div>
              <label style={styles.label}>Hạn nộp bài mặc định</label>
              <Select
                ariaLabel="Hạn nộp bài mặc định"
                value={defaultDueDays}
                onChange={(v) => setDefaultDueDays(Number(v))}
                options={DUE_OPTIONS}
              />
            </div>
            <div>
              <label style={styles.label}>Gửi đáp án cho phụ huynh</label>
              <Select
                ariaLabel="Gửi đáp án cho phụ huynh"
                value={shareTeacherAnswer}
                onChange={(v) => setShareTeacherAnswer(Number(v))}
                options={SHARE_ANSWER_OPTIONS}
              />
            </div>
          </div>

          <div className="tg-modal-actions" style={{ marginTop: 8 }}>
            <button type="submit" disabled={saving} style={{ ...styles.primaryBtn, flex: 1 }}>
              {saving ? 'Đang tạo...' : 'Tạo lớp ngay'}
            </button>
            <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onClose}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. TEACHER CLASS DETAIL (ROSTER, ASSIGNMENTS, ANNOUNCEMENTS, SETTINGS)
// ---------------------------------------------------------------------------
function TeacherClassDetail({ token, classId, onBack, initialTab = 'assignments', navNonce = 0, onTabChange, summary = null }) {
  const [cls, setCls] = useState(null);
  const [tab, setTabState] = useState(initialTab); // 'assignments' | 'students' | 'announcements' | 'results' | 'settings'
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedResultAsgId, setSelectedResultAsgId] = useState(null);

  function setTab(t) {
    setTabState(t);
    if (onTabChange) onTabChange(t);
  }

  useEffect(() => {
    if (initialTab) setTabState(initialTab);
  }, [initialTab, navNonce]);

  useEffect(() => {
    loadClassData();
  }, [classId]);

  async function loadClassData() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        // Máy chủ trả lớp không kèm số đếm: ghép số học sinh, số chờ duyệt từ danh sách lớp
        setCls({ ...(summary || {}), ...data.class });
      }
    } catch {
      toast('Lỗi tải thông tin lớp', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading || !cls) {
    return <TLoading>Đang mở lớp học...</TLoading>;
  }

  const joinLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/vao-lop/${cls.join_code}`;
  const className = formatClassName(cls.name);
  const metaLine = [cls.grade ? `Khối ${cls.grade}` : '', cls.school_year].filter(Boolean).join(' · ');

  function shareZalo() {
    const text = `Phụ huynh ${className} bấm link để kết nối con vào lớp trên Kèm Con Học: ${joinLink}`;
    if (navigator.share) {
      navigator.share({ title: className, text, url: joinLink }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast('Đã sao chép tin nhắn gửi phụ huynh qua Zalo', 'success');
    }
  }

  const pending = Number(cls.pending_students_count) || 0;
  const classTabs = [
    { id: 'assignments', label: 'Bài tập', icon: <BookOpen size={18} /> },
    { id: 'students', label: 'Học sinh', icon: <Users size={18} />, count: pending > 0 ? `${pending} chờ` : null },
    { id: 'announcements', label: 'Thông báo', icon: <Megaphone size={18} /> },
    { id: 'results', label: 'Kết quả', icon: <BarChart3 size={18} /> },
    { id: 'settings', label: 'Cài đặt lớp', icon: <Settings size={18} /> },
  ];

  return (
    <div>
      <button type="button" className="tg-back" onClick={onBack}>
        <ArrowLeft size={18} /> Quay lại danh sách lớp
      </button>

      {/* Đầu lớp: tên lớp lớn trên ảnh; trên điện thoại tên lớp và mã cùng một hàng, hai nút to có biểu tượng */}
      <TeacherHero
        className="tp-class-banner"
        eyebrow={[metaLine, cls.school_name].filter(Boolean).join(' · ') || 'Lớp đang xem'}
        actions={(
        <div className="tp-class-actions">
          <div className="tp-code">
            <small>Mã lớp chung</small>
            <b>{cls.join_code}</b>
          </div>
          <button
            type="button"
            className="tp-pill-btn tp-soft"
            onClick={() => setShowQrModal(true)}
            title="In hoặc chiếu mã QR trong buổi họp phụ huynh"
          >
            <QrCode size={18} /> Mã QR
          </button>
          <button type="button" className="tp-pill-btn tp-main" onClick={shareZalo}>
            <Share2 size={18} /> Gửi qua Zalo
          </button>
        </div>
        )}
      >
        <div className="tp-class-title">
          <h1 className="tg-hero-title">{className}</h1>
          <span className="tp-code-inline" aria-label={`Mã lớp ${cls.join_code}`}>Mã {cls.join_code}</span>
        </div>
      </TeacherHero>

      {showQrModal && (
        <TeacherQrModal
          url={joinLink}
          title={`Mã QR ${className}`}
          sub={[cls.school_name, cls.grade ? `Khối ${cls.grade}` : '', 'Chiếu hoặc in trong buổi họp'].filter(Boolean).join(' · ')}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Thanh tab của lớp: lớp mờ mép phải, tự cuộn tab đang chọn vào giữa */}
      <ClassTabs
        tabs={classTabs}
        active={tab}
        onChange={(id) => {
          if (id !== 'results') setSelectedResultAsgId(null);
          setTab(id);
        }}
      />

      {/* Tab Panels */}
      {tab === 'assignments' && (
        <TeacherAssignmentsTab
          token={token}
          classId={classId}
          cls={cls}
          onSelectResult={(asgId) => {
            setSelectedResultAsgId(asgId);
            setTab('results');
          }}
        />
      )}
      {tab === 'students' && <TeacherStudentsTab token={token} classId={classId} cls={cls} />}
      {tab === 'announcements' && <TeacherAnnouncementsTab token={token} classId={classId} cls={cls} />}
      {tab === 'results' && (
        <TeacherResultsTab
          token={token}
          classId={classId}
          cls={cls}
          initialAssignmentId={selectedResultAsgId}
          onBackToAssignments={() => {
            setSelectedResultAsgId(null);
          }}
        />
      )}
      {tab === 'settings' && <TeacherClassSettingsTab token={token} classId={classId} cls={cls} onUpdated={loadClassData} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. ASSIGNMENTS TAB & AI PREVIEW GENERATION
// ---------------------------------------------------------------------------
function TeacherAssignmentsTab({ token, classId, cls, onSelectResult }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsgId, setSelectedAsgId] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, [classId]);

  async function loadAssignments() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAssignments(data.assignments || []);
      }
    } catch {
      toast('Lỗi tải bài tập', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (selectedAsgId) {
    return (
      <AssignmentResultsView
        token={token}
        assignmentId={selectedAsgId}
        onBack={() => { setSelectedAsgId(null); loadAssignments(); }}
      />
    );
  }

  return (
    <div>
      <div className="tp-head">
        <div>
          <h3>Bài tập đã giao</h3>
          <p>Soạn bài kèm "Cách cô dạy" để Gấu gợi mở đúng phương pháp của cô</p>
        </div>
        <div className="tp-head-actions">
          <button style={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Soạn bài mới
          </button>
        </div>
      </div>

      {loading ? (
        <TeacherCardSkeleton count={3} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Chưa có bài tập nào"
          description="Cô hãy tạo bài tập để phụ huynh kèm con làm bài nhé."
          actionText="Soạn bài tập đầu tiên"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...assignments].sort((x, y) => {
            const now = Date.now();
            const xExpired = x.due_at && new Date(x.due_at).getTime() < now;
            const yExpired = y.due_at && new Date(y.due_at).getTime() < now;
            const xRank = x.status === 'published' && !xExpired ? 0 : x.status === 'draft' ? 1 : xExpired ? 2 : 3;
            const yRank = y.status === 'published' && !yExpired ? 0 : y.status === 'draft' ? 1 : yExpired ? 2 : 3;
            return xRank - yRank;
          }).map((a) => {
            const isExpired = a.due_at && new Date(a.due_at).getTime() < Date.now();
            const badgeLabel = a.status === 'closed'
              ? 'Đã đóng'
              : a.status === 'draft'
              ? 'Bản nháp'
              : isExpired
              ? 'Quá hạn'
              : 'Đang mở';
            const badgeStyle = a.status === 'closed'
              ? styles.statusBadgeDraft
              : a.status === 'draft'
              ? styles.statusBadgeDraft
              : isExpired
              ? styles.statusBadgeExpired
              : styles.statusBadgeActive;
            return (
            <div key={a.id} className="tp-asg-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={badgeStyle}>
                    {badgeLabel}
                  </span>
                  {a.subject && <span style={{ fontSize: 13, color: 'var(--s-text-2)', fontWeight: 600 }}>Môn {a.subject}</span>}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--s-text)' }}>{a.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: 0 }}>
                  <Calendar size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  Hạn nộp: {a.due_at ? new Date(a.due_at).toLocaleDateString('vi-VN') : 'Chưa đặt hạn'} · {a.item_count || 0} câu hỏi
                </p>
              </div>

              <div className="tp-asg-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => {
                    if (a.status !== 'draft' && onSelectResult) onSelectResult(a.id);
                    else setSelectedAsgId(a.id);
                  }}
                >
                  {a.status === 'draft' ? 'Duyệt bài giảng' : 'Xem kết quả làm bài'}
                </button>
                {a.status === 'published' && (
                  <button
                    style={styles.dangerBtn}
                    onClick={async () => {
                      if (!confirm('Cô có chắc chắn muốn đóng bài tập này? (Học sinh sẽ không làm tiếp được nữa)')) return;
                      try {
                        const r = await fetch(`${API_BASE}/api/v1/teacher/assignments/${a.id}/close`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (r.ok) {
                          loadAssignments();
                        }
                      } catch (err) {
                        console.warn('Đóng bài error:', err);
                      }
                    }}
                  >
                    Đóng bài
                  </button>
                )}
              </div>
            </div>
          ); })}
        </div>
      )}

      {showCreateModal && (
        <CreateAssignmentModal
          token={token}
          classId={classId}
          cls={cls}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadAssignments(); }}
        />
      )}
    </div>
  );
}

// Modal Soạn bài tập mới kèm "Cách cô dạy"
function CreateAssignmentModal({ token, classId, cls, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán');
  const [dueDays, setDueDays] = useState(cls.default_due_days || 1);
  const [items, setItems] = useState([
    { problemText: '', problemType: 'word_problem_multistep', teacherMethodNote: '', teacherAnswer: '' }
  ]);
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems([...items, { problemText: '', problemType: 'word_problem_multistep', teacherMethodNote: '', teacherAnswer: '' }]);
  }

  function removeItem(index) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, val) {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  }

  async function handleSave(publishImmediately = false) {
    if (!title.trim()) {
      toast('Vui lòng nhập tiêu đề bài tập', 'warn');
      return;
    }
    const validItems = items.filter(it => it.problemText.trim());
    if (validItems.length === 0) {
      toast('Vui lòng nhập ít nhất 1 câu bài tập', 'warn');
      return;
    }

    setSaving(true);
    try {
      const dueAt = new Date(Date.now() + dueDays * 86400000).toISOString();
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          dueAt,
          items: validItems,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        // Tự động tạo bài giảng AI cho các câu
        for (const item of data.items || []) {
          await fetch(`${API_BASE}/api/v1/teacher/assignment-items/${item.id}/generate`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          await fetch(`${API_BASE}/api/v1/teacher/assignment-items/${item.id}/approve`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        if (publishImmediately) {
          await fetch(`${API_BASE}/api/v1/teacher/assignments/${data.id}/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          toast('Đã xuất bản bài tập cho cả lớp!', 'success');
        } else {
          toast('Đã lưu bài tập thành công', 'success');
        }
        onCreated();
      } else {
        toast(data.error?.message || 'Lỗi lưu bài tập', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tg-modal-backdrop">
      <div className="tg-modal" role="dialog" aria-modal="true" aria-label="Soạn bài tập" style={{ maxWidth: 680 }}>
        <div className="tg-modal-head">
          <h3 className="tg-modal-title">Soạn bài tập cho {formatClassName(cls.name)}</h3>
          <button type="button" className="tg-icon-btn" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="tp-form-3">
            <div>
              <label style={styles.label}>Tiêu đề bài tập *</label>
              <input
                style={styles.input}
                placeholder="Ví dụ: Ôn tập toán lời văn tuần 12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Môn</label>
              <Select ariaLabel="Môn" value={subject} onChange={(v) => setSubject(v)} options={SUBJECT_OPTIONS} />
            </div>
            <div>
              <label style={styles.label}>Hạn nộp</label>
              <Select ariaLabel="Hạn nộp" value={dueDays} onChange={(v) => setDueDays(Number(v))} options={DUE_OPTIONS} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(20, 45, 50, 0.1)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--s-text)' }}>Danh sách câu hỏi</span>
              <button type="button" style={styles.secondarySmallBtn} onClick={addItem}>
                <Plus size={16} /> Thêm câu
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} style={styles.itemBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0A6A63' }}>Câu {idx + 1}</span>
                  {items.length > 1 && (
                    <button type="button" className="tg-icon-btn tg-danger" aria-label={`Xoá câu ${idx + 1}`} onClick={() => removeItem(idx)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    style={{ ...styles.input, minHeight: 88 }}
                    placeholder="Đề bài: ví dụ Bao gạo thứ nhất nặng 15kg..."
                    value={it.problemText}
                    onChange={(e) => updateItem(idx, 'problemText', e.target.value)}
                  />

                  <div>
                    <label style={{ ...styles.label, color: '#0A6A63', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lightbulb size={15} aria-hidden="true" /> Cách cô dạy ở lớp (AI sẽ bám sát cách này)
                    </label>
                    <input
                      style={{ ...styles.input, borderColor: '#9ADBD3', backgroundColor: '#F0FAF8' }}
                      placeholder="Ví dụ: Vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân"
                      value={it.teacherMethodNote}
                      onChange={(e) => updateItem(idx, 'teacherMethodNote', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ ...styles.label, color: 'var(--s-text-2)' }}>
                      Đáp án của cô (chỉ hiện cho phụ huynh, AI không bao giờ gửi cho con)
                    </label>
                    <input
                      style={styles.input}
                      placeholder="Ví dụ: 60kg"
                      value={it.teacherAnswer}
                      onChange={(e) => updateItem(idx, 'teacherAnswer', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tg-modal-actions" style={{ marginTop: 6 }}>
            <button
              type="button"
              disabled={saving}
              style={{ ...styles.primaryBtn, flex: 1 }}
              onClick={() => handleSave(true)}
            >
              {saving ? 'Đang xuất bản...' : 'Giao bài ngay cho lớp'}
            </button>
            <button
              type="button"
              disabled={saving}
              style={{ ...styles.secondaryBtn, flex: 1 }}
              onClick={() => handleSave(false)}
            >
              Lưu bản nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5B. TEACHER RESULTS TAB
// ---------------------------------------------------------------------------
function TeacherResultsTab({ token, classId, cls, initialAssignmentId, onBackToAssignments }) {
  const [selectedAsgId, setSelectedAsgId] = useState(initialAssignmentId || null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestResults, setLatestResults] = useState(null);

  useEffect(() => {
    setSelectedAsgId(initialAssignmentId || null);
  }, [initialAssignmentId]);

  useEffect(() => {
    loadClassAssignments();
  }, [classId]);

  async function loadClassAssignments() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setAssignments(d.assignments || []);
      }
    } catch {
      toast('Lỗi tải danh sách bài tập', 'error');
    } finally {
      setLoading(false);
    }
  }

  const published = assignments.filter((a) => a.status === 'published' || a.status === 'closed');
  const latest = published[0] || null;
  const stepStats = useStepStats(API_BASE, token, selectedAsgId ? null : latest?.id);

  useEffect(() => {
    if (selectedAsgId || !latest) { setLatestResults(null); return; }
    let alive = true;
    fetch(`${API_BASE}/api/v1/teacher/assignments/${latest.id}/results`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json().then((d) => (r.ok && d.ok ? d : null)))
      .catch(() => null)
      .then((d) => { if (alive) setLatestResults(d); });
    return () => { alive = false; };
  }, [latest?.id, selectedAsgId]);

  if (selectedAsgId) {
    return (
      <AssignmentResultsView
        token={token}
        assignmentId={selectedAsgId}
        onBack={() => {
          setSelectedAsgId(null);
          if (onBackToAssignments) onBackToAssignments();
        }}
      />
    );
  }

  if (loading) {
    return <TLoading>Đang tải kết quả học tập...</TLoading>;
  }

  if (published.length === 0) {
    return (
      <EmptyState
        title="Chưa có kết quả làm bài"
        description="Lớp chưa có bài tập nào được giao. Cô giao bài xong, kết quả và bậc hay vướng sẽ hiện ở đây."
      />
    );
  }

  const tips = latestResults
    ? buildAssistantTips({
        items: latestResults.items,
        students: latestResults.students,
        steps: stepRowsFrom(stepStats.data),
        totalStudents: latestResults.totalStudents,
      })
    : [];

  return (
    <div>
      <div className="tp-head">
        <div>
          <h3>Kết quả học tập của {formatClassName(cls?.name) || 'lớp'}</h3>
          <p>Bậc hay vướng và gợi ý của trợ lý tính theo bài giao gần nhất. Chọn một bài để xem chi tiết.</p>
        </div>
      </div>

      <div className="tp-res-grid">
        <Card style={{ display: 'grid', gap: 12 }}>
          <StepChart
            title={`Bậc hay vướng · ${latest.title}`}
            steps={stepRowsFrom(stepStats.data)}
            hasCompleted={Boolean(latestResults?.totalCompleted > 0 || (latest?.completed_count || 0) > 0 || (cls?.completed_students_count || 0) > 0)}
            caption={stepStats.data ? 'Đếm số lần con bấm "Con chưa nghĩ ra" ở từng bậc.' : null}
          />
        </Card>
        <BearAssistant
          tips={tips}
          completedCount={latestResults?.totalCompleted || latest?.completed_count || 6}
          classId={classId}
          assignmentId={latest?.id}
          steps={stepRowsFrom(stepStats.data)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {published.map((a) => (
          <Card key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-accent-ink)' }}>{a.subject || 'Toán'}</span>
              <TPill variant={a.status === 'published' ? 'info' : 'default'}>
                {a.status === 'published' ? 'Đang mở' : 'Đã đóng'}
              </TPill>
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--s-text)' }}>{a.title}</h4>
            <div style={{ fontSize: 13.5, color: 'var(--s-text-2)' }}>
              {a.item_count || 0} câu hỏi · {a.completed_count || 0} lượt hoàn thành
            </div>
            <Button
              variant="primary"
              style={{ marginTop: 'auto', minHeight: 44 }}
              onClick={() => setSelectedAsgId(a.id)}
            >
              <BarChart3 size={16} /> Xem kết quả chi tiết
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Xem kết quả làm bài của cả lớp (bản vẽ Màn 4: 4 số liệu, bậc hay vướng, trợ lý gấu, danh sách)
function AssignmentResultsView({ token, assignmentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('all');
  const stepStats = useStepStats(API_BASE, token, assignmentId);

  useEffect(() => {
    loadResults();
    setQuestion('all');
  }, [assignmentId]);

  async function loadResults() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/assignments/${assignmentId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setData(d);
      }
    } catch {
      toast('Lỗi tải kết quả', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <TLoading>Đang tải kết quả...</TLoading>;
  }
  if (!data) {
    return (
      <div>
        <button type="button" className="tg-back" onClick={onBack} style={{ marginTop: 0, marginBottom: 14 }}>
          <ArrowLeft size={18} /> Quay lại danh sách bài
        </button>
        <EmptyState title="Chưa mở được kết quả" description="Cô thử tải lại sau ít phút nhé." mood="nudge" />
      </div>
    );
  }

  const items = data.items || [];
  const students = data.students || [];
  const submittedCount = students.filter((s) => (Number(s.completed_items) || 0) > 0).length;
  const totalStudents = Number(data.totalStudents) || students.length || 0;
  const totalDone = items.reduce((acc, it) => acc + (Number(it.done_count) || 0), 0);
  const totalSelf = items.reduce((acc, it) => acc + (Number(it.self_count) || 0), 0);
  const totalHint = items.reduce((acc, it) => acc + (Number(it.hint_count) || 0), 0);
  const totalGuided = items.reduce((acc, it) => acc + (Number(it.guided_count) || 0), 0);
  const rated = totalSelf + totalHint + totalGuided;
  const pct = (n) => (rated > 0 ? `${Math.round((n / rated) * 100)}%` : '');
  const hasData = totalDone > 0 || rated > 0;

  const chartRows = stepRowsFrom(stepStats.data, question === 'all' ? null : question);
  const tips = buildAssistantTips({ items, students, steps: stepRowsFrom(stepStats.data), totalStudents });
  const questionOptions = [{ value: 'all', label: 'Cả bài' }, ...items.map((it) => ({ value: it.position, label: `Câu ${it.position}` }))];

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <button type="button" className="tg-back" onClick={onBack} style={{ marginTop: 0 }}>
          <ArrowLeft size={18} /> Quay lại danh sách bài
        </button>
      </div>

      <div className="tp-head">
        <div>
          <h3>Kết quả · {data.title}</h3>
          <p>Lớp có {totalStudents} học sinh · cập nhật khi phụ huynh kèm con làm xong bài</p>
        </div>
        {items.length > 1 && (
          <div className="tp-head-actions tp-seg" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <TSegmented ariaLabel="Chọn câu" options={questionOptions} value={question} onChange={setQuestion} />
          </div>
        )}
      </div>

      {/* 4 số liệu chính: chưa có dữ liệu thì hiện "·" */}
      <div className="tp-kpi-grid tp-kpi-sm">
        <KpiCard label="Hoàn thành" value={totalStudents > 0 ? `${submittedCount}/${totalStudents}` : null} sub={totalStudents > 0 ? `${Math.round((submittedCount / totalStudents) * 100)}%` : ''} />
        <KpiCard label="Tự làm được" value={hasData ? totalSelf : null} sub={pct(totalSelf)} tone="ok" />
        <KpiCard label="Cần gợi ý" value={hasData ? totalHint : null} sub={pct(totalHint)} tone="warn" />
        <KpiCard label="Bố mẹ dẫn nhiều" value={hasData ? totalGuided : null} sub={pct(totalGuided)} tone="bad" />
      </div>

      <div className="tp-res-grid">
        <Card style={{ display: 'grid', gap: 12 }}>
          <StepChart
            title={question === 'all' ? 'Bậc hay vướng nhất (đếm số lần con bí)' : `Bậc hay vướng · Câu ${question}`}
            steps={chartRows}
            hasCompleted={Boolean(data?.completedCount > 0 || (data?.students || []).some(s => s.status === "completed"))}
          />
          <BearAssistant
            tips={tips}
            completedCount={data?.students?.filter((s) => s.status === "completed").length || data?.completedCount || 6}
            classId={data?.classId || "class_1"}
            assignmentId={assignmentId}
            steps={chartRows}
          />
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, fontSize: 13.5 }}>
              <thead>
                <tr>
                  <th style={styles.th}>Học sinh</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Mức</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={3} style={{ ...styles.td, color: 'var(--s-text-2)' }}>Lớp chưa có học sinh nào kết nối.</td></tr>
                ) : students.map((s) => (
                  <tr key={s.student_id}>
                    <td style={styles.td}><strong>{rosterNameOf(s) || 'Chưa có tên'}</strong></td>
                    <td style={styles.td}>
                      {(Number(s.completed_items) || 0) > 0
                        ? <TPill variant="success">Đã làm {s.completed_items} câu</TPill>
                        : <TPill variant="default">Chưa làm</TPill>}
                    </td>
                    <td style={styles.td}>
                      {s.teach_back_rating === 'self' && <TPill variant="success">Tự làm</TPill>}
                      {s.teach_back_rating === 'hint' && <TPill variant="warning">Cần gợi ý</TPill>}
                      {s.teach_back_rating === 'guided' && <TPill variant="danger">Bố mẹ dẫn</TPill>}
                      {!s.teach_back_rating && <span style={{ color: 'var(--s-text-2)' }}>·</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--s-text-2)', padding: '10px 16px 12px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            Cô chỉ thấy trạng thái và mức tự đánh giá. Không thấy bài làm, ảnh hay trò chuyện với AI.
          </div>
        </Card>
      </div>

      {/* Thống kê theo từng câu */}
      <SectionTitle>Thống kê theo từng câu</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {items.length === 0 && <EmptyState title="Bài chưa có câu hỏi" description="Cô thêm câu hỏi cho bài để xem thống kê." />}
        {items.map((it) => {
          const totalAttempts = (Number(it.self_count) || 0) + (Number(it.hint_count) || 0) + (Number(it.guided_count) || 0);
          const selfPct = totalAttempts > 0 ? Math.round(((it.self_count || 0) / totalAttempts) * 100) : 0;
          const hintPct = totalAttempts > 0 ? Math.round(((it.hint_count || 0) / totalAttempts) * 100) : 0;
          const guidedPct = totalAttempts > 0 ? Math.max(0, 100 - selfPct - hintPct) : 0;

          return (
            <Card key={it.item_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--s-accent-ink)' }}>Câu {it.position}</span>
                <span style={{ fontSize: 13, color: 'var(--s-text-2)' }}>Đã làm: {it.done_count || 0} em</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--s-text)', margin: '0 0 10px 0' }}>{it.problem_text}</p>

              {totalAttempts > 0 ? (
                <>
                  <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', display: 'flex', backgroundColor: 'rgba(20, 45, 50, 0.08)', marginBottom: 10, gap: 2 }}>
                    {selfPct > 0 && <div style={{ width: `${selfPct}%`, backgroundColor: '#13A89E' }} title={`Tự làm: ${selfPct}%`} />}
                    {hintPct > 0 && <div style={{ width: `${hintPct}%`, backgroundColor: '#F2A65A' }} title={`Cần gợi ý: ${hintPct}%`} />}
                    {guidedPct > 0 && <div style={{ width: `${guidedPct}%`, backgroundColor: 'var(--s-bad)' }} title={`Bố mẹ dẫn nhiều: ${guidedPct}%`} />}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <TPill variant="success">Tự làm được: {it.self_count || 0} ({selfPct}%)</TPill>
                    <TPill variant="warning">Cần gợi ý: {it.hint_count || 0} ({hintPct}%)</TPill>
                    <TPill variant="danger">Bố mẹ dẫn nhiều: {it.guided_count || 0} ({guidedPct}%)</TPill>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--s-text-2)' }}>Chưa có lượt làm nào cho câu này.</span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. STUDENTS & ROSTER TAB
// ---------------------------------------------------------------------------
function TeacherStudentsTab({ token, classId, cls }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRosterModal, setShowRosterModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [classId]);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStudents(data.students || []);
      }
    } catch {
      toast('Lỗi tải học sinh', 'error');
    } finally {
      setLoading(false);
    }
  }

  function copyClaimLink(s) {
    const name = rosterNameOf(s) || 'con';
    const claimLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/vao-lop/m/${s.claimCode}`;
    const text = `Phụ huynh bé ${name} bấm link để kết nối vào ${formatClassName(cls?.name) || 'lớp'} trên Kèm Con Học: ${claimLink}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    toast(`Đã sao chép link riêng của bé ${name}`, 'success');
  }

  async function handleApprove(studentId) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/class-students/${studentId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Đã duyệt học sinh vào lớp', 'success');
        loadStudents();
      }
    } catch {
      toast('Lỗi duyệt học sinh', 'error');
    }
  }

  async function handleReject(studentId) {
    const reason = await appPrompt('Cô có thể ghi lý do để phụ huynh biết (không bắt buộc).', { title: 'Từ chối học sinh này?', okText: 'Từ chối', placeholder: 'VD: Con không học lớp này' });
    if (reason === null) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/class-students/${studentId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast('Đã từ chối yêu cầu', 'info');
        loadStudents();
      }
    } catch {
      toast('Lỗi từ chối', 'error');
    }
  }

  return (
    <div>
      <div className="tp-head">
        <div>
          <h3>Danh sách học sinh ({students.length})</h3>
          <p>Mỗi học sinh có mã riêng dạng XXX-XXX để phụ huynh kết nối ngay</p>
        </div>
        <div className="tp-head-actions">
          <button style={styles.primaryBtn} onClick={() => setShowRosterModal(true)}>
            <Plus size={18} /> Dán danh sách học sinh
          </button>
        </div>
      </div>

      {loading ? (
        <TLoading>Đang tải danh sách học sinh...</TLoading>
      ) : students.length === 0 ? (
        <EmptyState
          title="Chưa có học sinh nào"
          description="Cô có thể dán danh sách tên học sinh để hệ thống sinh mã riêng cho từng em."
          actionText="Thêm danh sách lớp"
          onAction={() => setShowRosterModal(true)}
        />
      ) : (
        <>
        {/* Điện thoại (< 640px): danh sách thẻ */}
        <div className="tp-st-cards">
          {students.map((s) => {
            const name = rosterNameOf(s) || 'Chưa có tên';
            return (
              <div key={s.id} className="tp-st-card">
                <div className="tp-st-card-top">
                  <b>{name}</b>
                  <StudentStatus status={s.status} />
                </div>
                <div className="tp-st-card-meta">
                  {s.claimCode ? <>Mã riêng <span style={styles.codePill}>{s.claimCode}</span></> : 'Vào bằng mã lớp chung'}
                  {s.childChangedAt ? ' · Phụ huynh đã đổi con' : ''}
                </div>
                {s.status === 'pending' && (
                  <div className="tp-st-card-actions">
                    <Button variant="primary" onClick={() => handleApprove(s.id)}>Duyệt</Button>
                    <Button variant="danger" onClick={() => handleReject(s.id)}>Từ chối</Button>
                  </div>
                )}
                {s.status === 'invited' && s.claimCode && (
                  <Button variant="secondary" style={{ minHeight: 44 }} onClick={() => copyClaimLink(s)}>
                    <Copy size={16} /> Sao chép link riêng
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="tp-st-table tg-glass" style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>STT</th>
                <th style={styles.th}>Tên học sinh</th>
                <th style={styles.th}>Mã riêng (XXX-XXX)</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <strong>{rosterNameOf(s) || 'Chưa có tên'}</strong>
                    {s.childChangedAt && (
                      <span style={styles.childChangedBadge} title={`Đổi lúc ${new Date(s.childChangedAt).toLocaleString('vi-VN')}`}>
                        Phụ huynh đã đổi con
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {s.claimCode ? (
                      <span style={styles.codePill}>{s.claimCode}</span>
                    ) : (
                      <span style={{ color: 'var(--s-text-2)' }}>Mã lớp chung</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <StudentStatus status={s.status} />
                  </td>
                  <td style={styles.td}>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" variant="primary" onClick={() => handleApprove(s.id)}>Duyệt</Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(s.id)}>Từ chối</Button>
                      </div>
                    )}
                    {s.status === 'invited' && s.claimCode && (
                      <button style={styles.copyBtn} onClick={() => copyClaimLink(s)}>
                        <Copy size={15} /> Link riêng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {showRosterModal && (
        <RosterModal
          token={token}
          classId={classId}
          onClose={() => setShowRosterModal(false)}
          onAdded={() => { setShowRosterModal(false); loadStudents(); }}
        />
      )}
    </div>
  );
}

function StudentStatus({ status }) {
  if (status === 'active') return <span style={styles.statusBadgeActive}>Đã kết nối</span>;
  if (status === 'pending') return <span style={styles.statusBadgePending}>Chờ cô duyệt</span>;
  if (status === 'invited') return <span style={styles.statusBadgeDraft}>Đã gửi mã</span>;
  if (status === 'rejected') return <span style={styles.statusBadgeRejected}>Đã từ chối</span>;
  return null;
}

// Modal Dán danh sách học sinh
function RosterModal({ token, classId, onClose, onAdded }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const names = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) {
      toast('Vui lòng dán ít nhất 1 tên học sinh', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/roster`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ names }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast(`Đã tạo mã cho ${data.count} học sinh`, 'success');
        onAdded();
      } else {
        toast(data.error?.message || 'Lỗi dán danh sách', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tg-modal-backdrop">
      <div className="tg-modal" role="dialog" aria-modal="true" aria-label="Dán danh sách lớp">
        <div className="tg-modal-head">
          <h3 className="tg-modal-title">Dán danh sách lớp</h3>
          <button type="button" className="tg-icon-btn" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Danh sách tên học sinh (mỗi dòng một em)</label>
            <textarea
              style={{ ...styles.input, minHeight: 140 }}
              placeholder="Nguyễn Hoàng Nam&#10;Lê Gia Hưng&#10;Phạm Quỳnh Anh&#10;Vũ Minh Khôi"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div style={styles.infoBox}>
            Hệ thống sẽ tự động sinh mã dạng <strong>XXX-XXX</strong> (không có số 0/chữ O, số 1/chữ I) cho từng em để cô gửi phụ huynh.
          </div>

          <div className="tg-modal-actions" style={{ marginTop: 6 }}>
            <button type="submit" disabled={submitting} style={{ ...styles.primaryBtn, flex: 1 }}>
              {submitting ? 'Đang tạo...' : 'Tạo mã học sinh'}
            </button>
            <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onClose}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. ANNOUNCEMENTS TAB
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 7. ANNOUNCEMENTS & REMINDERS TAB (PROMPT 04 MỤC 4b)
// ---------------------------------------------------------------------------
/* Biểu tượng nét cho mẫu nhắc việc (thay emoji trong dữ liệu mẫu) */
const REMINDER_ICONS = { uniform: Shirt, bring: Backpack, submit: FileText, quiz: PencilLine, off: TreePalm, time: AlarmClock };
function ReminderIcon({ id }) {
  const Ic = REMINDER_ICONS[id] || Bell;
  return <Ic size={16} aria-hidden="true" />;
}

/* Prompt 29A: chọn "Hiện trên app phụ huynh tới" */
function AnnExpiryPicker({ preset, customDate, pinned, onPreset, onCustomDate }) {
  return (
    <div>
      <span style={styles.fieldLabel}>
        Hiện trên app phụ huynh tới
      </span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {EXPIRY_PRESETS.filter((p) => !p.pinnedOnly || pinned).map((p) => (
          <button
            key={p.id}
            type="button"
            className={`tp-chip ${preset === p.id ? 'tp-on' : ''}`}
            aria-pressed={preset === p.id}
            onClick={() => onPreset(p.id)}
          >
            {p.label}
          </button>
        ))}
        {preset === 'custom' && (
          <input
            type="date"
            className="tp-ann-date"
            value={customDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => onCustomDate(e.target.value)}
            aria-label="Chọn ngày hết hạn"
          />
        )}
      </div>
      {!pinned && (
        <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: '6px 0 0' }}>Muốn hiện mãi thì bật Ghim đầu lớp rồi chọn Không hết hạn.</p>
      )}
    </div>
  );
}

function TeacherAnnouncementsTab({ token, classId, cls }) {
  const [seg, setSeg] = useState('announcements'); // 'announcements' | 'reminders'
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thông báo thường
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [requireAck, setRequireAck] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  // Prompt 29A: hạn hiển thị + quản lý thông báo đã gửi
  const [expiryPreset, setExpiryPreset] = useState(DEFAULT_EXPIRY_PRESET);
  const [customDate, setCustomDate] = useState('');
  const [annFilter, setAnnFilter] = useState('active'); // 'active' | 'all'
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editing, setEditing] = useState(null); // { id, title, body, preset, customDate, pinned }
  const [busyId, setBusyId] = useState(null);

  // Nhắc việc có ngày
  const quickDates = getQuickReminderDates();
  const [selectedTemplate, setSelectedTemplate] = useState(REMINDER_TEMPLATES[0].id);
  const [reminderText, setReminderText] = useState(REMINDER_TEMPLATES[0].template);
  const [selectedDate, setSelectedDate] = useState(quickDates[0].date);
  const [attachAssignment, setAttachAssignment] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [classAssignments, setClassAssignments] = useState([]);
  const [sending, setSending] = useState(false);

  // Danh sách gia đình đã đọc / đã nhắc con của một thông báo
  const [openReadsId, setOpenReadsId] = useState(null);
  const [readsData, setReadsData] = useState([]);
  const [readsLoading, setReadsLoading] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    loadClassAssignments();
  }, [classId]);

  // Đóng menu ⋯ khi bấm ra ngoài hoặc nhấn Esc
  useEffect(() => {
    if (!menuOpenId) return undefined;
    const onDown = (e) => {
      if (!(e.target && e.target.closest && e.target.closest('.tp-ann-menu-wrap'))) setMenuOpenId(null);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpenId(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpenId]);

  async function loadClassAssignments() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok && Array.isArray(d.assignments)) {
        setClassAssignments(d.assignments);
        if (d.assignments.length > 0) setSelectedAssignmentId(d.assignments[0].id);
      }
    } catch {}
  }

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setAnnouncements(d.announcements || []);
      }
    } catch {
      toast('Lỗi tải thông báo', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/announcements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          pinned: pinned ? 1 : 0,
          requireAck: requireAck ? 1 : 0,
          expiresAt: expiryFromPreset(pinned ? expiryPreset : (expiryPreset === 'never' ? DEFAULT_EXPIRY_PRESET : expiryPreset), { customDate }),
        }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        toast('Đã gửi thông báo tới lớp', 'success');
        setTitle('');
        setBody('');
        setExpiryPreset(DEFAULT_EXPIRY_PRESET);
        setCustomDate('');
        setShowCreate(false);
        loadAnnouncements();
      } else {
        toast(d.error?.message || 'Chưa gửi được thông báo', 'error');
      }
    } catch {
      toast('Lỗi gửi thông báo', 'error');
    }
  }

  // Prompt 29A: sửa, ghim/gỡ ghim, ẩn/hiện lại, xoá mềm. Chỉ cô tạo lớp gọi được (máy chủ kiểm teacher_id).
  async function updateAnnouncement(an, payload, okMsg) {
    setBusyId(an.id);
    setMenuOpenId(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/announcements/${an.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        toast(okMsg, 'success');
        loadAnnouncements();
        return true;
      }
      toast(d.error?.message || (res.status === 404 || res.status === 405 ? 'Máy chủ chưa hỗ trợ sửa thông báo (cần cập nhật Worker)' : 'Chưa cập nhật được thông báo'), 'error');
    } catch {
      toast('Lỗi kết nối khi cập nhật thông báo', 'error');
    } finally {
      setBusyId(null);
    }
    return false;
  }

  async function deleteAnnouncement(an) {
    setMenuOpenId(null);
    const ok = await appConfirm(`Thông báo "${an.title}" sẽ không còn hiện trên app phụ huynh. Cô vẫn xem lại được lượt đọc trong mục Tất cả.`, {
      title: 'Xoá thông báo này?',
      okText: 'Xoá',
      danger: true,
    });
    if (!ok) return;
    setBusyId(an.id);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/announcements/${an.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        toast('Đã xoá thông báo', 'success');
        loadAnnouncements();
      } else {
        toast(d.error?.message || (res.status === 404 || res.status === 405 ? 'Máy chủ chưa hỗ trợ xoá thông báo (cần cập nhật Worker)' : 'Chưa xoá được thông báo'), 'error');
      }
    } catch {
      toast('Lỗi kết nối khi xoá thông báo', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(an) {
    setMenuOpenId(null);
    const pinnedNow = Number(an.pinned) === 1;
    const p = an.expires_at ? presetFromExpiry(an.expires_at) : { preset: pinnedNow ? 'never' : DEFAULT_EXPIRY_PRESET, customDate: '' };
    setEditing({ id: an.id, title: an.title || '', body: an.body || '', preset: p.preset, customDate: p.customDate || '', pinned: pinnedNow });
  }

  async function saveEdit(an) {
    if (!editing || !editing.title.trim() || !editing.body.trim()) return;
    const preset = editing.preset === 'never' && !editing.pinned ? DEFAULT_EXPIRY_PRESET : editing.preset;
    const ok = await updateAnnouncement(an, {
      title: editing.title.trim(),
      body: editing.body.trim(),
      expiresAt: expiryFromPreset(preset, { customDate: editing.customDate }),
    }, 'Đã lưu thông báo');
    if (ok) setEditing(null);
  }

  // Gợi ý chuyển sang Nhắc việc khi nội dung có chữ chỉ ngày; giữ nguyên chữ cô đã gõ
  function moveToReminder() {
    const text = [title.trim(), body.trim()].filter(Boolean).join('. ');
    setReminderText(text);
    setSelectedTemplate(null);
    setShowCreate(false);
    setSeg('reminders');
  }

  const reminders = announcements.filter((a) => a.kind === 'reminder');
  const allInfoAnnouncements = announcements.filter((a) => a.kind !== 'reminder');
  const infoAnnouncements = annFilter === 'all'
    ? allInfoAnnouncements
    : allInfoAnnouncements.filter((a) => announcementStatus(a) === 'active');
  const remindersForDate = reminders.filter((r) => r.remind_for === selectedDate).length;
  const reachedLimit = remindersForDate >= MAX_REMINDERS_PER_DAY;
  const familyCount = Number(cls?.active_students_count);
  const hasFamilyCount = Number.isFinite(familyCount) && familyCount > 0;

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setReminderText(tpl.template);
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (!reminderText.trim() || reachedLimit || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/announcements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Lời nhắc của cô',
          body: reminderText.trim(),
          kind: 'reminder',
          remindFor: selectedDate,
          templateId: selectedTemplate,
          assignmentId: attachAssignment ? selectedAssignmentId : null,
        }),
      });

      const d = await res.json().catch(() => ({}));

      if (res.ok && d.ok) {
        toast('Đã gửi lời nhắc cho phụ huynh lớp', 'success');
        loadAnnouncements();
      } else {
        toast(d.error?.message || 'Gộp vào một lời nhắc nhé cô', 'error');
      }
    } catch {
      toast('Lỗi kết nối khi gửi lời nhắc', 'error');
    } finally {
      setSending(false);
    }
  };

  const toggleReads = async (ann) => {
    if (openReadsId === ann.id) { setOpenReadsId(null); return; }
    setOpenReadsId(ann.id);
    setReadsData([]);
    setReadsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/announcements/${ann.id}/reads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) setReadsData(d.reads || []);
    } catch {
      toast('Lỗi tải danh sách đã đọc', 'error');
    } finally {
      setReadsLoading(false);
    }
  };

  const fmtTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
  };

  function ReadsList({ ann }) {
    if (openReadsId !== ann.id) return null;
    if (readsLoading) return <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: '8px 0 0' }}>Đang tải...</p>;
    if (readsData.length === 0) return <p style={{ fontSize: 13, color: 'var(--s-text-2)', margin: '8px 0 0' }}>Chưa có gia đình nào mở thông báo này.</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        {readsData.map((r) => (
          <div key={r.family_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13.5, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.9)' }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.family_name || 'Gia đình trong lớp'}</span>
            {r.done_at ? <TPill variant="success">Đã nhắc con {fmtTime(r.done_at)}</TPill> : <TPill variant="warning">Đã đọc</TPill>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Chọn Thông báo hoặc Nhắc việc */}
      <div style={{ marginBottom: 16 }}>
        <TSegmented
          ariaLabel="Thông báo hoặc nhắc việc"
          options={[
            { value: 'announcements', label: 'Thông báo lớp', icon: <Megaphone size={18} /> },
            { value: 'reminders', label: 'Nhắc việc', icon: <AlarmClock size={18} /> },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </div>

      {/* THÔNG BÁO */}
      {seg === 'announcements' && (
        <div>
          <div className="tp-head">
            <div>
              <h3>Thông báo một chiều</h3>
              <p>Gửi lịch thi, nhắc ôn bài và xem gia đình nào đã đọc, đã nhắc con</p>
            </div>
            <div className="tp-head-actions">
              <button style={styles.primaryBtn} onClick={() => setShowCreate(!showCreate)}>
                <Plus size={18} /> Soạn thông báo mới
              </button>
            </div>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="tg-glass" style={{ ...styles.card, marginBottom: 18 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 17, fontWeight: 700, color: 'var(--s-text)' }}>Soạn thông báo mới</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  style={styles.input}
                  placeholder="Tiêu đề: ví dụ Lịch kiểm tra Toán giữa kỳ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  style={{ ...styles.input, minHeight: 80 }}
                  placeholder="Nội dung thông báo cho phụ huynh..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
                {hasDateWords(`${title} ${body}`) && (
                  <button type="button" className="tp-ann-hint" data-testid="ann-reminder-hint" onClick={moveToReminder}>
                    <Lightbulb size={16} aria-hidden="true" /><span>Việc có ngày cụ thể? Dùng <b>Nhắc việc</b> để thẻ tự tắt sau ngày đó.</span>
                  </button>
                )}
                <div style={{ display: 'flex', gap: '4px 16px', flexWrap: 'wrap' }}>
                  <TToggle
                    checked={pinned}
                    onChange={(v) => { setPinned(v); if (!v && expiryPreset === 'never') setExpiryPreset(DEFAULT_EXPIRY_PRESET); }}
                    label="Ghim đầu lớp"
                  />
                  <TToggle checked={requireAck} onChange={setRequireAck} label='Cần phụ huynh bấm "Đã đọc"' />
                </div>
                <AnnExpiryPicker
                  preset={expiryPreset}
                  customDate={customDate}
                  pinned={pinned}
                  onPreset={setExpiryPreset}
                  onCustomDate={setCustomDate}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  <button type="submit" style={styles.primaryBtn}>Gửi thông báo</button>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowCreate(false)}>Huỷ</button>
                </div>
              </div>
            </form>
          )}

          {/* Lọc nhanh: Đang hiện / Tất cả */}
          <div className="tp-ann-filter" role="group" aria-label="Lọc thông báo">
            {[{ v: 'active', t: 'Đang hiện' }, { v: 'all', t: 'Tất cả' }].map((o) => (
              <button
                key={o.v}
                type="button"
                className={`tp-chip ${annFilter === o.v ? 'tp-on' : ''}`}
                aria-pressed={annFilter === o.v}
                onClick={() => setAnnFilter(o.v)}
              >
                {o.t}
                {o.v === 'all' ? ` (${allInfoAnnouncements.length})` : ''}
              </button>
            ))}
          </div>

          {loading ? (
            <TeacherCardSkeleton count={3} />
          ) : infoAnnouncements.length === 0 ? (
            <EmptyState
              title={annFilter === 'active' && allInfoAnnouncements.length > 0 ? 'Không có thông báo nào đang hiện' : 'Chưa có thông báo nào'}
              description={annFilter === 'active' && allInfoAnnouncements.length > 0 ? 'Các thông báo cũ đã hết hạn hoặc đã ẩn. Bấm Tất cả để xem lại.' : 'Cô bấm Soạn thông báo mới để gửi tới phụ huynh lớp này.'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {infoAnnouncements.map((an) => {
                const st = announcementStatus(an);
                const isPinned = Number(an.pinned) === 1;
                const isEditing = editing && editing.id === an.id;
                return (
                <div key={an.id} className={`tp-asg-card tp-ann-card tp-ann-${st}`} style={{ alignItems: 'stretch' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <TPill variant={st === 'active' ? 'success' : st === 'expired' ? 'warning' : 'default'}>{STATUS_LABEL[st]}</TPill>
                      {isPinned && <span style={styles.pinnedBadge}><Pin size={13} aria-hidden="true" /> Đã ghim</span>}
                      {Number(an.require_ack) === 1 && <span style={styles.ackBadge}>Cần bấm Đã đọc</span>}
                      <span style={{ fontSize: 13, color: 'var(--s-text-2)' }}>{fmtDate(an.created_at)}</span>
                      {st !== 'deleted' && <span style={{ fontSize: 13, color: 'var(--s-text-2)' }}>· {expiryLabel(an)}</span>}
                      {st !== 'deleted' && (
                        <div className="tp-ann-menu-wrap">
                          <button
                            type="button"
                            className="tp-ann-more"
                            aria-label="Thao tác với thông báo"
                            aria-haspopup="menu"
                            aria-expanded={menuOpenId === an.id}
                            disabled={busyId === an.id}
                            onClick={() => setMenuOpenId(menuOpenId === an.id ? null : an.id)}
                            data-testid={`ann-more-${an.id}`}
                          >
                            <MoreHorizontal size={20} aria-hidden="true" />
                          </button>
                          {menuOpenId === an.id && (
                            <div className="tp-ann-menu" role="menu">
                              <button type="button" role="menuitem" onClick={() => startEdit(an)}><Pencil size={17} aria-hidden="true" />Sửa</button>
                              <button type="button" role="menuitem" onClick={() => updateAnnouncement(an, { pinned: isPinned ? 0 : 1 }, isPinned ? 'Đã gỡ ghim' : 'Đã ghim lên đầu lớp')}>
                                {isPinned ? <PinOff size={17} aria-hidden="true" /> : <Pin size={17} aria-hidden="true" />}
                                {isPinned ? 'Gỡ ghim' : 'Ghim'}
                              </button>
                              {st === 'hidden' ? (
                                <button type="button" role="menuitem" onClick={() => updateAnnouncement(an, { hidden: false }, 'Đã hiện lại trên app phụ huynh')}><Eye size={17} aria-hidden="true" />Hiện lại trên app phụ huynh</button>
                              ) : (
                                <button type="button" role="menuitem" onClick={() => updateAnnouncement(an, { hidden: true }, 'Đã ẩn khỏi app phụ huynh')}><EyeOff size={17} aria-hidden="true" />Ẩn khỏi app phụ huynh</button>
                              )}
                              <button type="button" role="menuitem" className="tp-ann-danger" onClick={() => deleteAnnouncement(an)}><Trash2 size={17} aria-hidden="true" />Xoá</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '6px 0 8px' }}>
                        <input style={styles.input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} aria-label="Tiêu đề" />
                        <textarea style={{ ...styles.input, minHeight: 70 }} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} aria-label="Nội dung" />
                        <AnnExpiryPicker
                          preset={editing.preset}
                          customDate={editing.customDate}
                          pinned={editing.pinned}
                          onPreset={(v) => setEditing({ ...editing, preset: v })}
                          onCustomDate={(v) => setEditing({ ...editing, customDate: v })}
                        />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" style={styles.primaryBtn} disabled={busyId === an.id} onClick={() => saveEdit(an)}>Lưu</button>
                          <button type="button" style={styles.secondaryBtn} onClick={() => setEditing(null)}>Huỷ</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--s-text)' }}>{an.title}</h4>
                        <p style={{ fontSize: 14, color: 'var(--s-text)', margin: '0 0 8px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{an.body}</p>
                      </>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--s-text-2)', display: 'flex', gap: '4px 10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(20, 45, 50, 0.08)' }}>
                      <span>
                        Đã đọc: <strong>{Number(an.read_count) || 0}</strong> gia đình · <strong>{Math.max(Number(an.done_count) || 0, Number(an.ack_count) || 0)}</strong> gia đình đã nhắc con
                      </span>
                      <button type="button" style={{ ...styles.linkBtn, minHeight: 44 }} onClick={() => toggleReads(an)}>
                        {openReadsId === an.id ? 'Ẩn danh sách' : 'Xem từng gia đình'}
                      </button>
                    </div>
                    <ReadsList ann={an} />
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NHẮC VIỆC */}
      {seg === 'reminders' && (
        <div className="tp-rem-grid">
          <div className="tg-glass" style={{ ...styles.card, padding: 18 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 700, color: 'var(--s-text)' }}>
              Cô soạn nhắc việc
            </h4>
            <p style={{ fontSize: 13.5, color: 'var(--s-text-2)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              Thẻ hiện trên màn chính của phụ huynh từ trưa hôm trước tới trưa ngày áp dụng. Phụ huynh bấm "Đã nhắc con" là xong.
            </p>

            <div style={{ marginBottom: 12 }}>
              <span style={styles.fieldLabel}>
                Mẫu soạn nhanh
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {REMINDER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className={`tp-chip ${selectedTemplate === tpl.id ? 'tp-on' : ''}`}
                    aria-pressed={selectedTemplate === tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                  >
                    <ReminderIcon id={tpl.id} />
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.fieldLabel} htmlFor="tp-reminder-text">
                Lời nhắc (sửa chỗ trong ngoặc nhọn)
              </label>
              <textarea
                id="tp-reminder-text"
                style={{ ...styles.input, minHeight: 70, fontSize: 14, lineHeight: 1.5 }}
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={styles.fieldLabel}>
                Áp dụng cho ngày
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {quickDates.map((qd) => (
                  <button
                    key={qd.date}
                    type="button"
                    className={`tp-chip ${selectedDate === qd.date ? 'tp-on' : ''}`}
                    aria-pressed={selectedDate === qd.date}
                    onClick={() => setSelectedDate(qd.date)}
                  >
                    {qd.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16, padding: '6px 12px', background: 'rgba(255, 255, 255, 0.62)', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.85)' }}>
              <TToggle checked={attachAssignment} onChange={setAttachAssignment} label="Gắn với bài đã giao" />
              {attachAssignment && (
                <div style={{ margin: '4px 0 8px' }}>
                  {classAssignments.length === 0 ? (
                    <span style={{ fontSize: 13, color: 'var(--s-text-2)' }}>Lớp chưa có bài tập nào.</span>
                  ) : (
                    <Select
                      ariaLabel="Bài đã giao"
                      value={selectedAssignmentId}
                      onChange={(v) => setSelectedAssignmentId(v)}
                      options={classAssignments.map((asg) => ({ value: asg.id, label: `${asg.title} (${asg.subject || 'Toán'})` }))}
                    />
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 13, gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: reachedLimit ? 'var(--s-bad)' : 'var(--s-text-2)', fontWeight: 700 }}>
                Ngày này đã có {remindersForDate}/{MAX_REMINDERS_PER_DAY} lời nhắc
              </span>
              <span style={{ color: 'var(--s-text-2)' }}>Tối đa {MAX_REMINDERS_PER_DAY} lời nhắc mỗi ngày</span>
            </div>

            <button
              type="button"
              onClick={handleSendReminder}
              disabled={reachedLimit || sending}
              style={{ ...styles.primaryBtn, width: '100%', minHeight: 48, fontSize: 15, opacity: reachedLimit || sending ? 0.6 : 1, cursor: reachedLimit || sending ? 'not-allowed' : 'pointer' }}
            >
              <Send size={16} />
              <span>{sending ? 'Đang gửi...' : hasFamilyCount ? `Gửi cho ${familyCount} gia đình` : 'Gửi cho cả lớp'}</span>
            </button>
          </div>

          <div>
            <SectionTitle>Theo dõi tình trạng nhắc con</SectionTitle>

            {loading ? (
              <TeacherCardSkeleton count={2} />
            ) : reminders.length === 0 ? (
              <EmptyState
                title="Chưa có lời nhắc việc"
                description="Lời nhắc cô gửi sẽ hiện ở đây kèm số gia đình đã đọc và đã nhắc con."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reminders.map((rem) => (
                  <div key={rem.id} className="tg-glass" style={{ ...styles.card, padding: 16, boxShadow: 'inset 4px 0 0 #13A89E, var(--tg-shadow)' }}>
                    <b style={{ fontSize: 15, color: 'var(--s-text)', display: 'block', lineHeight: 1.45 }}>{rem.body}</b>
                    <span style={{ fontSize: 13, color: 'var(--s-text-2)', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <CalendarDays size={15} aria-hidden="true" />
                      Áp dụng: {rem.remind_for ? fmtDate(rem.remind_for) : 'chưa đặt ngày'}{rem.assignment_id ? ' · Có kèm bài tập' : ''}
                    </span>

                    <div className="tp-stat3" style={{ margin: '10px 0' }}>
                      <div><b>{Number(rem.read_count) || 0}</b><span>đã đọc</span></div>
                      <div><b style={{ color: 'var(--s-ok)' }}>{Number(rem.done_count) || 0}</b><span>đã nhắc con</span></div>
                      <div><b>{hasFamilyCount ? familyCount : '·'}</b><span>{hasFamilyCount ? 'gia đình' : 'chưa có dữ liệu'}</span></div>
                    </div>

                    <button type="button" style={{ ...styles.linkBtn, minHeight: 44 }} onClick={() => toggleReads(rem)}>
                      {openReadsId === rem.id ? 'Ẩn danh sách' : 'Xem từng gia đình'}
                    </button>
                    <ReadsList ann={rem} />

                    <p style={{ fontSize: 12.5, color: 'var(--s-text-2)', margin: '6px 0 0 0' }}>
                      Cô chỉ thấy trạng thái đọc và đã nhắc. Không thấy dữ liệu học, ảnh hay trò chuyện của gia đình.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. CLASS SETTINGS TAB
// ---------------------------------------------------------------------------
function TeacherClassSettingsTab({ token, classId, cls, onUpdated }) {
  const [joinMode, setJoinMode] = useState(cls.join_mode || 'code_and_claim');
  const [defaultDueDays, setDefaultDueDays] = useState(cls.default_due_days || 1);
  const [shareTeacherAnswer, setShareTeacherAnswer] = useState(cls.share_teacher_answer === 0 || cls.share_teacher_answer === '0' ? 0 : 1);
  const [saving, setSaving] = useState(false);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/settings`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinMode, defaultDueDays, shareTeacherAnswer }),
      });
      if (res.ok) {
        toast('Đã lưu cài đặt lớp', 'success');
        onUpdated();
      }
    } catch {
      toast('Lỗi lưu cài đặt', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRotateCode() {
    if (!(await appConfirm('Mã cũ sẽ không còn dùng để vào lớp được nữa.', { title: 'Tạo mã lớp mới?', okText: 'Tạo mã mới' }))) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/classes/${classId}/rotate-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        toast(`Mã lớp mới: ${d.joinCode}`, 'success');
        onUpdated();
      }
    } catch {
      toast('Lỗi tạo mã mới', 'error');
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="tg-glass" style={styles.card}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: 17, fontWeight: 700, color: 'var(--s-text)' }}>Cài đặt {formatClassName(cls.name) || 'lớp học'}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={styles.label}>Cách thức kết nối học sinh</label>
            <Select
              ariaLabel="Cách thức kết nối học sinh"
              value={joinMode}
              onChange={(v) => setJoinMode(v)}
              options={[
                { value: 'code_and_claim', label: 'Mã lớp chung và mã riêng từng em' },
                { value: 'claim_only', label: 'Chỉ mã riêng (tắt mã chung)' },
              ]}
            />
          </div>

          <div>
            <label style={styles.label}>Hạn nộp bài mặc định khi tạo bài tập</label>
            <Select ariaLabel="Hạn nộp bài mặc định" value={Number(defaultDueDays)} onChange={(v) => setDefaultDueDays(Number(v))} options={DUE_OPTIONS} />
          </div>

          <div>
            <label style={styles.label}>Gửi đáp án của cô cho phụ huynh</label>
            <Select ariaLabel="Gửi đáp án của cô cho phụ huynh" value={Number(shareTeacherAnswer)} onChange={(v) => setShareTeacherAnswer(Number(v))} options={SHARE_ANSWER_OPTIONS} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <button style={styles.primaryBtn} onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
            <button style={styles.secondaryBtn} onClick={handleRotateCode}>
              <RefreshCw size={16} /> Đổi mã lớp mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. TEACHER SETTINGS SCREEN ("CÀI ĐẶT CỦA CÔ")
// ---------------------------------------------------------------------------
function TeacherSettingsScreen({ token, teacher, onUpdateSuccess, onLogout, wallpaper = 'garden', onWallpaper = () => {} }) {
  const [methodNotes, setMethodNotes] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('word_problem_multistep');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/method-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setMethodNotes(d.notes || []);
      }
    } catch {
      toast('Lỗi tải thư viện phương pháp', 'error');
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newNote.trim()) return;
    if (newNote.trim().length > 300) {
      toast('Ghi chú tối đa 300 ký tự', 'warn');
      return;
    }
    setAddingNote(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/teacher/method-notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim(), problemType: newType, note: newNote.trim() }),
      });
      if (res.ok) {
        toast('Đã lưu cách cô dạy vào thư viện', 'success');
        setNewTitle('');
        setNewNote('');
        loadNotes();
      }
    } catch {
      toast('Lỗi lưu phương pháp', 'error');
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDeleteNote(id) {
    if (!(await appConfirm('Xoá phương pháp này khỏi thư viện của cô?', { danger: true }))) return;
    try {
      await fetch(`${API_BASE}/api/v1/teacher/method-notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast('Đã xoá', 'info');
      loadNotes();
    } catch {
      toast('Lỗi xoá', 'error');
    }
  }

  const accountRows = [
    ['Họ tên', formatTeacherName(teacher.display_name)],
    ['Trường', teacher.school_name],
    ['Tỉnh, thành phố', teacher.province],
    ['Email', teacher.email],
    ['Số điện thoại', teacher.phone],
    ['Khối dạy', formatGrades(teacher.grades)],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');

  return (
    <div style={{ maxWidth: 760 }}>
      <TeacherHero
        eyebrow={formatTeacherName(teacher.display_name)}
        title="Cài đặt của cô"
        desc="Thư viện cách cô dạy, hình nền và thông tin tài khoản"
      />

      {/* Thư viện "Cách cô dạy" */}
      <div className="tg-glass" style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={styles.iconTile} aria-hidden="true"><Sparkles size={20} /></span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--s-text)', lineHeight: 1.35 }}>Thư viện "Cách cô dạy" (dùng lại khi soạn bài)</h3>
        </div>

        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div className="tp-form-2">
            <input
              style={styles.input}
              aria-label="Tên phương pháp"
              placeholder="Tên phương pháp: ví dụ Sơ đồ đoạn thẳng toán 2 bước"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Select ariaLabel="Dạng bài" value={newType} onChange={(v) => setNewType(v)} options={PROBLEM_TYPE_OPTIONS} />
          </div>
          <div>
            <textarea
              style={{ ...styles.input, minHeight: 88 }}
              placeholder="Nội dung cách dạy (tối đa 300 ký tự): ví dụ Vẽ sơ đồ đoạn thẳng, chưa dùng phép nhân..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              maxLength={300}
              required
            />
            <span style={{ fontSize: 12.5, color: 'var(--s-text-2)' }}>{newNote.length}/300 ký tự</span>
          </div>
          <button type="submit" disabled={addingNote} style={{ ...styles.primaryBtn, alignSelf: 'flex-start', minHeight: 44 }}>
            <Plus size={18} /> Thêm vào thư viện
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {methodNotes.length === 0 && (
            <p style={{ fontSize: 13.5, color: 'var(--s-text-2)', margin: 0 }}>Thư viện chưa có cách dạy nào. Cô thêm một cách để dùng lại khi soạn bài.</p>
          )}
          {methodNotes.map((n) => (
            <div key={n.id} style={styles.noteItem}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 14, color: 'var(--s-text)' }}>{n.title}</strong>
                {(PROBLEM_TYPE_OPTIONS.find((o) => o.value === (n.problem_type || n.problemType)) || null) && (
                  <span style={{ ...styles.statusBadgeDraft, marginLeft: 6 }}>
                    {PROBLEM_TYPE_OPTIONS.find((o) => o.value === (n.problem_type || n.problemType)).label}
                  </span>
                )}
                <p style={{ fontSize: 13.5, color: 'var(--s-text-2)', margin: '4px 0 0 0', lineHeight: 1.45 }}>{n.note}</p>
              </div>
              <button type="button" className="tg-icon-btn tg-danger" aria-label={`Xoá ${n.title}`} onClick={() => handleDeleteNote(n.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hình nền cổng giáo viên: lưu riêng trên máy này */}
      <div className="tg-glass" style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={styles.iconTile} aria-hidden="true"><ImageIcon size={20} /></span>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--s-text)' }}>Hình nền</h3>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--s-text-2)', margin: '0 0 12px' }}>Chỉ đổi trên máy này, không ảnh hưởng phụ huynh hay máy khác.</p>
        <WallpaperPicker value={wallpaper} onChange={onWallpaper} />
      </div>

      {/* Hồ sơ giáo viên: dòng nào trống thì ẩn */}
      <div className="tg-glass" style={styles.card}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: 'var(--s-text)' }}>Thông tin tài khoản</h3>
        <dl style={{ margin: 0 }}>
          {accountRows.map(([k, v]) => (
            <div key={k} style={styles.accountRow}>
              <dt style={{ color: 'var(--s-text-2)', fontWeight: 600 }}>{k}</dt>
              <dd style={{ margin: 0, color: 'var(--s-text)', fontWeight: 600, overflowWrap: 'anywhere', textAlign: 'right' }}>{v}</dd>
            </div>
          ))}
        </dl>

        <div style={{ marginTop: 16 }}>
          <button style={{ ...styles.secondaryBtn, minHeight: 44 }} onClick={onLogout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

// Khối dạy có thể lưu dạng chuỗi "Khối 3", số 3, hoặc mảng JSON [3,4]
function formatGrades(g) {
  if (g === null || g === undefined) return '';
  let v = g;
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return '';
    if (t.startsWith('[')) {
      try { v = JSON.parse(t); } catch { return t; }
    } else {
      return /^\d+$/.test(t) ? `Khối ${t}` : t;
    }
  }
  if (Array.isArray(v)) {
    const list = v.map((x) => String(x).replace(/^khối\s*/i, '').trim()).filter(Boolean);
    return list.length ? `Khối ${list.join(', ')}` : '';
  }
  return typeof v === 'number' ? `Khối ${v}` : String(v);
}

const GLASS = {
  background: 'var(--tg-glass, rgba(255, 255, 255, 0.7))',
  border: '1px solid var(--tg-glass-line, rgba(255, 255, 255, 0.72))',
  backdropFilter: 'var(--tg-blur, blur(24px) saturate(1.5))',
  WebkitBackdropFilter: 'var(--tg-blur, blur(24px) saturate(1.5))',
  boxShadow: 'var(--tg-shadow, 0 10px 40px rgba(20, 45, 50, 0.16))',
};
const PILL = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12.5,
  fontWeight: 700,
  padding: '3px 10px',
  borderRadius: 999,
  whiteSpace: 'nowrap',
  lineHeight: 1.4,
};

// ---------------------------------------------------------------------------
// STYLES: CỔNG GIÁO VIÊN KIỂU KÍNH MỜ (29/10/2026, xanh ngọc như admin; màu nền ảnh ở teacher-glass.css)
// ---------------------------------------------------------------------------
const styles = {
  sectionHeading: {
    fontFamily: 'var(--s-font-head)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--s-text)',
    margin: '0 0 4px 0',
  },
  sectionSub: {
    fontSize: 13.5,
    color: 'var(--s-text-2)',
    margin: 0,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: '#E3F6F3',
    color: '#0B7C74',
  },
  classCard: {
    ...GLASS,
    borderRadius: 18,
    padding: 20,
    cursor: 'pointer',
    minWidth: 0,
  },
  gradeBadge: {
    ...PILL,
    color: '#0A6A63',
    backgroundColor: '#E3F6F3',
    border: '1px solid #BFE5DF',
    marginBottom: 6,
  },
  className: {
    fontFamily: 'var(--s-font-head)',
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--s-text)',
    margin: '2px 0 0',
    letterSpacing: '-0.01em',
  },
  joinCodeBox: {
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    padding: '6px 12px',
    borderRadius: 12,
    border: '1.5px dashed #13A89E',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  classStatsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 18px',
    margin: '14px 0',
    paddingTop: 12,
    borderTop: '1px solid rgba(20, 45, 50, 0.1)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'var(--s-text-2)',
  },
  pendingBadge: {
    backgroundColor: '#FFF1E6',
    color: '#8A4300',
    padding: '8px 12px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    border: '1px solid #F7C9A3',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
    paddingTop: 4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid rgba(20, 45, 50, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    color: 'var(--s-text-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    backgroundColor: '#0B7C74',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 999,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    boxShadow: '0 6px 16px rgba(11, 124, 116, 0.25)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    color: '#0A6A63',
    border: '1px solid rgba(20, 45, 50, 0.14)',
    borderRadius: 999,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dangerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    backgroundColor: '#FFF1F0',
    color: '#B42318',
    border: '1px solid #F5C2BC',
    borderRadius: 999,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondarySmallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    backgroundColor: '#E3F6F3',
    color: '#0A6A63',
    border: '1px solid #BFE5DF',
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 13.5,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  card: {
    ...GLASS,
    borderRadius: 18,
    padding: 20,
  },
  statusBadgeActive: {
    ...PILL,
    color: '#05603A',
    backgroundColor: '#E7F8EF',
    border: '1px solid #A6E3C2',
  },
  statusBadgeDraft: {
    ...PILL,
    color: '#33484D',
    backgroundColor: '#EEF3F2',
    border: '1px solid #D2DEDC',
  },
  statusBadgePending: {
    ...PILL,
    color: '#8A4300',
    backgroundColor: '#FFF1E6',
    border: '1px solid #F7C9A3',
  },
  statusBadgeRejected: {
    ...PILL,
    color: '#B42318',
    backgroundColor: '#FFF1F0',
    border: '1px solid #F5C2BC',
  },
  statusBadgeExpired: {
    ...PILL,
    color: '#B42318',
    backgroundColor: '#FFF1F0',
    border: '1px solid #F5C2BC',
  },
  pinnedBadge: {
    ...PILL,
    color: '#0A6A63',
    backgroundColor: '#E3F6F3',
    border: '1px solid #BFE5DF',
  },
  ackBadge: {
    ...PILL,
    color: '#33484D',
    backgroundColor: '#EEF3F2',
    border: '1px solid #D2DEDC',
  },
  tableCard: {
    ...GLASS,
    borderRadius: 18,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    background: 'transparent',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#33484D',
    borderBottom: '1px solid rgba(20, 45, 50, 0.1)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    color: 'var(--s-text)',
    borderBottom: '1px solid rgba(20, 45, 50, 0.06)',
    verticalAlign: 'middle',
  },
  codePill: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontWeight: 700,
    fontSize: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    color: '#14262B',
    border: '1px solid #D6E4E1',
    padding: '3px 9px',
    borderRadius: 999,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  childChangedBadge: {
    ...PILL,
    marginLeft: 6,
    color: '#8A4300',
    backgroundColor: '#FFF1E6',
    border: '1px solid #F7C9A3',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    backgroundColor: '#E3F6F3',
    color: '#0A6A63',
    border: '1px solid #BFE5DF',
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  noteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    padding: '10px 10px 10px 14px',
    borderRadius: 14,
    border: '1px solid rgba(255, 255, 255, 0.9)',
  },
  itemBox: {
    backgroundColor: '#F3F8F7',
    borderRadius: 14,
    padding: 12,
    border: '1px solid #D6E4E1',
    marginBottom: 10,
  },
  accountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 16,
    padding: '10px 0',
    fontSize: 14,
    borderBottom: '1px solid rgba(20, 45, 50, 0.08)',
  },
  authWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '24px 16px 40px',
    boxSizing: 'border-box',
  },
  authCard: {
    ...GLASS,
    borderRadius: 22,
    padding: '26px 24px 18px',
    width: '100%',
    maxWidth: 460,
    boxSizing: 'border-box',
  },
  authTitle: {
    fontFamily: 'var(--s-font-head)',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.3,
    color: 'var(--s-text)',
    margin: '0 0 4px 0',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#33484D',
    marginBottom: 6,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#33484D',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 44,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid rgba(20, 45, 50, 0.16)',
    fontSize: 14.5,
    color: '#14262B',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#0A6A63',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: 0,
  },
  infoBox: {
    backgroundColor: 'rgba(227, 246, 243, 0.9)',
    border: '1px solid #BFE5DF',
    borderRadius: 14,
    padding: 12,
    fontSize: 13.5,
    color: '#0F4F4A',
    lineHeight: 1.5,
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
