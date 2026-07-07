"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { findScreen, modules, sampleRows, workflowSteps, type IconName, type ModuleDefinition, type ScreenDefinition } from "./admin-data";

const adminStyles = `
.ems-shell{--ems-sidebar:286px;background:#eef3f8;color:#172033;display:grid;grid-template-columns:var(--ems-sidebar) minmax(0,1fr);height:100dvh;inset:0;max-height:100dvh;overflow:hidden;position:fixed;width:100vw;font-family:var(--font-inter),Arial,sans-serif}
.ems-shell.sidebar-collapsed{--ems-sidebar:86px}
.ems-shell *{box-sizing:border-box}.ems-shell a{color:inherit;text-decoration:none}.ems-shell button,.ems-shell input{font:inherit}body:has(.ems-shell){margin:0;overflow:hidden}
.ems-sidebar{background:#10243d;border-right:1px solid rgba(255,255,255,.12);color:#eff6ff;display:flex;flex-direction:column;min-height:0;min-width:0;overflow:hidden;padding:16px 12px}
.ems-brand{align-items:center;background:#fff;border-radius:8px;display:flex;justify-content:center;min-height:76px;padding:8px}.ems-brand img{height:auto;max-height:66px;object-fit:contain;width:172px}
.ems-shell.sidebar-collapsed .ems-brand img{width:58px}.ems-shell.sidebar-collapsed .ems-nav-link span{display:none}.ems-shell.sidebar-collapsed .ems-nav-link{justify-content:center;padding:0}
.ems-nav{display:grid;gap:3px;margin-top:14px;min-height:0;overflow:auto;padding-right:3px}.ems-nav-link{align-items:center;border-radius:8px;color:#dce8f6;display:flex;font-size:14px;font-weight:700;gap:10px;min-height:38px;padding:0 12px}.ems-nav-link:hover,.ems-nav-link.active{background:#1e63b8;color:#fff}.ems-nav-link.logout{border-top:1px solid rgba(255,255,255,.12);color:#f7c9c9;margin-top:12px;padding-top:12px}
.ems-workspace{display:grid;grid-template-rows:auto minmax(0,1fr) auto;min-height:0;min-width:0;overflow:hidden}.ems-topbar{align-items:center;background:#fff;border-bottom:1px solid #dce5ef;display:grid;gap:16px;grid-template-columns:auto minmax(260px,1fr) auto;min-height:74px;min-width:0;padding:10px 20px}
.ems-title,.ems-actions,.ems-search,.panel-heading,.panel-action,.quick-add,.icon-button,.ems-user,.command-chip,.screen-toolbar,.filter-bar{align-items:center;display:flex}.ems-title{gap:12px;min-width:220px}.ems-title p,.panel-heading p,.screen-kicker{color:#64748b;font-size:12px;font-weight:800;letter-spacing:0;margin:0 0 3px;text-transform:uppercase}.ems-title h1,.panel-heading h2{color:#10243d;font-size:21px;line-height:1.15;margin:0}
.breadcrumb{color:#64748b;font-size:12px;font-weight:800;margin-top:4px}.breadcrumb a{text-decoration:underline;text-underline-offset:3px}.ems-search{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;color:#64748b;gap:10px;min-height:42px;padding:0 12px}.ems-search input{background:transparent;border:0;color:#172033;min-width:0;outline:0;width:100%}.ems-search kbd{background:#fff;border:1px solid #dce5ef;border-radius:6px;color:#64748b;font-size:11px;font-weight:800;padding:4px 7px;white-space:nowrap}
.ems-actions{flex-wrap:wrap;gap:8px;justify-content:flex-end}.quick-add,.panel-action,.command-chip,.icon-button,.ems-user,.toolbar-button{border:1px solid #dce5ef;border-radius:8px;color:#172033;font-weight:800}.quick-add,.panel-action,.command-chip,.toolbar-button{background:#fff;gap:7px;min-height:38px;padding:0 12px}.quick-add,.toolbar-button.primary{background:#1e63b8;border-color:#1e63b8;color:#fff}.icon-button{background:#fff;height:38px;justify-content:center;width:38px}.ems-user{background:#f7fafc;gap:7px;min-height:38px;padding:0 11px}
.badge{border-radius:999px;font-size:12px;font-weight:800;padding:7px 10px;white-space:nowrap}.badge-blue{background:#dbeafe;color:#1e63b8}.badge-green{background:#dcfce7;color:#15805b}.badge-amber{background:#fff4cc;color:#9a6a00}.badge-red{background:#ffe4e4;color:#d94d4d}
.ems-content{align-content:start;display:grid;gap:16px;min-height:0;overflow-x:hidden;overflow-y:auto;padding:18px 20px 36px;scrollbar-gutter:stable}.command-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}.command-chip{color:#31516f;flex:0 0 auto;font-size:13px}
.notice{align-items:center;background:#eaf4ff;border:1px solid #b8d7f8;border-radius:8px;color:#164982;display:flex;font-size:13px;font-weight:800;gap:10px;justify-content:space-between;padding:10px 12px}.notice button{background:transparent;border:0;color:#164982;font-weight:900}
.ops-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.ops-card,.ems-panel,.cms-tile,.queue-card,.pipeline-item,.activity-item,.screen-card,.form-card{background:#fff;border:1px solid #dce5ef;border-radius:8px}.ops-card{border-left:4px solid #1e63b8;min-height:122px;padding:16px}.ops-card span,.cms-tile span,.queue-card span,.pipeline-item span,.activity-item span,.screen-card span{color:#64748b;display:block;font-size:13px;line-height:1.35}.ops-card strong{color:#10243d;display:block;font-size:32px;line-height:1;margin:14px 0 8px}.ops-card p,.queue-card p,.pipeline-item p,.activity-item p,.screen-card p{color:#64748b;font-size:13px;line-height:1.45;margin:0}.accent-amber{border-left-color:#d89100}.accent-red{border-left-color:#d94d4d}.accent-green{border-left-color:#19a56f}
.ems-grid{display:grid;gap:16px;grid-template-columns:repeat(2,minmax(0,1fr))}.ems-grid.two-column{grid-template-columns:minmax(0,1.55fr) minmax(300px,.75fr)}.ems-panel,.screen-card,.form-card{min-width:0;padding:18px}.panel-heading{gap:14px;justify-content:space-between;margin-bottom:16px}.panel-heading.compact{align-items:flex-start}
.screen-hero{background:#fff;border:1px solid #dce5ef;border-radius:8px;display:grid;gap:16px;grid-template-columns:minmax(0,1fr) auto;padding:20px}.screen-hero h2{color:#10243d;font-size:26px;margin:0 0 8px}.screen-hero p{color:#64748b;line-height:1.55;margin:0;max-width:900px}.screen-toolbar{flex-wrap:wrap;gap:8px;justify-content:flex-end}.filter-bar{background:#fff;border:1px solid #dce5ef;border-radius:8px;flex-wrap:wrap;gap:10px;padding:12px}.filter-bar input,.filter-bar select,.form-card input,.form-card select,.form-card textarea{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;color:#172033;min-height:40px;padding:0 12px}.filter-bar input{flex:1 1 260px}.filter-bar select{flex:0 1 180px}.form-grid{display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr))}.form-card label{color:#31516f;display:grid;font-size:13px;font-weight:800;gap:7px}.form-card textarea{min-height:110px;padding:12px;resize:vertical}.span-two{grid-column:1/-1}
.cms-grid,.screen-grid{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr))}.cms-tile,.screen-tile{align-items:center;display:grid;gap:10px;grid-template-columns:auto minmax(0,1fr) auto;min-height:72px;padding:12px}.cms-tile strong,.pipeline-item strong,.activity-item strong,.screen-card strong{color:#10243d;display:block;font-size:14px}.screen-tile{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px}
.queue-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.queue-card{min-height:120px;padding:14px}.queue-card strong{color:#1e63b8;display:block;font-size:30px;line-height:1;margin-bottom:16px}.pipeline-stack,.activity-list{display:grid;gap:10px}.pipeline-item{border-left:4px solid #1e63b8;padding:12px}.activity-item{padding:12px}.activity-item span{font-size:12px;font-weight:800}
.table-scroll{overflow-x:auto}.ems-table{border-collapse:collapse;min-width:760px;width:100%}.ems-table th{background:#f7fafc;color:#31516f;font-size:12px;text-align:left;text-transform:uppercase}.ems-table th,.ems-table td{border-bottom:1px solid #dce5ef;padding:13px 12px}.ems-table td{color:#31516f;font-size:14px}.row-actions{display:flex;gap:8px}.row-actions button{background:transparent;border:0;color:#1e63b8;font-weight:800;padding:0}
.workflow-strip{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}.workflow-step{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;padding:12px}.workflow-step strong{color:#10243d;display:block;font-size:14px}.workflow-step.active{background:#dbeafe;border-color:#1e63b8}.module-list{display:grid;gap:8px}.module-list a{align-items:center;background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;color:#31516f;display:flex;font-size:13px;font-weight:800;gap:8px;min-height:38px;padding:0 10px}.module-list a.active{background:#dbeafe;border-color:#1e63b8;color:#1e63b8}
.dashboard-layout{display:grid;gap:16px;grid-template-columns:minmax(0,1.4fr) minmax(320px,.75fr)}.summary-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.summary-card{background:#fff;border:1px solid #dce5ef;border-left:4px solid #1e63b8;border-radius:8px;padding:16px}.summary-card strong{color:#10243d;display:block;font-size:30px;line-height:1;margin:8px 0}.summary-card span,.permission-note,.stock-alert p,.pipeline-row span,.inbox-row p{color:#64748b;font-size:13px;line-height:1.4;margin:0}.permission-list{display:flex;flex-wrap:wrap;gap:8px}.permission-pill{background:#dbeafe;border:1px solid #b8d7f8;border-radius:999px;color:#1e63b8;font-size:12px;font-weight:900;padding:7px 10px}.stock-list,.pipeline-list,.inbox-list{display:grid;gap:10px}.stock-alert,.pipeline-row,.inbox-row{background:#fff;border:1px solid #dce5ef;border-radius:8px;padding:12px}.stock-alert{border-left:4px solid #d94d4d}.pipeline-row,.inbox-row{align-items:center;display:grid;gap:12px;grid-template-columns:minmax(0,1fr) auto}.pipeline-row strong,.inbox-row strong,.stock-alert strong{color:#10243d;display:block;font-size:14px}.inbox-row{color:inherit;text-decoration:none}.inbox-row.resolved{background:#f7fafc;opacity:.78}.inbox-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.audit-note{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;color:#64748b;font-size:13px;line-height:1.5;padding:12px}
.crm-board{display:grid;gap:12px;grid-template-columns:repeat(4,minmax(220px,1fr));overflow-x:auto;padding-bottom:4px}.crm-column{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;min-width:220px;padding:12px}.crm-column.drag-over{background:#eaf4ff;border-color:#1e63b8}.crm-column h3{align-items:center;color:#10243d;display:flex;font-size:14px;justify-content:space-between;margin:0 0 12px}.lead-card{background:#fff;border:1px solid #dce5ef;border-left:4px solid #1e63b8;border-radius:8px;color:inherit;cursor:grab;display:block;margin-bottom:10px;padding:12px;text-align:left;text-decoration:none;width:100%}.lead-card:active{cursor:grabbing}.lead-card strong{color:#10243d;display:block;font-size:14px}.lead-card p,.lead-profile p,.history-item p,.quote-card p,.attachment-card p{color:#64748b;font-size:13px;line-height:1.4;margin:5px 0 0}.lead-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.lead-detail-layout{display:grid;gap:16px;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr)}.lead-profile{background:#fff;border:1px solid #dce5ef;border-radius:8px;padding:18px}.profile-grid{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:14px}.profile-cell{background:#f7fafc;border:1px solid #dce5ef;border-radius:8px;padding:10px}.profile-cell span{color:#64748b;display:block;font-size:12px;font-weight:800;text-transform:uppercase}.profile-cell strong{color:#10243d;display:block;font-size:14px;margin-top:4px}.history-list,.quote-list,.attachment-list{display:grid;gap:10px}.history-item,.quote-card,.attachment-card{background:#fff;border:1px solid #dce5ef;border-radius:8px;padding:12px}.history-item{border-left:4px solid #1e63b8}.quote-card{align-items:center;display:grid;gap:12px;grid-template-columns:minmax(0,1fr) auto}.archive-card{background:#fff;border:1px solid #dce5ef;border-radius:8px;padding:14px}.archive-card.archived{border-left:4px solid #d94d4d}.archive-card.active{border-left:4px solid #19a56f}
.quote-tabs{display:flex;gap:8px;overflow-x:auto}.quote-tab{background:#fff;border:1px solid #dce5ef;border-radius:8px;color:#31516f;flex:0 0 auto;font-size:13px;font-weight:900;min-height:38px;padding:0 12px}.quote-tab.active{background:#1e63b8;border-color:#1e63b8;color:#fff}.quote-layout{display:grid;gap:16px;grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr)}.pdf-preview{background:#fff;border:1px solid #dce5ef;border-radius:8px;min-height:560px;padding:24px}.pdf-page{background:#fff;border:1px solid #cfd8e3;border-radius:4px;box-shadow:0 18px 40px rgba(16,36,61,.12);margin:0 auto;max-width:420px;min-height:520px;padding:26px}.pdf-page h3{color:#10243d;font-size:20px;margin:0 0 16px}.pdf-line{border-bottom:1px solid #dce5ef;display:flex;justify-content:space-between;padding:10px 0}.delivery-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}.delivery-card{background:#fff;border:1px solid #dce5ef;border-radius:8px;padding:14px}.template-row{align-items:center;background:#fff;border:1px solid #dce5ef;border-radius:8px;display:grid;gap:10px;grid-template-columns:minmax(0,1fr) auto;padding:12px}.lead-selector{display:grid;gap:10px}.lead-selector .lead-card{cursor:pointer}.sync-note{background:#eaf4ff;border:1px solid #b8d7f8;border-radius:8px;color:#164982;font-size:13px;font-weight:800;line-height:1.45;padding:12px}
.inventory-layout{display:grid;gap:16px;grid-template-columns:minmax(0,1.2fr) minmax(340px,.8fr)}.stock-alert-grid{display:grid;gap:10px}.stock-alert-card{background:#fff;border:1px solid #dce5ef;border-left:5px solid #d94d4d;border-radius:8px;display:grid;gap:12px;grid-template-columns:minmax(0,1fr) auto;padding:14px}.stock-alert-card.warning{border-left-color:#d89100}.stock-alert-card strong,.supplier-card strong,.purchase-row strong{color:#10243d;display:block;font-size:14px}.stock-alert-card p,.supplier-card p,.purchase-row p,.request-summary p{color:#64748b;font-size:13px;line-height:1.45;margin:5px 0 0}.stock-meter{background:#f7fafc;border:1px solid #dce5ef;border-radius:999px;height:10px;margin-top:10px;overflow:hidden}.stock-meter span{background:#d94d4d;display:block;height:100%}.stock-meter.warning span{background:#d89100}.supplier-card{background:#fff;border:1px solid #dce5ef;border-radius:8px;display:grid;gap:12px;grid-template-columns:minmax(0,1fr) auto;padding:14px}.supplier-card.active{border-color:#1e63b8;box-shadow:0 0 0 2px #dbeafe}.supplier-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}.request-summary{background:#10243d;border-radius:8px;color:#eff6ff;padding:16px}.request-summary h3{font-size:18px;margin:0 0 12px}.request-summary p{color:#dce8f6}.request-items{display:grid;gap:8px;margin:12px 0}.request-item{align-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:8px;display:flex;gap:8px;justify-content:space-between;padding:10px}.purchase-row{background:#fff;border:1px solid #dce5ef;border-radius:8px;padding:12px}.inventory-tab-panel{display:grid;gap:16px}
.ems-footer{align-items:center;background:#fff;border-top:1px solid #dce5ef;color:#64748b;display:flex;font-size:12px;font-weight:700;gap:16px;justify-content:space-between;min-height:44px;min-width:0;padding:8px 20px}.ems-footer span:last-child{align-items:center;display:flex;gap:6px}
@media(max-width:1180px){.ems-shell{grid-template-columns:86px minmax(0,1fr)}.ems-brand img{width:58px}.ems-nav-link span,.ems-nav-link.logout span{display:none}.ems-nav-link{justify-content:center;padding:0}.ems-grid,.ems-grid.two-column,.screen-hero{grid-template-columns:1fr}}
@media(max-width:860px){body:has(.ems-shell){overflow:auto}.ems-shell{display:block;height:auto;max-height:none;min-height:100dvh;overflow:visible;position:static;width:100%}.ems-sidebar{max-height:none;overflow:visible}.ems-nav{grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible}.ems-workspace{display:block}.ems-topbar{grid-template-columns:1fr;min-height:auto;padding:14px}.ems-actions,.screen-toolbar{justify-content:flex-start}.ems-content{overflow:visible;padding:14px}.ops-grid,.cms-grid,.queue-grid,.screen-grid,.form-grid,.dashboard-layout,.lead-detail-layout,.profile-grid,.quote-layout,.inventory-layout{grid-template-columns:1fr}.stock-alert-card,.supplier-card{grid-template-columns:1fr}.cms-tile{grid-template-columns:auto minmax(0,1fr)}.cms-tile .badge{grid-column:2;justify-self:start}.ems-footer{align-items:flex-start;flex-direction:column;gap:8px;padding:12px 14px}}
`;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { "aria-hidden": true, fill: "none", height: size, stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 2, viewBox: "0 0 24 24", width: size };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
  if (name === "mail") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (name === "users") return <svg {...common}><path d="M16 21a6 6 0 0 0-12 0" /><circle cx="10" cy="8" r="4" /><path d="M22 21a5 5 0 0 0-4-4.8" /><path d="M17 4.2a4 4 0 0 1 0 7.6" /></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></svg>;
  if (name === "check") return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 12 3 3 5-6" /></svg>;
  if (name === "file") return <svg {...common}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /><path d="M8 13h8M8 17h5" /></svg>;
  if (name === "package") return <svg {...common}><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>;
  if (name === "briefcase") return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></svg>;
  if (name === "gallery") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="10" r="1.5" /><path d="m21 15-5-5L5 19" /></svg>;
  if (name === "message") return <svg {...common}><path d="M21 12a8 8 0 0 1-11.7 7.1L4 21l1.9-5.1A8 8 0 1 1 21 12Z" /></svg>;
  if (name === "archive") return <svg {...common}><path d="M4 7h16M6 7v13h12V7" /><path d="M9 11h6" /><path d="M5 3h14l1 4H4Z" /></svg>;
  if (name === "history") return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v6h6" /><path d="M12 7v5l4 2" /></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 5.5h-4L10.6 8a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.4 2.5h4l.4-2.5a8 8 0 0 0 1.7-1l2.4 1 2-3.5Z" /></svg>;
  if (name === "logout") return <svg {...common}><path d="M10 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" /><path d="M15 7l5 5-5 5" /><path d="M20 12H8" /></svg>;
  if (name === "panel") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>;
  if (name === "home") return <svg {...common}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>;
  if (name === "help") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-1.2.8-1.6 1.4-1.6 2.6" /><path d="M12 17h.01" /></svg>;
  if (name === "sparkles") return <svg {...common}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z" /></svg>;
  return <svg {...common}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>;
}

