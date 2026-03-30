import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  MessageSquare,
  Phone,
  MapPin,
  Store,
  Filter,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Brain,
  Plus,
  Star,
  Upload,
  Download,
  Clock3,
  ClipboardList,
  RefreshCw,
  FileSpreadsheet,
  Target,
  BadgeCheck,
  Copy,
} from "lucide-react";

const STORAGE_KEY = "smart-lead-platform-v3-online";
const TODAY = new Date().toISOString().slice(0, 10);

const seedLeads = [
  {
    id: 1,
    name: "兴旺五金贸易",
    ownerSurname: "陈",
    region: "Skudai",
    industry: "五金",
    phone: "016-888 1234",
    hasMobile: true,
    whatsappBusiness: true,
    chineseLikely: true,
    businessStable: true,
    chainStore: false,
    contacted: false,
    status: "new",
    notes: "门店稳定，适合华语沟通",
    source: "Google Maps",
    followUpDate: TODAY,
    lastContactDate: "",
  },
  {
    id: 2,
    name: "金福海鲜饭店",
    ownerSurname: "林",
    region: "Mount Austin",
    industry: "餐饮",
    phone: "012-334 8921",
    hasMobile: true,
    whatsappBusiness: true,
    chineseLikely: true,
    businessStable: true,
    chainStore: false,
    contacted: true,
    status: "follow_up",
    notes: "可二次切入做 review",
    source: "Referral",
    followUpDate: TODAY,
    lastContactDate: TODAY,
  },
  {
    id: 3,
    name: "Bright Auto Care",
    ownerSurname: "Tan",
    region: "Johor Jaya",
    industry: "汽修",
    phone: "07-556 3321",
    hasMobile: false,
    whatsappBusiness: false,
    chineseLikely: true,
    businessStable: true,
    chainStore: false,
    contacted: false,
    status: "new",
    notes: "有机会，但不是手机",
    source: "Manual",
    followUpDate: "",
    lastContactDate: "",
  },
  {
    id: 4,
    name: "万顺食品批发",
    ownerSurname: "黄",
    region: "Taman Universiti",
    industry: "批发",
    phone: "018-778 5432",
    hasMobile: true,
    whatsappBusiness: true,
    chineseLikely: true,
    businessStable: true,
    chainStore: false,
    contacted: false,
    status: "qualified",
    notes: "高潜力名单，建议优先处理",
    source: "Google Maps",
    followUpDate: TODAY,
    lastContactDate: "",
  },
  {
    id: 5,
    name: "Daily Glow Beauty",
    ownerSurname: "Lee",
    region: "Bukit Indah",
    industry: "美业",
    phone: "017-662 9087",
    hasMobile: true,
    whatsappBusiness: true,
    chineseLikely: true,
    businessStable: false,
    chainStore: false,
    contacted: true,
    status: "appointment",
    notes: "已愿意约时间详聊",
    source: "WhatsApp",
    followUpDate: TODAY,
    lastContactDate: TODAY,
  },
  {
    id: 6,
    name: "Mega Home Retail",
    ownerSurname: "-",
    region: "Kulai",
    industry: "零售",
    phone: "019-100 2000",
    hasMobile: true,
    whatsappBusiness: false,
    chineseLikely: false,
    businessStable: true,
    chainStore: true,
    contacted: false,
    status: "new",
    notes: "偏连锁，不建议优先",
    source: "Directory",
    followUpDate: "",
    lastContactDate: "",
  },
];

const statusMeta = {
  new: { label: "新名单", style: "bg-slate-100 text-slate-700" },
  qualified: { label: "高意向", style: "bg-emerald-100 text-emerald-700" },
  follow_up: { label: "待跟进", style: "bg-amber-100 text-amber-700" },
  appointment: { label: "已预约", style: "bg-sky-100 text-sky-700" },
  closed: { label: "已成交", style: "bg-violet-100 text-violet-700" },
};

