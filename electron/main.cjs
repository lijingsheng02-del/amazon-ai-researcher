const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const ExcelJS = require('exceljs');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

const seedPersonas = [
  { id: 'US-001', ageRange: '25-34', occupation: 'Remote software support specialist', incomeTier: '$55k-$75k', residence: 'Rents apartment in Austin, TX', family: 'Single, no children', habits: 'Buys tech and home items after reading comparison charts', priceSensitivity: 'Medium', concerns: ['durability', 'setup effort', 'return policy'] },
  { id: 'US-002', ageRange: '35-44', occupation: 'Elementary school teacher', incomeTier: '$45k-$65k', residence: 'Owns suburban townhouse in Ohio', family: 'Married, two children', habits: 'Shops during sales, values practical family use', priceSensitivity: 'High', concerns: ['safety', 'cleaning effort', 'kid-friendly design'] },
  { id: 'US-003', ageRange: '45-54', occupation: 'Nurse manager', incomeTier: '$80k-$110k', residence: 'Owns single-family home in North Carolina', family: 'Married, one teenager', habits: 'Pays more for proven quality and clear instructions', priceSensitivity: 'Low', concerns: ['reliability', 'warranty', 'ease of maintenance'] },
  { id: 'US-004', ageRange: '22-30', occupation: 'Graduate student', incomeTier: '$25k-$40k', residence: 'Shared apartment in Boston, MA', family: 'Single, roommates', habits: 'Compares TikTok, Amazon reviews, and Reddit before buying', priceSensitivity: 'Very high', concerns: ['space saving', 'low price', 'multi-use value'] },
  { id: 'US-005', ageRange: '55-64', occupation: 'Independent contractor', incomeTier: '$70k-$95k', residence: 'Owns home in Phoenix, AZ', family: 'Married, empty nest', habits: 'Likes simple products that solve concrete problems', priceSensitivity: 'Medium', concerns: ['sturdiness', 'clear photos', 'customer support'] },
  { id: 'US-006', ageRange: '30-39', occupation: 'Fitness studio owner', incomeTier: '$90k-$130k', residence: 'Condo in Denver, CO', family: 'Partnered, no children', habits: 'Buys premium products when design looks credible', priceSensitivity: 'Low', concerns: ['aesthetics', 'materials', 'brand credibility'] },
  { id: 'US-007', ageRange: '40-49', occupation: 'Warehouse supervisor', incomeTier: '$60k-$85k', residence: 'Suburban rental house in Georgia', family: 'Married, three children', habits: 'Reads negative reviews first and avoids fragile products', priceSensitivity: 'High', concerns: ['breakage risk', 'size accuracy', 'value pack options'] },
  { id: 'US-008', ageRange: '28-37', occupation: 'Marketing analyst', incomeTier: '$75k-$105k', residence: 'Urban apartment in Chicago, IL', family: 'Lives with partner', habits: 'Responds to clean visuals and concise benefit claims', priceSensitivity: 'Medium', concerns: ['visual fit', 'brand trust', 'social proof'] },
  { id: 'US-009', ageRange: '60-70', occupation: 'Retired military administrator', incomeTier: '$50k-$70k', residence: 'Owns ranch-style home in Florida', family: 'Married, grandchildren visit', habits: 'Prefers familiar designs and plain language', priceSensitivity: 'Medium', concerns: ['instructions', 'comfort', 'long-term use'] },
  { id: 'US-010', ageRange: '32-42', occupation: 'Small e-commerce seller', incomeTier: '$65k-$100k', residence: 'Townhome in New Jersey', family: 'Married, one child', habits: 'Knows marketplace tactics and distrusts vague claims', priceSensitivity: 'Medium', concerns: ['claim proof', 'spec detail', 'packaging quality'] },
  { id: 'US-011', ageRange: '24-33', occupation: 'Restaurant server', incomeTier: '$35k-$55k', residence: 'Apartment in Las Vegas, NV', family: 'Single', habits: 'Buys when photos quickly show real-life use', priceSensitivity: 'Very high', concerns: ['discounts', 'portable use', 'easy returns'] },
  { id: 'US-012', ageRange: '38-48', occupation: 'HR director', incomeTier: '$110k-$150k', residence: 'Owns home in Seattle suburbs', family: 'Married, two school-age children', habits: 'Values premium convenience and low friction', priceSensitivity: 'Low', concerns: ['time savings', 'family fit', 'safe materials'] },
  { id: 'US-013', ageRange: '50-60', occupation: 'Home improvement store associate', incomeTier: '$42k-$58k', residence: 'Small-town home in Pennsylvania', family: 'Divorced, adult child', habits: 'Judges products by specs and practical construction', priceSensitivity: 'High', concerns: ['material thickness', 'tool-free setup', 'real dimensions'] },
  { id: 'US-014', ageRange: '27-36', occupation: 'Graphic designer', incomeTier: '$60k-$85k', residence: 'Loft apartment in Portland, OR', family: 'Lives with partner and dog', habits: 'Cares about design coherence and lifestyle photos', priceSensitivity: 'Medium', concerns: ['color options', 'texture', 'photographic honesty'] },
  { id: 'US-015', ageRange: '43-52', occupation: 'Accountant', incomeTier: '$85k-$120k', residence: 'Suburban home in Minnesota', family: 'Married, two teens', habits: 'Compares total cost, warranty, and long-term value', priceSensitivity: 'Medium', concerns: ['price justification', 'warranty', 'replacement parts'] },
  { id: 'US-016', ageRange: '31-40', occupation: 'New parent and part-time consultant', incomeTier: '$95k-$125k household', residence: 'Single-family home in California', family: 'Married, infant', habits: 'Prioritizes safety and convenience over novelty', priceSensitivity: 'Medium', concerns: ['non-toxic materials', 'noise', 'cleanability'] },
  { id: 'US-017', ageRange: '21-29', occupation: 'Entry-level retail associate', incomeTier: '$28k-$42k', residence: 'Lives with parents in Texas', family: 'Single', habits: 'Buys visually appealing products with strong discounts', priceSensitivity: 'Very high', concerns: ['trend appeal', 'low price', 'fast shipping'] },
  { id: 'US-018', ageRange: '46-58', occupation: 'Real estate agent', incomeTier: '$100k-$180k variable', residence: 'Owns condo in Miami, FL', family: 'Partnered, no children at home', habits: 'Likes polished presentation and premium cues', priceSensitivity: 'Low', concerns: ['status fit', 'presentation', 'giftability'] },
  { id: 'US-019', ageRange: '34-45', occupation: 'Police dispatcher', incomeTier: '$55k-$78k', residence: 'Rural home in Tennessee', family: 'Married, one child', habits: 'Prefers reliable, no-nonsense products with strong ratings', priceSensitivity: 'High', concerns: ['shipping damage', 'ruggedness', 'support response'] },
  { id: 'US-020', ageRange: '29-41', occupation: 'Corporate travel manager', incomeTier: '$80k-$115k', residence: 'Apartment in Atlanta, GA', family: 'Single, frequent traveler', habits: 'Needs products to be compact, fast to understand, and easy to store', priceSensitivity: 'Medium', concerns: ['portability', 'clear use case', 'premium feel'] }
];

const personas = buildPersonas();

