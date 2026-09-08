export type IconName =
  | "archive"
  | "bell"
  | "briefcase"
  | "calendar"
  | "check"
  | "file"
  | "gallery"
  | "globe"
  | "help"
  | "history"
  | "home"
  | "kanban"
  | "layout"
  | "logout"
  | "mail"
  | "message"
  | "package"
  | "panel"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "user"
  | "users";

export type ScreenDefinition = {
  title: string;
  slug: string;
  type: "dashboard" | "table" | "form" | "workflow" | "cms" | "reports" | "settings";
  description: string;
};

export type ModuleDefinition = {
  title: string;
  basePath: string;
  icon: IconName;
  screens: ScreenDefinition[];
};

const screen = (
  title: string,
  slug: string,
  type: ScreenDefinition["type"],
  description: string,
): ScreenDefinition => ({ title, slug, type, description });

export const modules: ModuleDefinition[] = [
  {
    title: "HR Dashboard",
    basePath: "/admin",
    icon: "layout",
    screens: [
      screen("Dashboard Overview", "", "dashboard", "Read-only operational summary personalized by the logged-in user's privileges."),
      screen("Unified Inbox", "unified-inbox", "dashboard", "Cross-module notifications excluding CRM, with source links and audit history."),
    ],
  },
  {
    title: "Corporate Website",
    basePath: "/admin/corporate-website",
    icon: "globe",
    screens: [
      screen("Website Dashboard", "dashboard", "cms", "Website statistics, visitor summary, latest updates, pending content, and live preview."),
      screen("Home Page Editor", "home-page-editor", "cms", "Hero slider, hero text, buttons, who we are, what we do, featured projects, testimonials, SEO, and publishing."),
      screen("About Us Editor", "about-us-editor", "cms", "Company overview, history, mission, vision, values, leadership, why choose us, and SEO."),
      screen("Services Overview", "services-overview", "cms", "View, add, edit, delete, reorder, and publish services."),
      screen("Borehole Drilling", "services/borehole-drilling", "cms", "Independent service editor with hero, description, gallery, features, benefits, FAQs, related projects, SEO, and publish controls."),
      screen("Solar Water Pumping Systems", "services/solar-water-pumping-systems", "cms", "Independent service editor for solar-powered water pumping systems."),
      screen("Water Treatment", "services/water-treatment", "cms", "Independent service editor for water treatment pages."),
      screen("Plumbing Services", "services/plumbing-services", "cms", "Independent service editor for plumbing services."),
      screen("Pipeline Installation", "services/pipeline-installation", "cms", "Independent service editor for pipeline installation."),
      screen("Water Storage Solutions", "services/water-storage-solutions", "cms", "Independent service editor for water storage solutions."),
      screen("Water Taps & Accessories", "services/water-taps-accessories", "cms", "Independent service editor for taps, pipes, fittings, and accessories."),
      screen("Water Engineering Consultancy", "services/water-engineering-consultancy", "cms", "Independent service editor for consultancy services."),
      screen("Projects Manager", "projects-manager", "table", "Project entries, gallery, categories, locations, statuses, and featured projects."),
      screen("Gallery Manager", "gallery-manager", "table", "Albums, images, videos, and categories."),
      screen("Testimonials Manager", "testimonials-manager", "workflow", "View, approve, reject, feature, and archive testimonials."),
      screen("Blog Manager", "blog-manager", "table", "Articles, categories, comments, scheduling, and publishing."),
      screen("Contact Page Editor", "contact-page-editor", "cms", "Office details, phone numbers, emails, map, business hours, and emergency contacts."),
      screen("FAQ Manager", "faq-manager", "table", "FAQ categories, questions, answers, and ordering."),
      screen("Navigation Manager", "navigation-manager", "cms", "Header menu, footer menu, and quick links."),
      screen("Footer Manager", "footer-manager", "cms", "Company details, service links, resources, contact information, and social media."),
      screen("Media Library", "media-library", "table", "Images, videos, documents, downloads, tags, and reuse."),
      screen("Website Preview", "website-preview", "cms", "Open and review the live website."),
    ],
  },
  {
    title: "Tender Management",
    basePath: "/admin/tenders",
    icon: "check",
    screens: [
      screen("Tender Management", "dashboard", "dashboard", "Tender repository, auto-discovered opportunities, classification, suitability scoring, bid confirmation, status tracking, and history."),
    ],
  },
  {
    title: "Quotations & Leads",
    basePath: "/admin/quotations",
    icon: "file",
    screens: [
      screen("Quotation Management", "dashboard", "dashboard", "Single quotation workspace with lead management nested inside."),
    ],
  },
  {
    title: "Inventory Management",
    basePath: "/admin/inventory",
    icon: "package",
    screens: [
      screen("Inventory Workspace", "dashboard", "dashboard", "Stock registry, low-stock alerts, supplier contacts, purchase history, and multi-item supplier quotations in one place."),
    ],
  },
  {
    title: "Project Management",
    basePath: "/admin/projects",
    icon: "briefcase",
    screens: [
      screen("Projects Dashboard", "dashboard", "dashboard", "Ongoing, completed, upcoming, and delayed project overview."),
      screen("Create Project", "create", "form", "Create projects with customer, scope, dates, budget, and team."),
      screen("Project Details", "details", "workflow", "Project profile, status, milestones, resources, and activity."),
      screen("Project Gallery", "gallery", "table", "Project images and media."),
      screen("Milestones", "milestones", "workflow", "Milestone planning and progress."),
      screen("Progress Tracking", "progress", "workflow", "Progress updates, status, blockers, and completion percentage."),
      screen("Resources", "resources", "table", "People, equipment, and materials assigned to projects."),
      screen("Completion Reports", "completion-reports", "reports", "Completion summaries, handover, and reports."),
    ],
  },
  {
    title: "Employee Management",
    basePath: "/admin/employees",
    icon: "user",
    screens: [
      screen("Permanent Employees", "permanent", "table", "Permanent staff with long-term contracts and departments"),
      screen("Casual Employees", "casual", "table", "Temporary staff for project-based work"),
      screen("Add Employee", "create", "form", "Add new employee (select type first)"),
      screen("Departments", "departments", "table", "Department management"),
      screen("Job Titles", "job-titles", "table", "Job title management"),
    ],
  },
  {
    title: "Content Management",
    basePath: "/admin/content",
    icon: "gallery",
    screens: [
      screen("Content Management", "dashboard", "cms", "Services, portfolio, blog/news, testimonials review, core pages, publishing, and content version history."),
    ],
  },
  {
    title: "Reports & Analytics",
    basePath: "/admin/reports",
    icon: "archive",
    screens: [
      screen("Executive Dashboard", "executive-dashboard", "reports", "Executive summaries across all operational modules."),
      screen("CRM Reports", "crm", "reports", "CRM analytics and exports."),
      screen("Tender Reports", "tenders", "reports", "Tender performance, decisions, and outcomes."),
      screen("Quotation Reports", "quotations", "reports", "Quotation values, acceptance, rejection, and delivery."),
      screen("Supplier Reports", "suppliers", "reports", "Supplier analytics."),
      screen("Inventory Reports", "inventory", "reports", "Inventory analytics."),
      screen("Project Reports", "projects", "reports", "Project performance reports."),
      screen("Website Analytics", "website-analytics", "reports", "Website analytics and content performance."),
      screen("Audit Reports", "audit", "reports", "Audit log reports."),
      screen("Export Centre", "export-centre", "reports", "Export reports and datasets."),
    ],
  },
  {
    title: "Settings",
    basePath: "/admin/settings",
    icon: "settings",
    screens: [
      screen("Settings", "dashboard", "settings", "Admin-configurable business rules, security thresholds, tender eligibility settings, and integration controls."),
    ],
  },
  {
    title: "Audit Log Viewer",
    basePath: "/admin/audit-log",
    icon: "history",
    screens: [
      screen("Audit Log Viewer", "dashboard", "table", "Read-only system activity records for security, accountability, and compliance review."),
    ],
  },
];