const regionOptions = ["全部", "Skudai", "Mount Austin", "Johor Jaya", "Taman Universiti", "Bukit Indah", "Kulai", "Senai", "Tampoi"];
const industryOptions = ["全部", "五金", "餐饮", "汽修", "批发", "美业", "零售", "文具", "家居"];
const sourceOptions = ["Manual", "Google Maps", "WhatsApp", "Referral", "Directory", "Facebook"];

function scoreLead(lead) {
  let score = 0;
  if (lead.hasMobile) score += 20;
  if (lead.whatsappBusiness) score += 15;
  if (lead.chineseLikely) score += 20;
  if (["五金", "批发", "餐饮", "美业", "汽修"].includes(lead.industry)) score += 25;
  if (lead.businessStable) score += 15;
  if (["Skudai", "Taman Universiti", "Bukit Indah", "Johor Jaya", "Mount Austin", "Tampoi"].includes(lead.region)) score += 10;
  if (lead.chainStore) score -= 20;
  if (lead.contacted) score -= 5;
  if (lead.status === "qualified") score += 10;
  if (lead.status === "appointment") score += 15;
  return Math.max(0, Math.min(score, 100));
}

function getPriority(score) {
  if (score >= 75) return { label: "A级", style: "bg-emerald-500 text-white" };
  if (score >= 55) return { label: "B级", style: "bg-amber-500 text-white" };
  if (score >= 35) return { label: "C级", style: "bg-sky-500 text-white" };
  return { label: "D级", style: "bg-slate-500 text-white" };
}

function generateOpening(lead) {
  const title = lead.ownerSurname && lead.ownerSurname !== "-" ? `${lead.ownerSurname}老板` : "老板";
  if (lead.status === "follow_up") {
    return `嗨 ${title}，上次有简单和您提过保障 review 的部分。我这边最近刚好在帮几位本地商家整理个人保障，想顺便帮您看一下目前保障有没有重叠或缺口，不会耽误您太久，您这两天哪一天比较方便让我和您对一对？`;
  }

  if (lead.industry === "餐饮") {
    return `你好 ${title}，我这边主要是服务本地做生意的老板。像餐饮业平时工作时间长、风险也比较集中，所以很多老板都会先做一个简单的个人保障 review。我不是来硬推销的，主要是帮您先看现有保障够不够。方便的话，我可以先和您简单了解一下。`;
  }

  if (lead.industry === "五金" || lead.industry === "批发") {
    return `你好 ${title}，我平时主要接触本地做生意的老板，像五金和批发这类行业，很多人都会先把意外、医药和家庭责任那部分整理好。我这边想和您认识一下，也可以免费帮您做个现有保障 review，看有没有可以优化的地方。`;
  }

  return `你好 ${title}，我是专门服务本地商家客户的。现在很多老板都会先做一个简单的保障整理，了解自己目前有没有重复缴、保障不足或者重点遗漏。我这边可以先帮您做个基础 review，不会占用太久，方便认识一下吗？`;
}

function nextAction(lead) {
  const score = scoreLead(lead);
  if (lead.status === "appointment") return "准备 appointment 脚本与需求确认";
  if (lead.status === "follow_up") return "安排 3 天内二次触达";
  if (lead.status === "qualified") return "优先发送 review 邀约与时间确认";
  if (score >= 75) return "优先 WhatsApp + 电话双触达";
  if (score >= 55) return "先 WhatsApp 破冰，再观察回复";
  return "先放入养熟池，暂不强攻";
}