const categoryTemplates = [
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen / 家居厨房',
    match: ['home', 'kitchen', 'household', 'furniture', 'storage', 'organizer', 'shelf', 'rack', 'table', 'chair', 'cabinet', 'bathroom', 'bedroom', '家居', '厨房', '收纳', '家具', '置物架', '浴室', '卧室'],
    decisionDimensions: ['真实尺寸与空间适配', '材质与承重可信度', '安装/清洁成本', '家居风格匹配', '运输破损风险'],
    riskLenses: ['尺寸误判', '材质廉价感', '安装复杂', '图片比例失真', '包装破损'],
    reportModules: ['主图尺寸证明', 'A+ 场景对比', '安装步骤图', '材质细节图'],
    operatorQuestions: ['这个产品解决的是收纳、装饰、清洁还是便利性问题？', '用户最可能因为尺寸、材质还是安装给差评？', '主图是否能一眼证明比例和结构？'],
    personaSignals: ['real dimensions', 'space saving', 'tool-free setup', 'aesthetics', 'cleanability', 'shipping damage', 'material thickness']
  },
  {
    id: 'baby-family',
    name: 'Baby / Family / 母婴家庭',
    match: ['baby', 'infant', 'toddler', 'kid', 'kids', 'child', 'children', 'parent', 'nursery', 'family', '母婴', '婴儿', '儿童', '宝宝', '亲子', '家庭'],
    decisionDimensions: ['安全材料', '清洁便利性', '家庭日常高频使用', '年龄段适配', '误用风险'],
    riskLenses: ['安全证明不足', '异味/材质担忧', '清洗麻烦', '年龄段不清楚', '噪音或夹手风险'],
    reportModules: ['安全材质证明', '清洁步骤', '年龄段/尺寸适配图', '家庭场景图'],
    operatorQuestions: ['父母购买前最需要哪类安全证据？', '差评最可能来自安全、清洁还是耐用？', '页面是否提前说明年龄段和使用边界？'],
    personaSignals: ['safety', 'non-toxic materials', 'cleanability', 'kid-friendly design', 'family fit', 'noise', 'safe materials']
  },
  {
    id: 'pet',
    name: 'Pet Supplies / 宠物用品',
    match: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'litter', 'leash', 'grooming', '宠物', '猫', '狗', '犬', '猫砂', '牵引', '梳毛'],
    decisionDimensions: ['宠物安全', '耐咬耐抓', '清洁与气味控制', '尺寸/品种适配', '主人便利性'],
    riskLenses: ['尺寸不适合', '宠物不接受', '材料气味', '清洁困难', '耐用性不足'],
    reportModules: ['宠物体型适配图', '材料安全说明', '清洁流程', '使用前后对比'],
    operatorQuestions: ['目标宠物体型和行为特征是否清楚？', '卖点是否同时说服宠物和主人？', '页面是否降低“买回去宠物不用”的风险？'],
    personaSignals: ['durability', 'cleanability', 'safety', 'ruggedness', 'real dimensions', 'easy returns']
  },
  {
    id: 'electronics',
    name: 'Electronics / 电子配件',
    match: ['electronics', 'tech', 'charger', 'cable', 'adapter', 'battery', 'bluetooth', 'speaker', 'led', 'usb', 'phone', '电脑', '电子', '充电', '数据线', '蓝牙', '电池', '灯', '手机'],
    decisionDimensions: ['兼容性', '可靠性', '规格参数', '保修与售后', '安全认证'],
    riskLenses: ['兼容性误导', '发热/安全担忧', '参数不清', '寿命短', '售后不足'],
    reportModules: ['兼容设备列表', '参数对比表', '认证/保修说明', '真实使用场景'],
    operatorQuestions: ['用户最担心兼容、寿命还是安全？', '规格是否足够具体到型号/接口/功率？', '竞品对比是否能说明溢价？'],
    personaSignals: ['spec detail', 'claim proof', 'reliability', 'warranty', 'brand credibility', 'comparison detail']
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care / 美妆个护',
    match: ['beauty', 'skin', 'hair', 'makeup', 'cosmetic', 'care', 'salon', 'grooming', '美妆', '护肤', '头发', '个护', '美容', '化妆', '沙龙'],
    decisionDimensions: ['效果可信度', '成分/材质安全', '使用体验', '人群肤质/发质适配', '礼品感'],
    riskLenses: ['效果夸张', '过敏/刺激担忧', '质感廉价', '使用步骤不清', '包装破损'],
    reportModules: ['效果边界说明', '材质/成分证明', '使用步骤图', '礼品/质感图'],
    operatorQuestions: ['页面是否避免过度功效承诺？', '目标人群的肤质/发质/使用频率是否明确？', '图片是否能证明质感和使用方式？'],
    personaSignals: ['aesthetics', 'premium feel', 'presentation', 'safe materials', 'photographic honesty', 'giftability']
  },
  {
    id: 'outdoor-sports',
    name: 'Outdoor & Sports / 户外运动',
    match: ['outdoor', 'camping', 'hiking', 'sports', 'fitness', 'gym', 'bike', 'travel', 'portable', '户外', '露营', '运动', '健身', '旅行', '便携'],
    decisionDimensions: ['耐用与可靠性', '便携收纳', '重量/尺寸', '极端场景适配', '安全边界'],
    riskLenses: ['强度不足', '便携性夸张', '重量不清楚', '场景误导', '安全边界不明'],
    reportModules: ['承重/耐用证明', '收纳尺寸图', '场景使用图', '竞品规格对比'],
    operatorQuestions: ['这个产品的真实使用强度在哪里？', '用户会不会因为重量/体积产生退货？', '图片是否展示了携带和收纳状态？'],
    personaSignals: ['ruggedness', 'portability', 'durability', 'storage fit', 'clear use case', 'real dimensions']
  },
  {
    id: 'apparel-accessories',
    name: 'Apparel & Accessories / 服饰配件',
    match: ['apparel', 'clothing', 'shirt', 'shoe', 'bag', 'wallet', 'jewelry', 'accessory', 'wear', '服装', '衣服', '鞋', '包', '钱包', '首饰', '配件'],
    decisionDimensions: ['尺码/适配', '材质手感', '风格搭配', '耐用性', '送礼属性'],
    riskLenses: ['尺码不准', '色差', '材质廉价', '图片与实物差异', '做工问题'],
    reportModules: ['尺码/真人参考', '材质细节', '多场景搭配', '颜色差异说明'],
    operatorQuestions: ['页面是否足够降低尺码和色差风险？', '主图是否真实呈现材质和比例？', '目标风格人群是否明确？'],
    personaSignals: ['aesthetics', 'color options', 'texture', 'photographic honesty', 'giftability', 'status fit']
  },
  {
    id: 'generic',
    name: 'General Product / 通用产品',
    match: [],
    decisionDimensions: ['需求强度', '价格合理性', '差异化证据', '使用场景清晰度', '差评风险前置说明'],
    riskLenses: ['卖点泛化', '价格解释不足', '图片证据不足', '目标人群过宽', '竞品差异不清'],
    reportModules: ['核心场景图', '差异化对比', '价格价值证明', 'FAQ 风险拦截'],
    operatorQuestions: ['这个产品最强的购买理由是什么？', '用户最可能在哪里怀疑页面承诺？', '哪个目标人群应该优先验证？'],
    personaSignals: ['claim proof', 'price justification', 'clear use case', 'review consistency', 'brand trust', 'easy returns']
  }
];

function buildPersonas() {
  const occupations = [
    'Amazon Prime-heavy parent', 'Urban renter and pet owner', 'Suburban DIY hobbyist', 'College dorm resident',
    'Boutique hotel manager', 'Home office professional', 'Budget-focused retiree', 'First apartment shopper',
    'Interior design enthusiast', 'Military spouse', 'Part-time rideshare driver', 'Airbnb host',
    'New homeowner', 'Busy medical resident', 'Fitness-focused apartment renter', 'Minimalist condo owner',
    'Coupon-driven household shopper', 'Tech-savvy early adopter', 'Eco-conscious buyer', 'Gift shopper',
    'Garage organizer', 'Craft room owner', 'Remote sales manager', 'Single parent',
    'Warehouse associate', 'Frequent mover', 'Luxury apartment renter', 'Community college instructor',
    'Home daycare owner', 'Weekend renovator', 'Small-space furniture buyer', 'Senior caregiver',
    'Outdoor recreation buyer', 'Beauty salon owner', 'Rental property owner', 'Office administrator',
    'Apartment maintenance worker', 'Pet rescue volunteer', 'Newly married shopper', 'Basement apartment renter'
  ];
  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74'];
  const incomeTiers = ['$25k-$40k', '$40k-$60k', '$60k-$85k', '$85k-$115k', '$115k-$160k', '$160k+'];
  const residences = [
    'Studio apartment in New York, NY', 'Suburban home in Dallas, TX', 'Townhouse in Raleigh, NC',
    'Shared rental in Los Angeles, CA', 'Condo in San Diego, CA', 'Rural home in Iowa',
    'Duplex in Detroit, MI', 'Single-family home in Tampa, FL', 'Apartment in Nashville, TN',
    'Rowhouse in Philadelphia, PA'
  ];
  const families = [
    'Single, no children', 'Married, no children', 'Married, one child', 'Married, two children',
    'Single parent, one child', 'Lives with roommates', 'Lives with partner', 'Retired couple',
    'Multi-generational household', 'Empty nest'
  ];
  const habits = [
    'Reads negative reviews first and compares photos carefully',
    'Buys mostly during Prime Day, coupons, and seasonal sales',
    'Watches short product videos before deciding',
    'Prefers products with simple setup and clear dimensions',
    'Pays more when materials and warranty look credible',
    'Needs compact products that do not clutter small spaces',
    'Prioritizes safety, cleanability, and family use',
    'Compares Amazon, Walmart, Target, and Reddit opinions',
    'Trusts lifestyle images only when details look realistic',
    'Returns products quickly when claims feel exaggerated'
  ];
  const sensitivity = ['Very high', 'High', 'Medium', 'Low'];
  const concernSets = [
    ['low price', 'coupon value', 'fast shipping'],
    ['durability', 'warranty', 'replacement parts'],
    ['real dimensions', 'space saving', 'tool-free setup'],
    ['aesthetics', 'color options', 'photographic honesty'],
    ['safety', 'non-toxic materials', 'cleanability'],
    ['premium feel', 'giftability', 'brand credibility'],
    ['ruggedness', 'shipping damage', 'support response'],
    ['easy returns', 'setup effort', 'clear instructions'],
    ['multi-use value', 'storage fit', 'portability'],
    ['claim proof', 'comparison detail', 'review consistency']
  ];

  const generated = Array.from({ length: 80 }, (_, index) => {
    const n = index + 21;
    return {
      id: `US-${String(n).padStart(3, '0')}`,
      ageRange: ageRanges[index % ageRanges.length],
      occupation: occupations[index % occupations.length],
      incomeTier: incomeTiers[(index + Math.floor(index / 7)) % incomeTiers.length],
      residence: residences[(index * 3) % residences.length],
      family: families[(index * 5 + 2) % families.length],
      habits: habits[(index * 7) % habits.length],
      priceSensitivity: sensitivity[(index + Math.floor(index / 9)) % sensitivity.length],
      concerns: concernSets[(index * 4) % concernSets.length]
    };
  });

  return [...seedPersonas, ...generated];
}

