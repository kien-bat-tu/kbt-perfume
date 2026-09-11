import { CreditCard, Landmark, Save, WalletCards, Zap } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { saveBankAccountSettings, subscribeBankAccountSettings } from '../../services/paymentService'
import type { BankAccountSettings } from '../../types/payment'

const emptySettings: BankAccountSettings = {
  bankName: 'Vietcombank',
  accountNumber: '',
  accountHolder: '',
  transferNote: 'KBT Perfume - [Mã đơn hàng]',
  bankTransferEnabled: true,
  sepayApiKey: '',
  vnpayTmnCode: '',
  vnpayHashSecret: '',
  vnpayEndpoint: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnpayCallbackUrl: 'http://127.0.0.1:5000/payments/vnpay/callback',
  vnpayEnabled: false,
  momoPartnerCode: '',
  momoAccessKey: '',
  momoSecretKey: '',
  momoEndpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
  momoCallbackUrl: 'http://127.0.0.1:5000/payments/momo/callback',
  momoIpnUrl: 'http://127.0.0.1:5000/payments/momo/callback',
  momoEnabled: false,
}

const bankOptions = [
  { name: 'Vietcombank', short: 'VCB', color: '#1747c3' },
  { name: 'MB Bank', short: 'MB', color: '#f59e0b' },
  { name: 'Techcombank', short: 'TCB', color: '#0f766e' },
  { name: 'TPBank', short: 'TPB', color: '#2563eb' },
  { name: 'VPBank', short: 'VPB', color: '#7c3aed' },
  { name: 'ACB', short: 'ACB', color: '#dc2626' },
  { name: 'Sacombank', short: 'SCB', color: '#0ea5e9' },
  { name: 'VIB', short: 'VIB', color: '#0891b2' },
  { name: 'VietCapital Bank', short: 'VC', color: '#ea580c' },
  { name: 'Eximbank', short: 'EIB', color: '#a16207' },
  { name: 'SHB', short: 'SHB', color: '#16a34a' },
  { name: 'BaoViet Bank', short: 'BVB', color: '#475569' },
  { name: 'Nam A Bank', short: 'NAB', color: '#b91c1c' },
  { name: 'VietABank', short: 'VAB', color: '#0284c7' },
  { name: 'ViettinBank', short: 'VTB', color: '#111827' },
]

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState<BankAccountSettings>(emptySettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastSavedSettings, setLastSavedSettings] = useState<BankAccountSettings>(emptySettings)

  const selectedBank = useMemo(
    () => bankOptions.find((bank) => bank.name === settings.bankName) ?? bankOptions[0],
    [settings.bankName],
  )

  useEffect(() => {
    const unsubscribe = subscribeBankAccountSettings((loaded) => {
      if (loaded) {
        const nextSettings = { ...emptySettings, ...loaded }
        setSettings(nextSettings)
        setLastSavedSettings(nextSettings)
      } else {
        setSettings(emptySettings)
        setLastSavedSettings(emptySettings)
      }
      setErrorMessage('')
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')
    setErrorMessage('')

    try {
      const nextSettings = {
        ...settings,
        bankName: settings.bankName.trim(),
        accountNumber: settings.accountNumber.trim(),
        accountHolder: settings.accountHolder.trim(),
        transferNote: settings.transferNote.trim(),
      }

      await saveBankAccountSettings(nextSettings)
      setSettings(nextSettings)
      setLastSavedSettings(nextSettings)
      setMessage('Đã lưu thông tin tài khoản ngân hàng.')
    } catch {
      setErrorMessage('Không thể lưu. Hãy kiểm tra quyền admin trong Firebase.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="payment-settings-page">
      <div className="payment-settings-shell">
        <section className="payment-settings-panel">
          <div className="payment-settings-card">
            <h1 className="payment-settings-title">Cài đặt thanh toán</h1>
            <p className="payment-settings-subtitle">
              Quản lý tài khoản nhận chuyển khoản và mã QR của cửa hàng.
            </p>

            {isLoading ? (
              <div className="empty-state-card">Đang tải cấu hình...</div>
            ) : (
              <form className="payment-settings-form" onSubmit={handleSubmit}>
                <label className="field-group field-group-inline">
                  <span className="field-label field-label-bolt"><Zap size={15} /> SePay Webhook API Key</span>
                  <input
                    type="text"
                    value={settings.sepayApiKey ?? ''}
                    onChange={(event) => setSettings((current) => ({ ...current, sepayApiKey: event.target.value }))}
                    className="payment-settings-key-input"
                  />
                </label>

                <p className="payment-settings-note">Dùng để SePay gửi thông báo tiền vào an toàn tới website.</p>

                <div className="input-row two-col">
                  <label className="field-group">
                    <span className="field-label field-label-bank"><Landmark size={15} /> Ngân hàng</span>
                    <div className="bank-select-wrap">
                      <span className="selected-bank-icon" style={{ background: selectedBank.color }}>
                        {selectedBank.short}
                      </span>
                      <select
                        value={settings.bankName}
                        onChange={(event) => setSettings((current) => ({ ...current, bankName: event.target.value }))}
                        aria-label="Chọn ngân hàng"
                      >
                        {bankOptions.map((bank) => (
                          <option key={bank.name} value={bank.name}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="field-group">
                    <span className="field-label field-label-bank">Số tài khoản</span>
                    <input
                      value={settings.accountNumber}
                      onChange={(event) => setSettings((current) => ({ ...current, accountNumber: event.target.value }))}
                      inputMode="numeric"
                      placeholder="0338532423"
                      required
                    />
                  </label>
                </div>

                <p className="payment-settings-note">Danh sách có thể cuộn để chọn ngân hàng.</p>

                <label className="field-group">
                  <span className="field-label">Tên chủ tài khoản</span>
                  <input
                    value={settings.accountHolder}
                    onChange={(event) => setSettings((current) => ({ ...current, accountHolder: event.target.value }))}
                    placeholder="NGUYEN TRUNG KIEN"
                    required
                  />
                </label>

                <label className="field-group checkbox-field">
                  <input
                    type="checkbox"
                    checked={settings.bankTransferEnabled ?? true}
                    onChange={(event) => setSettings((current) => ({ ...current, bankTransferEnabled: event.target.checked }))}
                  />
                  <span>Cho phép thanh toán bằng QR ngân hàng</span>
                </label>

                <section className="payment-provider-section">
                  <h2><CreditCard size={18} /> VNPay</h2>
                  <div className="input-row two-col">
                    <label className="field-group">
                      <span className="field-label">Mã website / TMN Code</span>
                      <input value={settings.vnpayTmnCode ?? ''} onChange={(event) => setSettings((current) => ({ ...current, vnpayTmnCode: event.target.value }))} />
                    </label>
                    <label className="field-group">
                      <span className="field-label">Hash Secret</span>
                      <input type="password" value={settings.vnpayHashSecret ?? ''} onChange={(event) => setSettings((current) => ({ ...current, vnpayHashSecret: event.target.value }))} />
                    </label>
                  </div>
                  <div className="input-row two-col">
                    <label className="field-group">
                      <span className="field-label">Endpoint thanh toán</span>
                      <input value={settings.vnpayEndpoint ?? ''} onChange={(event) => setSettings((current) => ({ ...current, vnpayEndpoint: event.target.value }))} />
                      <small>Sandbox VNPay chuẩn.</small>
                    </label>
                    <label className="field-group">
                      <span className="field-label">URL callback</span>
                      <input value={settings.vnpayCallbackUrl ?? ''} onChange={(event) => setSettings((current) => ({ ...current, vnpayCallbackUrl: event.target.value }))} />
                    </label>
                  </div>
                  <label className="field-group checkbox-field">
                    <input type="checkbox" checked={settings.vnpayEnabled ?? false} onChange={(event) => setSettings((current) => ({ ...current, vnpayEnabled: event.target.checked }))} />
                    <span>Cho phép khách hàng thanh toán qua VNPay</span>
                  </label>
                </section>

                <section className="payment-provider-section">
                  <h2><WalletCards size={18} /> MoMo</h2>
                  <div className="input-row two-col">
                    <label className="field-group">
                      <span className="field-label">Partner Code</span>
                      <input value={settings.momoPartnerCode ?? ''} onChange={(event) => setSettings((current) => ({ ...current, momoPartnerCode: event.target.value }))} />
                    </label>
                    <label className="field-group">
                      <span className="field-label">Access Key</span>
                      <input value={settings.momoAccessKey ?? ''} onChange={(event) => setSettings((current) => ({ ...current, momoAccessKey: event.target.value }))} />
                    </label>
                  </div>
                  <div className="input-row two-col">
                    <label className="field-group">
                      <span className="field-label">Secret Key</span>
                      <input type="password" value={settings.momoSecretKey ?? ''} onChange={(event) => setSettings((current) => ({ ...current, momoSecretKey: event.target.value }))} />
                    </label>
                    <label className="field-group">
                      <span className="field-label">Endpoint tạo giao dịch</span>
                      <input value={settings.momoEndpoint ?? ''} onChange={(event) => setSettings((current) => ({ ...current, momoEndpoint: event.target.value }))} />
                      <small>Sandbox MoMo chuẩn.</small>
                    </label>
                  </div>
                  <div className="input-row two-col">
                    <label className="field-group">
                      <span className="field-label">URL callback</span>
                      <input value={settings.momoCallbackUrl ?? ''} onChange={(event) => setSettings((current) => ({ ...current, momoCallbackUrl: event.target.value }))} />
                    </label>
                    <label className="field-group">
                      <span className="field-label">URL IPN</span>
                      <input value={settings.momoIpnUrl ?? ''} onChange={(event) => setSettings((current) => ({ ...current, momoIpnUrl: event.target.value }))} />
                    </label>
                  </div>
                  <label className="field-group checkbox-field">
                    <input type="checkbox" checked={settings.momoEnabled ?? false} onChange={(event) => setSettings((current) => ({ ...current, momoEnabled: event.target.checked }))} />
                    <span>Cho phép khách hàng thanh toán qua MoMo</span>
                  </label>
                </section>

                {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
                {message && <p className="success-inline">{message}</p>}

                <div className="payment-settings-actions">
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    <Save size={17} />
                    {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                  <button className="secondary-button" type="button" onClick={() => { setSettings(lastSavedSettings); setMessage('') }}>
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
