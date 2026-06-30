import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  Download,
  Edit3,
  FileText,
  Home,
  Image as ImageIcon,
  Loader2,
  Play,
  Plus,
  Search,
  Settings,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import './index.css'

type View = 'home' | 'offlineInput' | 'apiInput' | 'personas' | 'run' | 'report' | 'history' | 'settings'
type Language = 'zh' | 'en'

type ProductInput = {
  reportTitle: string
  productUrl: string
  competitorUrls: string
  researchNotes: string
  productName: string
  category: string
  price: string
  dimensions: string
  material: string
  sellingPoints: string
  targetAudience: string
  competitors: string
  knownWeaknesses: string
  images: ProductImage[]
}

type ProductImage = {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  addedAt: string
}

type Persona = {
  id: string
  ageRange: string
  occupation: string
  incomeTier: string
  residence: string
  family: string
  habits: string
  priceSensitivity: string
  concerns: string[]
}

type PersonaResult = {
  persona_id: string
  purchase_intent_score: number
  likely_to_buy: boolean
  positive_points: string[]
  negative_points: string[]
  price_reaction: string
  usage_scenario: string
  main_objection: string
  possible_bad_review_reason: string
  suggested_improvement: string
  image_expectation: string
  image_purchase_impact: string
  image_consistency_feedback: string
  listing_copy_suggestion: string
  confidence_score: number
}

type ReportSummary = {
  overall_purchase_intent: number
  top_positive_points: string[]
  top_negative_risks: string[]
  best_target_customers: string[]
  weak_target_customers: string[]
  price_sensitivity_summary: string
  product_optimization_suggestions: string[]
  listing_title_direction: string
  bullet_points_direction: string[]
  main_image_suggestions: string[]
  aplus_image_suggestions: string[]
  image_feedback_summary: string[]
  competitor_asin_comparison?: string[]
  qa_suggestions: string[]
  final_operator_summary: string
  metadata?: ResearchMetadata
}

type ResearchMetadata = {
  engine?: string
  model?: string
  fallback_enabled?: boolean
  category_template?: {
    id: string
    name: string
    confidence: number
    matched_keywords: string[]
    decision_dimensions: string[]
    risk_lenses: string[]
    report_modules: string[]
    operator_questions: string[]
  }
  sampling?: {
    pool_size: number
    sample_size: number
    selected_persona_ids: string[]
    reason: string
    segment_mix?: {
      price_sensitivity?: Record<string, number>
      age_range?: Record<string, number>
      family_keywords?: Record<string, number>
    }
    top_relevance_reasons?: Array<{
      persona_id: string
      score: number
      reason: string
    }>
  }
}

type Report = {
  id: number
  projectId: number
  title: string
  createdAt: string
  product: ProductInput
  personaResults?: PersonaResult[]
  summary: ReportSummary
}

type SettingsState = {
  apiKey: string
  baseUrl: string
  model: string
  engineMode: 'offline' | 'api-enhanced'
}

type ProgressState = {
  stage: string
  progress: number
  activePersonaIds: string[]
}

const emptyProduct: ProductInput = {
  reportTitle: '',
  productUrl: '',
  competitorUrls: '',
  researchNotes: '',
  productName: '',
  category: '',
  price: '',
  dimensions: '',
  material: '',
  sellingPoints: '',
  targetAudience: '',
  competitors: '',
  knownWeaknesses: '',
  images: [],
}

const maxProductImages = 9
const maxImageBytes = 2.5 * 1024 * 1024

const navItems = [
  { view: 'home' as const, label: { zh: '首页', en: 'Home' }, icon: Home },
  { view: 'offlineInput' as const, label: { zh: '离线规则调研', en: 'Offline Research' }, icon: Database },
  { view: 'apiInput' as const, label: { zh: 'API 增强调研', en: 'API Research' }, icon: Sparkles },
  { view: 'personas' as const, label: { zh: 'Persona 样本池', en: 'Personas' }, icon: Users },
  { view: 'history' as const, label: { zh: '历史报告', en: 'History' }, icon: Archive },
  { view: 'settings' as const, label: { zh: '运行设置', en: 'Settings' }, icon: Settings },
]

const stageLabel: Record<string, { zh: string; en: string }> = {
  queued: { zh: '建立项目与样本队列', en: 'Preparing project and persona queue' },
  offline_rules: { zh: '离线规则引擎正在分析', en: 'Offline rule engine is analyzing' },
  calling_ai: { zh: 'AI 正在生成结构化反馈', en: 'AI is generating structured feedback' },
  saving: { zh: '写入本地 SQLite', en: 'Saving to local SQLite' },
  done: { zh: '调研完成', en: 'Research complete' },
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function scoreTone(score: number) {
  if (score >= 4) return 'text-emerald-700 bg-emerald-50'
  if (score >= 3) return 'text-blue-700 bg-blue-50'
  return 'text-rose-700 bg-rose-50'
}

function priceSensitivityLabel(value: string, language: Language) {
  const labels: Record<string, { zh: string; en: string }> = {
    'Very high': { zh: '很高', en: 'Very high' },
    High: { zh: '高', en: 'High' },
    Medium: { zh: '中', en: 'Medium' },
    Low: { zh: '低', en: 'Low' },
  }
  return labels[value]?.[language] || value
}

function extractAsin(value: string) {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /[?&]asin=([A-Z0-9]{10})(?:&|$)/i,
    /\b([A-Z0-9]{10})\b/i,
  ]
  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match) return match[1].toUpperCase()
  }
  return ''
}

function parseLinkLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({ url, asin: extractAsin(url) }))
}

function uniqueAsinsFromLinks(links: Array<{ asin: string }>) {
  return [...new Set(links.map((item) => item.asin).filter(Boolean))]
}