let db;

function now() {
  return new Date().toISOString();
}

function openDb() {
  if (db) return db;
  const dbPath = path.join(app.getPath('userData'), 'amazon-ai-researcher.sqlite3');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      product_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      persona_results_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS training_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      source TEXT NOT NULL,
      input_json TEXT NOT NULL,
      output_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
  const upsertPersona = db.prepare('INSERT INTO personas (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data');
  const tx = db.transaction(() => personas.forEach((persona) => upsertPersona.run(persona.id, JSON.stringify(persona))));
  tx();
  return db;
}

function getSettings() {
  const rows = openDb().prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    apiKey: (settings.apiKey || '').trim(),
    baseUrl: (settings.baseUrl || 'https://api.openai.com/v1').trim(),
    model: (settings.model || 'gpt-4o-mini').trim(),
    engineMode: (settings.engineMode || 'offline').trim()
  };
}

function saveSettings(settings) {
  const stmt = openDb().prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  const tx = openDb().transaction(() => {
    stmt.run('apiKey', (settings.apiKey || '').trim());
    stmt.run('baseUrl', (settings.baseUrl || 'https://api.openai.com/v1').trim());
    stmt.run('model', (settings.model || 'gpt-4o-mini').trim());
    stmt.run('engineMode', (settings.engineMode || 'offline').trim());
  });
  tx();
  return getSettings();
}

function listPersonas() {
  return openDb().prepare('SELECT data FROM personas ORDER BY id').all().map((row) => JSON.parse(row.data));
}

function listReports(search = '') {
  const rows = openDb().prepare(`
    SELECT reports.id, reports.project_id, reports.created_at, projects.title, projects.product_json, reports.summary_json
    FROM reports
    JOIN projects ON projects.id = reports.project_id
    ORDER BY reports.created_at DESC
  `).all();
  const normalized = rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    createdAt: row.created_at,
    product: JSON.parse(row.product_json),
    summary: JSON.parse(row.summary_json)
  }));
  const q = search.trim().toLowerCase();
  return q ? normalized.filter((item) => JSON.stringify(item).toLowerCase().includes(q)) : normalized;
}

function getReport(reportId) {
  const row = openDb().prepare(`
    SELECT reports.id, reports.project_id, reports.created_at, projects.title, projects.product_json, reports.persona_results_json, reports.summary_json
    FROM reports
    JOIN projects ON projects.id = reports.project_id
    WHERE reports.id = ?
  `).get(reportId);
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    createdAt: row.created_at,
    product: JSON.parse(row.product_json),
    personaResults: JSON.parse(row.persona_results_json),
    summary: JSON.parse(row.summary_json)
  };
}

