export const services = [
  {
    slug: "borehole-drilling",
    icon: "BD",
    title: "Borehole Drilling",
    shortDescription: "Professional drilling services for reliable groundwater access.",
    description:
      "Survey-led borehole drilling for homes, farms, institutions, commercial sites, and community water supply projects.",
    sections: [
      ["Overview", "We assess the site, water demand, geology, and access conditions before recommending a drilling approach."],
      ["Drilling Process", "Our process covers survey, drilling, casing, development, test pumping, and commissioning."],
      ["Equipment", "Project teams use appropriate drilling rigs, compressors, casing, pumps, and safety equipment for each site."],
      ["Benefits", "A properly drilled borehole gives dependable water access, lower long-term supply costs, and stronger drought resilience."],
    ],
  },
  {
    slug: "solar-water-pumping-systems",
    icon: "SW",
    title: "Solar Water Pumping Systems",
    shortDescription: "Solar-powered pumping systems for dependable water supply.",
    description:
      "Solar water pumping uses solar-powered pumps to move water from boreholes, wells, or storage points. It is not a standalone solar energy service.",
    sections: [
      ["Overview", "We design solar-powered water pumping systems around the water source, daily demand, pump head, and storage needs."],
      ["System Components", "Typical systems include solar panels, pump controllers, submersible or surface pumps, protection devices, and storage tanks."],
      ["Installation Process", "Installation covers sizing, mounting, wiring, pump fitting, controller setup, testing, and handover."],
      ["Applications", "Systems support farms, schools, homes, health facilities, villages, and remote sites where grid power is unreliable."],
      ["Advantages", "Solar pumping reduces generator dependence, improves operating costs, and supports continuous water access in sunny conditions."],
    ],
  },
  {
    slug: "water-treatment",
    icon: "WT",
    title: "Water Treatment",
    shortDescription: "Treatment solutions for clean, safe, usable water.",
    description:
      "Water testing, filtration, purification, and treatment system installation for residential, commercial, and institutional needs.",
    sections: [
      ["Overview", "We match treatment solutions to actual water quality issues, usage needs, and operating conditions."],
      ["Treatment Technologies", "Solutions may include filtration, softening, disinfection, sediment removal, and specialist treatment units."],
      ["Residential Solutions", "Home systems improve drinking water, appliance protection, and everyday household use."],
      ["Commercial Solutions", "Commercial systems support reliable treated water for offices, hospitality, schools, clinics, and industry."],
    ],
  },
  {
    slug: "plumbing-services",
    icon: "PS",
    title: "Plumbing Services",
    shortDescription: "Domestic, commercial, and maintenance plumbing services.",
    description:
      "Plumbing installation, repair, maintenance, and system improvement services for dependable water movement inside properties.",
    sections: [
      ["Overview", "We handle practical plumbing works connected to water supply, storage, distribution, and maintenance."],
      ["Domestic Plumbing", "Home services cover repairs, fixtures, pipework, tanks, pumps, and water access improvements."],
      ["Commercial Plumbing", "Commercial works support offices, schools, apartments, clinics, and business premises."],
      ["Maintenance Services", "Scheduled maintenance helps prevent leaks, pressure problems, blockages, and unexpected downtime."],
    ],
  },
  {
    slug: "pipeline-installation",
    icon: "PI",
    title: "Pipeline Installation",
    shortDescription: "Pipeline construction and installation for durable water systems.",
    description:
      "Pipeline design support, trenching, laying, connection, testing, and commissioning for water distribution projects.",
    sections: [
      ["Overview", "Pipeline projects are planned around distance, pressure, flow rate, terrain, materials, and future maintenance access."],
      ["Pipeline Construction", "Works include route preparation, trenching, pipe laying, jointing, backfilling, and site reinstatement."],
      ["Installation Process", "The team coordinates layout, materials, installation, pressure testing, and commissioning."],
      ["Materials Used", "Materials are selected based on water pressure, site conditions, budget, and durability needs."],
    ],
  },
  {
    slug: "water-storage-solutions",
    icon: "WS",
    title: "Water Storage Solutions",
    shortDescription: "Storage tanks, reservoir systems, and installation support.",
    description:
      "Storage planning and installation for households, farms, commercial properties, and community water systems.",
    sections: [
      ["Overview", "We plan storage around daily demand, supply reliability, site space, elevation, and distribution requirements."],
      ["Storage Tanks", "Tank options can include plastic, steel, elevated, ground-level, and linked tank arrangements."],
      ["Reservoir Systems", "Larger systems support institutions, farms, communities, and commercial facilities with higher water demand."],
      ["Installation", "Installation covers base preparation, positioning, pipe connections, valves, overflow, and testing."],
    ],
  },
  {
    slug: "water-taps-accessories",
    icon: "TA",
    title: "Water Taps & Accessories",
    shortDescription: "Water taps, pipes, valves, fittings, and connectors.",
    description:
      "Supply and installation support for practical water-system accessories used in homes, institutions, and project sites.",
    sections: [
      ["Overview", "We support clients with the right accessories for reliable water control, connection, and distribution."],
      ["Products", "Products include water taps, pipes, valves, fittings, connectors, and related accessories."],
      ["Applications", "Accessories support domestic plumbing, borehole systems, storage tanks, treatment units, and pipeline works."],
    ],
  },
  {
    slug: "water-engineering-consultancy",
    icon: "EC",
    title: "Water Engineering Consultancy",
    shortDescription: "Site surveys, system design, BOQs, and technical advisory.",
    description:
      "Technical support for water projects from survey and design through budgeting, implementation planning, and advisory.",
    sections: [
      ["Overview", "Consultancy helps clients choose practical, cost-aware, and technically sound water solutions."],
      ["Site Surveys", "Surveys assess water sources, site access, demand, terrain, constraints, and implementation risks."],
      ["System Design", "Design work can cover boreholes, pumping, storage, treatment, pipelines, and distribution systems."],
      ["BOQ Preparation", "Bills of quantities help clients understand materials, equipment, scope, and expected project costs."],
      ["Technical Advisory", "Advisory supports procurement, contractor review, troubleshooting, and project decision-making."],
    ],
  },
] as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const featuredProjects = [
  {
    location: "Kampala",
    title: "Commercial borehole drilling",
    description: "Survey-led drilling and commissioning for a commercial property water supply.",
    category: "Borehole Drilling",
  },
  {
    location: "Mbale",
    title: "Water treatment installation",
    description: "Filtration and treatment setup for safer daily use at an institutional site.",
    category: "Water Treatment",
  },
  {
    location: "Luweero",
    title: "Solar water pumping installation",
    description: "Solar-powered pumping from source to storage for a farm water system.",
    category: "Solar Water Pumping",
  },
] as const;

export const testimonials = [
  {
    quote: "Reliable service and clear communication from survey to completion.",
    company: "Kampala Estates",
  },
  {
    quote: "Their team delivered our solar water pumping system on schedule.",
    company: "Luweero Farm",
  },
  {
    quote: "Professional maintenance support keeps our system running.",
    company: "Bright Schools",
  },
] as const;

export const blogPosts = [
  {
    title: "How to Plan a Reliable Borehole Project",
    category: "Boreholes",
    summary: "Key early decisions before drilling, from site surveys to expected water demand.",
  },
  {
    title: "When Solar Water Pumping Makes Sense",
    category: "Solar Water Pumping",
    summary: "Where solar-powered pumps work best and what details affect sizing.",
  },
  {
    title: "Signs Your Water Needs Treatment",
    category: "Water Treatment",
    summary: "Common water quality issues and the treatment conversations they should start.",
  },
] as const;