const personaZh: Record<string, string> = {
  'Remote software support specialist': '远程软件支持专员',
  'Elementary school teacher': '小学教师',
  'Nurse manager': '护士主管',
  'Graduate student': '研究生',
  'Independent contractor': '自由承包商',
  'Fitness studio owner': '健身工作室老板',
  'Warehouse supervisor': '仓库主管',
  'Marketing analyst': '市场分析师',
  'Retired military administrator': '退休军队行政人员',
  'Small e-commerce seller': '小型电商卖家',
  'Restaurant server': '餐厅服务员',
  'HR director': '人力资源总监',
  'Home improvement store associate': '家装店员工',
  'Graphic designer': '平面设计师',
  Accountant: '会计',
  'New parent and part-time consultant': '新手父母/兼职顾问',
  'Entry-level retail associate': '初级零售员工',
  'Real estate agent': '房地产经纪人',
  'Police dispatcher': '警务调度员',
  'Corporate travel manager': '企业差旅经理',
  'Amazon Prime-heavy parent': 'Amazon Prime 高频家长用户',
  'Urban renter and pet owner': '城市租房养宠用户',
  'Suburban DIY hobbyist': '郊区 DIY 爱好者',
  'College dorm resident': '大学宿舍住户',
  'Boutique hotel manager': '精品酒店经理',
  'Home office professional': '居家办公专业人士',
  'Budget-focused retiree': '预算敏感退休人士',
  'First apartment shopper': '首次租房购物者',
  'Interior design enthusiast': '室内设计爱好者',
  'Military spouse': '军人配偶',
  'Part-time rideshare driver': '兼职网约车司机',
  'Airbnb host': 'Airbnb 房东',
  'New homeowner': '新房主',
  'Busy medical resident': '忙碌的住院医生',
  'Fitness-focused apartment renter': '重视健身的公寓租客',
  'Minimalist condo owner': '极简风公寓业主',
  'Coupon-driven household shopper': '优惠券驱动型家庭买家',
  'Tech-savvy early adopter': '技术敏感型早期用户',
  'Eco-conscious buyer': '环保意识买家',
  'Gift shopper': '礼品购买者',
  'Garage organizer': '车库收纳用户',
  'Craft room owner': '手工房用户',
  'Remote sales manager': '远程销售经理',
  'Single parent': '单亲家长',
  'Warehouse associate': '仓库员工',
  'Frequent mover': '频繁搬家用户',
  'Luxury apartment renter': '高端公寓租客',
  'Community college instructor': '社区大学讲师',
  'Home daycare owner': '家庭托育经营者',
  'Weekend renovator': '周末装修爱好者',
  'Small-space furniture buyer': '小空间家具买家',
  'Senior caregiver': '老人照护者',
  'Outdoor recreation buyer': '户外休闲买家',
  'Beauty salon owner': '美容沙龙老板',
  'Rental property owner': '出租房业主',
  'Office administrator': '办公室行政',
  'Apartment maintenance worker': '公寓维修人员',
  'Pet rescue volunteer': '宠物救助志愿者',
  'Newly married shopper': '新婚购物者',
  'Basement apartment renter': '地下室公寓租客',
  'Single, no children': '单身，无子女',
  'Married, no children': '已婚，无子女',
  'Married, one child': '已婚，一个孩子',
  'Married, two children': '已婚，两个孩子',
  'Married, three children': '已婚，三个孩子',
  'Single parent, one child': '单亲，一个孩子',
  'Lives with roommates': '与室友同住',
  'Lives with partner': '与伴侣同住',
  'Retired couple': '退休夫妻',
  'Multi-generational household': '多代同堂家庭',
  'Empty nest': '空巢家庭',
  Single: '单身',
  'Single, roommates': '单身，与室友同住',
  'Married, infant': '已婚，有婴儿',
  'Partnered, no children': '有伴侣，无子女',
  'Partnered, no children at home': '有伴侣，家中无子女',
  'Married, grandchildren visit': '已婚，孙辈偶尔来访',
  'Married, empty nest': '已婚，空巢',
  'Single, frequent traveler': '单身，经常出差',
  'Divorced, adult child': '离异，有成年子女',
  durability: '耐用性',
  'setup effort': '安装难度',
  'return policy': '退货政策',
  safety: '安全性',
  cleanability: '易清洁',
  'kid-friendly design': '儿童友好设计',
  reliability: '可靠性',
  warranty: '质保',
  'ease of maintenance': '维护便利性',
  'space saving': '节省空间',
  'low price': '低价格',
  'multi-use value': '多用途价值',
  sturdiness: '稳固性',
  'clear photos': '清晰图片',
  'customer support': '客服支持',
  aesthetics: '美观度',
  materials: '材质',
  'brand credibility': '品牌可信度',
  'breakage risk': '破损风险',
  'size accuracy': '尺寸准确性',
  'value pack options': '套装价值',
  'visual fit': '视觉适配',
  'brand trust': '品牌信任',
  'social proof': '社会证明',
  instructions: '说明书',
  comfort: '舒适度',
  'long-term use': '长期使用',
  'claim proof': '卖点证据',
  'spec detail': '规格细节',
  'packaging quality': '包装质量',
  discounts: '折扣',
  portability: '便携性',
  'fast shipping': '快速配送',
  'time savings': '节省时间',
  'family fit': '家庭适配',
  'safe materials': '安全材质',
  'material thickness': '材质厚度',
  'tool-free setup': '免工具安装',
  'real dimensions': '真实尺寸',
  'color options': '颜色选项',
  texture: '质感',
  'photographic honesty': '图片真实性',
  'price justification': '价格合理性',
  'replacement parts': '替换件',
  'non-toxic materials': '无毒材质',
  noise: '噪音',
  'trend appeal': '流行感',
  'status fit': '身份匹配',
  presentation: '展示效果',
  giftability: '送礼属性',
  'shipping damage': '运输损坏',
  ruggedness: '耐造性',
  'support response': '客服响应',
  'clear use case': '明确使用场景',
  'premium feel': '高级感',
  'coupon value': '优惠券价值',
  'easy returns': '退货便利性',
  'review consistency': '评论一致性',
  'comparison detail': '对比细节',
  'storage fit': '收纳适配',
  'Buys tech and home items after reading comparison charts': '阅读对比表后购买科技和家居产品',
  'Shops during sales, values practical family use': '喜欢促销期购物，重视家庭实用性',
  'Pays more for proven quality and clear instructions': '愿意为可靠品质和清晰说明多付费',
  'Compares TikTok, Amazon reviews, and Reddit before buying': '购买前会比较 TikTok、Amazon 评论和 Reddit 讨论',
  'Likes simple products that solve concrete problems': '喜欢能解决具体问题的简单产品',
  'Buys premium products when design looks credible': '当设计和呈现可信时愿意买高端产品',
  'Reads negative reviews first and avoids fragile products': '先看差评，避免易碎产品',
  'Responds to clean visuals and concise benefit claims': '对清晰视觉和简洁利益点反应更好',
  'Prefers familiar designs and plain language': '偏好熟悉设计和直白表达',
  'Knows marketplace tactics and distrusts vague claims': '了解平台套路，不信模糊卖点',
  'Buys when photos quickly show real-life use': '图片能快速展示真实使用场景时更容易购买',
  'Values premium convenience and low friction': '重视高级便利性和低操作门槛',
  'Judges products by specs and practical construction': '根据规格和实际结构判断产品',
  'Cares about design coherence and lifestyle photos': '关注设计一致性和生活方式图片',
  'Compares total cost, warranty, and long-term value': '比较总成本、质保和长期价值',
  'Prioritizes safety and convenience over novelty': '安全和便利优先于新奇感',
  'Buys visually appealing products with strong discounts': '容易被高颜值和强折扣打动',
  'Likes polished presentation and premium cues': '喜欢精致呈现和高端线索',
  'Prefers reliable, no-nonsense products with strong ratings': '偏好可靠、直接、评分强的产品',
  'Needs products to be compact, fast to understand, and easy to store': '需要紧凑、易理解、易收纳的产品',
  'Reads negative reviews first and compares photos carefully': '先读差评，并仔细比较图片',
  'Buys mostly during Prime Day, coupons, and seasonal sales': '主要在 Prime Day、优惠券和季节促销时购买',
  'Watches short product videos before deciding': '决策前会看短视频',
  'Prefers products with simple setup and clear dimensions': '偏好安装简单、尺寸清晰的产品',
  'Pays more when materials and warranty look credible': '材质和质保可信时愿意多付费',
  'Needs compact products that do not clutter small spaces': '需要不占小空间的紧凑产品',
  'Prioritizes safety, cleanability, and family use': '优先考虑安全、清洁和家庭使用',
  'Compares Amazon, Walmart, Target, and Reddit opinions': '会比较 Amazon、Walmart、Target 和 Reddit 观点',
  'Trusts lifestyle images only when details look realistic': '只有细节真实时才信任生活方式图',
  'Returns products quickly when claims feel exaggerated': '卖点夸张时会快速退货',
}