function createProject(product) {
  const createdAt = now();
  const parsedProductLink = parseAmazonUrl(product.productUrl);
  const title = buildProjectTitle(product, parsedProductLink);
  const info = openDb().prepare(`
    INSERT INTO projects (title, product_json, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(title, JSON.stringify(product), createdAt, createdAt);
  return { id: info.lastInsertRowid, title, product, createdAt, updatedAt: createdAt };
}

function buildProjectTitle(product, parsedProductLink = null) {
  const manualTitle = String(product.reportTitle || '').trim();
  if (manualTitle) return manualTitle;
  const productName = String(product.productName || '').trim();
  if (productName) return productName;
  const category = String(product.category || '').trim();
  const asin = parsedProductLink?.asin || parseAmazonUrl(product.productUrl)?.asin;
  if (category && asin) return `${category} - ${asin}`;
  if (asin) return `Amazon ASIN ${asin}`;
  if (category) return `${category} product research`;
  return 'Untitled product research';
}

function saveReport(projectId, payload) {
  const createdAt = now();
  const summaryWithMetadata = {
    ...payload.summary,
    metadata: payload.metadata || {}
  };
  const info = openDb().prepare(`
    INSERT INTO reports (project_id, persona_results_json, summary_json, created_at)
    VALUES (?, ?, ?, ?)
  `).run(projectId, JSON.stringify(payload.persona_results), JSON.stringify(summaryWithMetadata), createdAt);
  return getReport(info.lastInsertRowid);
}

function saveTrainingExample(projectId, product, payload) {
  openDb().prepare(`
    INSERT INTO training_examples (project_id, source, input_json, output_json, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    projectId,
    payload.metadata?.engine || 'offline-rules',
    JSON.stringify(buildProductPromptPayload(product)),
    JSON.stringify({
      persona_results: payload.persona_results,
      summary: payload.summary
    }),
    now()
  );
}

function deleteReport(reportId) {
  const row = getReport(reportId);
  if (!row) return false;
  openDb().prepare('DELETE FROM reports WHERE id = ?').run(reportId);
  return true;
}

function renameReport(reportId, nextTitle) {
  const cleanTitle = String(nextTitle || '').trim();
  if (!cleanTitle) throw new Error('报告名称不能为空。');
  const report = getReport(reportId);
  if (!report) throw new Error('报告不存在。');
  openDb().prepare('UPDATE projects SET title = ?, updated_at = ? WHERE id = ?').run(cleanTitle, now(), report.projectId);
  return getReport(reportId);
}

async function exportReportExcel(event, reportId) {
  const report = getReport(reportId);
  if (!report) throw new Error('报告不存在。');
  const win = BrowserWindow.fromWebContents(event.sender);
  const defaultPath = `${safeFileName(report.title)}-${formatDateForFile(report.createdAt)}.xlsx`;
  const result = await dialog.showSaveDialog(win, {
    title: '导出 Excel 报告',
    defaultPath,
    filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  const workbook = buildExcelWorkbook(report);
  await workbook.xlsx.writeFile(result.filePath);
  return { canceled: false, filePath: result.filePath };
}

function buildExcelWorkbook(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Amazon AI Researcher';
  workbook.created = new Date();
  workbook.modified = new Date();

  addSummarySheet(workbook, report);
  addPersonaSheet(workbook, report);
  addProductInputSheet(workbook, report);
  addImagesSheet(workbook, report);

  return workbook;
}

function addSummarySheet(workbook, report) {
  const summary = report.summary || {};
  const personaResults = report.personaResults || [];
  const product = report.product || {};
  const metadata = summary.metadata || {};
  const sheet = workbook.addWorksheet('Summary', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  sheet.columns = [
    { key: 'label', width: 28 },
    { key: 'value', width: 46 },
    { key: 'extra1', width: 24 },
    { key: 'extra2', width: 24 }
  ];

  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = report.title;
  titleCell.style = styles.title;
  sheet.getRow(1).height = 34;

  sheet.addRow([]);
  sheet.addRow(['Overall Purchase Intent', 'Likely Buyers', 'Sample Size', 'Category Template']);
  sheet.addRow([
    `${summary.overall_purchase_intent || 0}/5`,
    personaResults.filter((item) => item.likely_to_buy).length,
    personaResults.length,
    metadata.category_template?.name || ''
  ]);
  styleRange(sheet, 3, 4, 1, 4, styles.metric);
  styleRange(sheet, 4, 4, 1, 4, styles.metricValue);

  addSection(sheet, 'Product Basics');
  addKeyValueRows(sheet, [
    ['Created At', formatDisplayDate(report.createdAt)],
    ['Product Name', product.productName || ''],
    ['Category', product.category || ''],
    ['Price', product.price || ''],
    ['Dimensions', product.dimensions || ''],
    ['Material', product.material || '']
  ]);

  addSection(sheet, 'Research Summary');
  addKeyValueRows(sheet, [
    ['Top Positive Points', bulletText(summary.top_positive_points)],
    ['Top Negative Risks', bulletText(summary.top_negative_risks)],
    ['Best Target Customers', bulletText(summary.best_target_customers)],
    ['Weak Target Customers', bulletText(summary.weak_target_customers)],
    ['Price Feedback', summary.price_sensitivity_summary || ''],
    ['Operator Summary', summary.final_operator_summary || '']
  ]);

  addSection(sheet, 'Listing & Image Direction');
  addKeyValueRows(sheet, [
    ['Product Improvements', bulletText(summary.product_optimization_suggestions)],
    ['Listing Title Direction', summary.listing_title_direction || ''],
    ['Bullet Direction', bulletText(summary.bullet_points_direction)],
    ['Main Image Suggestions', bulletText(summary.main_image_suggestions)],
    ['A+ Image Suggestions', bulletText(summary.aplus_image_suggestions)],
    ['Buyer Image Feedback', bulletText(summary.image_feedback_summary)],
    ['QA Suggestions', bulletText(summary.qa_suggestions)]
  ]);

  finalizeSheet(sheet);
}

function addPersonaSheet(workbook, report) {
  const sheet = workbook.addWorksheet('Persona Results', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  sheet.columns = [
    { key: 'persona_id', width: 13 },
    { key: 'score', width: 12 },
    { key: 'buy', width: 13 },
    { key: 'positive', width: 38 },
    { key: 'negative', width: 38 },
    { key: 'price', width: 36 },
    { key: 'scenario', width: 36 },
    { key: 'objection', width: 36 },
    { key: 'bad_review', width: 38 },
    { key: 'improvement', width: 38 },
    { key: 'image', width: 38 },
    { key: 'image_impact', width: 42 },
    { key: 'image_consistency', width: 42 },
    { key: 'copy', width: 38 },
    { key: 'confidence', width: 12 }
  ];
  sheet.addRow([
    'Persona ID', 'Intent Score', 'Likely To Buy', 'Positive Points', 'Negative Points',
    'Price Reaction', 'Usage Scenario', 'Main Objection', 'Bad Review Risk',
    'Suggested Improvement', 'Image Expectation', 'Image Purchase Impact',
    'Image Consistency Feedback', 'Listing Copy Suggestion', 'Confidence'
  ]);

  for (const item of report.personaResults || []) {
    sheet.addRow([
      item.persona_id,
      item.purchase_intent_score,
      item.likely_to_buy ? 'TRUE' : 'FALSE',
      bulletText(item.positive_points),
      bulletText(item.negative_points),
      item.price_reaction,
      item.usage_scenario,
      item.main_objection,
      item.possible_bad_review_reason,
      item.suggested_improvement,
      item.image_expectation,
      item.image_purchase_impact,
      item.image_consistency_feedback,
      item.listing_copy_suggestion,
      item.confidence_score
    ]);
  }

  styleHeaderRow(sheet, 1);
  sheet.autoFilter = 'A1:O1';
  finalizeSheet(sheet);
}

function addProductInputSheet(workbook, report) {
  const product = report.product || {};
  const images = Array.isArray(product.images) ? product.images : [];
  const sheet = workbook.addWorksheet('Product Input');
  sheet.columns = [
    { key: 'field', width: 28 },
    { key: 'value', width: 88 }
  ];
  sheet.mergeCells('A1:B1');
  sheet.getCell('A1').value = 'Product Input';
  sheet.getCell('A1').style = styles.title;
  sheet.getRow(1).height = 32;
  addKeyValueRows(sheet, [
    ['Report Title', report.title],
    ['Product URL', product.productUrl || ''],
    ['Competitor URLs', product.competitorUrls || ''],
    ['Research Notes', product.researchNotes || ''],
    ['Product Name', product.productName || ''],
    ['Category', product.category || ''],
    ['Price', product.price || ''],
    ['Dimensions', product.dimensions || ''],
    ['Material', product.material || ''],
    ['Selling Points', product.sellingPoints || ''],
    ['Target Audience', product.targetAudience || ''],
    ['Competitor Notes', product.competitors || ''],
    ['Known Weaknesses', product.knownWeaknesses || ''],
    ['Image Count', images.length]
  ]);
  finalizeSheet(sheet);
}

function addImagesSheet(workbook, report) {
  const product = report.product || {};
  const images = Array.isArray(product.images) ? product.images : [];
  const sheet = workbook.addWorksheet('Product Images');
  sheet.columns = [
    { key: 'image1', width: 18 },
    { key: 'image2', width: 18 },
    { key: 'image3', width: 18 },
    { key: 'meta', width: 42 },
    { key: 'note', width: 42 }
  ];
  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = 'Product Images';
  sheet.getCell('A1').style = styles.title;
  sheet.getRow(1).height = 32;

  if (!images.length) {
    sheet.addRow(['No uploaded product images.']);
    finalizeSheet(sheet);
    return;
  }

  let rowNumber = 3;
  for (const [index, image] of images.entries()) {
    sheet.mergeCells(`A${rowNumber}:C${rowNumber}`);
    sheet.getCell(`A${rowNumber}`).value = `Image ${index + 1}`;
    sheet.getCell(`A${rowNumber}`).style = styles.section;
    sheet.getCell(`D${rowNumber}`).value = image.name || '';
    sheet.getCell(`D${rowNumber}`).style = styles.field;
    sheet.getCell(`E${rowNumber}`).value = `${image.type || ''} / ${Math.round(Number(image.size || 0) / 1024)} KB`;
    sheet.getCell(`E${rowNumber}`).style = styles.field;

    const imageInfo = getExcelImageInfo(image);
    if (imageInfo) {
      const imageId = workbook.addImage(imageInfo);
      sheet.addImage(imageId, {
        tl: { col: 0.15, row: rowNumber + 0.3 },
        ext: { width: 320, height: 220 }
      });
      sheet.getRow(rowNumber + 1).height = 168;
      sheet.getCell(`D${rowNumber + 1}`).value = 'Embedded image';
      sheet.getCell(`E${rowNumber + 1}`).value = '图片已写入 Excel 文件，不依赖外部链接。';
    } else {
      sheet.getCell(`D${rowNumber + 1}`).value = 'Unsupported image format';
      sheet.getCell(`E${rowNumber + 1}`).value = 'Excel 导出目前直接支持 JPG / PNG / GIF。WebP 请先转成 JPG 或 PNG 后上传。';
    }
    styleRange(sheet, rowNumber + 1, rowNumber + 1, 4, 5, styles.value);
    rowNumber += 12;
  }

  finalizeSheet(sheet);
}

function getExcelImageInfo(image) {
  const dataUrl = String(image.dataUrl || '');
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|gif));base64,(.+)$/i);
  if (!match) return null;
  const extension = match[1].toLowerCase().includes('png')
    ? 'png'
    : match[1].toLowerCase().includes('gif')
      ? 'gif'
      : 'jpeg';
  return { base64: dataUrl, extension };
}

function addSection(sheet, title) {
  const row = sheet.addRow([title]);
  const rowNumber = row.number;
  sheet.mergeCells(`A${rowNumber}:D${rowNumber}`);
  row.height = 24;
  sheet.getCell(`A${rowNumber}`).style = styles.section;
}

function addKeyValueRows(sheet, rows) {
  for (const [label, value] of rows) {
    const row = sheet.addRow([label, value]);
    const rowNumber = row.number;
    if (sheet.columnCount >= 4) sheet.mergeCells(`B${rowNumber}:D${rowNumber}`);
    sheet.getCell(`A${rowNumber}`).style = styles.field;
    sheet.getCell(`B${rowNumber}`).style = styles.value;
    row.height = estimateRowHeight(value);
  }
}

function styleHeaderRow(sheet, rowNumber) {
  const row = sheet.getRow(rowNumber);
  row.height = 30;
  row.eachCell((cell) => {
    cell.style = styles.header;
  });
}

function styleRange(sheet, startRow, endRow, startCol, endCol, style) {
  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      sheet.getCell(row, col).style = style;
    }
  }
}

function finalizeSheet(sheet) {
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = borderStyle;
      cell.alignment = cell.alignment || bodyAlignment;
    });
  });
}

function bulletText(items) {
  return normalizeArray(items).map((item) => `• ${item}`).join('\n');
}

function estimateRowHeight(value) {
  const text = String(value ?? '');
  const lineCount = Math.max(1, text.split(/\r?\n/).length);
  const lengthFactor = Math.ceil(text.length / 70);
  return Math.min(120, Math.max(24, (lineCount + lengthFactor) * 18));
}

function formatDisplayDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function safeFileName(value) {
  return String(value || 'amazon-research-report')
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('')
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'amazon-research-report';
}

function formatDateForFile(value) {
  const date = new Date(value || Date.now());
  return date.toISOString().slice(0, 10);
}

const bodyAlignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
const borderStyle = {
  top: { style: 'thin', color: { argb: 'D9E2EF' } },
  left: { style: 'thin', color: { argb: 'D9E2EF' } },
  bottom: { style: 'thin', color: { argb: 'D9E2EF' } },
  right: { style: 'thin', color: { argb: 'D9E2EF' } }
};
const styles = {
  title: {
    font: { bold: true, size: 16, color: { argb: 'FFFFFF' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } },
    border: borderStyle
  },
  section: {
    font: { bold: true, color: { argb: 'FFFFFF' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B9BD5' } },
    border: borderStyle
  },
  header: {
    font: { bold: true, color: { argb: 'FFFFFF' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
    border: borderStyle
  },
  field: {
    font: { bold: true, color: { argb: '1F2937' } },
    alignment: bodyAlignment,
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } },
    border: borderStyle
  },
  value: {
    alignment: bodyAlignment,
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FBFF' } },
    border: borderStyle
  },
  metric: {
    font: { bold: true, color: { argb: '1F2937' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2F0D9' } },
    border: borderStyle
  },
  metricValue: {
    font: { bold: true, size: 14, color: { argb: '1F2937' } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } },
    border: borderStyle
  }
};

function extractJson(text) {
  const trimmed = String(text || '').trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i) || trimmed.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error('AI response did not contain a JSON object.');
  return JSON.parse(match[1]);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (value == null || value === '') return [];
  return [String(value)];
}

function normalizePayload(raw) {
  const personaResults = Array.isArray(raw.persona_results) ? raw.persona_results : [];
  const summary = raw.summary || {};
  return {
    persona_results: personaResults.map((item, index) => ({
      persona_id: String(item.persona_id || personas[index]?.id || `US-${String(index + 1).padStart(3, '0')}`),
      purchase_intent_score: Math.max(1, Math.min(5, Number(item.purchase_intent_score || 1))),
      likely_to_buy: Boolean(item.likely_to_buy),
      positive_points: normalizeArray(item.positive_points),
      negative_points: normalizeArray(item.negative_points),
      price_reaction: String(item.price_reaction || ''),
      usage_scenario: String(item.usage_scenario || ''),
      main_objection: String(item.main_objection || ''),
      possible_bad_review_reason: String(item.possible_bad_review_reason || ''),
      suggested_improvement: String(item.suggested_improvement || ''),
      image_expectation: String(item.image_expectation || ''),
      image_purchase_impact: String(item.image_purchase_impact || ''),
      image_consistency_feedback: String(item.image_consistency_feedback || ''),
      listing_copy_suggestion: String(item.listing_copy_suggestion || ''),
      confidence_score: Math.max(0, Math.min(1, Number(item.confidence_score || 0.6)))
    })),
    summary: {
      overall_purchase_intent: Number(summary.overall_purchase_intent || 0),
      top_positive_points: normalizeArray(summary.top_positive_points),
      top_negative_risks: normalizeArray(summary.top_negative_risks),
      best_target_customers: normalizeArray(summary.best_target_customers),
      weak_target_customers: normalizeArray(summary.weak_target_customers),
      price_sensitivity_summary: String(summary.price_sensitivity_summary || ''),
      product_optimization_suggestions: normalizeArray(summary.product_optimization_suggestions),
      listing_title_direction: String(summary.listing_title_direction || ''),
      bullet_points_direction: normalizeArray(summary.bullet_points_direction),
      main_image_suggestions: normalizeArray(summary.main_image_suggestions),
      aplus_image_suggestions: normalizeArray(summary.aplus_image_suggestions),
      image_feedback_summary: normalizeArray(summary.image_feedback_summary),
      qa_suggestions: normalizeArray(summary.qa_suggestions),
      final_operator_summary: String(summary.final_operator_summary || '')
    },
    metadata: raw.metadata || {}
  };
}

function createResearchPlan(product, personaPool, engineMode) {
  const template = detectCategoryTemplate(product);
  const sampleSize = engineMode === 'api-enhanced' ? 32 : 48;
  const selection = selectResearchPersonas(product, personaPool, template, sampleSize);
  return {
    template,
    selectedPersonas: selection.personas,
    sampling: {
      pool_size: personaPool.length,
      sample_size: selection.personas.length,
      selected_persona_ids: selection.personas.map((persona) => persona.id),
      top_relevance_reasons: selection.reasons,
      segment_mix: buildSegmentMix(selection.personas),
      reason: engineMode === 'api-enhanced'
        ? 'API 增强模式优先抽取与当前类目、价格、人群、使用场景最相关的 32 个 persona，降低调用成本并提升反馈密度。'
        : '离线规则模式抽取与当前类目、价格、人群、使用场景最相关的 48 个 persona，保留广度同时避免 100 人平均稀释结论。'
    }
  };
}

function detectCategoryTemplate(product) {
  const text = [
    product.category,
    product.productName,
    product.targetAudience,
    product.sellingPoints,
    product.researchNotes,
    product.competitors,
    product.knownWeaknesses
  ].join(' ').toLowerCase();

  let best = categoryTemplates[categoryTemplates.length - 1];
  let bestScore = 0;
  let matchedKeywords = [];

  for (const template of categoryTemplates) {
    if (template.id === 'generic') continue;
    const hits = template.match.filter((keyword) => text.includes(String(keyword).toLowerCase()));
    const score = hits.length;
    if (score > bestScore) {
      best = template;
      bestScore = score;
      matchedKeywords = hits.slice(0, 8);
    }
  }

  return {
    id: best.id,
    name: best.name,
    confidence: bestScore ? Math.min(0.95, 0.45 + bestScore * 0.12) : 0.35,
    matched_keywords: matchedKeywords,
    decision_dimensions: best.decisionDimensions,
    risk_lenses: best.riskLenses,
    report_modules: best.reportModules,
    operator_questions: best.operatorQuestions,
    persona_signals: best.personaSignals
  };
}

function selectResearchPersonas(product, personaPool, template, sampleSize) {
  const scored = personaPool.map((persona, index) => ({
    persona,
    index,
    score: scorePersonaRelevance(product, persona, template),
    reason: buildPersonaSelectionReason(persona, template)
  }));

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = [];
  const selectedIds = new Set();
  const add = (item) => {
    if (!item || selectedIds.has(item.persona.id) || selected.length >= sampleSize) return;
    selected.push(item);
    selectedIds.add(item.persona.id);
  };

  scored.slice(0, Math.ceil(sampleSize * 0.65)).forEach(add);

  for (const sensitivity of ['Very high', 'High', 'Medium', 'Low']) {
    add(scored.find((item) => item.persona.priceSensitivity === sensitivity && !selectedIds.has(item.persona.id)));
  }

  for (const ageMarker of ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74']) {
    add(scored.find((item) => item.persona.ageRange === ageMarker && !selectedIds.has(item.persona.id)));
  }

  for (const pattern of ['children', 'infant', 'Single', 'partner', 'Retired', 'roommates']) {
    add(scored.find((item) => new RegExp(pattern, 'i').test(item.persona.family) && !selectedIds.has(item.persona.id)));
  }

  scored.forEach(add);

  return {
    personas: selected.map((item) => item.persona),
    reasons: selected.slice(0, 10).map((item) => ({
      persona_id: item.persona.id,
      score: item.score,
      reason: item.reason
    }))
  };
}

function scorePersonaRelevance(product, persona, template) {
  const text = `${product.category} ${product.productName} ${product.targetAudience} ${product.sellingPoints} ${product.researchNotes} ${product.knownWeaknesses}`.toLowerCase();
  const personaTextValue = `${persona.occupation} ${persona.residence} ${persona.family} ${persona.habits} ${persona.concerns.join(' ')}`.toLowerCase();
  let score = 0;

  for (const signal of template.persona_signals || []) {
    if (personaTextValue.includes(String(signal).toLowerCase())) score += 5;
  }

  const price = Number(String(product.price || '').replace(/[^\d.]/g, ''));
  if (price >= 80 && ['Medium', 'Low'].includes(persona.priceSensitivity)) score += 2;
  if (price <= 35 && ['Very high', 'High'].includes(persona.priceSensitivity)) score += 2;
  if (/premium|gift|luxury|高端|礼品|送礼|质感/.test(text) && ['Low', 'Medium'].includes(persona.priceSensitivity)) score += 3;
  if (/budget|cheap|coupon|折扣|低价|便宜|性价比/.test(text) && ['Very high', 'High'].includes(persona.priceSensitivity)) score += 3;
  if (/baby|kid|child|family|母婴|婴儿|儿童|家庭/.test(text) && /child|infant|family|children|parent/i.test(persona.family + persona.occupation)) score += 4;
  if (/small|compact|portable|fold|apartment|dorm|小户型|租房|宿舍|便携|折叠|收纳/.test(text) && /apartment|shared|studio|dorm|roommates|compact|small/i.test(persona.residence + persona.habits + persona.concerns.join(' '))) score += 4;
  if (/pet|dog|cat|宠物|猫|狗/.test(text) && /pet|dog|cat/i.test(persona.occupation + persona.family + persona.habits)) score += 4;
  if (/office|business|work|办公|商用/.test(text) && /office|manager|professional|administrator|business|sales/i.test(persona.occupation)) score += 3;

  score += persona.concerns.filter((concern) => text.includes(concern.toLowerCase())).length * 3;
  return score;
}

function buildPersonaSelectionReason(persona, template) {
  const matchedSignals = (template.persona_signals || []).filter((signal) =>
    `${persona.concerns.join(' ')} ${persona.habits}`.toLowerCase().includes(String(signal).toLowerCase())
  );
  const signals = matchedSignals.length ? matchedSignals.slice(0, 3).join(', ') : persona.concerns.slice(0, 2).join(', ');
  return `${persona.occupation} / ${persona.family}，关注 ${signals || 'value proof'}，适合验证 ${template.name} 的核心风险。`;
}

function buildSegmentMix(selectedPersonas) {
  const countBy = (getter) => selectedPersonas.reduce((acc, persona) => {
    const key = getter(persona);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    price_sensitivity: countBy((persona) => persona.priceSensitivity),
    age_range: countBy((persona) => persona.ageRange),
    family_keywords: {
      with_children: selectedPersonas.filter((persona) => /child|children|infant|parent/i.test(persona.family + persona.occupation)).length,
      small_space: selectedPersonas.filter((persona) => /apartment|shared|studio|dorm|roommates/i.test(persona.residence + persona.family)).length,
      premium_or_low_sensitivity: selectedPersonas.filter((persona) => persona.priceSensitivity === 'Low').length
    }
  };
}

function attachResearchMetadata(payload, researchPlan, extra = {}) {
  return {
    ...payload,
    metadata: {
      ...(payload.metadata || {}),
      ...extra,
      category_template: researchPlan.template,
      sampling: researchPlan.sampling
    }
  };
}

async function callAiResearch(product, selectedPersonas, settings, researchPlan, onProgress) {
  if (!settings.apiKey) {
    throw new Error('请先在 API 设置中保存 AI API Key。');
  }
  const endpoint = buildChatCompletionsEndpoint(settings.baseUrl);
  const chunks = chunkArray(selectedPersonas, 4);
  const personaResults = [];

  for (const [index, group] of chunks.entries()) {
    onProgress?.({
      stage: 'calling_ai',
      progress: Math.min(78, 24 + Math.round((index / Math.max(chunks.length, 1)) * 54)),
      activePersonaIds: group.map((persona) => persona.id)
    });
    try {
      const payload = await callPersonaBatch(product, group, settings, endpoint, researchPlan);
      personaResults.push(...payload.persona_results);
    } catch (error) {
      console.warn(`AI batch failed, using local fallback: ${error.message}`);
      personaResults.push(...buildRuleBasedPersonaResults(product, group));
    }
  }

  const payload = normalizePayload({
    persona_results: personaResults,
    summary: buildLocalSummary(product, personaResults, selectedPersonas, researchPlan),
    metadata: {
      engine: 'api-enhanced',
      model: settings.model,
      fallback_enabled: true
    }
  });
  return attachResearchMetadata(payload, researchPlan);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runOfflineResearch(product, selectedPersonas, researchPlan) {
  const personaResults = buildRuleBasedPersonaResults(product, selectedPersonas);
  const payload = normalizePayload({
    persona_results: personaResults,
    summary: buildLocalSummary(product, personaResults, selectedPersonas, researchPlan),
    metadata: {
      engine: 'offline-rules',
      model: 'local-rule-engine'
    }
  });
  return attachResearchMetadata(payload, researchPlan);
}

async function callPersonaBatch(product, selectedPersonas, settings, endpoint, researchPlan) {
  const body = {
    model: settings.model,
    temperature: 0.25,
    max_tokens: 6000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a strict Amazon product research analyst. Be skeptical like real shoppers. Return valid JSON only.'
      },
      {
        role: 'user',
        content: buildPersonaBatchContent(product, selectedPersonas, researchPlan, true)
      }
    ]
  };

  let response = await postChatCompletions(endpoint, settings.apiKey, body);
  let responseText = await response.text();

  if (!response.ok && shouldRetryWithoutImages(response.status, responseText)) {
    const textOnlyBody = {
      ...body,
      messages: [
        body.messages[0],
        {
          role: 'user',
          content: buildPersonaBatchContent(product, selectedPersonas, researchPlan, false)
        }
      ]
    };
    response = await postChatCompletions(endpoint, settings.apiKey, textOnlyBody);
    responseText = await response.text();
  }

  if (!response.ok && shouldRetryWithoutResponseFormat(response.status, responseText)) {
    const fallbackBody = { ...body, max_tokens: 10000 };
    delete fallbackBody.response_format;
    fallbackBody.messages = [
      body.messages[0],
      {
        role: 'user',
        content: buildPersonaBatchContent(product, selectedPersonas, researchPlan, false)
      }
    ];
    response = await postChatCompletions(endpoint, settings.apiKey, fallbackBody);
    responseText = await response.text();
  }

  if (!response.ok) {
    throw new Error(`AI 调用失败：${response.status} ${responseText.slice(0, 500)}`);
  }

  const json = JSON.parse(responseText);
  const content = json.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error(`AI 响应为空，finish_reason=${json.choices?.[0]?.finish_reason || 'unknown'}`);
  }

  return normalizePayload(extractJson(content));
}

function buildPersonaBatchContent(product, selectedPersonas, researchPlan, includeImages) {
  const prompt = buildPersonaBatchPrompt(product, selectedPersonas, researchPlan, includeImages);
  const imageParts = includeImages ? buildVisionImageParts(product) : [];
  if (!imageParts.length) return prompt;
  return [
    { type: 'text', text: prompt },
    ...imageParts
  ];
}

function buildVisionImageParts(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return images
    .slice(0, 9)
    .map((image, index) => {
      const dataUrl = String(image.dataUrl || '');
      if (!/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(dataUrl)) return null;
      return {
        type: 'image_url',
        image_url: {
          url: dataUrl
        },
        _image_index: index + 1
      };
    })
    .filter(Boolean)
    .map(({ _image_index, ...part }) => part);
}

function buildPersonaBatchPrompt(product, selectedPersonas, researchPlan, includeImages = false) {
  return `You are running a simulated buyer research exercise for Amazon operators.

Hard boundary:
- This is not a review-generation task.
- Do not write fake Amazon reviews.
- Do not claim these are real consumers or real survey results.
- Treat each persona as a market-research hypothesis generator.
- The persona must behave like a skeptical real Amazon shopper, not a polite evaluator.
- If images look cheap, inconsistent, blurry, low-trust, mismatched, over-edited, or fail to prove the claims, reduce purchase_intent_score.
- Do not give the product benefit of the doubt when images and claims conflict.

Product input:
${JSON.stringify(buildProductPromptPayload(product), null, 2)}

Image inspection mode:
${includeImages ? 'Uploaded product images are attached after this text. Inspect the actual pixels. Compare product photos, dimension images, material/detail images, and lifestyle scenes. If a dimension image seems inconsistent with product photos, call it out clearly.' : 'Actual image pixels are NOT available in this request. You must say image inspection is limited and judge only from image metadata and product text.'}

Category research template:
${JSON.stringify(researchPlan?.template || detectCategoryTemplate(product), null, 2)}

Personas:
${JSON.stringify(selectedPersonas, null, 2)}

Return one JSON object only:
{
  "persona_results": [
    {
      "persona_id": "US-001",
      "purchase_intent_score": 1,
      "likely_to_buy": false,
      "positive_points": ["string"],
      "negative_points": ["string"],
      "price_reaction": "string",
      "usage_scenario": "string",
      "main_objection": "string",
      "possible_bad_review_reason": "string",
      "suggested_improvement": "string",
      "image_expectation": "string",
      "image_purchase_impact": "string",
      "image_consistency_feedback": "string",
      "listing_copy_suggestion": "string",
      "confidence_score": 0.7
    }
  ]
}

Rules:
- Generate exactly ${selectedPersonas.length} persona_results, one for every persona_id in this batch.
- purchase_intent_score must be an integer from 1 to 5.
- confidence_score must be 0 to 1.
- image_purchase_impact must explain how the uploaded/listing images increase or decrease this persona's purchase intent.
- image_consistency_feedback must evaluate whether images, selling points, size/material claims, and usage scenario feel consistent or create trust gaps.
- Specifically check whether dimension images, scale references, product photos, material closeups, and lifestyle scenes appear to describe the same product.
- Specifically mention poor image quality, low resolution, visual clutter, unreadable text, cheap rendering, inconsistent colors, unrealistic proportions, or missing proof if present.
- Be concrete and operational. Avoid generic praise.
- Write in Simplified Chinese, but keep persona_id unchanged.`;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function buildProductPromptPayload(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const productLink = parseAmazonUrl(product.productUrl);
  const competitorLinks = parseAmazonLinks(product.competitorUrls);
  return {
    ...product,
    product_link_analysis: productLink,
    competitor_link_analysis: competitorLinks,
    images: images.map((image, index) => ({
      index: index + 1,
      name: image.name,
      type: image.type,
      size_kb: Math.round(Number(image.size || 0) / 1024)
    })),
    image_count: images.length
  };
}

function parseAmazonLinks(value) {
  return String(value || '')
    .split(/\r?\n|[ ,，]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(parseAmazonUrl)
    .filter(Boolean);
}

function parseAmazonUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(withProtocol);
  } catch {
    return { raw, valid: false, asin: extractAsin(raw), domain: '', path: '', type: 'invalid-url' };
  }
  const asin = extractAsin(`${url.pathname} ${url.search}`);
  return {
    raw,
    valid: true,
    asin,
    domain: url.hostname.replace(/^www\./, ''),
    path: url.pathname,
    type: asin ? 'amazon-product' : 'amazon-link'
  };
}

function extractAsin(value) {
  const text = String(value || '');
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /[?&]asin=([A-Z0-9]{10})(?:&|$)/i,
    /\b([A-Z0-9]{10})\b/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return '';
}

function buildRuleBasedPersonaResults(product, selectedPersonas) {
  const positives = splitInput(product.sellingPoints);
  const negatives = splitInput(product.knownWeaknesses);
  const competitorNotes = splitInput(product.competitors);
  const images = Array.isArray(product.images) ? product.images : [];

  return selectedPersonas.map((persona) => {
    const score = scorePersona(product, persona, positives, negatives);
    const topPositive = positives[0] || (images.length ? '已提供产品图片，可用于判断主图和A+内容方向' : `${product.productName || '该产品'}的功能点比较清晰`);
    const topNegative = negatives[0] || competitorNotes[0] || (images.length ? '图片仍需要补充尺寸、材质和使用场景证明' : '目前缺少产品图片、真实尺寸、材质和使用场景证明');
    const concern = persona.concerns[0] || 'value';

    return {
      persona_id: persona.id,
      purchase_intent_score: score,
      likely_to_buy: score >= 4,
      positive_points: [
        topPositive,
        persona.priceSensitivity === 'Low' ? '如果图片和质感可信，愿意为便利性支付溢价' : '如果价格解释清楚，会进入对比清单'
      ],
      negative_points: [
        topNegative,
        `该 persona 会重点审查 ${concern}，如果证据不足会降低购买意愿`
      ],
      price_reaction: buildPriceReaction(product.price, persona.priceSensitivity),
      usage_scenario: buildUsageScenario(product, persona),
      main_objection: `${persona.priceSensitivity === 'Very high' || persona.priceSensitivity === 'High' ? '价格和价值证明不足' : '缺少可信的实拍与细节证明'}，会让该 persona 暂缓下单。`,
      possible_bad_review_reason: negatives[0] ? `如果实际体验出现“${negatives[0]}”，容易转化为差评。` : '如果尺寸、材质或安装体验与页面预期不一致，容易形成差评。',
      suggested_improvement: buildImprovement(product, persona),
      image_expectation: buildImageExpectation(product, persona),
      image_purchase_impact: buildImagePurchaseImpact(product, persona, positives, negatives),
      image_consistency_feedback: buildImageConsistencyFeedback(product, persona, positives, negatives),
      listing_copy_suggestion: buildListingSuggestion(product, persona),
      confidence_score: 0.56
    };
  });
}

function splitInput(value) {
  return String(value || '')
    .split(/\r?\n|[;；]/)
    .map((item) => item.replace(/^\s*[\d一二三四五六七八九十]+[.、)-]?\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function scorePersona(product, persona, positives, negatives) {
  let score = 3;
  const price = Number(String(product.price || '').replace(/[^\d.]/g, ''));
  const imageCount = Array.isArray(product.images) ? product.images.length : 0;
  if (positives.length >= 4) score += 1;
  if (negatives.length >= 3) score -= 1;
  if (imageCount >= 3) score += 1;
  if (imageCount === 0) score -= 1;
  if (price >= 80 && ['Very high', 'High'].includes(persona.priceSensitivity)) score -= 1;
  if (price <= 35 && ['Very high', 'High'].includes(persona.priceSensitivity)) score += 1;
  if (/kid|child|baby|family|家庭|儿童|婴儿/i.test(`${product.targetAudience} ${persona.family}`)) score += 1;
  if (/small|compact|fold|portable|小户型|折叠|便携|宿舍|租房/i.test(`${product.sellingPoints} ${product.targetAudience} ${persona.habits}`)) score += 1;
  return Math.max(1, Math.min(5, score));
}

function buildPriceReaction(price, sensitivity) {
  if (!price) return '价格信息不足，建议补充竞品价位和促销策略后再判断。';
  if (sensitivity === 'Very high') return `对 ${price} 会非常敏感，需要用折扣、套装价值或明确对比图降低犹豫。`;
  if (sensitivity === 'High') return `会接受 ${price}，但前提是主图和五点能快速证明耐用性与使用价值。`;
  if (sensitivity === 'Low') return `如果质感、场景图和品牌可信度足够，${price} 不会是首要阻碍。`;
  return `对 ${price} 的接受度中等，需要解释相比竞品贵在哪里或省在哪里。`;
}

function buildUsageScenario(product, persona) {
  const category = product.category || '该类目';
  if (/apartment|rents|shared|condo|租房|宿舍|小户型/i.test(`${persona.residence} ${product.targetAudience}`)) {
    return `在空间有限的居住环境中，用于提升 ${category} 的收纳和日常效率。`;
  }
  if (/children|child|infant|family|家庭|儿童/i.test(`${persona.family} ${product.targetAudience}`)) {
    return `在家庭日常场景中使用，核心诉求是安全、耐用、好清洁。`;
  }
  return `在 ${persona.residence} 的日常使用场景中，用来解决 ${category} 的具体痛点。`;
}

function buildImprovement(product, persona) {
  const weakness = splitInput(product.knownWeaknesses)[0];
  if (weakness) return `优先解决或解释“${weakness}”，并在图片和文案中提前管理预期。`;
  if (persona.concerns.includes('real dimensions')) return '补充带真人、家具或标准物体参照的尺寸图，降低尺寸误判。';
  if (persona.concerns.includes('cleanability')) return '补充清洁步骤、材质耐污说明和使用后对比图。';
  return '补充真实使用场景、材质细节和竞品差异说明，不要只堆抽象卖点。';
}

function buildImageExpectation(product, persona) {
  const imageCount = Array.isArray(product.images) ? product.images.length : 0;
  if (imageCount === 0) return '当前没有上传产品图片，至少需要补充白底主图、尺寸图、场景图和细节图。';
  if (imageCount < 3) return `当前只上传了 ${imageCount} 张图片，需要继续补齐尺寸、材质、使用场景和对比图。`;
  if (persona.concerns.includes('size accuracy')) return '需要主图或副图展示清晰尺寸标注，并用真实场景证明比例。';
  if (persona.concerns.includes('aesthetics')) return '需要展示不同家居风格中的效果，避免只用白底孤品图。';
  if (persona.concerns.includes('safety')) return '需要展示边角、材质、承重或安全测试信息。';
  return `需要展示 ${product.productName || '产品'} 的实际使用前后对比、细节特写和安装/收纳过程。`;
}

function buildImagePurchaseImpact(product, persona, positives, negatives) {
  const imageCount = Array.isArray(product.images) ? product.images.length : 0;
  const topPoint = positives[0] || '核心卖点';
  const topRisk = negatives[0] || '尺寸、材质和真实使用效果';
  if (imageCount === 0) {
    return `当前没有图片证据，${persona.id} 会把购买意愿下调，因为无法确认 ${topPoint} 是否真实解决 ${topRisk}。`;
  }
  if (imageCount < 4) {
    return `离线规则只能基于图片数量和文案判断。当前 ${imageCount} 张图只能提供初步信任，若没有尺寸、材质、场景和细节图，购买意愿仍会被 ${topRisk} 拖低。`;
  }
  if (imageCount >= 8) {
    return `离线规则无法识别图片像素。图片数量充足只是基础，只有主图、场景图、尺寸图和细节图表达一致，才会提升该 persona 对 ${topPoint} 的信任和购买意愿。`;
  }
  return `离线规则无法判断图片真实质量。图片数量基本够用，但必须让每张图各自承担任务：主图证明外观，尺寸图证明适配，细节图证明材质，场景图证明 ${topPoint} 的真实价值。`;
}

function buildImageConsistencyFeedback(product, persona, positives, negatives) {
  const imageCount = Array.isArray(product.images) ? product.images.length : 0;
  const point = positives[0] || product.sellingPoints || '卖点';
  const weakness = negatives[0] || product.knownWeaknesses || '潜在缺点';
  if (imageCount === 0) {
    return '图片链路为空，卖点、尺寸、材质和使用场景之间没有视觉证据闭环。';
  }
  if (imageCount < 6) {
    return `离线规则无法发现图片内容矛盾，只能提示检查方向：如果文案说“${point}”，图片必须同步证明；如果存在“${weakness}”，也要用细节图提前管理预期。`;
  }
  return `需要人工或视觉模型检查 9 图逻辑是否一致：主图吸引点击，副图逐一证明 ${point}，尺寸/材质/安装/场景图不能互相矛盾，也不能只做氛围图。`;
}

function buildListingSuggestion(product, persona) {
  const point = splitInput(product.sellingPoints)[0] || '核心功能';
  return `标题和五点应优先讲清“${point}”对 ${persona.ageRange} ${persona.occupation} 这类人的实际价值。`;
}

function buildLocalSummary(product, personaResults, selectedPersonas, researchPlan) {
  const imageCount = Array.isArray(product.images) ? product.images.length : 0;
  const template = researchPlan?.template || detectCategoryTemplate(product);
  const average = personaResults.length
    ? Number((personaResults.reduce((sum, item) => sum + item.purchase_intent_score, 0) / personaResults.length).toFixed(1))
    : 0;
  const positives = collectTopItems(personaResults.flatMap((item) => item.positive_points));
  const negatives = collectTopItems([
    ...personaResults.flatMap((item) => item.negative_points),
    ...personaResults.map((item) => item.possible_bad_review_reason)
  ]);
  const personaById = Object.fromEntries(selectedPersonas.map((persona) => [persona.id, persona]));
  const best = personaResults
    .filter((item) => item.purchase_intent_score >= 4)
    .slice(0, 5)
    .map((item) => `${item.persona_id} ${personaById[item.persona_id]?.occupation || ''}`.trim());
  const weak = personaResults
    .filter((item) => item.purchase_intent_score <= 2)
    .slice(0, 5)
    .map((item) => `${item.persona_id} ${personaById[item.persona_id]?.occupation || ''}`.trim());

  return {
    overall_purchase_intent: average,
    top_positive_points: positives,
    top_negative_risks: negatives,
    best_target_customers: best.length ? best : ['卖点匹配度中等，暂未形成非常明确的强目标客群'],
    weak_target_customers: weak.length ? weak : ['没有明显完全排斥客群，但高价格敏感用户仍需要重点验证'],
    price_sensitivity_summary: buildPriceSummary(product.price, personaResults),
    product_optimization_suggestions: collectTopItems([
      ...personaResults.map((item) => item.suggested_improvement),
      ...template.risk_lenses.map((risk) => `围绕「${risk}」补证据：把风险前置到图片、五点或 QA 中，不要等差评出现后再解释。`)
    ]),
    listing_title_direction: `围绕“${product.productName || '产品'} + 核心使用场景 + 明确差异点”组织标题，避免只写材料和泛卖点。`,
    bullet_points_direction: [
      '第一点先讲最强使用收益，而不是堆参数。',
      '第二点解释尺寸、材质和适配场景，降低误购。',
      '第三点提前回应差评风险，例如安装、清洁、承重、色差或耐用性。',
      '第四点用竞品差异说明为什么值得这个价格。',
      '第五点写清售后、包装和使用注意事项。'
    ],
    main_image_suggestions: [
      imageCount ? `当前已上传 ${imageCount} 张图片，应筛选其中最能证明结构、尺寸和质感的一张作为主图参考。` : '当前未上传产品图片，先补白底主图，否则无法判断视觉转化风险。',
      '主图保持白底清晰，同时让关键结构和比例一眼可见。',
      '如果产品有可调节、折叠、抽屉或组合功能，主图中必须让功能状态可识别。',
      '避免只展示漂亮角度，忽略真实尺寸和材质质感。'
    ],
    aplus_image_suggestions: [
      imageCount ? '基于已上传图片，优先补齐缺失的使用场景、尺寸标注、材质特写和竞品对比。' : '先补齐产品实拍，再规划A+内容；没有图片时只能得到泛化建议。',
      '做一张目标场景图：小户型、租房、宿舍或家庭空间中的实际使用。',
      '做一张痛点对比图：使用前混乱 vs 使用后有序。',
      '做一张材质与结构细节图：承重、连接、边角、表面处理。',
      '做一张竞品差异图：明确你比普通款多解决了什么。'
    ],
    image_feedback_summary: collectTopItems([
      ...personaResults.map((item) => item.image_purchase_impact),
      ...personaResults.map((item) => item.image_consistency_feedback),
      imageCount >= 9
        ? '图片数量已经接近完整 9 图链路，下一步重点不是继续加图，而是检查主图、尺寸图、材质图、场景图、安装图和对比图是否各自承担明确任务。'
        : `当前只有 ${imageCount} 张图片，建议补足到 9 张：主图、尺寸图、材质细节、场景图、功能步骤、安装/收纳、痛点对比、竞品差异、包装/配件。`
    ]),
    qa_suggestions: [
      ...template.operator_questions,
      '尺寸是否适合我的空间？',
      '安装是否需要工具？',
      '材质是否稳定、是否容易变形？',
      '是否容易清洁？',
      '包装运输中是否容易损坏？'
    ],
    final_operator_summary: average >= 3.6
      ? '该产品具备继续推进价值，但必须用图片和文案证明核心功能，尤其要提前处理价格敏感和差评风险。'
      : '当前购买意向不够强，建议先强化差异化卖点、价格解释和真实场景证明，再进入大规模投放或备货。'
  };
}

function collectTopItems(items) {
  const cleaned = items.map((item) => String(item || '').trim()).filter(Boolean);
  return [...new Set(cleaned)].slice(0, 6);
}

function buildPriceSummary(price, personaResults) {
  const highConcernCount = personaResults.filter((item) => /敏感|价格|折扣|value|贵|价/i.test(`${item.price_reaction} ${item.main_objection}`)).length;
  if (!price) return '价格字段为空，无法形成稳定价格判断。建议补充目标售价和竞品价格带。';
  if (highConcernCount >= personaResults.length / 2) {
    return `${price} 对样本池中的高价格敏感人群有明显压力，需要用套装价值、耐用性证明、促销或对比图解释。`;
  }
  return `${price} 的阻力可控，但页面必须说明材质、尺寸、功能和竞品差异，否则中等价格敏感用户仍会犹豫。`;
}

function buildChatCompletionsEndpoint(baseUrl) {
  const trimmed = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  if (trimmed.endsWith('/chat')) return `${trimmed}/completions`;
  return `${trimmed}/chat/completions`;
}

function shouldRetryWithoutResponseFormat(status, body) {
  if (status !== 400 && status !== 422) return false;
  return /response_format|json_object|unsupported|not support|invalid/i.test(body);
}

function shouldRetryWithoutImages(status, body) {
  if (![400, 413, 415, 422].includes(status)) return false;
  return /image|image_url|vision|multimodal|content.*array|unsupported|not support|payload|too large|invalid/i.test(body);
}

async function postChatCompletions(endpoint, apiKey, body) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1040,
    minHeight: 720,
    title: 'Amazon AI Researcher',
    backgroundColor: '#f7f8fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  openDb();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('app:init', () => ({
  settings: getSettings(),
  personas: listPersonas(),
  reports: listReports()
}));