function Badge({ label }: { label: string }) {
  const value = label.toLowerCase();
  const color = value.includes("approved") || value.includes("published") || value.includes("active") || value.includes("green") ? "green" : value.includes("draft") || value.includes("pending") || value.includes("review") || value.includes("amber") ? "amber" : value.includes("red") || value.includes("archived") ? "red" : "blue";
  return <span className={`badge badge-${color}`}>{label}</span>;
}

function screenHref(module: ModuleDefinition, screen: ScreenDefinition) {
  return screen.slug ? `${module.basePath}/${screen.slug}` : module.basePath;
}

function moduleHref(module: ModuleDefinition) {
  return module.title === "Corporate Website" ? "/" : screenHref(module, module.screens[0]);
}

function topbarContext(module: ModuleDefinition) {
  const defaults = {
    addLabel: "Quick Add",
    addMessage: "Quick Add opened. Use the shortcut chips below to create records.",
    searchPlaceholder: "Search screens, records, leads, tenders, quotations",
    messagesMessage: `${module.title} messages opened.`,
    tasksMessage: `${module.title} tasks opened.`,
    profileMessage: "Admin profile and role menu opened.",
  };

  if (module.basePath === "/admin/quotations") return { ...defaults, addLabel: "New Quotation", addMessage: "Quotation generation form opened.", searchPlaceholder: "Search quotations, leads, clients, templates", messagesMessage: "Quotation delivery messages opened.", tasksMessage: "Quotation follow-up tasks opened." };
  if (module.basePath === "/admin/content") return { ...defaults, addLabel: "New Content", addMessage: "Content editor opened for the selected website section.", searchPlaceholder: "Search services, pages, posts, testimonials, photos", messagesMessage: "Website content messages opened.", tasksMessage: "Content review and publish tasks opened." };
  if (module.basePath === "/admin/tenders") return { ...defaults, addLabel: "Add Tender", addMessage: "Manual tender entry opened.", searchPlaceholder: "Search tenders, sources, deadlines, bond requirements", messagesMessage: "Tender source messages opened.", tasksMessage: "Tender confirmation tasks opened." };
  if (module.basePath === "/admin/inventory") return { ...defaults, addLabel: "Receive Stock", addMessage: "Goods received form opened.", searchPlaceholder: "Search stock, suppliers, purchase records, alerts", messagesMessage: "Supplier communication inbox opened.", tasksMessage: "Inventory reorder tasks opened." };
  if (module.basePath === "/admin/employees") return { ...defaults, addLabel: "Register Employee", addMessage: "Employee registration form opened.", searchPlaceholder: "Search employees, contracts, salary, penalties, documents", messagesMessage: "Employee management messages opened.", tasksMessage: "Contract expiry and HR tasks opened." };
  if (module.basePath === "/admin/users") return { ...defaults, addLabel: "New User", addMessage: "Create user account form opened.", searchPlaceholder: "Search users, roles, permissions, account status", messagesMessage: "User account messages opened.", tasksMessage: "User access review tasks opened." };
  if (module.basePath === "/admin/settings") return { ...defaults, addLabel: "Save Settings", addMessage: "Settings saved and queued for audit log.", searchPlaceholder: "Search settings, security rules, integrations", messagesMessage: "System configuration messages opened.", tasksMessage: "Settings review tasks opened." };
  if (module.basePath === "/admin/audit-log") return { ...defaults, addLabel: "Export Logs", addMessage: "Read-only audit export prepared.", searchPlaceholder: "Search audit actors, actions, modules, references", messagesMessage: "Audit review messages opened.", tasksMessage: "Audit review tasks opened." };
  if (module.basePath === "/admin") return { ...defaults, addLabel: "Open Inbox", addMessage: "Unified Inbox opened from dashboard.", searchPlaceholder: "Search dashboard widgets, notifications, alerts" };

  return defaults;
}