function personaText(value: string, language: Language) {
  if (language === 'en') return value
  return personaZh[value] || value
}

function personaResidence(value: string, language: Language) {
  if (language === 'en') return value
  return value
    .replace('Rents apartment in', '租住公寓，位于')
    .replace('Owns suburban townhouse in', '拥有郊区联排住宅，位于')
    .replace('Owns single-family home in', '拥有独栋住宅，位于')
    .replace('Shared apartment in', '合租公寓，位于')
    .replace('Owns home in', '拥有住宅，位于')
    .replace('Condo in', '公寓，位于')
    .replace('Suburban rental house in', '郊区租住房，位于')
    .replace('Urban apartment in', '城市公寓，位于')
    .replace('Owns ranch-style home in', '拥有牧场式住宅，位于')
    .replace('Townhome in', '联排住宅，位于')
    .replace('Apartment in', '公寓，位于')
    .replace('Small-town home in', '小镇住宅，位于')
    .replace('Loft apartment in', 'Loft 公寓，位于')
    .replace('Suburban home in', '郊区住宅，位于')
    .replace('Single-family home in', '独栋住宅，位于')
    .replace('Lives with parents in', '与父母同住，位于')
    .replace('Rural home in', '乡村住宅，位于')
    .replace('Studio apartment in', '单间公寓，位于')
    .replace('Duplex in', '双拼住宅，位于')
    .replace('Rowhouse in', '排屋，位于')
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  )
}