export const quickAdd = [
  { label: "New Lead / Quotation", path: "/admin/quotations/dashboard" },
  { label: "New Tender", path: "/admin/tenders/dashboard" },
  { label: "New Blog", path: "/admin/content/dashboard" },
  { label: "New Project", path: "/admin/projects/dashboard" },
  { label: "New Employee", path: "/admin/employees/create" },
  { label: "Invite User", path: "/admin/users/dashboard" },
];

export const operations = [
  ["36", "Employee Management", "4 contracts expiring", "blue", "/admin/employees"],
  ["76", "Customer Relations Management", "Customers, leads and quotations", "green", "/admin/crm"],
  ["18", "Tender Management", "6 in confirmation", "blue", "/admin/tenders/dashboard"],
  ["9", "Project Management", "3 nearing completion", "green", "/admin/projects/dashboard"],
  ["7", "Inventory Management", "3 high priority alerts", "red", "/admin/inventory/dashboard"],
  ["17", "Content Management", "Blogs and testimonials", "amber", "/admin/content/dashboard"],
  ["24", "User Management", "Active system users", "blue", "/admin/users/dashboard"],
  ["23", "Reports & Analytics", "Across all modules", "green", "/admin/reports/dashboard"],
];

export const sampleRows = [
  ["SWS-001", "Kampala Estates", "In Progress", "High", "Today"],
  ["SWS-002", "Bright Schools", "Pending Review", "Medium", "Yesterday"],
  ["SWS-003", "Green Valley Ltd", "Approved", "Low", "Jul 3, 2026"],
  ["SWS-004", "City Hospital", "Draft", "Medium", "Jul 2, 2026"],
];

export const workflowSteps = ["Draft", "Review", "Approval", "Published", "Archived"];

export function findScreen(pathSegments: string[]) {
  if (pathSegments.length === 0) {
    return { module: modules[0], screen: modules[0].screens[0] };
  }

  const path = `/admin/${pathSegments.join("/")}`;
  for (const adminModule of modules) {
    for (const item of adminModule.screens) {
      const screenPath = item.slug ? `${adminModule.basePath}/${item.slug}` : adminModule.basePath;
      if (screenPath === path) {
        return { module: adminModule, screen: item };
      }
    }
  }

  const adminModule = modules.find((item) => item.basePath === path);
  if (adminModule) {
    return { module: adminModule, screen: adminModule.screens[0] };
  }

  return { module: modules[0], screen: modules[0].screens[0] };
}

export function allScreenParams() {
  return modules.flatMap((adminModule) =>
    adminModule.screens
      .filter((item) => item.slug)
      .map((item) => {
        const modulePrefix = adminModule.basePath === "/admin" ? "" : adminModule.basePath.replace("/admin/", "");
        const slug = modulePrefix ? `${modulePrefix}/${item.slug}` : item.slug;

        return { slug: slug.split("/") };
      }),
  );
}
