# AI 智能获客中台（StackBlitz / Vercel 最终上线版）

这是一个基于 **React + Vite + Tailwind CSS** 的本地商家获客工作台，可直接本地运行，也适合部署到 **StackBlitz** 与 **Vercel**。

## 已包含功能

- 名单总览
- 地区 / 行业 / 关键字筛选
- 智能评分与优先级排序
- 今日任务清单
- 自动触达话术
- 跟进管道
- CSV 导入 / 导出
- 浏览器本地储存（localStorage）
- 名单编辑 / 删除
- 疑似重复识别
- 一键复制话术

## 本地运行

```bash
npm install
npm run dev
```

开发地址通常会是：

```bash
http://localhost:5173
```

## 部署到 Vercel

这个项目已经附带 `vercel.json`，可直接部署。Vercel 当前对 Vite 有官方支持，也支持通过 Git 导入和 CLI 部署。citeturn385635search0turn385635search6turn385635search11

### 方式 1：导入 Git 仓库

1. 把这个项目上传到 GitHub。
2. 在 Vercel 里选择导入该仓库。
3. 保持默认设置或使用项目里的 `vercel.json`。
4. 点击部署。

### 方式 2：Vercel CLI

```bash
npm i -g vercel
vercel
```

生产部署：

```bash
vercel --prod
```

Vercel CLI 当前支持 `vercel` 与 `vercel --prod` 这类部署方式。citeturn385635search10

## 放到 StackBlitz

StackBlitz 官方文档说明，最直接的导入方式是从 **GitHub 仓库** 导入。citeturn385635search1

做法：

1. 把这个项目上传到 GitHub。
2. 打开：

```text
https://stackblitz.com/github/你的GitHub用户名/你的仓库名
```

或在 StackBlitz 首页选择从 GitHub 导入。

## 目录说明

- `src/App.jsx`：主页面逻辑
- `src/main.jsx`：入口文件
- `src/index.css`：样式入口
- `vite.config.js`：Vite 配置
- `vercel.json`：Vercel 部署配置

## 备注

当前这版是 **前端工作台 + 本地储存原型**。
如果你要继续升级成正式商业系统，下一步最值得接：

- 真正数据库（Supabase / Firebase / PostgreSQL）
- 登录账号
- 多设备同步
- WhatsApp 工作流
- AI 回复意图判断
- 报表系统