function Section({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="panel">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function ListBlock({ items, tone = 'neutral' }: { items?: string[]; tone?: 'neutral' | 'risk' | 'good' }) {
  const marker =
    tone === 'risk' ? 'bg-rose-500' : tone === 'good' ? 'bg-emerald-500' : 'bg-blue-500'
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []
  if (!safeItems.length) {
    return <p className="paragraph">旧报告没有保存这个字段。重新运行调研后会生成这一项。</p>
  }
  return (
    <ul className="space-y-2">
      {safeItems.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ResearchPlanPanel({ metadata }: { metadata?: ResearchMetadata }) {
  if (!metadata?.category_template && !metadata?.sampling) return null

  const template = metadata.category_template
  const sampling = metadata.sampling
  const confidence = template?.confidence ? `${Math.round(template.confidence * 100)}%` : '未知'
  const priceMix = sampling?.segment_mix?.price_sensitivity || {}

  return (
    <section className="research-plan-panel">
      <div className="research-plan-main">
        <div>
          <p className="kicker">研究计划</p>
          <h2>{template?.name || '通用产品模板'}</h2>
          <p>{sampling?.reason || '系统根据产品输入选择最相关的 persona 子样本，而不是平均跑完整个样本池。'}</p>
        </div>
        <div className="research-plan-stats">
          <span>识别置信度 <b>{confidence}</b></span>
          <span>样本池 <b>{sampling?.pool_size || '-'}</b></span>
          <span>本次抽样 <b>{sampling?.sample_size || '-'}</b></span>
        </div>
      </div>

      <div className="research-plan-grid">
        <div>
          <h3>决策维度</h3>
          <div className="tag-list">
            {(template?.decision_dimensions || []).map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div>
          <h3>风险镜头</h3>
          <div className="tag-list risk">
            {(template?.risk_lenses || []).map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div>
          <h3>价格敏感度分布</h3>
          <div className="mix-list">
            {Object.entries(priceMix).map(([key, value]) => (
              <span key={key}>{key}: <b>{value}</b></span>
            ))}
          </div>
        </div>
        <div>
          <h3>抽样理由 Top 5</h3>
          <div className="reason-list">
            {(sampling?.top_relevance_reasons || []).slice(0, 5).map((item) => (
              <p key={item.persona_id}><b>{item.persona_id}</b>{item.reason}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app-language') as Language) || 'zh')
  const [product, setProduct] = useState<ProductInput>(emptyProduct)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [activeReport, setActiveReport] = useState<Report | null>(null)
  const [settings, setSettings] = useState<SettingsState>({
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    engineMode: 'offline',
  })
  const [progress, setProgress] = useState<ProgressState>({ stage: 'queued', progress: 0, activePersonaIds: [] })
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingReportTitle, setEditingReportTitle] = useState(false)
  const [reportTitleDraft, setReportTitleDraft] = useState('')

  const tr = (zh: string, _en: string) => zh
  const pTr = (zh: string, en: string) => language === 'zh' ? zh : en

  function switchLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage)
    localStorage.setItem('app-language', nextLanguage)
  }

  useEffect(() => {
    window.researchApi.init().then((data) => {
      setSettings(data.settings)
      setPersonas(data.personas)
      const initialReports = data.reports as Report[]
      setReports(initialReports)
      setActiveReport(initialReports[0] || null)
    })

    return window.researchApi.onProgress((payload) => {
      setProgress(payload)
    })
  }, [])

  useEffect(() => {
    setReportTitleDraft(activeReport?.title || '')
    setEditingReportTitle(false)
  }, [activeReport?.id, activeReport?.title])

  const completedReports = reports.length
  const averageIntent = useMemo(() => {
    if (!reports.length) return 0
    const total = reports.reduce((sum, report) => sum + Number(report.summary.overall_purchase_intent || 0), 0)
    return Number((total / reports.length).toFixed(1))
  }, [reports])

  async function refreshReports(nextSearch = search) {
    const data = await window.researchApi.listReports(nextSearch)
    const typedReports = data as Report[]
    setReports(typedReports)
    return typedReports
  }

  async function saveApiSettings() {
    setBusy(true)
    setError('')
    try {
      const saved = await window.researchApi.saveSettings(settings)
      setSettings(saved)
      setNotice('运行设置已保存到本地 SQLite。')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) return

    const currentImages = product.images || []
    const selected = Array.from(files).filter((file) => file.type.startsWith('image/'))
    const availableSlots = maxProductImages - currentImages.length

    if (availableSlots <= 0) {
      setError(`最多只能上传 ${maxProductImages} 张产品图片。`)
      return
    }

    const accepted = selected.slice(0, availableSlots)
    const oversized = accepted.find((file) => file.size > maxImageBytes)
    if (oversized) {
      setError(`图片 ${oversized.name} 超过 2.5MB。请先压缩后再上传。`)
      return
    }

    try {
      const images = await Promise.all(accepted.map(readProductImage))
      setProduct({ ...product, images: [...currentImages, ...images] })
      setNotice(`已添加 ${images.length} 张产品图片。`)
      if (selected.length > accepted.length) {
        setError(`最多保存 ${maxProductImages} 张图片，超出的图片已忽略。`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  function removeProductImage(imageId: string) {
    setProduct({
      ...product,
      images: (product.images || []).filter((image) => image.id !== imageId),
    })
  }

  function readProductImage(file: File): Promise<ProductImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: String(reader.result),
          addedAt: new Date().toISOString(),
        })
      }
      reader.onerror = () => reject(new Error(`读取图片失败：${file.name}`))
      reader.readAsDataURL(file)
    })
  }

  async function runResearch(engineMode: 'offline' | 'api-enhanced') {
    if (engineMode === 'offline' && (!product.productName.trim() || !product.category.trim())) {
      setError('离线规则调研至少需要产品名称和类目。')
      return
    }
    if (engineMode === 'api-enhanced' && (!product.productUrl.trim() || !product.category.trim())) {
      setError('API 增强调研至少需要亚马逊产品链接和类目。')
      return
    }
    if (engineMode === 'api-enhanced' && !settings.apiKey.trim()) {
      setError('API 增强调研需要先在运行设置中保存 API Key。')
      setView('settings')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')
    setProgress({ stage: 'queued', progress: 4, activePersonaIds: [] })
    setView('run')
    await new Promise((resolve) => setTimeout(resolve, 80))

    try {
      const result = await window.researchApi.runResearch(product, engineMode)
      setActiveReport(result.report as Report)
      const nextReports = await refreshReports('')
      setReports(nextReports)
      setSearch('')
      setView('report')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setView(engineMode === 'api-enhanced' ? 'apiInput' : 'offlineInput')
    } finally {
      setBusy(false)
    }
  }

  async function openReport(reportId: number) {
    const report = await window.researchApi.getReport(reportId)
    setActiveReport(report as Report)
    setView('report')
  }

  async function removeReport(reportId: number) {
    await window.researchApi.deleteReport(reportId)
    const nextReports = await refreshReports()
    if (activeReport?.id === reportId) setActiveReport(nextReports[0] || null)
  }

  async function saveReportTitle() {
    if (!activeReport) return
    const title = reportTitleDraft.trim()
    if (!title) {
      setError('报告名称不能为空。')
      return
    }
    setBusy(true)
    setError('')
    try {
      const updated = await window.researchApi.renameReport(activeReport.id, title)
      setActiveReport(updated as Report)
      await refreshReports('')
      setEditingReportTitle(false)
      setNotice('报告名称已更新。')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function exportActiveReportExcel() {
    if (!activeReport) return
    setBusy(true)
    setError('')
    try {
      const result = await window.researchApi.exportReportExcel(activeReport.id)
      if (!result.canceled) setNotice(`Excel 报告已导出：${result.filePath}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  function renderHome() {
    const latest = reports.slice(0, 3)
    return (
      <main className="content">
        <div className="hero-strip">
          <div>
            <p className="kicker">{tr('美国虚拟买家调研模拟器', 'US Virtual Buyer Research Simulator')}</p>
            <h1>{tr(`用 ${personas.length || 100} 个结构化 persona 快速暴露新品风险。`, `Use ${personas.length || 100} structured personas to expose new-product risks.`)}</h1>
            <p className="hero-copy">
              {tr('本工具只生成运营调研假设，用于 Listing、A+ 图片、定价和差评风险预判；不能用于生成或伪造真实亚马逊评论。', 'This tool generates operational research hypotheses for listings, A+ images, pricing, and bad-review risk prediction. It must not be used to generate or fake Amazon reviews.')}
            </p>
          </div>
          <button className="primary-button" onClick={() => setView('apiInput')}>
            <Plus size={18} />
            {tr('新建 API 调研', 'New API research')}
          </button>
        </div>

        <div className="mode-grid mb-4">
          <button className="mode-card" type="button" onClick={() => setView('offlineInput')}>
            <strong>{tr('离线规则调研', 'Offline rule research')}</strong>
            <span>{tr('不需要 Key。适合你还没有链接、只有产品概念和图片时，先做早期风险筛查。', 'No key required. Use it for early risk screening when you only have a concept and product images.')}</span>
          </button>
          <button className="mode-card" type="button" onClick={() => setView('apiInput')}>
            <strong>{tr('API 增强调研', 'API-enhanced research')}</strong>
            <span>{tr('支持粘贴亚马逊产品链接和竞品链接，把 ASIN、链接和补充说明交给模型分析。', 'Paste Amazon product and competitor links; ASINs, URLs, and notes are sent to the model for analysis.')}</span>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="metric-card">
            <FileText size={20} />
            <span>{tr('历史报告', 'Reports')}</span>
            <strong>{completedReports}</strong>
          </div>
          <div className="metric-card">
            <Users size={20} />
            <span>{tr('内置 persona', 'Built-in personas')}</span>
            <strong>{personas.length}</strong>
          </div>
          <div className="metric-card">
            <Sparkles size={20} />
            <span>{tr('平均购买意向', 'Avg intent')}</span>
            <strong>{averageIntent || '-'}</strong>
          </div>
        </div>

        <Section title={tr('最近调研', 'Recent research')} action={<button className="ghost-button" onClick={() => setView('history')}>{tr('查看全部', 'View all')}</button>}>
          {latest.length ? (
            <div className="space-y-3">
              {latest.map((report) => (
                <button key={report.id} className="report-row" onClick={() => openReport(report.id)}>
                  <div>
                    <strong>{report.title}</strong>
                    <span>{report.product.category} · {formatDate(report.createdAt)}</span>
                  </div>
                  <span className={`score-pill ${scoreTone(report.summary.overall_purchase_intent)}`}>
                    {report.summary.overall_purchase_intent}/5
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Database size={26} />
              <p>{tr('还没有历史报告。先创建一个产品调研，系统会自动保存结果。', 'No reports yet. Create a product research project and the result will be saved automatically.')}</p>
            </div>
          )}
        </Section>
      </main>
    )
  }

  function renderImageSection(title = '产品图片', description = '支持 JPG、PNG、WebP。MVP 会保存图片并用于报告参考；暂不做视觉识别。') {
    return (
      <Section
        title={title}
        action={<span className="section-note">{(product.images || []).length}/{maxProductImages} 张</span>}
      >
        <label className="image-upload">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              handleImageUpload(event.target.files)
              event.currentTarget.value = ''
            }}
          />
          <Upload size={20} />
          <strong>上传产品图、主图草稿或竞品参考图</strong>
          <span>{description}</span>
        </label>

        {(product.images || []).length > 0 && (
          <div className="image-grid">
            {product.images.map((image) => (
              <figure className="image-thumb" key={image.id}>
                <img src={image.dataUrl} alt={image.name} />
                <figcaption>
                  <span>{image.name}</span>
                  <button type="button" onClick={() => removeProductImage(image.id)} aria-label="移除图片">
                    <X size={15} />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>
    )
  }

  function renderOfflineInput() {
    return (
      <main className="content">
        <div className="page-head">
          <div>
            <p className="kicker">{tr('离线规则调研', 'Offline rule research')}</p>
            <h1>{tr('没有 API Key，也能先跑产品风险判断。', 'Run product risk screening without an API key.')}</h1>
            <p className="hero-copy">{tr('适合新品概念阶段。系统会用 persona 权重、价格敏感度、卖点、缺点和图片数量生成结构化报告。', 'Best for early concepts. The system uses persona weighting, price sensitivity, selling points, weaknesses, and image count to generate a structured report.')}</p>
          </div>
          <button className="primary-button" onClick={() => runResearch('offline')} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            {tr('运行离线调研', 'Run offline research')}
          </button>
        </div>

        <Section title={tr('产品基础信息', 'Product basics')}>
          <div className="form-grid">
            <Field label="报告名称（可选）" value={product.reportTitle} onChange={(value) => setProduct({ ...product, reportTitle: value })} placeholder="例如：梳妆台 85.99 美元首轮调研" />
            <Field label={tr('产品名称', 'Product name')} value={product.productName} onChange={(value) => setProduct({ ...product, productName: value })} placeholder={tr('例如：可折叠厨房收纳架', 'Example: folding kitchen storage rack')} />
            <Field label={tr('亚马逊类目', 'Amazon category')} value={product.category} onChange={(value) => setProduct({ ...product, category: value })} placeholder="Home & Kitchen / Storage" />
            <Field label={tr('目标售价', 'Target price')} value={product.price} onChange={(value) => setProduct({ ...product, price: value })} placeholder="$29.99" />
            <Field label={tr('尺寸/规格', 'Dimensions/specs')} value={product.dimensions} onChange={(value) => setProduct({ ...product, dimensions: value })} placeholder={tr('长宽高、容量、重量', 'L/W/H, capacity, weight')} />
            <Field label={tr('材质', 'Material')} value={product.material} onChange={(value) => setProduct({ ...product, material: value })} placeholder={tr('例如：ABS + 不锈钢', 'Example: ABS + stainless steel')} />
            <Field label={tr('目标人群', 'Target audience')} value={product.targetAudience} onChange={(value) => setProduct({ ...product, targetAudience: value })} placeholder={tr('例如：小户型家庭、租房人群', 'Example: small apartments, renters')} />
          </div>
        </Section>

        <Section
          title="产品图片"
          action={<span className="section-note">{(product.images || []).length}/{maxProductImages} 张</span>}
        >
          <label className="image-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                handleImageUpload(event.target.files)
                event.currentTarget.value = ''
              }}
            />
            <Upload size={20} />
            <strong>上传产品图、主图草稿或竞品参考图</strong>
            <span>支持 JPG、PNG、WebP。MVP 会保存图片并用于报告参考；暂不做视觉识别。</span>
          </label>

          {(product.images || []).length > 0 && (
            <div className="image-grid">
              {product.images.map((image) => (
                <figure className="image-thumb" key={image.id}>
                  <img src={image.dataUrl} alt={image.name} />
                  <figcaption>
                    <span>{image.name}</span>
                    <button type="button" onClick={() => removeProductImage(image.id)} aria-label="移除图片">
                      <X size={15} />
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </Section>

        <Section title={tr('运营判断输入', 'Operator inputs')}>
          <div className="form-grid">
            <Field multiline label={tr('核心卖点', 'Core selling points')} value={product.sellingPoints} onChange={(value) => setProduct({ ...product, sellingPoints: value })} placeholder={tr('逐条写清楚，不要只写“高品质”。', 'Write concrete points line by line; avoid vague claims like “high quality”.')} />
            <Field multiline label={tr('竞品信息', 'Competitor notes')} value={product.competitors} onChange={(value) => setProduct({ ...product, competitors: value })} placeholder={tr('竞品价格、差评点、主图风格、卖点结构。', 'Competitor price, bad-review points, image style, claim structure.')} />
            <Field multiline label={tr('已知缺点', 'Known weaknesses')} value={product.knownWeaknesses} onChange={(value) => setProduct({ ...product, knownWeaknesses: value })} placeholder={tr('如实写。隐藏缺点只会让调研结论变弱。', 'Be honest. Hiding weaknesses weakens the research output.')} />
          </div>
        </Section>
      </main>
    )
  }

  function renderApiInput() {
    const productAsin = extractAsin(product.productUrl)
    const competitorLinks = parseLinkLines(product.competitorUrls)
    const competitorAsins = uniqueAsinsFromLinks(competitorLinks)

    return (
      <main className="content">
        <div className="page-head">
          <div>
            <p className="kicker">{tr('API 增强调研', 'API-enhanced research')}</p>
            <h1>{tr('粘贴亚马逊产品链接和竞品链接。', 'Paste Amazon product and competitor links.')}</h1>
            <p className="hero-copy">{tr('MVP 会解析链接和 ASIN 并交给模型分析；不会抓取亚马逊页面内容。若要自动读取标题、价格、评分，后续需要接 Amazon PA-API 或稳定的数据服务。', 'The MVP parses URLs and ASINs for model analysis. It does not scrape Amazon pages. Automatic title, price, and rating lookup requires PA-API or a stable product data service later.')}</p>
          </div>
          <button className="primary-button" onClick={() => runResearch('api-enhanced')} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            {tr('运行 API 增强调研', 'Run API research')}
          </button>
        </div>

        <Section title={tr('亚马逊链接', 'Amazon links')}>
          <div className="form-grid">
            <Field label="报告名称（可选）" value={product.reportTitle} onChange={(value) => setProduct({ ...product, reportTitle: value })} placeholder="例如：竞品链接调研 - 梳妆台" />
            <Field label={tr('产品链接', 'Product URL')} value={product.productUrl} onChange={(value) => setProduct({ ...product, productUrl: value })} placeholder="https://www.amazon.com/dp/ASIN" />
            <Field label={tr('亚马逊类目', 'Amazon category')} value={product.category} onChange={(value) => setProduct({ ...product, category: value })} placeholder="Home & Kitchen / Vanities" />
            <Field label={tr('产品名称（可选）', 'Product name (optional)')} value={product.productName} onChange={(value) => setProduct({ ...product, productName: value })} placeholder={tr('链接无法提供标题时，用这里补充', 'Use this if the link does not provide a title')} />
            <Field label={tr('目标人群（可选）', 'Target audience (optional)')} value={product.targetAudience} onChange={(value) => setProduct({ ...product, targetAudience: value })} placeholder={tr('例如：小户型、租房、宿舍、女性用户', 'Example: small apartments, renters, dorms, women buyers')} />
            <Field multiline label={tr('竞品链接', 'Competitor URLs')} value={product.competitorUrls} onChange={(value) => setProduct({ ...product, competitorUrls: value })} placeholder={tr('每行一个 Amazon 竞品链接。系统会解析 ASIN 和域名，作为模型对比输入。', 'One Amazon competitor URL per line. The app parses ASINs and domains for model context.')} />
            <Field multiline label={tr('补充说明', 'Research notes')} value={product.researchNotes} onChange={(value) => setProduct({ ...product, researchNotes: value })} placeholder={tr('你已经知道的竞品差评、价格带、主图问题、想验证的假设。', 'Known competitor complaints, price bands, image issues, or hypotheses to test.')} />
          </div>
          <div className="link-preview">
            <div>
              <strong>{tr('产品 ASIN', 'Product ASIN')}</strong>
              <span>{product.productUrl ? productAsin || tr('未识别到 ASIN，请检查链接格式', 'No ASIN detected. Check the URL format.') : tr('等待粘贴产品链接', 'Waiting for product URL')}</span>
            </div>
            <div>
              <strong>{tr('竞品链接', 'Competitor URLs')}</strong>
              <span>{competitorLinks.length ? tr(`${competitorLinks.length} 条，已识别 ${competitorLinks.filter((item) => item.asin).length} 个 ASIN`, `${competitorLinks.length} links, ${competitorLinks.filter((item) => item.asin).length} ASINs detected`) : tr('等待粘贴竞品链接', 'Waiting for competitor URLs')}</span>
            </div>
            {competitorAsins.length > 0 && (
              <div>
                <strong>竞品 ASIN</strong>
                <div className="tag-row compact-tags">
                  {competitorAsins.map((asin) => <span key={asin}>{asin}</span>)}
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title={tr('可选补充字段', 'Optional details')}>
          <div className="form-grid">
            <Field label={tr('目标售价', 'Target price')} value={product.price} onChange={(value) => setProduct({ ...product, price: value })} placeholder="$85.99" />
            <Field label={tr('尺寸/规格', 'Dimensions/specs')} value={product.dimensions} onChange={(value) => setProduct({ ...product, dimensions: value })} placeholder={tr('长宽高、容量、重量', 'L/W/H, capacity, weight')} />
            <Field label={tr('材质', 'Material')} value={product.material} onChange={(value) => setProduct({ ...product, material: value })} placeholder={tr('例如：工程木、金属框架', 'Example: engineered wood, metal frame')} />
            <Field label={tr('已知缺点', 'Known weaknesses')} value={product.knownWeaknesses} onChange={(value) => setProduct({ ...product, knownWeaknesses: value })} placeholder={tr('例如：没有色温调节、安装复杂', 'Example: no color-temperature control, complex assembly')} />
          </div>
        </Section>

        {renderImageSection(tr('参考图片', 'Reference images'), tr('上传产品图、主图草稿或竞品参考图。API 模式会尝试把图片交给支持视觉的模型；不支持时退回文本分析。', 'Upload product images, main-image drafts, or competitor references. API mode attempts vision-model inspection and falls back to text-only analysis when unsupported.'))}
      </main>
    )
  }

  function renderPersonas() {
    return (
      <main className="content">
        <div className="page-head">
          <div>
            <p className="kicker">{pTr('样本池', 'Persona Pool')}</p>
            <h1>{pTr(`本地内置 ${personas.length} 个美国虚拟消费者。`, `${personas.length} built-in US virtual consumers.`)}</h1>
            <p className="hero-copy">{pTr('覆盖不同年龄、职业、收入、家庭结构、居住环境、消费习惯和价格敏感度。', 'Covers different ages, jobs, income tiers, household types, living situations, shopping habits, and price sensitivity.')}</p>
          </div>
          <div className="language-switch persona-language-switch" aria-label="Persona language switch">
            <button className={language === 'zh' ? 'selected' : ''} onClick={() => switchLanguage('zh')} type="button">中文</button>
            <button className={language === 'en' ? 'selected' : ''} onClick={() => switchLanguage('en')} type="button">EN</button>
          </div>
        </div>
        <div className="persona-grid">
          {personas.map((persona) => (
            <article className="persona-card" key={persona.id}>
              <div className="persona-card-head">
                <div className="persona-avatar">{persona.id.replace('US-', '')}</div>
                <div className="persona-title">
                  <strong>{persona.id}</strong>
                  <p>{persona.ageRange} · {personaText(persona.occupation, language)}</p>
                </div>
                <span className="tag sensitivity-tag">
                  <span>{pTr('价格敏感度', 'Price sensitivity')}</span>
                  {priceSensitivityLabel(persona.priceSensitivity, language)}
                </span>
              </div>
              <dl>
                <dt>{pTr('收入', 'Income')}</dt>
                <dd>{persona.incomeTier}</dd>
                <dt>{pTr('居住', 'Residence')}</dt>
                <dd>{personaResidence(persona.residence, language)}</dd>
                <dt>{pTr('家庭', 'Family')}</dt>
                <dd>{personaText(persona.family, language)}</dd>
                <dt>{pTr('消费习惯', 'Shopping habit')}</dt>
                <dd>{personaText(persona.habits, language)}</dd>
              </dl>
              <p className="persona-concern-title">{pTr('购买关注点', 'Purchase concerns')}</p>
              <div className="tag-row">
                {persona.concerns.map((concern) => <span key={concern}>{personaText(concern, language)}</span>)}
              </div>
            </article>
          ))}
        </div>
      </main>
    )
  }

  function renderRun() {
    const active = new Set(progress.activePersonaIds)
    return (
      <main className="content">
        <div className="run-panel">
          <div className="run-header">
            <Brain size={34} />
            <div>
              <p className="kicker">{tr('调研运行中', 'Research running')}</p>
              <h1>{stageLabel[progress.stage]?.[language] || tr('准备中', 'Preparing')}</h1>
            </div>
          </div>
          <div className="progress-track">
            <div style={{ width: `${progress.progress}%` }} />
          </div>
          <p className="text-sm text-slate-600">{tr(`当前进度 ${progress.progress}% · 结果会生成结构化 JSON，并保存到本地 SQLite 作为历史样本。`, `Progress ${progress.progress}% · Results are generated as structured JSON and saved to local SQLite as historical samples.`)}</p>
        </div>

        <div className="persona-grid compact">
          {personas.map((persona) => (
            <div className={`persona-status ${active.has(persona.id) ? 'active' : ''}`} key={persona.id}>
              {active.has(persona.id) ? <Loader2 className="animate-spin" size={16} /> : <Clock3 size={16} />}
              <span>{persona.id}</span>
              <small>{persona.occupation}</small>
            </div>
          ))}
        </div>
      </main>
    )
  }

  function renderReport() {
    if (!activeReport) {
      return (
        <main className="content">
          <div className="empty-state">
            <FileText size={28} />
            <p>没有可展示的报告。</p>
          </div>
        </main>
      )
    }
    const summary = activeReport.summary
    const personaResults = activeReport.personaResults || []
    return (
      <main className="content">
        <div className="page-head">
          <div>
            <p className="kicker">{tr('报告', 'Report')}</p>
            {editingReportTitle ? (
              <div className="report-title-editor">
                <input
                  value={reportTitleDraft}
                  onChange={(event) => setReportTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') saveReportTitle()
                    if (event.key === 'Escape') {
                      setReportTitleDraft(activeReport.title)
                      setEditingReportTitle(false)
                    }
                  }}
                  autoFocus
                />
                <button className="icon-button" onClick={saveReportTitle} disabled={busy} aria-label="保存报告名称">
                  <Save size={16} />
                </button>
              </div>
            ) : (
              <div className="report-title-line">
                <h1>{activeReport.title}</h1>
                <button className="icon-button" onClick={() => setEditingReportTitle(true)} aria-label="修改报告名称">
                  <Edit3 size={16} />
                </button>
              </div>
            )}
            <p className="hero-copy">{activeReport.product.category} · {formatDate(activeReport.createdAt)}</p>
          </div>
          <div className="report-actions">
            <button className="ghost-button" onClick={exportActiveReportExcel} disabled={busy}>
              <Download size={17} />
              导出 Excel
            </button>
            <button className="ghost-button" onClick={() => setView(activeReport.product.productUrl ? 'apiInput' : 'offlineInput')}>
              <Plus size={17} />
              {tr('再做一次', 'Run again')}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="metric-card large">
            <span>{tr('购买意向评分', 'Purchase intent')}</span>
            <strong>{summary.overall_purchase_intent}/5</strong>
          </div>
          <div className="metric-card large">
            <span>{tr('可能购买人数', 'Likely buyers')}</span>
            <strong>{personaResults.filter((item) => item.likely_to_buy).length || '-'}</strong>
          </div>
          <div className="metric-card large">
            <span>{tr('样本规模', 'Sample size')}</span>
            <strong>{personaResults.length || personas.length}</strong>
          </div>
        </div>

        <ResearchPlanPanel metadata={summary.metadata} />

        {(activeReport.product.images || []).length > 0 && (
          <Section title={tr('产品图片', 'Product images')} action={<span className="section-note">{tr(`${activeReport.product.images.length} 张已保存`, `${activeReport.product.images.length} saved`)}</span>}>
            <div className="image-grid report-images">
              {activeReport.product.images.map((image) => (
                <figure className="image-thumb" key={image.id}>
                  <img src={image.dataUrl} alt={image.name} />
                  <figcaption>
                    <ImageIcon size={14} />
                    <span>{image.name}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        <div className="report-grid">
          <Section title={tr('好评点汇总', 'Positive drivers')}><ListBlock tone="good" items={summary.top_positive_points} /></Section>
          <Section title={tr('差评风险汇总', 'Bad-review risks')}><ListBlock tone="risk" items={summary.top_negative_risks} /></Section>
          <Section title={tr('最佳目标人群', 'Best target customers')}><ListBlock items={summary.best_target_customers} /></Section>
          <Section title={tr('弱目标人群', 'Weak target customers')}><ListBlock tone="risk" items={summary.weak_target_customers} /></Section>
          <Section title={tr('价格反馈', 'Price feedback')}><p className="paragraph">{summary.price_sensitivity_summary}</p></Section>
          <Section title={tr('产品优化建议', 'Product improvements')}><ListBlock items={summary.product_optimization_suggestions} /></Section>
          <Section title={tr('Listing 标题方向', 'Listing title direction')}><p className="paragraph">{summary.listing_title_direction}</p></Section>
          <Section title={tr('五点描述方向', 'Bullet direction')}><ListBlock items={summary.bullet_points_direction} /></Section>
          <Section title={tr('主图建议', 'Main image suggestions')}><ListBlock items={summary.main_image_suggestions} /></Section>
          <Section title={tr('A+ 图片建议', 'A+ image suggestions')}><ListBlock items={summary.aplus_image_suggestions} /></Section>
          <Section title="买家图片评价"><ListBlock items={summary.image_feedback_summary} /></Section>
          <Section title="竞品 ASIN 对比"><ListBlock items={summary.competitor_asin_comparison} /></Section>
          <Section title={tr('QA 问题预测', 'QA predictions')}><ListBlock items={summary.qa_suggestions} /></Section>
          <Section title={tr('运营结论', 'Operator summary')}><p className="paragraph strong">{summary.final_operator_summary}</p></Section>
        </div>

        {personaResults.length > 0 && (
          <Section title={tr('Persona 明细', 'Persona details')}>
            <div className="space-y-3">
              {personaResults.map((item) => (
                <details key={item.persona_id} className="detail-row">
                  <summary>
                    <span>{item.persona_id}</span>
                    <span className={`score-pill ${scoreTone(item.purchase_intent_score)}`}>{item.purchase_intent_score}/5</span>
                    <span>{item.likely_to_buy ? '可能购买' : '不太可能购买'}</span>
                  </summary>
                  <div className="detail-grid">
                    <p><b>主要阻碍：</b>{item.main_objection}</p>
                    <p><b>差评风险：</b>{item.possible_bad_review_reason}</p>
                    <p><b>使用场景：</b>{item.usage_scenario}</p>
                    <p><b>图片期待：</b>{item.image_expectation}</p>
                    <p><b>图片影响：</b>{item.image_purchase_impact}</p>
                    <p><b>图片一致性：</b>{item.image_consistency_feedback}</p>
                    <p><b>文案建议：</b>{item.listing_copy_suggestion}</p>
                    <p><b>改进建议：</b>{item.suggested_improvement}</p>
                  </div>
                </details>
              ))}
            </div>
          </Section>
        )}
      </main>
    )
  }

  function renderHistory() {
    return (
      <main className="content">
        <div className="page-head">
          <div>
            <p className="kicker">历史报告</p>
            <h1>检索、复盘、删除旧调研。</h1>
          </div>
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                refreshReports(event.target.value)
              }}
              placeholder="搜索产品、类目、报告内容"
            />
          </div>
        </div>

        <Section title="报告列表">
          <div className="space-y-3">
            {reports.map((report) => (
              <div className="history-row" key={report.id}>
                <button onClick={() => openReport(report.id)}>
                  <strong>{report.title}</strong>
                  <span>{report.product.category} · {formatDate(report.createdAt)}</span>
                </button>
                <span className={`score-pill ${scoreTone(report.summary.overall_purchase_intent)}`}>
                  {report.summary.overall_purchase_intent}/5
                </span>
                <button className="icon-button danger" onClick={() => removeReport(report.id)} aria-label="删除报告">
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {!reports.length && <div className="empty-state"><Archive size={26} /><p>没有匹配的报告。</p></div>}
          </div>
        </Section>
      </main>
    )
  }

  function renderSettings() {
    return (
      <main className="content">
        <div className="page-head">
          <div>
            <p className="kicker">{tr('运行模式', 'Run mode')}</p>
            <h1>{tr('离线规则优先，API 只做增强。', 'Offline rules first. API is an enhancement.')}</h1>
            <p className="hero-copy">{tr('没有 API Key 也能运行。API 增强模式的结果会保存为本地训练样本，后续可用于规则校准或导出做微调数据。', 'The app works without an API key. API-enhanced outputs are saved as local training examples for later rule calibration or fine-tune export.')}</p>
          </div>
        </div>
        <Section title={tr('调研引擎', 'Research engine')}>
          <div className="mode-grid">
            <button
              className={`mode-card ${settings.engineMode === 'offline' ? 'selected' : ''}`}
              onClick={() => setSettings({ ...settings, engineMode: 'offline' })}
              type="button"
            >
              <strong>{tr('离线规则模式', 'Offline rules')}</strong>
              <span>{tr('不需要 API Key。使用 persona 权重、价格敏感度、卖点和缺点匹配生成结构化报告。', 'No API key required. Uses persona weighting, price sensitivity, selling points, and weaknesses to generate a structured report.')}</span>
            </button>
            <button
              className={`mode-card ${settings.engineMode === 'api-enhanced' ? 'selected' : ''}`}
              onClick={() => setSettings({ ...settings, engineMode: 'api-enhanced' })}
              type="button"
            >
              <strong>{tr('API 增强模式', 'API enhanced')}</strong>
              <span>{tr('有 Key 时分批调用当前模型；失败时自动回落离线规则，并沉淀训练样本。', 'Calls the configured model in batches when a key exists; failures fall back to offline rules and still save training samples.')}</span>
            </button>
          </div>
        </Section>
        <Section title={tr('连接参数', 'Connection')}>
          <div className="form-grid">
            <Field label="API Key" value={settings.apiKey} onChange={(value) => setSettings({ ...settings, apiKey: value })} placeholder="sk-..." />
            <Field label="Base URL" value={settings.baseUrl} onChange={(value) => setSettings({ ...settings, baseUrl: value })} placeholder="https://api.openai.com/v1" />
            <Field label="模型" value={settings.model} onChange={(value) => setSettings({ ...settings, model: value })} placeholder="gpt-4o-mini" />
          </div>
          <div className="mt-5 flex justify-end">
            <button className="primary-button" onClick={saveApiSettings} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              {tr('保存设置', 'Save settings')}
            </button>
          </div>
        </Section>
      </main>
    )
  }

  const renderedView = {
    home: renderHome,
    offlineInput: renderOfflineInput,
    apiInput: renderApiInput,
    personas: renderPersonas,
    run: renderRun,
    report: renderReport,
    history: renderHistory,
    settings: renderSettings,
  }[view]()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Brain size={22} /></div>
          <div>
            <strong>Amazon AI Researcher</strong>
            <span>桌面 MVP</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.view} className={view === item.view ? 'active' : ''} onClick={() => setView(item.view)}>
                <Icon size={18} />
                {item.label.zh}
              </button>
            )
          })}
        </nav>

        <div className="boundary-note">
          <CircleAlert size={18} />
          <p>输出是模拟调研假设，不能作为真实消费者反馈或亚马逊评论使用。</p>
        </div>
      </aside>

      <section className="workspace">
        {(error || notice) && (
          <div className={`toast ${error ? 'error' : 'success'}`}>
            {error || notice}
            <button onClick={() => { setError(''); setNotice('') }}>关闭</button>
          </div>
        )}
        {renderedView}
      </section>
    </div>
  )
}