ipcMain.handle('settings:save', (_event, settings) => saveSettings(settings));
ipcMain.handle('reports:list', (_event, search) => listReports(search || ''));
ipcMain.handle('reports:get', (_event, reportId) => getReport(reportId));
ipcMain.handle('reports:delete', (_event, reportId) => deleteReport(reportId));
ipcMain.handle('reports:rename', (_event, reportId, title) => renameReport(reportId, title));
ipcMain.handle('reports:exportExcel', (event, reportId) => exportReportExcel(event, reportId));

ipcMain.handle('research:run', async (event, request) => {
  const product = request?.product || request;
  const personaPool = listPersonas();
  const settings = getSettings();
  const requestedEngineMode = request?.engineMode || settings.engineMode;
  const researchPlan = createResearchPlan(product, personaPool, requestedEngineMode);
  const selectedPersonas = researchPlan.selectedPersonas;
  const sendProgress = (payload) => event.sender.send('research:progress', payload);
  sendProgress({ stage: 'queued', progress: 8, activePersonaIds: selectedPersonas.slice(0, 4).map((p) => p.id) });
  const project = createProject(product);
  const useApi = requestedEngineMode === 'api-enhanced' && settings.apiKey;
  await delay(160);
  sendProgress({
    stage: useApi ? 'calling_ai' : 'offline_rules',
    progress: 22,
    activePersonaIds: selectedPersonas.slice(0, 12).map((p) => p.id)
  });
  let payload;
  if (useApi) {
    try {
      payload = await callAiResearch(product, selectedPersonas, settings, researchPlan, sendProgress);
    } catch (error) {
      console.warn(`API enhanced research failed, using offline rules: ${error.message}`);
      sendProgress({ stage: 'offline_rules', progress: 58, activePersonaIds: selectedPersonas.slice(0, 16).map((p) => p.id) });
      await delay(180);
      payload = runOfflineResearch(product, selectedPersonas, researchPlan);
      payload = attachResearchMetadata(payload, researchPlan, { engine: 'offline-rules-after-api-failure' });
    }
  } else {
    await delay(260);
    sendProgress({ stage: 'offline_rules', progress: 58, activePersonaIds: selectedPersonas.slice(12, 28).map((p) => p.id) });
    await delay(180);
    payload = runOfflineResearch(product, selectedPersonas, researchPlan);
  }
  sendProgress({ stage: 'saving', progress: 86, activePersonaIds: payload.persona_results.slice(0, 18).map((p) => p.persona_id) });
  const report = saveReport(project.id, payload);
  saveTrainingExample(project.id, product, payload);
  await delay(140);
  sendProgress({ stage: 'done', progress: 100, activePersonaIds: [] });
  return { project, report };
});
