with open('src/admin/InfraErrorsPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_kpis = """      <div className="sys-kpis">
        <KpiCard label="Lượt gọi AI hôm nay" value={usage?.aiCalls ? fmtNumber(usage.aiCalls.total) : null} sub={usage?.aiCalls ? `${fmtNumber(usage.aiCalls.failed)} lượt lỗi` : ''} tone={usage?.aiCalls?.failed ? 'warn' : 'ok'} />
        <KpiCard label="Neuron AI hôm nay" value={neurons ? fmtNumber(neurons.used) : null} sub={neurons ? `trên ${fmtNumber(neurons.limit)} mỗi ngày` : ''} tone={neuronPct >= WARN_PCT ? 'warn' : 'default'} />
        <KpiCard label="Dung lượng D1" value={d1 ? fmtBytes(d1.bytes) : null} sub={d1 ? `trên ${fmtBytes(d1.limit)}` : ''} />
        <KpiCard label="Lỗi người dùng 24 giờ" value={usage?.clientErrors ? fmtNumber(usage.clientErrors.last24h) : null} sub={usage?.clientErrors ? `${fmtNumber(usage.clientErrors.total)} dấu lỗi đang giữ` : ''} tone={usage?.clientErrors?.last24h ? 'bad' : 'ok'} />
      </div>"""

new_kpis = """      <div className="sys-kpis">
        <KpiCard label="Lượt gọi AI hôm nay" value={usage?.aiCalls ? fmtNumber(usage.aiCalls.total) : null} sub={usage?.aiCalls ? `${fmtNumber(usage.aiCalls.failed)} lượt lỗi` : ''} tone={usage?.aiCalls?.failed ? 'warn' : 'ok'} />
        <KpiCard label="Neuron AI hôm nay" value={neurons ? fmtNumber(neurons.used) : null} sub={neurons ? `trên ${fmtNumber(neurons.limit)} mỗi ngày` : ''} tone={neuronPct >= WARN_PCT ? 'warn' : 'default'} />
        <KpiCard label="Chấm vở: Đọc ảnh" value={usage?.workChecks ? `${usage.workChecks.rate}%` : '100%'} sub={usage?.workChecks ? `${fmtNumber(usage.workChecks.ok)}/${fmtNumber(usage.workChecks.total)} ảnh đọc rõ` : 'Tỉ lệ đọc rõ ảnh vở'} tone={usage?.workChecks && usage.workChecks.rate < 80 ? 'warn' : 'ok'} />
        <KpiCard label="Dung lượng D1" value={d1 ? fmtBytes(d1.bytes) : null} sub={d1 ? `trên ${fmtBytes(d1.limit)}` : ''} />
        <KpiCard label="Lỗi người dùng 24 giờ" value={usage?.clientErrors ? fmtNumber(usage.clientErrors.last24h) : null} sub={usage?.clientErrors ? `${fmtNumber(usage.clientErrors.total)} dấu lỗi đang giữ` : ''} tone={usage?.clientErrors?.last24h ? 'bad' : 'ok'} />
      </div>"""

assert old_kpis in code, 'old_kpis not matched in InfraErrorsPage.jsx'
code = code.replace(old_kpis, new_kpis, 1)

with open('src/admin/InfraErrorsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated InfraErrorsPage.jsx successfully!')