function csvEscape(value) {
  const safe = String(value ?? "");
  if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function exportToCSV(rows) {
  const headers = [
    "name",
    "ownerSurname",
    "region",
    "industry",
    "phone",
    "source",
    "status",
    "score",
    "priority",
    "followUpDate",
    "lastContactDate",
    "notes",
  ];
  const body = rows.map((row) => [
    row.name,
    row.ownerSurname,
    row.region,
    row.industry,
    row.phone,
    row.source,
    row.status,
    row.score,
    row.priority.label,
    row.followUpDate,
    row.lastContactDate,
    row.notes,
  ]);
  return [headers, ...body].map((line) => line.map(csvEscape).join(",")).join("\n");
}

function parseCsvText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(",").map((h) => h.trim());

  return dataLines.map((line, index) => {
    const cols = line.split(",").map((c) => c.trim());
    const item = Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));

    return {
      id: Date.now() + index,
      name: item.name || item.store || "未命名店家",
      ownerSurname: item.ownerSurname || item.surname || "",
      region: item.region || "Skudai",
      industry: item.industry || "五金",
      phone: item.phone || item.mobile || "",
      hasMobile: (item.hasMobile || item.mobileFlag || "true").toLowerCase() !== "false",
      whatsappBusiness: (item.whatsappBusiness || "true").toLowerCase() !== "false",
      chineseLikely: (item.chineseLikely || "true").toLowerCase() !== "false",
      businessStable: (item.businessStable || "true").toLowerCase() !== "false",
      chainStore: (item.chainStore || "false").toLowerCase() === "true",
      contacted: false,
      status: ["new", "qualified", "follow_up", "appointment", "closed"].includes(item.status) ? item.status : "new",
      notes: item.notes || "由 CSV 导入",
      source: item.source || "Manual",
      followUpDate: item.followUpDate || "",
      lastContactDate: item.lastContactDate || "",
    };
  });
}

