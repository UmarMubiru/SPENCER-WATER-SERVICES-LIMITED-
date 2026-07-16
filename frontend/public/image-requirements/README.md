# Public Website Image Plan

Place the approved, web-optimised images in `frontend/public/` using the filenames below. The public website currently has the company logo only; it also references the three missing home-page hero images.

## Minimum launch set — 24 unique images

| Filename | Screen / placement | What it should show |
| --- | --- | --- |
| `hero-water-1.jpg` | Home — first hero slide | Wide, high-quality borehole drilling rig at work in Uganda; clear sky, safe site practices, room for white text on the left. |
| `hero-water-2.jpg` | Home — second hero slide | Solar panels powering a water pump or elevated tank at a farm, school, or community site. |
| `hero-water-3.jpg` | Home — third hero slide | Completed water system: clean storage tanks, piping, and a community, institutional, or commercial setting. |
| `project-borehole-kampala.jpg` | Home and Projects — Commercial borehole drilling card | Completed commercial borehole, pump-house, or rig commissioning in Kampala. |
| `project-treatment-mbale.jpg` | Home and Projects — Water treatment card | Neat installed filtration/treatment equipment at an institution in Mbale. |
| `project-solar-luweero.jpg` | Home and Projects — Solar pumping card | Solar array, pump controller, and water storage installation at a Luweero farm. |
| `about-company-overview.jpg` | About Us — Company overview | Spencer Water field team inspecting or commissioning a water project; professional uniforms/PPE where applicable. |
| `about-mission-impact.jpg` | About Us — Mission and vision | Beneficiaries using a completed clean-water point, tank, or distribution system. |
| `service-borehole-drilling.jpg` | Services and Borehole Drilling detail | Drilling rig, casing, compressor, or test-pumping operation. |
| `service-solar-water-pumping.jpg` | Services and Solar Water Pumping detail | Solar panels, controller, pump installation, and storage tank in one coherent scene. |
| `service-water-treatment.jpg` | Services and Water Treatment detail | Modern, clean filtration, UV, softening, or treatment installation. |
| `service-plumbing.jpg` | Services and Plumbing Services detail | Skilled plumber fitting clean pipework, valves, or a pump system. |
| `service-pipeline-installation.jpg` | Services and Pipeline Installation detail | Safe trenching or pipe-laying with visible HDPE/PVC pipeline work. |
| `service-water-storage.jpg` | Services and Water Storage Solutions detail | Elevated or ground-level tanks with professional pipe connections. |
| `service-taps-accessories.jpg` | Services and Water Taps & Accessories detail | Well-arranged taps, valves, fittings, and pipes; product-focused but real. |
| `service-water-engineering-consultancy.jpg` | Services and Consultancy detail | Engineer reviewing plans at a water-project site, surveying, or assessing a system. |
| `team-technical-director.jpg` | About Us — Management team | Professional portrait of the technical director, neutral background or project site. |
| `team-operations-lead.jpg` | About Us — Management team | Professional portrait of the operations lead. |
| `team-service-team.jpg` | About Us — Management team | Small group portrait of field/service technicians with equipment or at a completed site. |
| `blog-borehole-planning.jpg` | Blog — Borehole planning article | Engineer/site surveyor reviewing a borehole location or drilling plan. |
| `blog-solar-pumping.jpg` | Blog — Solar pumping article | Solar pumping system operating in daylight. |
| `blog-water-treatment.jpg` | Blog — Water treatment article | Water sample, filtration system, or clean treatment equipment. |
| `contact-office-kampala.jpg` | Contact — Office/location section | Spencer Water office exterior, reception, or clearly recognisable Kampala location. |
| `projects-map-uganda.jpg` | Projects — Location/map section | Branded Uganda project-coverage map showing completed project areas; use a designed graphic, not a stock map screenshot. |

## Recommended service-gallery extension — 18 more images

For each service image above, add two related gallery images:

1. `gallery-<service>-process.jpg` — installation, survey, drilling, trenching, wiring, or construction in progress.
2. `gallery-<service>-completed.jpg` — clean completed installation, commissioning, or client-ready outcome.

Example: `gallery-borehole-drilling-process.jpg` and `gallery-borehole-drilling-completed.jpg`.

This raises the complete content library to **42 images** and gives every service detail page meaningful visual variety without needing a different image for every text section.

## Technical guidance

- Hero images: landscape, at least **1920 × 1080 px**, JPEG/WebP, under 500 KB after compression.
- Service, project, blog, and team images: at least **1200 × 800 px**, JPEG/WebP, under 350 KB after compression.
- Use real Spencer Water projects only where client permission has been obtained. Avoid identifiable clients or children without consent.
- Do not use images with prominent third-party logos, unsafe work practices, or unrelated solar-electricity imagery. Solar images must clearly relate to **water pumping**.
- Keep important subjects away from the left edge of hero images because the home-page headline is displayed there.

## Current implementation note

Only `hero-water-1.jpg`, `hero-water-2.jpg`, and `hero-water-3.jpg` are already referenced by the CSS. The remaining filename plan is ready for the next visual pass, when the placeholders are replaced with real images.