function Sidebar({ activeBase, onAction }: { activeBase: string; onAction: (message: string) => void }) {
  return (
    <aside className="ems-sidebar">
      <Link className="ems-brand" href="/">
        <Image src="/sws-logo-current.png" alt="Spencer Water Services Ltd logo" width={302} height={212} priority />
      </Link>
      <nav className="ems-nav" aria-label="Admin modules">
        {modules.map((item) => (
          <Link className={item.basePath === activeBase ? "ems-nav-link active" : "ems-nav-link"} href={moduleHref(item)} key={item.title}>
            <Icon name={item.icon} size={18} />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      <button className="ems-nav-link logout" onClick={() => onAction("Logout confirmation opened.")} type="button">
        <Icon name="logout" size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

function Topbar({
  module,
  screen,
  onAction,
  onToggleSidebar,
}: {
  module: ModuleDefinition;
  screen: ScreenDefinition;
  onAction: (message: string) => void;
  onToggleSidebar: () => void;
}) {
  const context = topbarContext(module);

  return (
    <header className="ems-topbar">
      <div className="ems-title">
        <button className="icon-button" aria-label="Toggle navigation" onClick={onToggleSidebar} type="button"><Icon name="panel" size={19} /></button>
        <div>
          <p>Spencer EWSMS</p>
          <h1>{screen.title}</h1>
          <div className="breadcrumb"><Link href="/admin">Dashboard</Link> / {module.title}</div>
        </div>
      </div>
      <form className="ems-search" role="search" onSubmit={(event) => { event.preventDefault(); onAction("Global search submitted."); }}>
        <Icon name="search" size={18} />
        <input aria-label="Global search" placeholder={context.searchPlaceholder} />
        <kbd>Ctrl K</kbd>
      </form>
      <div className="ems-actions">
        <button className="quick-add" onClick={() => onAction(context.addMessage)} type="button"><Icon name="plus" size={17} /><span>{context.addLabel}</span></button>
        <Link className="icon-button" aria-label="Notifications" href="/admin/unified-inbox"><Icon name="bell" size={18} /></Link>
        <button className="icon-button" aria-label="Messages" onClick={() => onAction(context.messagesMessage)} type="button"><Icon name="mail" size={18} /></button>
        <button className="icon-button" aria-label="Tasks" onClick={() => onAction(context.tasksMessage)} type="button"><Icon name="check" size={18} /></button>
        <button className="ems-user" onClick={() => onAction(context.profileMessage)} type="button"><Icon name="user" size={17} /><span>Admin</span></button>
        <Badge label="Jul 7, 2026" />
      </div>
    </header>
  );
}

function ScreenNavigator({ module, screen }: { module: ModuleDefinition; screen: ScreenDefinition }) {
  return (
    <article className="ems-panel">
      <div className="panel-heading compact">
        <div>
          <p>Module Screens</p>
          <h2>{module.title}</h2>
        </div>
        <Icon name={module.icon} size={20} />
      </div>
      <div className="module-list">
        {module.screens.map((item) => (
          <Link className={item.slug === screen.slug ? "active" : ""} href={screenHref(module, item)} key={item.title}>
            <Icon name={item.type === "form" ? "file" : item.type === "workflow" ? "check" : item.type === "settings" ? "settings" : module.icon} size={15} />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </article>
  );
}

const dashboardStats = [
  ["7", "Unread notifications", "Visible from authorized modules only", "blue"],
  ["UGX 48.2M", "Open quotation value", "Pending approvals and sent quotations", "amber"],
  ["18", "Open tenders", "6 awaiting confirmation", "blue"],
  ["7", "Stock alerts", "3 critical reorder items", "red"],
];

const crmPipeline = [
  ["New Leads", "24", "8 borehole requests"],
  ["Contacted", "17", "Follow-up due this week"],
  ["Quote Sent", "11", "Awaiting client response"],
  ["Won", "6", "Ready for project handoff"],
];

const stockAlerts = [
  ["PVC Pipe 2 inch", "18 in stock", "Reorder level is 40", "High"],
  ["Solar pump controller", "3 in stock", "Reorder level is 8", "High"],
  ["Water filters", "11 in stock", "Reorder level is 20", "Medium"],
];

const dashboardPrivileges = ["Dashboard", "Unified Inbox", "Leads Summary", "Tender Summary", "Quotation Summary", "Inventory Alerts"];

const inboxItems = [
  {
    title: "Quotation Q-2026-045 moved from Draft to Sent",
    module: "Quotation Management",
    status: "Unread",
    time: "10:24 AM",
    href: "/admin/quotations/dashboard",
    detail: "Auto-resolves when the quotation lifecycle reports Sent.",
  },
  {
    title: "Municipal water extension tender needs confirmation",
    module: "Tender Management",
    status: "Unread",
    time: "09:15 AM",
    href: "/admin/tenders/dashboard",
    detail: "AI analysis is complete and staff confirmation is required.",
  },
  {
    title: "PVC Pipe 2 inch below reorder level",
    module: "Inventory Management",
    status: "Unread",
    time: "Today",
    href: "/admin/inventory/dashboard",
    detail: "This notification resolves when stock is received or reorder settings change.",
  },
  {
    title: "New website message from Kampala Estates",
    module: "Corporate Website",
    status: "Unread",
    time: "Today",
    href: "/admin/corporate-website/contact-page-editor",
    detail: "CRM activity is excluded; this is a website contact notification.",
  },
  {
    title: "Employee contract expiry alert",
    module: "Users",
    status: "Unread",
    time: "Jul 12",
    href: "/admin/users/dashboard",
    detail: "Visible to users assigned the Human Resource class after login.",
  },
  {
    title: "Supplier contract renewal needed",
    module: "Inventory Management",
    status: "Unread",
    time: "Yesterday",
    href: "/admin/inventory/dashboard",
    detail: "Supplier follow-up is handled inside the Inventory supplier workspace.",
  },
  {
    title: "Testimonial pending approval",
    module: "Corporate Website",
    status: "Unread",
    time: "Yesterday",
    href: "/admin/corporate-website/testimonials-manager",
    detail: "Website content approval notification.",
  },
];

const inboxHistory = [
  {
    title: "Weekly backup completed",
    module: "Settings",
    status: "Resolved",
    time: "Jul 3",
    href: "/admin/settings/dashboard",
    detail: "Resolved automatically when backup job reported complete.",
  },
  {
    title: "Project gallery upload processed",
    module: "Project Management",
    status: "Resolved",
    time: "Jul 2",
    href: "/admin/projects/gallery",
    detail: "Resolved automatically after media processing finished.",
  },
];

const crmPipelineColumns = [
  {
    title: "New",
    leads: [
      ["LD-104", "Kampala Estates", "Borehole drilling", "Today", "High"],
      ["LD-105", "Mukono Factory", "Water treatment", "Yesterday", "Medium"],
    ],
  },
  {
    title: "Contacted",
    leads: [
      ["LD-098", "Green Valley Ltd", "Solar water pumping", "Jul 3", "Medium"],
      ["LD-097", "Luweero Farm", "Pipeline installation", "Jul 2", "Low"],
    ],
  },
  {
    title: "Site Visit",
    leads: [
      ["LD-091", "City Hospital", "Water storage", "Jul 1", "High"],
    ],
  },
  {
    title: "Quote Linked",
    leads: [
      ["LD-082", "Bright Schools", "Treatment system", "Jun 28", "High"],
      ["LD-078", "Nakasero Apartments", "Plumbing upgrade", "Jun 26", "Medium"],
    ],
  },
];

const leadProfile = {
  name: "Kampala Estates",
  contact: "Mary Akello",
  phone: "+256 700 123 456",
  email: "mary@kampalaestates.co.ug",
  service: "Commercial borehole drilling",
  location: "Kampala",
  status: "Site Visit",
  owner: "Daniel M.",
};

const leadHistory = [
  ["Lead created", "Website contact form submitted for borehole drilling.", "Today 08:42"],
  ["Phone call logged", "Client confirmed site access and preferred visit window.", "Today 09:10"],
  ["Site visit note", "Site has truck access, nearby power, and space for drilling rig.", "Today 11:30"],
  ["Quotation linked", "Q-2026-045 attached to this lead.", "Today 12:05"],
];

const linkedQuotations = [
  ["Q-2026-045", "Commercial borehole drilling", "UGX 18.4M", "Draft"],
  ["Q-2026-046", "Pump testing and commissioning", "UGX 4.2M", "Pending Review"],
];

const leadAttachments = [
  ["Site photos", "6 images uploaded from first site visit."],
  ["Client brief", "PDF requirements from Kampala Estates."],
  ["Hydro survey note", "Initial survey notes awaiting engineer review."],
];

const archivedLeads = [
  ["LD-055", "Mbale Clinic", "Archived", "Duplicate request merged into customer profile."],
  ["LD-043", "Jinja Warehouses", "Archived", "Client postponed procurement to next quarter."],
  ["LD-021", "Entebbe Resort", "Restored", "Lead reopened after client confirmed budget."],
];

const quotationRows = [
  ["Q-2026-045", "Kampala Estates", "Draft", "Jul 6, 2026", "LD-104"],
  ["Q-2026-044", "Bright Schools", "Sent", "Jul 5, 2026", "LD-082"],
  ["Q-2026-043", "Green Valley Ltd", "Accepted", "Jul 3, 2026", "LD-098"],
  ["Q-2026-042", "Luweero Farm", "Declined", "Jul 2, 2026", "LD-097"],
];

const quotationTemplates = [
  ["Borehole Drilling Standard", "Admin + Technician", "Published"],
  ["Solar Water Pumping", "Admin + Technician", "Published"],
  ["Water Treatment Installation", "Admin + Technician", "Draft"],
];

const supportingDocs = [
  ["Site photos", "Attached to lead LD-104"],
  ["Hydro survey notes", "Pending engineer review"],
  ["Client requirements PDF", "Uploaded from lead detail"],
];

const quoteTabs = ["Lifecycle", "Templates", "Generate + Preview", "Delivery", "Documents", "Leads"];

function DashboardContent() {
  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Home / Dashboard Overview</p>
          <h2>Dashboard Overview</h2>
          <p>Read-only summary widgets personalized by the logged-in user&apos;s assigned privileges. Users only see components they are authorized to view.</p>
        </div>
        <Link className="toolbar-button primary" href="/admin/unified-inbox"><Icon name="mail" size={15} /> Open Unified Inbox</Link>
      </section>

      <section className="summary-grid" aria-label="Read-only dashboard summary">
        {dashboardStats.map(([value, label, helper, color]) => (
          <article className={`summary-card accent-${color}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{helper}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-layout">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Leads Summary</p><h2>Pipeline Snapshot</h2></div><Badge label="Read only" /></div>
          <div className="pipeline-list">
            {crmPipeline.map(([stage, count, detail]) => (
              <div className="pipeline-row" key={stage}>
                <div><strong>{stage}</strong><span>{detail}</span></div>
                <Badge label={count} />
              </div>
            ))}
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading"><div><p>Privileges</p><h2>Visible Components</h2></div><Icon name="shield" size={19} /></div>
          <div className="permission-list">
            {dashboardPrivileges.map((item) => <span className="permission-pill" key={item}>{item}</span>)}
          </div>
          <p className="permission-note" style={{ marginTop: 14 }}>Additional module widgets remain hidden until the user&apos;s role grants access.</p>
        </article>
      </section>

      <section className="ems-grid">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Inventory</p><h2>Stock Alerts</h2></div><Badge label="3 active" /></div>
          <div className="stock-list">
            {stockAlerts.map(([item, current, reorder, priority]) => (
              <div className="stock-alert" key={item}>
                <strong>{item}</strong>
                <p>{current} / {reorder}</p>
                <div className="inbox-meta"><Badge label={priority} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading"><div><p>Notifications</p><h2>Unread Inbox Preview</h2></div><Badge label="7 unread" /></div>
          <div className="inbox-list">
            {inboxItems.slice(0, 4).map((item) => (
              <Link className="inbox-row" href={item.href} key={item.title}>
                <div><strong>{item.title}</strong><p>{item.module}</p></div>
                <Badge label={item.time} />
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function UnifiedInboxContent() {
  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Home / Unified Inbox</p>
          <h2>Unified Inbox</h2>
          <p>Aggregated notifications from every module except lead activity. Lead and quotation activity is handled directly inside Quotation Management.</p>
        </div>
        <Link className="toolbar-button" href="/admin"><Icon name="layout" size={15} /> Back to Dashboard</Link>
      </section>

      <section className="ems-grid two-column">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Active Notifications</p><h2>Unread Module Events</h2></div><Badge label={`${inboxItems.length} unread`} /></div>
          <div className="inbox-list">
            {inboxItems.map((item) => (
              <Link className="inbox-row" href={item.href} key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <div className="inbox-meta"><Badge label={item.module} /><Badge label={item.status} /></div>
                </div>
                <Badge label={item.time} />
              </Link>
            ))}
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading compact"><div><p>Rules</p><h2>Inbox Behavior</h2></div><Icon name="check" size={19} /></div>
          <div className="activity-list">
            <div className="audit-note">Lead activity notifications are intentionally excluded because leads are managed directly inside Quotation Management.</div>
            <div className="audit-note">No manual dismiss button is shown. Each notification resolves only when its source module reports the related event complete.</div>
            <div className="audit-note">Clicking a notification redirects to the relevant module screen for action or review.</div>
            <div className="audit-note">Resolved notifications remain visible below for audit history.</div>
          </div>
        </article>
      </section>

      <section className="ems-panel">
        <div className="panel-heading"><div><p>Audit History</p><h2>Resolved Notifications</h2></div><Badge label="History" /></div>
        <div className="inbox-list">
          {inboxHistory.map((item) => (
            <Link className="inbox-row resolved" href={item.href} key={item.title}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <div className="inbox-meta"><Badge label={item.module} /><Badge label={item.status} /></div>
              </div>
              <Badge label={item.time} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function QuotationManagementScreen({ onAction }: { onAction: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState("Lifecycle");

  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Quotation Management</p>
          <h2>Quotations & Leads</h2>
          <p>One primary workspace for quotation lifecycle tracking, templates, generation, delivery, supporting documents, and lead management nested inside the same screen.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button primary" onClick={() => setActiveTab("Generate + Preview")} type="button"><Icon name="plus" size={15} /> Generate Quotation</button>
          <button className="toolbar-button" onClick={() => setActiveTab("Leads")} type="button">Open Leads</button>
        </div>
      </section>

      <section className="quote-tabs" aria-label="Quotation workspace tabs">
        {quoteTabs.map((tab) => (
          <button className={activeTab === tab ? "quote-tab active" : "quote-tab"} key={tab} onClick={() => setActiveTab(tab)} type="button">
            {tab}
          </button>
        ))}
      </section>

      {activeTab === "Lifecycle" && <QuotationLifecycle onAction={onAction} />}
      {activeTab === "Templates" && <QuotationTemplates onAction={onAction} />}
      {activeTab === "Generate + Preview" && <QuotationGenerator onAction={onAction} />}
      {activeTab === "Delivery" && <QuotationDelivery onAction={onAction} />}
      {activeTab === "Documents" && <QuotationDocuments onAction={onAction} />}
      {activeTab === "Leads" && <QuotationLeads onAction={onAction} />}
    </>
  );
}

function QuotationLifecycle({ onAction }: { onAction: (message: string) => void }) {
  return (
    <article className="ems-panel">
      <div className="panel-heading"><div><p>Main View</p><h2>Quotation Lifecycle Tracker</h2></div><Badge label="Live" /></div>
      <div className="table-scroll">
        <table className="ems-table">
          <thead><tr><th>Reference</th><th>Client</th><th>Status</th><th>Date</th><th>Linked Lead</th><th>Actions</th></tr></thead>
          <tbody>
            {quotationRows.map(([ref, client, status, date, lead]) => (
              <tr key={ref}>
                <td>{ref}</td>
                <td>{client}</td>
                <td><Badge label={status} /></td>
                <td>{date}</td>
                <td>{lead}</td>
                <td><div className="row-actions"><button onClick={() => onAction(`${ref} opened.`)} type="button">View</button><button onClick={() => onAction(`${ref} status history opened.`)} type="button">History</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function QuotationTemplates({ onAction }: { onAction: (message: string) => void }) {
  return (
    <section className="ems-grid">
      <article className="ems-panel">
        <div className="panel-heading"><div><p>Templates</p><h2>Template Management</h2></div><Badge label="Admin + Technician" /></div>
        <div className="stock-list">
          {quotationTemplates.map(([title, access, status]) => (
            <div className="template-row" key={title}>
              <div><strong>{title}</strong><p className="permission-note">{access}</p></div>
              <div className="screen-toolbar"><Badge label={status} /><button className="toolbar-button" onClick={() => onAction(`${title} template editor opened.`)} type="button">Edit</button></div>
            </div>
          ))}
        </div>
      </article>
      <article className="ems-panel">
        <div className="panel-heading"><div><p>Rules</p><h2>Shared Control</h2></div><Icon name="shield" size={18} /></div>
        <p className="permission-note">Both Administrator and Technician classes can manage quotation templates equally. Changes are tracked in quotation history.</p>
      </article>
    </section>
  );
}

function QuotationGenerator({ onAction }: { onAction: (message: string) => void }) {
  return (
    <section className="quote-layout">
      <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("Quotation generated and linked to lead LD-104."); }}>
        <div className="panel-heading"><div><p>Generate</p><h2>Quotation Generation Form</h2></div><Badge label="Linked Lead" /></div>
        <div className="form-grid">
          <label>Lead<select><option>LD-104 / Kampala Estates</option><option>LD-098 / Green Valley Ltd</option><option>LD-082 / Bright Schools</option></select></label>
          <label>Template<select><option>Borehole Drilling Standard</option><option>Solar Water Pumping</option><option>Water Treatment Installation</option></select></label>
          <label>Prepared By<input placeholder="Technician / Admin" /></label>
          <label>Valid Until<input placeholder="Jul 31, 2026" /></label>
          <label className="span-two">Scope<textarea placeholder="Survey, drilling, casing, development, test pumping, and commissioning." /></label>
        </div>
        <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
          <button className="toolbar-button" onClick={() => onAction("Quotation draft saved.")} type="button">Save Draft</button>
          <button className="toolbar-button primary" type="submit">Generate</button>
        </div>
      </form>

      <article className="pdf-preview">
        <div className="pdf-page">
          <h3>Quotation Preview</h3>
          <div className="pdf-line"><span>Client</span><strong>Kampala Estates</strong></div>
          <div className="pdf-line"><span>Lead</span><strong>LD-104</strong></div>
          <div className="pdf-line"><span>Template</span><strong>Borehole Drilling</strong></div>
          <div className="pdf-line"><span>Status</span><strong>Draft</strong></div>
          <p className="permission-note" style={{ marginTop: 18 }}>Live PDF preview updates from quotation form data and remains linked to the selected lead.</p>
        </div>
      </article>
    </section>
  );
}

function QuotationDelivery({ onAction }: { onAction: (message: string) => void }) {
  return (
    <section className="delivery-grid">
      {["Send via WhatsApp", "Send via Email", "Mark Accepted", "Mark Declined"].map((item) => (
        <article className="delivery-card" key={item}>
          <div className="panel-heading compact"><div><p>Delivery</p><h2>{item}</h2></div><Icon name={item.includes("Email") ? "mail" : "message"} size={18} /></div>
          <p className="permission-note">Action is executed directly from the quotation tool and recorded in lifecycle history.</p>
          <button className="toolbar-button primary" onClick={() => onAction(`${item} action completed for Q-2026-045.`)} style={{ marginTop: 12 }} type="button">Run Action</button>
        </article>
      ))}
    </section>
  );
}

function QuotationDocuments({ onAction }: { onAction: (message: string) => void }) {
  return (
    <article className="ems-panel">
      <div className="panel-heading"><div><p>Documents</p><h2>Supporting Attachment Management</h2></div><button className="toolbar-button primary" onClick={() => onAction("Supporting document upload opened.")} type="button">Upload</button></div>
      <div className="attachment-list">
        {supportingDocs.map(([title, detail]) => <div className="attachment-card" key={title}><strong>{title}</strong><p>{detail}</p></div>)}
      </div>
    </article>
  );
}

function QuotationLeads({ onAction }: { onAction: (message: string) => void }) {
  return (
    <>
      <section className="sync-note">Lead status auto-syncs from quotation outcome: Accepted moves the lead to Won, Declined moves the lead to Lost. A lead can carry multiple linked quotation revisions and engagements.</section>
      <section className="lead-detail-layout">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Lead Selector</p><h2>Attach Lead to Quotation</h2></div><Badge label="Nested" /></div>
          <div className="lead-selector">
            {crmPipelineColumns.flatMap((column) => column.leads).map(([id, client, service, updated, priority]) => (
              <button className="lead-card" key={id} onClick={() => onAction(`${client} selected for quotation.`)} type="button">
                <strong>{client}</strong><p>{id} / {service}</p><div className="lead-meta"><Badge label={priority} /><Badge label={updated} /></div>
              </button>
            ))}
          </div>
        </article>
        <article className="lead-profile">
          <div className="panel-heading"><div><p>Inline Lead Detail</p><h2>{leadProfile.name}</h2></div><Badge label={leadProfile.status} /></div>
          <div className="profile-grid">
            <div className="profile-cell"><span>Contact</span><strong>{leadProfile.contact}</strong></div>
            <div className="profile-cell"><span>Phone</span><strong>{leadProfile.phone}</strong></div>
            <div className="profile-cell"><span>Service</span><strong>{leadProfile.service}</strong></div>
            <div className="profile-cell"><span>Linked Quotations</span><strong>2 revisions</strong></div>
          </div>
        </article>
      </section>
      <CrmPipelineWorkspace screen={{ title: "Lead Pipeline", slug: "pipeline", type: "workflow", description: "Nested lead pipeline board." }} onAction={onAction} />
    </>
  );
}

const inventoryLowStock = [
  { item: "PVC Pipe 2 inch", sku: "INV-PVC-020", stock: 8, reorder: 40, status: "Critical", suppliers: "4 suppliers" },
  { item: "Submersible Pump 1.5HP", sku: "INV-PMP-150", stock: 2, reorder: 10, status: "Critical", suppliers: "3 suppliers" },
  { item: "Chlorine Tablets", sku: "INV-CHL-010", stock: 18, reorder: 50, status: "Warning", suppliers: "5 suppliers" },
];

const inventorySuppliers = [
  { name: "AquaTech Supplies Uganda", contact: "Grace Namatovu", phone: "+256 772 410 115", email: "orders@aquatech.ug", category: "Pipes, pumps", lastOrder: "PVC Pipe 2 inch, 120 pcs", rating: "Preferred" },
  { name: "Nile Pump & Tools", contact: "Daniel Okello", phone: "+256 701 889 221", email: "sales@nilepump.ug", category: "Pumps, tools", lastOrder: "Submersible Pump 1.5HP, 6 pcs", rating: "Fast response" },
  { name: "ClearFlow Chemicals", contact: "Sarah Mbabazi", phone: "+256 754 220 881", email: "supply@clearflow.ug", category: "Chemicals", lastOrder: "Chlorine Tablets, 20 cartons", rating: "Approved" },
];

const supplierPurchaseHistory = [
  ["PO-2026-031", "AquaTech Supplies Uganda", "PVC pipes and fittings", "UGX 4.8M", "Jun 24, 2026"],
  ["PO-2026-027", "Nile Pump & Tools", "Pumps and installation tools", "UGX 7.2M", "Jun 10, 2026"],
  ["PO-2026-019", "ClearFlow Chemicals", "Treatment chemicals", "UGX 2.1M", "May 28, 2026"],
];

const userAccounts = [
  { name: "Mary Nakasujja", email: "admin@spencerwater.co.ug", role: "Administrator", status: "Active", access: "Full system access", lastSeen: "Today 10:22" },
  { name: "Peter Kato", email: "technician@spencerwater.co.ug", role: "Technician", status: "Active", access: "Quotations, inventory, tenders", lastSeen: "Today 09:48" },
  { name: "Ruth Namuli", email: "hr@spencerwater.co.ug", role: "Human Resource", status: "Pending MFA", access: "Personalized HR dashboard, employee contracts, user profile view", lastSeen: "Yesterday" },
  { name: "Simon Okello", email: "simon@spencerwater.co.ug", role: "Technician", status: "Locked", access: "Temporary lockout after failed login attempts", lastSeen: "Jul 5, 2026" },
];

const roleMatrix = [
  ["Administrator", "Dashboard, Inbox, Quotations, Content, Tenders, Inventory, Employee Management, Users, Settings, Audit Logs"],
  ["Technician", "Dashboard, Inbox, Quotations, Tenders, Inventory"],
  ["Human Resource", "Personalized dashboard titled by role, Inbox, Employee Management, Inventory when granted, contracts, salary, penalties, limited user profile view"],
];

const auditLogs = [
  ["AUD-2026-1007", "Mary Nakasujja", "Changed lockout threshold from 3 to 5", "Settings", "Success", "Jul 7, 2026 08:41"],
  ["AUD-2026-1006", "Peter Kato", "Sent supplier quotation request to AquaTech Supplies Uganda", "Inventory", "Success", "Jul 7, 2026 08:18"],
  ["AUD-2026-1005", "System", "Auto-resolved low-stock notification after stock verification", "Unified Inbox", "Success", "Jul 7, 2026 08:02"],
  ["AUD-2026-1004", "Ruth Namuli", "Viewed employee contract expiry alert", "Human Resource", "Success", "Jul 6, 2026 16:35"],
  ["AUD-2026-1003", "Simon Okello", "Failed MFA verification attempt", "Users", "Warning", "Jul 6, 2026 15:11"],
  ["AUD-2026-1002", "Mary Nakasujja", "Assigned Technician class to Peter Kato", "Users", "Success", "Jul 6, 2026 12:24"],
];

const contentServices = [
  ["Borehole Drilling", "Published", "Hero, process, FAQs, gallery"],
  ["Solar Water Pumping", "Draft", "Benefits, pricing cues, project links"],
  ["Water Treatment", "Published", "Systems, chemicals, maintenance"],
];

const contentPortfolio = [
  ["Kampala Estates Borehole", "Featured", "Residential water supply"],
  ["Mukono Factory Treatment Plant", "Published", "Industrial treatment"],
  ["Wakiso Solar Pumping", "Draft", "Solar-powered pumping"],
];

const contentTestimonials = [
  ["Bright Schools", "Pending Review", "Fast response and professional installation."],
  ["City Hospital", "Approved", "Reliable maintenance support for our water system."],
  ["Green Valley Ltd", "Rejected", "Duplicate submission from same contact."],
];

const contentMediaSlots = [
  ["Home Hero", "hero-home.jpg", "Featured hero photo on the public homepage", "Published"],
  ["Services Overview", "services-water.jpg", "Section image for service categories", "Published"],
  ["Borehole Drilling", "borehole-rig.jpg", "Featured service page image", "Needs Update"],
  ["Portfolio Featured", "project-wakiso.jpg", "Featured project thumbnail", "Draft"],
  ["Gallery", "gallery-24-items", "Public gallery images and albums", "Published"],
];

const tenderRecords = [
  { ref: "TEN-2026-044", title: "Municipal water extension works", source: "KCCA Procurement Portal", className: "Water infrastructure", score: 86, deadline: "Jul 18, 2026", bond: "UGX 30M", status: "Awaiting Confirmation", recommendation: "Proceed" },
  { ref: "TEN-2026-043", title: "Solar pumping systems for schools", source: "PPDA Tender Notice", className: "Solar water pumping", score: 78, deadline: "Jul 25, 2026", bond: "Not required", status: "Analysis Complete", recommendation: "Proceed" },
  { ref: "TEN-2026-042", title: "Chemical supply framework contract", source: "Ministry Procurement", className: "Water treatment", score: 62, deadline: "Aug 2, 2026", bond: "UGX 12M", status: "Review Required", recommendation: "Manual Review" },
  { ref: "TEN-2026-041", title: "Road drainage construction package", source: "District Portal", className: "Out of scope", score: 34, deadline: "Jul 20, 2026", bond: "UGX 45M", status: "Archived", recommendation: "Decline" },
];

const tenderHistory = [
  ["TEN-2026-040", "Borehole drilling framework", "Confirmed for bid", "Jul 4, 2026"],
  ["TEN-2026-039", "Pipeline rehabilitation", "Declined after staff override", "Jul 2, 2026"],
  ["TEN-2026-038", "Water testing equipment", "Archived after deadline passed", "Jun 29, 2026"],
];

const employeeRecords = [
  { id: "EMP-001", name: "Peter Kato", role: "Technician", status: "Active", contract: "Permanent", expiry: "No expiry", salary: "UGX 1,800,000" },
  { id: "EMP-002", name: "Ruth Namuli", role: "Human Resource", status: "Active", contract: "2-year contract", expiry: "Aug 30, 2026", salary: "UGX 2,100,000" },
  { id: "EMP-003", name: "Simon Okello", role: "Field Assistant", status: "Probation", contract: "6-month probation", expiry: "Sep 15, 2026", salary: "UGX 900,000" },
  { id: "EMP-004", name: "Grace Akello", role: "Accounts Officer", status: "Contract Review", contract: "1-year contract", expiry: "Jul 28, 2026", salary: "UGX 1,500,000" },
];

const employeePenalties = [
  ["EMP-003", "Late site reporting", "Warning issued", "Jun 25, 2026"],
  ["EMP-004", "Missing receipt documentation", "Pending review", "Jul 2, 2026"],
];

function InventoryManagementScreen({ onAction }: { onAction: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState("Low Stock");
  const [selectedSupplier, setSelectedSupplier] = useState(inventorySuppliers[0].name);
  const tabs = ["Low Stock", "Suppliers", "Supplier Quotation", "Purchase History"];
  const supplier = inventorySuppliers.find((item) => item.name === selectedSupplier) ?? inventorySuppliers[0];

  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Inventory Management</p>
          <h2>Stock Control With Supplier Reorder Workflow</h2>
          <p>Low-stock items trigger red alerts, the in-charge verifies the stock position, checks saved suppliers and previous purchase records, then sends a multi-item supplier quotation request from this same workspace.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Inventory stock levels refreshed from database.")} type="button"><Icon name="package" size={15} /> Refresh Stock</button>
          <button className="toolbar-button primary" onClick={() => onAction("Goods received form opened.")} type="button"><Icon name="plus" size={15} /> Receive Stock</button>
        </div>
      </section>

      <div className="quote-tabs" role="tablist" aria-label="Inventory workflow sections">
        {tabs.map((tab) => (
          <button className={tab === activeTab ? "quote-tab active" : "quote-tab"} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
        ))}
      </div>

      {activeTab === "Low Stock" && (
        <section className="inventory-layout">
          <article className="ems-panel">
            <div className="panel-heading">
              <div><p>Red Alerts</p><h2>Items Below Reorder Limit</h2></div>
              <Badge label="3 alerts" />
            </div>
            <div className="stock-alert-grid">
              {inventoryLowStock.map((item) => {
                const percent = Math.max(8, Math.round((item.stock / item.reorder) * 100));
                return (
                  <div className={item.status === "Critical" ? "stock-alert-card" : "stock-alert-card warning"} key={item.sku}>
                    <div>
                      <strong>{item.item}</strong>
                      <p>{item.sku} | Available {item.stock} | Reorder limit {item.reorder} | {item.suppliers}</p>
                      <div className={item.status === "Critical" ? "stock-meter" : "stock-meter warning"}><span style={{ width: `${percent}%` }} /></div>
                    </div>
                    <div className="screen-toolbar">
                      <Badge label={item.status === "Critical" ? "Red Alert" : "Warning"} />
                      <button className="toolbar-button" onClick={() => onAction(`${item.item} verification opened.`)} type="button">Verify</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="request-summary">
            <h3>In-Charge Workflow</h3>
            <p>1. Confirm physical stock count and pending allocations.</p>
            <p>2. Pick suppliers from saved records with contacts and past purchase history.</p>
            <p>3. Send one supplier quotation request for multiple items.</p>
            <div className="request-items">
              {inventoryLowStock.map((item) => (
                <div className="request-item" key={item.sku}><span>{item.item}</span><strong>{item.reorder - item.stock} needed</strong></div>
              ))}
            </div>
            <button className="toolbar-button primary" onClick={() => { setActiveTab("Supplier Quotation"); onAction("Multi-item supplier quotation draft created from low-stock alerts."); }} type="button">Create Supplier Quotation</button>
          </article>
        </section>
      )}

      {activeTab === "Suppliers" && (
        <section className="inventory-layout">
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Saved Suppliers</p><h2>Contacts And Supply Categories</h2></div><Badge label="Database ready" /></div>
            <div className="lead-selector">
              {inventorySuppliers.map((item) => (
                <button className={item.name === selectedSupplier ? "supplier-card active" : "supplier-card"} key={item.name} onClick={() => { setSelectedSupplier(item.name); onAction(`${item.name} selected.`); }} type="button">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.contact} | {item.phone} | {item.email}</p>
                    <div className="supplier-meta"><Badge label={item.rating} /><Badge label={item.category} /></div>
                  </div>
                  <span>Last order: {item.lastOrder}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="ems-panel">
            <div className="panel-heading"><div><p>Supplier Actions</p><h2>{supplier.name}</h2></div><Badge label={supplier.rating} /></div>
            <div className="activity-list">
              <div className="activity-item"><span>Contact Person</span><strong>{supplier.contact}</strong><p>{supplier.phone} | {supplier.email}</p></div>
              <div className="activity-item"><span>Supply Focus</span><strong>{supplier.category}</strong><p>Backend will match suppliers to the items they can supply.</p></div>
              <div className="activity-item"><span>Past Purchase</span><strong>{supplier.lastOrder}</strong><p>Used to guide pricing, preferred supplier choice, and reorder speed.</p></div>
            </div>
            <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              <button className="toolbar-button" onClick={() => onAction(`Call task opened for ${supplier.contact}.`)} type="button">Call Supplier</button>
              <button className="toolbar-button" onClick={() => onAction(`Email draft opened for ${supplier.email}.`)} type="button">Email</button>
              <button className="toolbar-button primary" onClick={() => { setActiveTab("Supplier Quotation"); onAction(`Supplier quotation draft assigned to ${supplier.name}.`); }} type="button">Send Quotation</button>
            </div>
          </article>
        </section>
      )}

      {activeTab === "Supplier Quotation" && (
        <section className="quote-layout">
          <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction(`Supplier quotation sent to ${supplier.name}.`); }}>
            <div className="panel-heading"><div><p>Supplier RFQ</p><h2>Multi-Item Order Quotation</h2></div><Badge label="Draft" /></div>
            <div className="form-grid">
              <label>Supplier<select value={selectedSupplier} onChange={(event) => setSelectedSupplier(event.target.value)}>{inventorySuppliers.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
              <label>Delivery Needed By<input type="date" defaultValue="2026-07-15" /></label>
              {inventoryLowStock.map((item) => (
                <label key={item.sku}>{item.item}<input defaultValue={`${item.reorder - item.stock} units`} /></label>
              ))}
              <label className="span-two">Message To Supplier<textarea defaultValue="Please quote availability, unit price, delivery timeline, payment terms, and warranty where applicable for the listed items." /></label>
            </div>
            <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              <button className="toolbar-button" onClick={() => onAction("Supplier quotation saved as draft.")} type="button">Save Draft</button>
              <button className="toolbar-button" onClick={() => onAction(`WhatsApp quotation prepared for ${supplier.contact}.`)} type="button">WhatsApp</button>
              <button className="toolbar-button primary" type="submit">Send To Supplier</button>
            </div>
          </form>

          <article className="pdf-preview">
            <div className="pdf-page">
              <h3>Supplier Quotation Request</h3>
              <div className="pdf-line"><span>Supplier</span><strong>{supplier.name}</strong></div>
              <div className="pdf-line"><span>Contact</span><strong>{supplier.contact}</strong></div>
              {inventoryLowStock.map((item) => (
                <div className="pdf-line" key={item.sku}><span>{item.item}</span><strong>{item.reorder - item.stock} units</strong></div>
              ))}
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginTop: 18 }}>This preview will use database stock records and supplier profiles once the backend is connected.</p>
            </div>
          </article>
        </section>
      )}

      {activeTab === "Purchase History" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Supplier Memory</p><h2>Past Purchase Records</h2></div><Badge label="Audit ready" /></div>
          <div className="stock-alert-grid">
            {supplierPurchaseHistory.map(([ref, name, items, value, date]) => (
              <div className="purchase-row" key={ref}>
                <strong>{ref} | {name}</strong>
                <p>{items} | {value} | {date}</p>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

function UserManagementScreen({ onAction }: { onAction: (message: string) => void }) {
  const [selectedRole, setSelectedRole] = useState("Administrator");

  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Users / User Management Component</p>
          <h2>Users</h2>
          <p>Administrators create user accounts and assign each person to one of three classes: Administrator, Technician, or Human Resource. Screen access is enforced from that class, so users only see what they are authorized to use.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("User activity export prepared.")} type="button">Export Activity</button>
          <button className="toolbar-button primary" onClick={() => onAction("Create account form focused.")} type="button"><Icon name="plus" size={15} /> New User</button>
        </div>
      </section>

      <section className="summary-grid" aria-label="User management summary">
        <article className="summary-card"><span>Total Users</span><strong>4</strong><p>Across administrator, technician, and HR classes.</p></article>
        <article className="summary-card"><span>Active Accounts</span><strong>2</strong><p>Can access assigned dashboard screens.</p></article>
        <article className="summary-card accent-amber"><span>MFA Pending</span><strong>1</strong><p>Must finish verification before full access.</p></article>
        <article className="summary-card accent-red"><span>Locked</span><strong>1</strong><p>Requires administrator unlock or password reset.</p></article>
      </section>

      <section className="inventory-layout">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Accounts</p><h2>Saved Users</h2></div><Badge label="RBAC enforced" /></div>
          <div className="table-scroll">
            <table className="ems-table">
              <thead><tr><th>User</th><th>Class</th><th>Status</th><th>Access</th><th>Last Seen</th><th>Actions</th></tr></thead>
              <tbody>
                {userAccounts.map((user) => (
                  <tr key={user.email}>
                    <td><strong>{user.name}</strong><br /><span>{user.email}</span></td>
                    <td>{user.role}</td>
                    <td><Badge label={user.status} /></td>
                    <td>{user.access}</td>
                    <td>{user.lastSeen}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => onAction(`${user.name} profile opened.`)} type="button">View</button>
                        <button onClick={() => onAction(`${user.name} role editor opened.`)} type="button">Role</button>
                        <button onClick={() => onAction(`${user.name} password reset prepared.`)} type="button">Reset</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction(`${selectedRole} account invitation created.`); }}>
          <div className="panel-heading"><div><p>Create Account</p><h2>New User</h2></div><Badge label={selectedRole} /></div>
          <div className="form-grid">
            <label>Full Name<input placeholder="Jane Akello" /></label>
            <label>Email<input placeholder="jane@spencerwater.co.ug" type="email" /></label>
            <label>Phone<input placeholder="+256..." /></label>
            <label>User Class<select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}><option>Administrator</option><option>Technician</option><option>Human Resource</option></select></label>
            <label>Temporary Password<input placeholder="Auto generated on backend" /></label>
            <label>Account Status<select><option>Invite Pending</option><option>Active</option><option>Suspended</option></select></label>
            <label className="span-two">Access Note<textarea value={roleMatrix.find(([role]) => role === selectedRole)?.[1] ?? ""} readOnly /></label>
            <label><input defaultChecked={selectedRole === "Administrator" || selectedRole === "Human Resource"} type="checkbox" /> Employee Management</label>
            <label><input defaultChecked={selectedRole === "Administrator"} type="checkbox" /> Inventory Management</label>
          </div>
          <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className="toolbar-button" onClick={() => onAction("User invitation draft saved.")} type="button">Save Draft</button>
            <button className="toolbar-button primary" type="submit">Create Account</button>
          </div>
        </form>
      </section>

      <section className="ems-grid">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Permission Matrix</p><h2>User Classes</h2></div><Icon name="shield" size={18} /></div>
          <div className="activity-list">
            {roleMatrix.map(([role, access]) => (
              <div className="activity-item" key={role}>
                <span>{role}</span>
                <strong>{access}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading"><div><p>Role Dashboard Preview</p><h2>Personalized Login Experience</h2></div><Badge label={selectedRole} /></div>
          <div className="activity-list">
            <div className="activity-item"><span>Dashboard Heading</span><strong>{selectedRole} Dashboard</strong><p>The admin shell stays uniform, but the heading and visible widgets follow the assigned user class.</p></div>
            <div className="activity-item"><span>Visible Components</span><strong>{roleMatrix.find(([role]) => role === selectedRole)?.[1]}</strong></div>
            <div className="activity-item"><span>Navigation</span><strong>Unauthorized screens hidden</strong><p>Human Resource users are created here and do not require a separate HR top-level screen.</p></div>
          </div>
        </article>
      </section>

      <article className="ems-panel">
        <div className="panel-heading"><div><p>Security Controls</p><h2>Account Enforcement</h2></div><Badge label="Admin only" /></div>
        <div className="screen-toolbar" style={{ justifyContent: "flex-start" }}>
          <button className="toolbar-button" onClick={() => onAction("Locked account queue opened.")} type="button">Review Locked</button>
          <button className="toolbar-button" onClick={() => onAction("MFA retry policy opened in Settings.")} type="button">MFA Policy</button>
          <button className="toolbar-button" onClick={() => onAction("Role audit trail opened.")} type="button">Role Audit</button>
        </div>
        <p className="permission-note" style={{ marginTop: 14 }}>Users cannot grant themselves access. Role changes are administrator actions and should be written to the audit log once the backend is connected.</p>
      </article>
    </div>
  );
}

function ContentManagementScreen({ onAction }: { onAction: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState("Services");
  const tabs = ["Services", "Portfolio", "Blog/News", "Testimonials", "Core Pages", "Photos/Gallery", "Version History"];

  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Content Management</p>
          <h2>Website Content Workspace</h2>
          <p>Create, edit, and publish services, portfolio items, blog/news posts, and core pages. Testimonials are client-submitted, so they are reviewed and approved before going live.</p>
        </div>
        <div className="screen-toolbar">
          <Link className="toolbar-button" href="/">Open Public Website</Link>
          <button className="toolbar-button primary" onClick={() => onAction(`${activeTab} editor opened.`)} type="button"><Icon name="plus" size={15} /> New Content</button>
        </div>
      </section>

      <section className="summary-grid" aria-label="Content summary">
        <article className="summary-card"><span>Published Pages</span><strong>18</strong><p>Live public website content.</p></article>
        <article className="summary-card accent-amber"><span>Drafts</span><strong>5</strong><p>Needs review before publishing.</p></article>
        <article className="summary-card accent-amber"><span>Testimonials</span><strong>1</strong><p>Pending approval queue.</p></article>
        <article className="summary-card accent-green"><span>Versions</span><strong>42</strong><p>Recoverable content revisions.</p></article>
      </section>

      <div className="quote-tabs" role="tablist" aria-label="Content sections">
        {tabs.map((tab) => (
          <button className={tab === activeTab ? "quote-tab active" : "quote-tab"} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
        ))}
      </div>

      {activeTab === "Services" && (
        <section className="inventory-layout">
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Services</p><h2>Service Pages</h2></div><Badge label="Editable" /></div>
            <div className="activity-list">
              {contentServices.map(([title, status, detail]) => (
                <div className="activity-item" key={title}>
                  <span>{status}</span>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                  <div className="screen-toolbar" style={{ marginTop: 10, justifyContent: "flex-start" }}>
                    <button className="toolbar-button" onClick={() => onAction(`${title} service editor opened.`)} type="button">Edit</button>
                    <button className="toolbar-button" onClick={() => onAction(`${title} preview opened.`)} type="button">Preview</button>
                    <button className="toolbar-button primary" onClick={() => onAction(`${title} queued for publishing.`)} type="button">Publish</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <ContentEditorPanel title="Service Editor" description="Hero text, service details, benefits, FAQs, gallery, related projects, SEO metadata, and publish controls." onAction={onAction} />
        </section>
      )}

      {activeTab === "Portfolio" && (
        <section className="ems-grid">
          {contentPortfolio.map(([title, status, detail]) => (
            <article className="screen-card" key={title}>
              <div className="panel-heading"><div><p>{status}</p><h2>{title}</h2></div><Icon name="gallery" size={18} /></div>
              <p>{detail}</p>
              <div className="screen-toolbar" style={{ marginTop: 12, justifyContent: "flex-start" }}>
                <button className="toolbar-button" onClick={() => onAction(`${title} portfolio entry opened.`)} type="button">Edit</button>
                <button className="toolbar-button primary" onClick={() => onAction(`${title} portfolio entry published.`)} type="button">Publish</button>
              </div>
            </article>
          ))}
        </section>
      )}

      {activeTab === "Blog/News" && (
        <section className="inventory-layout">
          <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("Blog/news article saved."); }}>
            <div className="panel-heading"><div><p>Blog/News</p><h2>Article Editor</h2></div><Badge label="Draft" /></div>
            <div className="form-grid">
              <label>Headline<input placeholder="New community water project launched" /></label>
              <label>Category<select><option>News</option><option>Projects</option><option>Water Tips</option></select></label>
              <label>Publish Date<input type="date" defaultValue="2026-07-07" /></label>
              <label>Author<input defaultValue="Spencer Water Services" /></label>
              <label className="span-two">Article Body<textarea placeholder="Write the news update or article content." /></label>
            </div>
            <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              <button className="toolbar-button" onClick={() => onAction("Blog/news draft saved.")} type="button">Save Draft</button>
              <button className="toolbar-button primary" type="submit">Publish</button>
            </div>
          </form>
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Recent Posts</p><h2>Publishing Queue</h2></div><Badge label="3 posts" /></div>
            <div className="activity-list">
              <div className="activity-item"><span>Draft</span><strong>Water treatment maintenance guide</strong><p>Awaiting image selection.</p></div>
              <div className="activity-item"><span>Scheduled</span><strong>July project update</strong><p>Scheduled for next week.</p></div>
              <div className="activity-item"><span>Published</span><strong>Solar pumping benefits</strong><p>Visible on public website.</p></div>
            </div>
          </article>
        </section>
      )}

      {activeTab === "Testimonials" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Review Queue</p><h2>Client-Submitted Testimonials</h2></div><Badge label="Approval required" /></div>
          <div className="table-scroll">
            <table className="ems-table">
              <thead><tr><th>Client</th><th>Status</th><th>Submission</th><th>Actions</th></tr></thead>
              <tbody>
                {contentTestimonials.map(([client, status, text]) => (
                  <tr key={client}>
                    <td>{client}</td>
                    <td><Badge label={status} /></td>
                    <td>{text}</td>
                    <td><div className="row-actions"><button onClick={() => onAction(`${client} testimonial opened.`)} type="button">View</button><button onClick={() => onAction(`${client} testimonial approved.`)} type="button">Approve</button><button onClick={() => onAction(`${client} testimonial rejected.`)} type="button">Reject</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {activeTab === "Core Pages" && (
        <section className="ems-grid">
          <ContentEditorPanel title="Home Page" description="Hero, calls to action, company intro, featured services, featured projects, testimonials, and SEO metadata." onAction={onAction} />
          <ContentEditorPanel title="About Us" description="Company overview, history, mission, vision, values, leadership, and why choose us content." onAction={onAction} />
        </section>
      )}

      {activeTab === "Photos/Gallery" && (
        <section className="inventory-layout">
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Website Photos</p><h2>Featured Image Slots</h2></div><Badge label="Upload ready" /></div>
            <div className="activity-list">
              {contentMediaSlots.map(([section, file, detail, status]) => (
                <div className="activity-item" key={section}>
                  <span>{status}</span>
                  <strong>{section}</strong>
                  <p>{detail} | Current: {file}</p>
                  <div className="screen-toolbar" style={{ marginTop: 10, justifyContent: "flex-start" }}>
                    <button className="toolbar-button" onClick={() => onAction(`${section} image picker opened.`)} type="button">Choose Existing</button>
                    <button className="toolbar-button" onClick={() => onAction(`${section} replacement upload opened.`)} type="button">Replace Photo</button>
                    <button className="toolbar-button primary" onClick={() => onAction(`${section} featured photo updated.`)} type="button">Set Featured</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("Photo uploaded and assigned to selected website section."); }}>
            <div className="panel-heading"><div><p>Upload</p><h2>Add Website Photo</h2></div><Icon name="gallery" size={18} /></div>
            <div className="form-grid">
              <label>Assign To Section<select><option>Home Hero</option><option>About Us</option><option>Services Overview</option><option>Borehole Drilling</option><option>Solar Water Pumping</option><option>Water Treatment</option><option>Portfolio Featured</option><option>Gallery Album</option></select></label>
              <label>Visibility<select><option>Draft</option><option>Published</option><option>Featured</option></select></label>
              <label>Image File<input accept="image/*" type="file" /></label>
              <label>Alt Text<input placeholder="Technician installing solar water pump" /></label>
              <label className="span-two">Caption<textarea placeholder="Short public caption for gallery or project section." /></label>
            </div>
            <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              <button className="toolbar-button" onClick={() => onAction("Photo upload saved as draft.")} type="button">Save Draft</button>
              <button className="toolbar-button primary" type="submit">Upload & Assign</button>
            </div>
          </form>

          <article className="ems-panel">
            <div className="panel-heading"><div><p>Gallery</p><h2>Public Gallery Albums</h2></div><Badge label="24 photos" /></div>
            <div className="screen-grid">
              {["Borehole Projects", "Solar Pumping", "Water Treatment", "Team On Site"].map((album) => (
                <div className="screen-tile" key={album}>
                  <Icon name="gallery" size={18} />
                  <div><strong>{album}</strong><span>Manage album photos, captions, order, and featured cover.</span></div>
                  <button className="toolbar-button" onClick={() => onAction(`${album} gallery album opened.`)} type="button">Manage</button>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "Version History" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Versions</p><h2>Content Revision History</h2></div><Icon name="history" size={18} /></div>
          <div className="activity-list">
            <div className="activity-item"><span>Jul 7, 2026</span><strong>Home Page updated by Admin</strong><p>Hero text and featured services changed.</p></div>
            <div className="activity-item"><span>Jul 6, 2026</span><strong>Borehole Drilling service published</strong><p>FAQs and gallery updated.</p></div>
            <div className="activity-item"><span>Jul 5, 2026</span><strong>Testimonial approved</strong><p>City Hospital testimonial moved live.</p></div>
          </div>
        </article>
      )}
    </div>
  );
}

function ContentEditorPanel({ title, description, onAction }: { title: string; description: string; onAction: (message: string) => void }) {
  return (
    <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction(`${title} content saved.`); }}>
      <div className="panel-heading"><div><p>Editor</p><h2>{title}</h2></div><Badge label="Draft" /></div>
      <div className="form-grid">
        <label>Title<input defaultValue={title} /></label>
        <label>Status<select><option>Draft</option><option>Published</option><option>Archived</option></select></label>
        <label className="span-two">Summary<textarea defaultValue={description} /></label>
        <label>SEO Title<input placeholder={`${title} | Spencer Water Services`} /></label>
        <label>SEO Status<select><option>Ready</option><option>Needs Review</option></select></label>
      </div>
      <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
        <button className="toolbar-button" onClick={() => onAction(`${title} preview opened.`)} type="button">Preview</button>
        <button className="toolbar-button" onClick={() => onAction(`${title} draft saved.`)} type="button">Save Draft</button>
        <button className="toolbar-button primary" type="submit">Publish</button>
      </div>
    </form>
  );
}

function TenderManagementScreen({ onAction }: { onAction: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState("Repository");
  const [selectedTender, setSelectedTender] = useState(tenderRecords[0].ref);
  const tabs = ["Repository", "Analysis", "Bid Confirmation", "Status History"];
  const tender = tenderRecords.find((item) => item.ref === selectedTender) ?? tenderRecords[0];

  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Tender Management</p>
          <h2>Tender Repository And Bid Confirmation</h2>
          <p>Auto-discovered procurement opportunities are classified, scored for eligibility and suitability, and then routed through one staff bid-confirmation checkpoint before bid work starts.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Configured procurement sources refreshed.")} type="button"><Icon name="search" size={15} /> Refresh Sources</button>
          <button className="toolbar-button primary" onClick={() => onAction("Manual tender entry opened.")} type="button"><Icon name="plus" size={15} /> Add Tender</button>
        </div>
      </section>

      <section className="summary-grid" aria-label="Tender summary">
        <article className="summary-card"><span>Discovered</span><strong>18</strong><p>From configured procurement sources.</p></article>
        <article className="summary-card accent-amber"><span>Confirmation Queue</span><strong>6</strong><p>Staff must approve or override recommendation.</p></article>
        <article className="summary-card accent-green"><span>Recommended</span><strong>9</strong><p>Suitable based on score and eligibility.</p></article>
        <article className="summary-card accent-red"><span>Declined</span><strong>3</strong><p>Out of scope, ineligible, or too risky.</p></article>
      </section>

      <div className="quote-tabs" role="tablist" aria-label="Tender workflow sections">
        {tabs.map((tab) => (
          <button className={tab === activeTab ? "quote-tab active" : "quote-tab"} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
        ))}
      </div>

      {activeTab === "Repository" && (
        <section className="inventory-layout">
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Repository</p><h2>Discovered Opportunities</h2></div><Badge label="Auto-discovered" /></div>
            <div className="table-scroll">
              <table className="ems-table">
                <thead><tr><th>Ref</th><th>Tender</th><th>Classification</th><th>Score</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {tenderRecords.map((item) => (
                    <tr key={item.ref}>
                      <td>{item.ref}</td>
                      <td><strong>{item.title}</strong><br /><span>{item.source}</span></td>
                      <td>{item.className}</td>
                      <td>{item.score}%</td>
                      <td>{item.deadline}</td>
                      <td><Badge label={item.status} /></td>
                      <td><div className="row-actions"><button onClick={() => { setSelectedTender(item.ref); setActiveTab("Analysis"); onAction(`${item.ref} analysis opened.`); }} type="button">Analyze</button><button onClick={() => { setSelectedTender(item.ref); setActiveTab("Bid Confirmation"); onAction(`${item.ref} confirmation opened.`); }} type="button">Confirm</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="ems-panel">
            <div className="panel-heading"><div><p>Selected Tender</p><h2>{tender.ref}</h2></div><Badge label={tender.recommendation} /></div>
            <div className="activity-list">
              <div className="activity-item"><span>Title</span><strong>{tender.title}</strong><p>{tender.source}</p></div>
              <div className="activity-item"><span>Deadline</span><strong>{tender.deadline}</strong><p>Bid bond: {tender.bond}</p></div>
              <div className="activity-item"><span>Classification</span><strong>{tender.className}</strong><p>Suitability score: {tender.score}%</p></div>
            </div>
          </article>
        </section>
      )}

      {activeTab === "Analysis" && (
        <section className="ems-grid">
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Extracted Information</p><h2>{tender.title}</h2></div><Badge label={`${tender.score}%`} /></div>
            <div className="profile-grid">
              <div className="profile-cell"><span>Source</span><strong>{tender.source}</strong></div>
              <div className="profile-cell"><span>Deadline</span><strong>{tender.deadline}</strong></div>
              <div className="profile-cell"><span>Bond Requirement</span><strong>{tender.bond}</strong></div>
              <div className="profile-cell"><span>Classification</span><strong>{tender.className}</strong></div>
              <div className="profile-cell"><span>Suitability</span><strong>{tender.score}%</strong></div>
              <div className="profile-cell"><span>Recommendation</span><strong>{tender.recommendation}</strong></div>
            </div>
          </article>

          <article className="ems-panel">
            <div className="panel-heading"><div><p>Eligibility Checks</p><h2>System Recommendation</h2></div><Icon name="check" size={18} /></div>
            <div className="activity-list">
              <div className="activity-item"><span>Annual Turnover</span><strong>Pass</strong><p>Compared with verified turnover in Settings.</p></div>
              <div className="activity-item"><span>Scope Match</span><strong>{tender.className}</strong><p>Mapped to Spencer Water service categories.</p></div>
              <div className="activity-item"><span>Bid Bond Risk</span><strong>{tender.bond}</strong><p>Flagged against configured warning limit.</p></div>
            </div>
          </article>
        </section>
      )}

      {activeTab === "Bid Confirmation" && (
        <section className="quote-layout">
          <article className="request-summary">
            <h3>Single Bid-Confirmation Checkpoint</h3>
            <p>Staff must approve the recommendation or override it with a reason. This is the only decision checkpoint before bid preparation starts.</p>
            <div className="request-items">
              <div className="request-item"><span>Tender</span><strong>{tender.ref}</strong></div>
              <div className="request-item"><span>Recommendation</span><strong>{tender.recommendation}</strong></div>
              <div className="request-item"><span>Score</span><strong>{tender.score}%</strong></div>
            </div>
          </article>

          <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction(`${tender.ref} bid decision saved.`); }}>
            <div className="panel-heading"><div><p>Staff Decision</p><h2>{tender.title}</h2></div><Badge label="Required" /></div>
            <div className="form-grid">
              <label>Decision<select><option>Approve Recommendation</option><option>Override: Proceed</option><option>Override: Decline</option><option>Request More Review</option></select></label>
              <label>Assigned Owner<select><option>Administrator</option><option>Technician</option><option>Tender Team</option></select></label>
              <label className="span-two">Decision Reason<textarea placeholder="Record why this bid was approved, declined, or overridden." /></label>
            </div>
            <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              <button className="toolbar-button" onClick={() => onAction(`${tender.ref} saved for later review.`)} type="button">Save Review</button>
              <button className="toolbar-button primary" type="submit">Confirm Decision</button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "Status History" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>History</p><h2>Tender Status Tracking</h2></div><Icon name="history" size={18} /></div>
          <div className="activity-list">
            {tenderHistory.map(([ref, action, date]) => (
              <div className="activity-item" key={ref}>
                <span>{date}</span>
                <strong>{ref}</strong>
                <p>{action}</p>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

function EmployeeManagementScreen({ onAction }: { onAction: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState("Registry");
  const tabs = ["Registry", "Register Employee", "Contracts", "Salary", "Penalties", "Documents", "Reports"];

  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Employee Management</p>
          <h2>Employee Records And HR Operations</h2>
          <p>Manage employee registration, profiles, contracts, contract terms, expiry monitoring, salary records, penalties, documents, and HR reports. Access is granted from Users by Administrator.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Employee records export prepared.")} type="button">Export Records</button>
          <button className="toolbar-button primary" onClick={() => setActiveTab("Register Employee")} type="button"><Icon name="plus" size={15} /> Register Employee</button>
        </div>
      </section>

      <section className="summary-grid" aria-label="Employee management summary">
        <article className="summary-card"><span>Total Employees</span><strong>36</strong><p>Active staff and contract workers.</p></article>
        <article className="summary-card accent-amber"><span>Expiring Contracts</span><strong>4</strong><p>Within the next 60 days.</p></article>
        <article className="summary-card"><span>On Probation</span><strong>3</strong><p>Require confirmation review.</p></article>
        <article className="summary-card accent-red"><span>Penalty Reviews</span><strong>2</strong><p>Need HR/admin decision.</p></article>
      </section>

      <div className="quote-tabs" role="tablist" aria-label="Employee management sections">
        {tabs.map((tab) => (
          <button className={tab === activeTab ? "quote-tab active" : "quote-tab"} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
        ))}
      </div>

      {activeTab === "Registry" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Employee Registry</p><h2>Employee Records</h2></div><Badge label="36 employees" /></div>
          <div className="table-scroll">
            <table className="ems-table">
              <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Status</th><th>Contract</th><th>Expiry</th><th>Salary</th><th>Actions</th></tr></thead>
              <tbody>
                {employeeRecords.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td><Badge label={employee.status} /></td>
                    <td>{employee.contract}</td>
                    <td>{employee.expiry}</td>
                    <td>{employee.salary}</td>
                    <td><div className="row-actions"><button onClick={() => onAction(`${employee.name} employee profile opened.`)} type="button">Profile</button><button onClick={() => onAction(`${employee.name} contract editor opened.`)} type="button">Contract</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {activeTab === "Register Employee" && (
        <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("New employee registered and employee profile created."); }}>
          <div className="panel-heading"><div><p>Onboarding</p><h2>Register New Employee</h2></div><Badge label="Draft" /></div>
          <div className="form-grid">
            <label>Full Name<input placeholder="Employee full name" /></label>
            <label>Job Title<input placeholder="Technician" /></label>
            <label>Department<select><option>Operations</option><option>Human Resource</option><option>Finance</option><option>Administration</option></select></label>
            <label>Employment Status<select><option>Probation</option><option>Active</option><option>Contract</option><option>Suspended</option></select></label>
            <label>Phone<input placeholder="+256..." /></label>
            <label>Email<input placeholder="employee@spencerwater.co.ug" type="email" /></label>
            <label className="span-two">Address / Emergency Contact<textarea placeholder="Address, next of kin, emergency phone, and notes." /></label>
          </div>
          <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className="toolbar-button" onClick={() => onAction("Employee draft saved.")} type="button">Save Draft</button>
            <button className="toolbar-button primary" type="submit">Register Employee</button>
          </div>
        </form>
      )}

      {activeTab === "Contracts" && (
        <section className="inventory-layout">
          <article className="ems-panel">
            <div className="panel-heading"><div><p>Contract Expiry</p><h2>Expiry Monitoring</h2></div><Badge label="4 alerts" /></div>
            <div className="activity-list">
              {employeeRecords.filter((employee) => employee.expiry !== "No expiry").map((employee) => (
                <div className="activity-item" key={employee.id}>
                  <span>{employee.expiry}</span>
                  <strong>{employee.name}</strong>
                  <p>{employee.contract} | {employee.status}</p>
                  <div className="screen-toolbar" style={{ marginTop: 10, justifyContent: "flex-start" }}>
                    <button className="toolbar-button" onClick={() => onAction(`${employee.name} renewal opened.`)} type="button">Renew</button>
                    <button className="toolbar-button" onClick={() => onAction(`${employee.name} contract terms opened.`)} type="button">Terms</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("Contract terms saved."); }}>
            <div className="panel-heading"><div><p>Contract Terms</p><h2>Contract Editor</h2></div><Icon name="file" size={18} /></div>
            <div className="form-grid">
              <label>Employee<select>{employeeRecords.map((employee) => <option key={employee.id}>{employee.name}</option>)}</select></label>
              <label>Contract Type<select><option>Permanent</option><option>1-year contract</option><option>2-year contract</option><option>Probation</option></select></label>
              <label>Start Date<input type="date" defaultValue="2026-07-07" /></label>
              <label>Expiry Date<input type="date" defaultValue="2027-07-07" /></label>
              <label className="span-two">Terms<textarea placeholder="Contract terms, duties, benefits, renewal conditions, and notes." /></label>
            </div>
            <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
              <button className="toolbar-button primary" type="submit">Save Contract</button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "Salary" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Salary Records</p><h2>Compensation</h2></div><Badge label="Confidential" /></div>
          <div className="table-scroll">
            <table className="ems-table">
              <thead><tr><th>Employee</th><th>Role</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{employeeRecords.map((employee) => <tr key={employee.id}><td>{employee.name}</td><td>{employee.role}</td><td>{employee.salary}</td><td><Badge label={employee.status} /></td><td><div className="row-actions"><button onClick={() => onAction(`${employee.name} salary record opened.`)} type="button">View</button><button onClick={() => onAction(`${employee.name} salary adjustment opened.`)} type="button">Adjust</button></div></td></tr>)}</tbody>
            </table>
          </div>
        </article>
      )}

      {activeTab === "Penalties" && (
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Disciplinary</p><h2>Penalties And Reviews</h2></div><Badge label="2 open" /></div>
          <div className="activity-list">
            {employeePenalties.map(([id, issue, status, date]) => (
              <div className="activity-item" key={`${id}-${issue}`}>
                <span>{date}</span>
                <strong>{id} | {issue}</strong>
                <p>{status}</p>
                <div className="screen-toolbar" style={{ marginTop: 10, justifyContent: "flex-start" }}>
                  <button className="toolbar-button" onClick={() => onAction(`${id} penalty record opened.`)} type="button">View</button>
                  <button className="toolbar-button primary" onClick={() => onAction(`${id} penalty decision saved.`)} type="button">Record Decision</button>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {activeTab === "Documents" && (
        <section className="ems-grid">
          {["Contracts", "National ID", "Certificates", "Disciplinary Letters"].map((folder) => (
            <article className="screen-card" key={folder}>
              <div className="panel-heading"><div><p>Folder</p><h2>{folder}</h2></div><Icon name="file" size={18} /></div>
              <p>Upload, review, and attach employee documents to employee profiles.</p>
              <div className="screen-toolbar" style={{ marginTop: 12, justifyContent: "flex-start" }}>
                <button className="toolbar-button" onClick={() => onAction(`${folder} document upload opened.`)} type="button">Upload</button>
                <button className="toolbar-button" onClick={() => onAction(`${folder} folder opened.`)} type="button">Open</button>
              </div>
            </article>
          ))}
        </section>
      )}

      {activeTab === "Reports" && (
        <section className="ems-grid">
          <article className="ems-panel"><div className="panel-heading"><div><p>Reports</p><h2>Employee Reports</h2></div><Icon name="archive" size={18} /></div><p className="permission-note">Headcount, contract expiry, salary summary, disciplinary records, and onboarding reports.</p></article>
          <article className="ems-panel"><div className="panel-heading"><div><p>Permissions</p><h2>Access Reminder</h2></div><Icon name="shield" size={18} /></div><p className="permission-note">Administrator has full access. Human Resource users see this module only when Admin grants Employee Management rights from Users.</p></article>
        </section>
      )}
    </div>
  );
}

function SettingsScreen({ onAction }: { onAction: (message: string) => void }) {
  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Settings</p>
          <h2>System Configuration</h2>
          <p>Admin-configurable business rules for security, tender eligibility, notifications, integrations, backups, and operational thresholds. These values will drive backend enforcement once the API is connected.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Settings change history opened.")} type="button"><Icon name="history" size={15} /> History</button>
          <button className="toolbar-button primary" onClick={() => onAction("Settings saved and queued for audit log.")} type="button">Save Settings</button>
        </div>
      </section>

      <section className="summary-grid" aria-label="Settings summary">
        <article className="summary-card"><span>Lockout Threshold</span><strong>5</strong><p>Failed login attempts before account lock.</p></article>
        <article className="summary-card"><span>MFA Retry Limit</span><strong>3</strong><p>Maximum verification retries per session.</p></article>
        <article className="summary-card"><span>Annual Turnover</span><strong>UGX 1.8B</strong><p>Verified value used for tender eligibility.</p></article>
        <article className="summary-card accent-green"><span>Integrations</span><strong>4</strong><p>Email, WhatsApp, procurement, and storage.</p></article>
      </section>

      <section className="ems-grid">
        <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("Security rules saved."); }}>
          <div className="panel-heading"><div><p>Security Rules</p><h2>Login And MFA</h2></div><Icon name="shield" size={18} /></div>
          <div className="form-grid">
            <label>Lockout Threshold<input defaultValue="5" type="number" /></label>
            <label>MFA Retry Limit<input defaultValue="3" type="number" /></label>
            <label>Lockout Duration<select defaultValue="30 minutes"><option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>Admin unlock only</option></select></label>
            <label>Password Expiry<select defaultValue="90 days"><option>60 days</option><option>90 days</option><option>180 days</option><option>Disabled</option></select></label>
          </div>
          <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className="toolbar-button primary" type="submit">Save Security</button>
          </div>
        </form>

        <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("Tender eligibility settings saved."); }}>
          <div className="panel-heading"><div><p>Tender Eligibility</p><h2>Business Rules</h2></div><Icon name="check" size={18} /></div>
          <div className="form-grid">
            <label>Verified Annual Turnover<input defaultValue="UGX 1,800,000,000" /></label>
            <label>Turnover Verified Date<input defaultValue="2026-06-30" type="date" /></label>
            <label>Bid Bond Warning Limit<input defaultValue="UGX 50,000,000" /></label>
            <label>Minimum Suitability Score<input defaultValue="70" type="number" /></label>
            <label className="span-two">Eligibility Note<textarea defaultValue="Use verified turnover and configured thresholds when classifying tender eligibility and staff confirmation recommendations." /></label>
          </div>
          <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className="toolbar-button primary" type="submit">Save Tender Rules</button>
          </div>
        </form>
      </section>

      <section className="ems-grid">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Notifications</p><h2>Routing Rules</h2></div><Icon name="bell" size={18} /></div>
          <div className="activity-list">
            <div className="activity-item"><span>Inventory</span><strong>Low-stock alerts route to Inventory in-charge and Administrators.</strong></div>
            <div className="activity-item"><span>Tenders</span><strong>Bid-confirmation alerts route to authorized tender staff.</strong></div>
            <div className="activity-item"><span>Users</span><strong>Lockout and MFA failures route to Administrators.</strong></div>
          </div>
          <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className="toolbar-button" onClick={() => onAction("Notification routing editor opened.")} type="button">Edit Routing</button>
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading"><div><p>Integrations</p><h2>Connected Services</h2></div><Icon name="settings" size={18} /></div>
          <div className="activity-list">
            <div className="activity-item"><span>Email</span><strong>Quotation and supplier RFQ delivery.</strong></div>
            <div className="activity-item"><span>WhatsApp</span><strong>Client quotation and supplier contact delivery.</strong></div>
            <div className="activity-item"><span>Procurement Sources</span><strong>Tender discovery source monitoring.</strong></div>
            <div className="activity-item"><span>Backup Storage</span><strong>Nightly operational backup target.</strong></div>
          </div>
          <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className="toolbar-button" onClick={() => onAction("Integration test started.")} type="button">Test Connections</button>
            <button className="toolbar-button" onClick={() => onAction("Backup schedule opened.")} type="button">Backup Schedule</button>
          </div>
        </article>
      </section>
    </div>
  );
}

function AuditLogViewerScreen({ onAction }: { onAction: (message: string) => void }) {
  return (
    <div className="inventory-tab-panel">
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">Audit Log Viewer</p>
          <h2>Read-Only System Activity</h2>
          <p>System activity records are visible for review and compliance, but cannot be edited or deleted from the dashboard. Filters and exports preserve the original audit trail.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Audit filters focused.")} type="button"><Icon name="search" size={15} /> Filter</button>
          <button className="toolbar-button primary" onClick={() => onAction("Read-only audit export prepared.")} type="button">Export Logs</button>
        </div>
      </section>

      <section className="summary-grid" aria-label="Audit log summary">
        <article className="summary-card"><span>Records Today</span><strong>3</strong><p>Captured from user and system actions.</p></article>
        <article className="summary-card"><span>Security Events</span><strong>1</strong><p>MFA and access-control events.</p></article>
        <article className="summary-card accent-amber"><span>Warnings</span><strong>1</strong><p>Needs administrator review.</p></article>
        <article className="summary-card accent-green"><span>Retention</span><strong>On</strong><p>Audit records are preserved.</p></article>
      </section>

      <form className="filter-bar" onSubmit={(event) => { event.preventDefault(); onAction("Audit log filters applied."); }}>
        <input aria-label="Search audit logs" placeholder="Search by user, action, module, or reference" />
        <select aria-label="Module filter"><option>All modules</option><option>Settings</option><option>Users</option><option>Inventory</option><option>Unified Inbox</option></select>
        <select aria-label="Event status filter"><option>All statuses</option><option>Success</option><option>Warning</option><option>Failed</option></select>
        <button className="toolbar-button" type="submit">Apply</button>
      </form>

      <article className="ems-panel">
        <div className="panel-heading">
          <div><p>Immutable Records</p><h2>Activity Log</h2></div>
          <Badge label="Read only" />
        </div>
        <div className="table-scroll">
          <table className="ems-table">
            <thead><tr><th>Reference</th><th>Actor</th><th>Action</th><th>Module</th><th>Status</th><th>Timestamp</th><th>Allowed Actions</th></tr></thead>
            <tbody>
              {auditLogs.map(([ref, actor, action, moduleName, status, timestamp]) => (
                <tr key={ref}>
                  <td>{ref}</td>
                  <td>{actor}</td>
                  <td>{action}</td>
                  <td>{moduleName}</td>
                  <td><Badge label={status} /></td>
                  <td>{timestamp}</td>
                  <td><div className="row-actions"><button onClick={() => onAction(`${ref} audit detail opened.`)} type="button">View</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="ems-grid">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Audit Rule</p><h2>No Mutation Controls</h2></div><Icon name="shield" size={18} /></div>
          <p className="permission-note">This viewer intentionally has no edit, delete, archive, or manual resolve actions. Corrections must be appended as new audit records by the backend.</p>
        </article>
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Review Support</p><h2>Compliance Tools</h2></div><Icon name="file" size={18} /></div>
          <div className="screen-toolbar" style={{ justifyContent: "flex-start" }}>
            <button className="toolbar-button" onClick={() => onAction("Date range picker opened.")} type="button">Date Range</button>
            <button className="toolbar-button" onClick={() => onAction("Actor activity report prepared.")} type="button">Actor Report</button>
            <button className="toolbar-button" onClick={() => onAction("Module activity report prepared.")} type="button">Module Report</button>
          </div>
        </article>
      </section>
    </div>
  );
}

function CrmScreen({ screen, onAction }: { screen: ScreenDefinition; onAction: (message: string) => void }) {
  if (screen.slug === "lead-details") return <CrmLeadDetail onAction={onAction} />;
  if (screen.slug === "lead-history-archive") return <CrmLeadHistoryArchive onAction={onAction} />;
  if (screen.slug === "create-lead") return <CrmCreateLead onAction={onAction} />;

  return <CrmPipelineWorkspace screen={screen} onAction={onAction} />;
}

function CrmPipelineWorkspace({ screen, onAction }: { screen: ScreenDefinition; onAction: (message: string) => void }) {
  const [columns, setColumns] = useState(crmPipelineColumns);
  const [draggingLead, setDraggingLead] = useState<{ leadId: string; sourceColumn: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const moveLead = (targetColumn: string) => {
    if (!draggingLead || draggingLead.sourceColumn === targetColumn) {
      setDraggingLead(null);
      setDragOverColumn(null);
      return;
    }

    const source = columns.find((column) => column.title === draggingLead.sourceColumn);
    const lead = source?.leads.find(([id]) => id === draggingLead.leadId);

    if (!lead) {
      setDraggingLead(null);
      setDragOverColumn(null);
      return;
    }

    setColumns((currentColumns) =>
      currentColumns.map((column) => {
        if (column.title === draggingLead.sourceColumn) {
          return { ...column, leads: column.leads.filter(([id]) => id !== draggingLead.leadId) };
        }

        if (column.title === targetColumn) {
          return { ...column, leads: [...column.leads, lead] };
        }

        return column;
      }),
    );
    onAction(`${lead[1]} moved from ${draggingLead.sourceColumn} to ${targetColumn}.`);
    setDraggingLead(null);
    setDragOverColumn(null);
  };

  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">CRM / {screen.title}</p>
          <h2>Lead Pipeline Board</h2>
          <p>Drag-and-drop style lead cards organized by status. Cards link into lead detail views with customer profile, activity history, site visit notes, files, linked quotations, and archive history.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button primary" onClick={() => onAction("Nested lead creation opened inside Quotation Management.")} type="button"><Icon name="plus" size={15} /> Create Lead</button>
          <button className="toolbar-button" onClick={() => onAction("Nested lead history and archive opened inside Quotation Management.")} type="button">History & Archive</button>
        </div>
      </section>

      <section className="crm-board" aria-label="Lead pipeline board">
        {columns.map((column) => (
          <article
            className={dragOverColumn === column.title ? "crm-column drag-over" : "crm-column"}
            key={column.title}
            onDragLeave={() => setDragOverColumn(null)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(column.title);
            }}
            onDrop={(event) => {
              event.preventDefault();
              moveLead(column.title);
            }}
          >
            <h3>{column.title}<Badge label={`${column.leads.length}`} /></h3>
            {column.leads.map(([id, client, service, updated, priority]) => (
              <button
                className="lead-card"
                draggable
                key={id}
                onClick={() => onAction(`${client} lead detail shown inline.`)}
                onDragStart={() => setDraggingLead({ leadId: id, sourceColumn: column.title })}
                type="button"
              >
                <strong>{client}</strong>
                <p>{service}</p>
                <div className="lead-meta">
                  <Badge label={id} />
                  <Badge label={priority} />
                  <Badge label={updated} />
                </div>
              </button>
            ))}
          </article>
        ))}
      </section>

      <section className="ems-grid">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Pipeline Controls</p><h2>Board Actions</h2></div><Badge label="Prototype" /></div>
          <div className="screen-toolbar" style={{ justifyContent: "flex-start" }}>
            <button className="toolbar-button" onClick={() => onAction("Pipeline filtered by owner.")} type="button">Filter by Owner</button>
            <button className="toolbar-button" onClick={() => onAction("Pipeline sorted by priority.")} type="button">Sort Priority</button>
            <button className="toolbar-button" onClick={() => onAction("Pipeline board export prepared.")} type="button">Export Board</button>
          </div>
        </article>
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Archive Rule</p><h2>Lead History</h2></div><Icon name="archive" size={18} /></div>
          <p className="permission-note">Closed, duplicate, postponed, and restored leads are tracked in history. Archive actions preserve audit records instead of deleting CRM data.</p>
        </article>
      </section>
    </>
  );
}

function CrmLeadDetail({ onAction }: { onAction: (message: string) => void }) {
  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">CRM / Lead Detail View</p>
          <h2>{leadProfile.name}</h2>
          <p>Customer profile, communication history, activity timeline, site visit notes, file attachments, and quotations linked to this CRM lead.</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Lead activity note panel opened.")} type="button">Add Activity</button>
          <button className="toolbar-button" onClick={() => onAction("Site visit note panel opened.")} type="button">Add Site Visit Note</button>
          <Link className="toolbar-button primary" href="/admin/quotations/dashboard">Generate Quotation</Link>
        </div>
      </section>

      <section className="lead-detail-layout">
        <article className="lead-profile">
          <div className="panel-heading"><div><p>Customer Profile</p><h2>{leadProfile.service}</h2></div><Badge label={leadProfile.status} /></div>
          <div className="profile-grid">
            <div className="profile-cell"><span>Contact</span><strong>{leadProfile.contact}</strong></div>
            <div className="profile-cell"><span>Phone</span><strong>{leadProfile.phone}</strong></div>
            <div className="profile-cell"><span>Email</span><strong>{leadProfile.email}</strong></div>
            <div className="profile-cell"><span>Location</span><strong>{leadProfile.location}</strong></div>
            <div className="profile-cell"><span>Owner</span><strong>{leadProfile.owner}</strong></div>
            <div className="profile-cell"><span>Status</span><strong>{leadProfile.status}</strong></div>
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading"><div><p>Linked Quotations</p><h2>Quotation Records</h2></div><Badge label="2 linked" /></div>
          <div className="quote-list">
            {linkedQuotations.map(([ref, title, amount, status]) => (
              <Link className="quote-card" href="/admin/quotations/dashboard" key={ref}>
                <div><strong>{ref}</strong><p>{title} / {amount}</p></div>
                <Badge label={status} />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="ems-grid">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Communication & Activity</p><h2>Lead Timeline</h2></div><Icon name="history" size={18} /></div>
          <div className="history-list">
            {leadHistory.map(([title, detail, time]) => (
              <div className="history-item" key={title}>
                <strong>{title}</strong>
                <p>{detail}</p>
                <div className="lead-meta"><Badge label={time} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="ems-panel">
          <div className="panel-heading"><div><p>Files</p><h2>Attachments</h2></div><button className="toolbar-button" onClick={() => onAction("Attachment upload opened.")} type="button">Upload</button></div>
          <div className="attachment-list">
            {leadAttachments.map(([title, detail]) => (
              <div className="attachment-card" key={title}><strong>{title}</strong><p>{detail}</p></div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function CrmLeadHistoryArchive({ onAction }: { onAction: (message: string) => void }) {
  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">CRM / Lead History and Archiving</p>
          <h2>Lead History & Archive</h2>
          <p>Read and manage lead lifecycle history. Archived leads are retained for audit and can be restored by authorized CRM users.</p>
        </div>
        <Link className="toolbar-button" href="/admin/crm/pipeline">Back to Pipeline</Link>
      </section>

      <section className="screen-grid">
        {archivedLeads.map(([id, client, status, reason]) => (
          <article className={status === "Archived" ? "archive-card archived" : "archive-card active"} key={id}>
            <div className="panel-heading"><div><p>{id}</p><h2>{client}</h2></div><Badge label={status} /></div>
            <p className="permission-note">{reason}</p>
            <div className="screen-toolbar" style={{ marginTop: 12, justifyContent: "flex-start" }}>
              <button className="toolbar-button" onClick={() => onAction(`${id} history opened.`)} type="button">View History</button>
              <button className="toolbar-button" onClick={() => onAction(`${id} restore request opened.`)} type="button">Restore</button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function CrmCreateLead({ onAction }: { onAction: (message: string) => void }) {
  return (
    <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction("CRM lead saved and added to the New column."); }}>
      <div className="panel-heading"><div><p>CRM / Create Lead</p><h2>New Lead</h2></div><Badge label="Draft" /></div>
      <div className="form-grid">
        <label>Customer or Company<input placeholder="Kampala Estates" /></label>
        <label>Contact Person<input placeholder="Mary Akello" /></label>
        <label>Phone<input placeholder="+256..." /></label>
        <label>Email<input placeholder="client@example.com" /></label>
        <label>Service Interest<select><option>Borehole Drilling</option><option>Solar Water Pumping</option><option>Water Treatment</option><option>Plumbing Services</option></select></label>
        <label>Lead Source<select><option>Website</option><option>Phone Call</option><option>Referral</option><option>Manual Entry</option></select></label>
        <label className="span-two">Initial Notes<textarea placeholder="Describe the client need, location, urgency, and any first contact notes." /></label>
      </div>
      <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
        <Link className="toolbar-button" href="/admin/crm/pipeline">Cancel</Link>
        <button className="toolbar-button" onClick={() => onAction("CRM lead draft saved.")} type="button">Save Draft</button>
        <button className="toolbar-button primary" type="submit">Save Lead</button>
      </div>
    </form>
  );
}

function StandardScreen({ module, screen, onAction }: { module: ModuleDefinition; screen: ScreenDefinition; onAction: (message: string) => void }) {
  if (screen.slug === "" && module.basePath === "/admin") return <DashboardContent />;
  if (screen.slug === "unified-inbox" && module.basePath === "/admin") return <UnifiedInboxContent />;
  if (module.basePath === "/admin/tenders") return <TenderManagementScreen onAction={onAction} />;
  if (module.basePath === "/admin/quotations") return <QuotationManagementScreen onAction={onAction} />;
  if (module.basePath === "/admin/content") return <ContentManagementScreen onAction={onAction} />;
  if (module.basePath === "/admin/employees") return <EmployeeManagementScreen onAction={onAction} />;
  if (module.basePath === "/admin/inventory") return <InventoryManagementScreen onAction={onAction} />;
  if (module.basePath === "/admin/users") return <UserManagementScreen onAction={onAction} />;
  if (module.basePath === "/admin/settings") return <SettingsScreen onAction={onAction} />;
  if (module.basePath === "/admin/audit-log") return <AuditLogViewerScreen onAction={onAction} />;
  if (module.basePath === "/admin/crm") return <CrmScreen screen={screen} onAction={onAction} />;

  return (
    <>
      <section className="screen-hero">
        <div>
          <p className="screen-kicker">{module.title}</p>
          <h2>{screen.title}</h2>
          <p>{screen.description}</p>
        </div>
        <div className="screen-toolbar">
          <button className="toolbar-button" onClick={() => onAction("Filter panel focused.")} type="button"><Icon name="search" size={15} /> Filter</button>
          <button className="toolbar-button" onClick={() => onAction(`${screen.title} export prepared.`)} type="button">Export</button>
          <button className="toolbar-button primary" onClick={() => onAction(`New ${screen.title} record opened.`)} type="button"><Icon name="plus" size={15} /> New</button>
        </div>
      </section>

      <section className="ems-grid two-column">
        <article className="ems-panel">
          <div className="panel-heading"><div><p>Screen Summary</p><h2>{screen.type === "form" ? "Entry Workspace" : screen.type === "workflow" ? "Lifecycle Status" : "Management View"}</h2></div><Badge label={screen.type} /></div>
          <div className="workflow-strip">{workflowSteps.map((item, index) => <div className={index === 2 ? "workflow-step active" : "workflow-step"} key={item}><strong>{item}</strong><span>{index === 2 ? "Current stage" : "Available"}</span></div>)}</div>
        </article>
        <ScreenNavigator module={module} screen={screen} />
      </section>

      <form className="filter-bar" onSubmit={(event) => { event.preventDefault(); onAction(`${screen.title} filters applied.`); }}>
        <input aria-label="Search records" placeholder={`Search ${screen.title.toLowerCase()}`} />
        <select aria-label="Status filter"><option>All statuses</option><option>Draft</option><option>Pending Review</option><option>Approved</option></select>
        <select aria-label="Owner filter"><option>All owners</option><option>Admin</option><option>Operations</option><option>Content Team</option></select>
        <button className="toolbar-button" type="submit">Apply</button>
      </form>

      {screen.type === "form" || screen.type === "settings" || screen.type === "cms" ? <FormPanel screen={screen} onAction={onAction} /> : <TablePanel screen={screen} onAction={onAction} />}
    </>
  );
}

function TablePanel({ screen, onAction }: { screen: ScreenDefinition; onAction: (message: string) => void }) {
  return (
    <article className="ems-panel">
      <div className="panel-heading"><div><p>Records</p><h2>{screen.title}</h2></div><Badge label="4 records" /></div>
      <div className="table-scroll">
        <table className="ems-table">
          <thead><tr><th>Reference</th><th>Name</th><th>Status</th><th>Priority</th><th>Updated</th><th>Actions</th></tr></thead>
          <tbody>{sampleRows.map(([ref, name, status, priority, updated]) => <tr key={ref}><td>{ref}</td><td>{name}</td><td><Badge label={status} /></td><td>{priority}</td><td>{updated}</td><td><div className="row-actions"><button onClick={() => onAction(`${ref} opened.`)} type="button">View</button><button onClick={() => onAction(`${ref} edit mode opened.`)} type="button">Edit</button><button onClick={() => onAction(`${ref} delete confirmation opened.`)} type="button">Delete</button></div></td></tr>)}</tbody>
        </table>
      </div>
    </article>
  );
}

function FormPanel({ screen, onAction }: { screen: ScreenDefinition; onAction: (message: string) => void }) {
  return (
    <form className="form-card" onSubmit={(event) => { event.preventDefault(); onAction(`${screen.title} saved.`); }}>
      <div className="panel-heading"><div><p>Standard Form</p><h2>{screen.title}</h2></div><Badge label="Draft" /></div>
      <div className="form-grid">
        <label>Title<input placeholder={screen.title} /></label>
        <label>Status<select><option>Draft</option><option>Pending Review</option><option>Published</option></select></label>
        <label>Owner<input placeholder="Admin" /></label>
        <label>Priority<select><option>Medium</option><option>High</option><option>Low</option></select></label>
        <label className="span-two">Description<textarea placeholder={screen.description} /></label>
      </div>
      <div className="screen-toolbar" style={{ marginTop: 16, justifyContent: "flex-start" }}>
        <button className="toolbar-button" onClick={() => onAction(`${screen.title} edit cancelled.`)} type="button">Cancel</button>
        <button className="toolbar-button" onClick={() => onAction(`${screen.title} draft saved.`)} type="button">Save Draft</button>
        <button className="toolbar-button primary" type="submit">Save</button>
      </div>
    </form>
  );
}

export function AdminScreen({ pathSegments }: { pathSegments: string[] }) {
  const { module, screen } = findScreen(pathSegments);
  const [notice, setNotice] = useState("Admin controls are ready.");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const shellClassName = sidebarCollapsed ? "ems-shell sidebar-collapsed" : "ems-shell";

  return (
    <div className={shellClassName}>
      <style>{adminStyles}</style>
      <Sidebar activeBase={module.basePath} onAction={setNotice} />
      <section className="ems-workspace">
        <Topbar module={module} screen={screen} onAction={setNotice} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
        <main className="ems-content">
          <div className="notice"><span>{notice}</span><button onClick={() => setNotice("Admin controls are ready.")} type="button">Reset</button></div>
          <StandardScreen module={module} screen={screen} onAction={setNotice} />
        </main>
        <footer className="ems-footer">
          <span>Spencer Water Services Ltd Copyright 2026</span>
          <span>System Version 1.0 | Production</span>
          <span><Icon name="help" size={15} /> Help | Documentation | Support | Last sync 10:30 AM</span>
        </footer>
      </section>
    </div>
  );
}