function MetricCard({ title, value, hint, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-slate-900 p-2 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="text-base font-medium text-slate-800">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leads, setLeads] = useState(seedLeads);
  const [region, setRegion] = useState("全部");
  const [industry, setIndustry] = useState("全部");
  const [mobileOnly, setMobileOnly] = useState(true);
  const [chineseOnly, setChineseOnly] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [csvText, setCsvText] = useState("name,ownerSurname,region,industry,phone,source,status,notes\n大发五金,刘,Skudai,五金,0161234567,Google Maps,new,适合先 WhatsApp\n顺利海鲜饭店,陈,Mount Austin,餐饮,0128889999,Referral,follow_up,上周已接触");
  const [form, setForm] = useState({
    name: "",
    ownerSurname: "",
    region: "Skudai",
    industry: "五金",
    phone: "",
    source: "Manual",
    hasMobile: true,
    whatsappBusiness: true,
    chineseLikely: true,
    businessStable: true,
    chainStore: false,
    notes: "",
    followUpDate: "",
  });
  const exportAnchorRef = useRef(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setLeads(parsed);
      } catch {
        // ignore invalid local storage data
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads]);

  const enrichedLeads = useMemo(() => {
    return leads.map((lead) => ({
      ...lead,
      score: scoreLead(lead),
      priority: getPriority(scoreLead(lead)),
      opening: generateOpening(lead),
      action: nextAction(lead),
    }));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return enrichedLeads
      .filter((lead) => (region === "全部" ? true : lead.region === region))
      .filter((lead) => (industry === "全部" ? true : lead.industry === industry))
      .filter((lead) => (mobileOnly ? lead.hasMobile : true))
      .filter((lead) => (chineseOnly ? lead.chineseLikely : true))
      .filter((lead) => {
        if (!kw) return true;
        return [lead.name, lead.ownerSurname, lead.region, lead.industry, lead.phone, lead.notes]
          .join(" ")
          .toLowerCase()
          .includes(kw);
      })
      .sort((a, b) => b.score - a.score);
  }, [enrichedLeads, region, industry, mobileOnly, chineseOnly, keyword]);

  const todayPriorityList = useMemo(() => filteredLeads.slice(0, 8), [filteredLeads]);

  const followUpToday = useMemo(
    () => enrichedLeads.filter((lead) => lead.followUpDate && lead.followUpDate <= TODAY && lead.status !== "closed"),
    [enrichedLeads]
  );

  const pipeline = useMemo(
    () => ({
      new: enrichedLeads.filter((x) => x.status === "new"),
      qualified: enrichedLeads.filter((x) => x.status === "qualified"),
      follow_up: enrichedLeads.filter((x) => x.status === "follow_up"),
      appointment: enrichedLeads.filter((x) => x.status === "appointment"),
      closed: enrichedLeads.filter((x) => x.status === "closed"),
    }),
    [enrichedLeads]
  );

  const metrics = {
    total: enrichedLeads.length,
    aClass: enrichedLeads.filter((x) => x.priority.label === "A级").length,
    followUp: enrichedLeads.filter((x) => x.status === "follow_up").length,
    appointments: enrichedLeads.filter((x) => x.status === "appointment").length,
    dueToday: followUpToday.length,
  };

  const addLead = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    const newLead = {
      id: Date.now(),
      ...form,
      contacted: false,
      lastContactDate: "",
      status: "new",
    };
    setLeads((prev) => [newLead, ...prev]);
    setForm({
      name: "",
      ownerSurname: "",
      region: "Skudai",
      industry: "五金",
      phone: "",
      source: "Manual",
      hasMobile: true,
      whatsappBusiness: true,
      chineseLikely: true,
      businessStable: true,
      chainStore: false,
      notes: "",
      followUpDate: "",
    });
    setActiveTab("leads");
  };

  const moveStatus = (id, status) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status,
              contacted: status !== "new",
              lastContactDate: status === "new" ? lead.lastContactDate : TODAY,
              followUpDate: status === "follow_up" ? TODAY : lead.followUpDate,
            }
          : lead
      )
    );
  };

  const setLeadFollowUpDate = (id, date) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, followUpDate: date } : lead)));
  };

  const importCsv = () => {
    const imported = parseCsvText(csvText).filter((item) => item.phone);
    if (!imported.length) return;
    setLeads((prev) => [...imported, ...prev]);
    setActiveTab("leads");
  };

  const resetData = () => {
    setLeads(seedLeads);
  };

  const downloadCsv = () => {
    const csv = exportToCSV(enrichedLeads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    if (exportAnchorRef.current) {
      exportAnchorRef.current.href = url;
      exportAnchorRef.current.download = `smart-leads-${TODAY}.csv`;
      exportAnchorRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const deleteLead = (id) => {
    const ok = window.confirm("确定要删除这笔名单吗？删除后无法恢复。");
    if (!ok) return;
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const copyOpening = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      window.alert("话术已复制，可以直接贴去 WhatsApp。");
    } catch {
      window.alert("复制失败，请手动复制。");
    }
  };

  const tabs = [
    { key: "dashboard", label: "总览" },
    { key: "leads", label: "搜客引擎" },
    { key: "tasks", label: "今日任务" },
    { key: "outreach", label: "触达话术" },
    { key: "pipeline", label: "跟进管道" },
    { key: "builder", label: "导入 / 新增" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a ref={exportAnchorRef} className="hidden" href="#">download</a>
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                AI 智能获客中台 · v2 可用雏形
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
                从展示原型升级成
                <span className="text-sky-300">可管理名单的实用工作台</span>
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                这一版已经补上本地储存、CSV 导入、CSV 导出、每日跟进任务、关键字搜索、跟进日期与更完整的客户状态逻辑。你现在可以把它当成一个轻量级名单管理与智能筛选工作台来试跑。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "LocalStorage 储存",
                  "CSV 导入",
                  "CSV 导出",
                  "今日任务清单",
                  "跟进日期",
                  "智能排序",
                ].map((tag) => (
                  <div key={tag} className="rounded-2xl bg-white/10 px-4 py-2 text-sm">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">今日重点</p>
                <p className="mt-2 text-xl font-semibold">先处理到期跟进与 A 级名单</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  系统会同步显示最值得先联络的人，以及今天必须处理的 follow up 对象。
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">当前定位</p>
                <p className="mt-2 text-xl font-semibold">本地商家获客操作台</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  适合先用来管理你自己搜到的商家名单，再逐步接到真正数据库或自动搜客模块。
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard title="总名单数" value={metrics.total} hint="当前系统里的全部潜在客户" icon={Users} />
              <MetricCard title="A级名单" value={metrics.aClass} hint="建议优先联络与推进" icon={Star} />
              <MetricCard title="待跟进" value={metrics.followUp} hint="适合 3 天内再触达" icon={MessageSquare} />
              <MetricCard title="已预约" value={metrics.appointments} hint="准备进 review / appointment" icon={Calendar} />
              <MetricCard title="今日到期" value={metrics.dueToday} hint="今天该处理的 follow up" icon={Clock3} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={Brain} title="今日优先清单" subtitle="系统根据评分自动推荐最值得先处理的名单" />
                <div className="mt-6 space-y-4">
                  {todayPriorityList.length === 0 && <EmptyState title="暂无符合条件名单" text="调整筛选条件后，系统会自动重新排序。" />}
                  {todayPriorityList.map((lead) => (
                    <div key={lead.id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{lead.name}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lead.priority.style}`}>{lead.priority.label}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta[lead.status].style}`}>{statusMeta[lead.status].label}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{lead.region}</span>
                            <span className="inline-flex items-center gap-1"><Store className="h-4 w-4" />{lead.industry}</span>
                            <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{lead.phone}</span>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center md:min-w-[120px]">
                          <div className="text-xs text-slate-500">评分</div>
                          <div className="mt-1 text-2xl font-semibold">{lead.score}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-700">推荐下一步</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{lead.action}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-700">跟进日期</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{lead.followUpDate || "尚未安排"}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-700">来源</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{lead.source}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle icon={ClipboardList} title="今日必须处理" subtitle="到期跟进对象会集中出现在这里" />
                  <div className="mt-5 space-y-3">
                    {followUpToday.length === 0 && <EmptyState title="今天没有到期跟进" text="你可以先推进 A 级新名单。" />}
                    {followUpToday.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800">{lead.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{lead.region} · {lead.industry}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lead.priority.style}`}>{lead.priority.label}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{lead.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle icon={CheckCircle2} title="这一版已补上的能力" subtitle="比第一版更接近真实可用" />
                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    {[
                      "名单会自动储存在浏览器，不用每次重打",
                      "可贴上 CSV 文字批量导入名单",
                      "可一键导出目前全部名单成 CSV",
                      "每个顾客可以设定跟进日期",
                      "系统会自动整理今日到期任务",
                      "支持关键字搜寻与多条件筛选",
                    ].map((rule) => (
                      <div key={rule} className="rounded-2xl bg-slate-50 px-4 py-3">{rule}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle icon={Filter} title="搜客筛选器" subtitle="按地区、行业、手机、华语概率和关键字过滤名单" />
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">地区</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                    {regionOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">行业</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                    {industryOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-slate-700">关键字搜索</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="店名 / 地区 / 号码" className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-slate-400" />
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" checked={mobileOnly} onChange={(e) => setMobileOnly(e.target.checked)} className="h-4 w-4" />
                  只看有手机号码
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" checked={chineseOnly} onChange={(e) => setChineseOnly(e.target.checked)} className="h-4 w-4" />
                  只看华语概率高
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredLeads.length === 0 && <EmptyState title="没有符合条件的名单" text="你可以放宽筛选条件，或先去导入新名单。" />}
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{lead.name}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lead.priority.style}`}>{lead.priority.label}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta[lead.status].style}`}>{statusMeta[lead.status].label}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{lead.region}</span>
                        <span className="inline-flex items-center gap-1"><Store className="h-4 w-4" />{lead.industry}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{lead.phone}</span>
                        <span className="inline-flex items-center gap-1"><BadgeCheck className="h-4 w-4" />{lead.source}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{lead.notes || "暂无备注"}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:min-w-[420px]">
                      <div className="rounded-2xl bg-slate-50 p-4 text-center">
                        <div className="text-xs text-slate-500">智能评分</div>
                        <div className="mt-1 text-3xl font-semibold text-slate-900">{lead.score}</div>
                        <div className="mt-1 text-xs text-slate-500">{lead.priority.label} 优先级</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs text-slate-500">系统建议</div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">{lead.action}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">跟进日期</label>
                      <input
                        type="date"
                        value={lead.followUpDate || ""}
                        onChange={(e) => setLeadFollowUpDate(lead.id, e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => moveStatus(lead.id, "qualified")} className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-200">标记高意向</button>
                      <button onClick={() => moveStatus(lead.id, "follow_up")} className="rounded-2xl bg-amber-100 px-3 py-2 text-sm text-amber-700 hover:bg-amber-200">安排跟进</button>
                      <button onClick={() => moveStatus(lead.id, "appointment")} className="rounded-2xl bg-sky-100 px-3 py-2 text-sm text-sky-700 hover:bg-sky-200">移入预约</button>
                      <button onClick={() => moveStatus(lead.id, "closed")} className="rounded-2xl bg-violet-100 px-3 py-2 text-sm text-violet-700 hover:bg-violet-200">标记成交</button>
                      <button onClick={() => deleteLead(lead.id)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm text-rose-700 hover:bg-rose-200">删除名单</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle icon={Clock3} title="今日跟进任务" subtitle="只要 followUpDate 到期，系统就会把名单推到这里" />
              <div className="mt-6 space-y-4">
                {followUpToday.length === 0 && <EmptyState title="今天没有待处理 follow up" text="你可以先去推进新名单或 A 级名单。" />}
                {followUpToday.map((lead) => (
                  <div key={lead.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{lead.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{lead.region} · {lead.industry} · {lead.phone}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lead.priority.style}`}>{lead.priority.label}</span>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">推荐动作</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{lead.action}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">上次联系日期</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{lead.lastContactDate || "尚未记录"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => moveStatus(lead.id, "follow_up")} className="rounded-2xl bg-amber-100 px-3 py-2 text-sm text-amber-700 hover:bg-amber-200">保留待跟进</button>
                      <button onClick={() => moveStatus(lead.id, "appointment")} className="rounded-2xl bg-sky-100 px-3 py-2 text-sm text-sky-700 hover:bg-sky-200">转入预约</button>
                      <button onClick={() => moveStatus(lead.id, "closed")} className="rounded-2xl bg-violet-100 px-3 py-2 text-sm text-violet-700 hover:bg-violet-200">标记成交</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle icon={Target} title="每日作战建议" subtitle="把今天最该做的动作直接列出来" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">优先动作 1</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">先清掉今日到期跟进</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">因为这些名单已经进入你的触达节奏，继续推进的成本通常低于重新开发新客。</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">优先动作 2</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">再处理 A 级新名单</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">系统会自动按评分排序，建议从评分最高、且有手机的对象先联络。</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">优先动作 3</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">把已愿意聊的人推进预约</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">不要让高意向名单停留太久，尽快让它进入 appointment 或 review 阶段。</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">优先动作 4</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">导出名单做备份</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">工作到一半可以把当前名单导出，方便你之后丢去 Excel、Sheets 或交给开发者接系统。</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "outreach" && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={MessageSquare} title="自动触达话术" subtitle="系统按行业与当前状态自动生成较贴近真人的开场白" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {todayPriorityList.length === 0 && <EmptyState title="暂无优先名单" text="先去新增或导入名单，系统才会生成对应话术。" />}
              {todayPriorityList.map((lead) => (
                <div key={lead.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{lead.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{lead.region} · {lead.industry} · {lead.phone}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${lead.priority.style}`}>{lead.priority.label}</span>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    {lead.opening}
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <ArrowRight className="mt-1 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">建议下一步</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{lead.action}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => copyOpening(lead.opening)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"><Copy className="h-4 w-4" />复制这段话术</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pipeline" && (
          <div className="mt-6 grid gap-4 xl:grid-cols-5">
            {Object.entries(pipeline).map(([key, items]) => (
              <div key={key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-slate-500">{statusMeta[key].label}</p>
                    <p className="text-2xl font-semibold text-slate-900">{items.length}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta[key].style}`}>{statusMeta[key].label}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {items.length === 0 && (
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">暂无名单</div>
                  )}
                  {items.map((lead) => (
                    <div key={lead.id} className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-medium text-slate-800">{lead.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{lead.region} · {lead.industry}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{lead.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "builder" && (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={Plus} title="新增潜在客户" subtitle="把你手上的名单手动录入系统，立即获得评分与建议" />
                <div className="mt-6 grid gap-4">
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="店名 / 公司名" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                  <input value={form.ownerSurname} onChange={(e) => setForm((p) => ({ ...p, ownerSurname: e.target.value }))} placeholder="老板姓氏（可选）" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <select value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                      {regionOptions.filter((x) => x !== "全部").map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <select value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                      {industryOptions.filter((x) => x !== "全部").map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="电话号码 / 手机号码" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                      {sourceOptions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <input type="date" value={form.followUpDate} onChange={(e) => setForm((p) => ({ ...p, followUpDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                  </div>
                  <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="备注，例如：门店稳定、适合华语、附近区域等" className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["hasMobile", "有手机号码"],
                      ["whatsappBusiness", "有 WhatsApp Business"],
                      ["chineseLikely", "华语沟通概率高"],
                      ["businessStable", "经营稳定"],
                      ["chainStore", "连锁门店"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form[key]}
                          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                          className="h-4 w-4"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <button onClick={addLead} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
                    <Plus className="h-4 w-4" />
                    加入系统并自动评分
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={RefreshCw} title="系统控制" subtitle="快速备份、导出与重置示范资料" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button onClick={downloadCsv} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-500">
                    <Download className="h-4 w-4" />
                    导出全部名单 CSV
                  </button>
                  <button onClick={resetData} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
                    <RefreshCw className="h-4 w-4" />
                    重置成示范资料
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={Upload} title="CSV 批量导入" subtitle="先贴入 CSV 文字，系统会把名单批量加入并自动评分" />
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                  支援的基本字段：name, ownerSurname, region, industry, phone, source, status, notes。第一行必须是标题列。现在这版先做轻量导入，适合从 Excel 或 Google Sheets 复制成 CSV 文本后贴进来。
                </div>
                <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} className="mt-4 min-h-[220px] w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-slate-400" />
                <button onClick={importCsv} className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500">
                  <FileSpreadsheet className="h-4 w-4" />
                  导入名单到系统
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={Brain} title="下一阶段最值得接入的功能" subtitle="把这版继续推进成真正商业系统" />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "真实数据库",
                      text: "把 LocalStorage 升级成 Supabase / Firebase / PostgreSQL，让资料可跨装置同步。",
                    },
                    {
                      title: "账号与权限",
                      text: "让你和团队成员都能登入，看到各自名单与进度。",
                    },
                    {
                      title: "自动搜客接入",
                      text: "接 Google Maps / 表单 / 外部 API，把名单自动灌进来。",
                    },
                    {
                      title: "WhatsApp 工作流",
                      text: "把名单与话术接到你的触达动作，而不是只停留在内部管理。",
                    },
                    {
                      title: "回复意图判断",
                      text: "顾客回复后让 AI 自动判定是拒绝、延后、可预约还是高意向。",
                    },
                    {
                      title: "成交报表",
                      text: "统计地区、行业、来源、跟进次数与预约率，做更强的商业判断。",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl border border-slate-200 p-5">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
