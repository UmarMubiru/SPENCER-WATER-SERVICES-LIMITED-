#!/usr/bin/env python
"""Script to populate blog categories and sample articles based on services."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from blog.models import BlogCategory, BlogPost, BlogTag
from services.models import Service
from django.contrib.auth.models import User

def get_or_create_user():
    """Get or create a default user for blog posts."""
    try:
        return User.objects.first()
    except:
        return None

def create_categories_from_services():
    """Create blog categories based on existing services."""
    services = Service.objects.filter(is_active=True)
    categories_created = []
    
    print(f"Found {services.count()} active services")
    
    for service in services:
        # Create category from service name
        category_name = service.name.strip()
        slug = service.slug
        
        category, created = BlogCategory.objects.get_or_create(
            slug=slug,
            defaults={
                'name': category_name,
                'description': f'Articles and insights about {category_name.lower()}'
            }
        )
        
        if created:
            categories_created.append(category)
            print(f"Created category: {category.name}")
    
    return categories_created

def create_sample_articles():
    """Create sample articles for each category."""
    user = get_or_create_user()
    categories = BlogCategory.objects.all()
    
    # Map actual category slugs to article data
    sample_articles = [
        {
            'category': 'borehole-drilling',
            'title': 'Understanding Borehole Drilling: A Complete Guide',
            'slug': 'understanding-borehole-drilling-complete-guide',
            'excerpt': 'Comprehensive guide to borehole drilling process, equipment, and best practices for water supply in Uganda.',
            'featured_image': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
            'content': '''# Understanding Borehole Drilling: A Complete Guide

## Introduction

Borehole drilling is a critical process for accessing groundwater for residential, commercial, and agricultural use. This guide covers the essential aspects of borehole drilling in Uganda.

## Site Survey and Assessment

Before drilling begins, a thorough site assessment is essential:
- Geological survey to determine water table depth
- Hydrogeological assessment for water quality
- Environmental impact assessment
- Access and logistics planning

## The Drilling Process

### Equipment Used
- Rotary drilling rigs
- Mud pumps for circulation
- Casing materials (PVC or steel)
- Well screens

### Drilling Stages
1. Site preparation and rig setup
2. Drilling to target depth
3. Casing installation
4. Well screen placement
5. Grouting and sealing
6. Development and testing

## Water Quality Considerations

Common water quality issues in boreholes:
- Iron and manganese contamination
- Bacterial contamination
- Hardness and mineral content
- pH imbalance

## Maintenance Requirements

Regular maintenance ensures longevity:
- Annual water quality testing
- Pump inspection and servicing
- Wellhead protection
- Monitoring water levels

## Conclusion

Proper borehole drilling requires expertise and proper planning. Always work with licensed professionals for best results.''',
            'reading_time': 8,
            'is_featured': True,
            'meta_description': 'Complete guide to borehole drilling process, site assessment, and maintenance in Uganda.',
            'meta_keywords': 'borehole drilling, water wells, groundwater, drilling process, Uganda'
        },
        {
            'category': 'solar-water-pumping-systems',
            'title': 'Solar Water Pumping: Sustainable Solution for Uganda',
            'slug': 'solar-water-pumping-sustainable-solution-uganda',
            'excerpt': 'How solar water pumping systems provide reliable water supply for farms and communities in Uganda.',
            'featured_image': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
            'content': '''# Solar Water Pumping: Sustainable Solution for Uganda

## Introduction

Solar water pumping harnesses Uganda's abundant sunshine to provide reliable water supply for irrigation, livestock, and domestic use.

## How Solar Pumping Works

### System Components
- Solar panels (photovoltaic modules)
- Pump controller/inverter
- Electric pump (submersible or surface)
- Water storage tank
- Piping and distribution system

### Types of Solar Pumps
- Submersible pumps for deep wells
- Surface pumps for shallow water sources
- Booster pumps for pressurized systems
- Hybrid systems with backup power

## Advantages for Uganda

### Cost Benefits
- Zero fuel costs after installation
- Minimal maintenance requirements
- Long system lifespan (20+ years)
- Reduced operational expenses

### Reliability
- Independent of grid power
- Works during power outages
- Consistent daily operation
- Suitable for remote areas

### Environmental Benefits
- Zero emissions during operation
- Reduced deforestation for fuel
- Sustainable water extraction
- Minimal environmental impact

## System Sizing

### Key Factors
- Daily water requirements
- Total dynamic head
- Solar resource availability
- Seasonal variations

### Sizing Steps
1. Calculate daily water demand
2. Determine pumping head
3. Assess solar potential
4. Select appropriate pump capacity
5. Size solar array
6. Design storage capacity

## Installation Considerations

### Site Requirements
- Unobstructed solar access
- Proximity to water source
- Security considerations
- Accessibility for maintenance

### Regulatory Compliance
- Water use permits
- Environmental impact assessment
- Building permits where required
- Grid connection regulations

## Maintenance

### Regular Tasks
- Clean solar panels regularly
- Inspect electrical connections
- Monitor pump performance
- Check storage tank integrity

### Troubleshooting
- Low water output
- Pump not starting
- Electrical faults
- System monitoring

## Conclusion

Solar water pumping represents a sustainable investment for water supply in Uganda, offering reliability and cost savings over the long term.''',
            'reading_time': 8,
            'is_featured': True,
            'meta_description': 'Comprehensive guide to solar water pumping systems for farms and communities in Uganda.',
            'meta_keywords': 'solar pumping, solar water pumps, renewable energy, irrigation, Uganda'
        },
        {
            'category': 'water-storage-solutions',
            'title': 'Water Storage Solutions for Reliable Supply',
            'slug': 'water-storage-solutions-reliable-supply',
            'excerpt': 'Effective water storage solutions including tanks, reservoirs, and distribution systems for consistent water supply.',
            'featured_image': 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800&h=600&fit=crop',
            'content': '''# Water Storage Solutions for Reliable Supply

## Introduction

Proper water storage ensures consistent supply during outages, peak demand periods, and for emergency preparedness.

## Types of Water Storage

### Domestic Storage
- Overhead tanks
- Underground tanks
- Pressure vessels
- Rainwater harvesting tanks

### Commercial Storage
- Large capacity tanks
- Fire suppression tanks
- Process water storage
- Distribution reservoirs

### Agricultural Storage
- Irrigation water storage
- Livestock water tanks
- Farm ponds and reservoirs
- Rainwater collection systems

## Tank Materials

### Plastic/Polyethylene Tanks
- Lightweight and durable
- Corrosion resistant
- Various sizes available
- Cost-effective

### Steel Tanks
- High durability
- Suitable for large capacities
- Can be painted or coated
- Long lifespan

### Concrete Tanks
- Permanent installation
- Large capacity options
- Can be underground
- Excellent durability

### Fiberglass Tanks
- Corrosion resistant
- Lightweight
- Custom sizes available
- Good chemical resistance

## Sizing Considerations

### Domestic Use
- 500-1000 liters for small households
- 1000-2000 liters for medium households
- 2000+ liters for large households
- Consider family size and usage patterns

### Commercial Use
- Based on daily consumption
- Peak demand factors
- Backup duration requirements
- Fire suppression needs

### Agricultural Use
- Irrigation requirements
- Livestock needs
- Seasonal variations
- Crop water requirements

## Installation Requirements

### Site Selection
- Stable foundation
- Proper elevation for gravity flow
- Access for maintenance
- Protection from contamination

### Foundation Requirements
- Concrete slab for large tanks
- Proper leveling
- Load-bearing capacity
- Drainage considerations

### Plumbing Connections
- Inlet and outlet sizing
- Overflow provisions
- Ventilation requirements
- Access for maintenance

## Maintenance

### Regular Tasks
- Tank cleaning and disinfection
- Inspect for leaks
- Check fittings and connections
- Monitor water quality

### Water Quality Management
- Regular testing
- Proper chlorination
- Algae prevention
- Sediment removal

## Safety Considerations

### Structural Safety
- Proper installation
- Regular inspections
- Load management
- Foundation integrity

### Water Quality Safety
- Covered storage
- Proper ventilation
- Contamination prevention
- Regular disinfection

## Conclusion

Proper water storage is essential for reliable water supply. Choose the right type and size based on your specific needs and ensure proper installation and maintenance.''',
            'reading_time': 7,
            'is_featured': False,
            'meta_description': 'Guide to water storage solutions including tanks, materials, sizing, and installation for reliable water supply.',
            'meta_keywords': 'water storage, water tanks, reservoirs, rainwater harvesting, water supply'
        },
        {
            'category': 'plumbing-services',
            'title': 'Professional Plumbing Services for Your Property',
            'slug': 'professional-plumbing-services-property',
            'excerpt': 'Expert guide to plumbing systems and installation for residential, commercial, and industrial applications.',
            'featured_image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
            'content': '''# Professional Plumbing Services for Your Property

## Introduction

Proper plumbing is essential for efficient water distribution and wastewater management in any building or facility.

## Plumbing System Components

### Water Supply Systems
- Main water lines
- Distribution piping
- Valves and controls
- Pressure regulation
- Backflow prevention

### Drainage Systems
- Waste pipes
- Vent pipes
- Traps and cleanouts
- Sewage ejectors
- Grease interceptors

### Fixtures and Appliances
- Faucets and taps
- Toilets and urinals
- Showers and tubs
- Sinks and basins
- Water heaters

## Pipe Materials

### Common Materials
- PVC (Polyvinyl Chloride)
- PEX (Cross-linked Polyethylene)
- Copper
- Steel (galvanized)
- CPVC (Chlorinated PVC)

### Material Selection
- Water quality compatibility
- Pressure requirements
- Temperature considerations
- Cost and availability
- Local building codes

## Installation Standards

### Code Compliance
- Uganda building codes
- International plumbing codes
- Local authority requirements
- Industry best practices

### Quality Standards
- Proper joint techniques
- Correct pressure ratings
- Adequate support and hangers
- Proper slope for drainage
- Access for maintenance

## System Design

### Residential Plumbing
- Water supply sizing
- Drainage layout
- Ventilation requirements
- Fixture placement
- Hot water distribution

### Commercial Plumbing
- Higher capacity requirements
- Multiple fixture groups
- Specialized systems
- Fire suppression integration
- Grease management

### Industrial Plumbing
- Process water systems
- Chemical resistance
- High-pressure applications
- Specialized materials
- Safety considerations

## Installation Process

### Planning Phase
- System design and layout
- Material selection
- Permit acquisition
- Site preparation

### Installation Phase
- Rough-in plumbing
- Pipe installation
- Fixture installation
- System testing
- Final connections

### Inspection Phase
- Pressure testing
- Leak detection
- Flow testing
- Code compliance check
- Final approval

## Maintenance Requirements

### Preventive Maintenance
- Regular inspections
- Leak detection
- Valve exercising
- Anode rod replacement
- Sediment removal

### Common Issues
- Leaks and drips
- Low water pressure
- Clogged drains
- Water hammer
- Corrosion

## Troubleshooting

### Water Supply Issues
- Low pressure
- No water
- Discolored water
- Temperature problems

### Drainage Issues
- Slow drains
- Backups
- Odors
- Noise

## Conclusion

Professional plumbing installation requires expertise, proper planning, and adherence to standards. Always work with licensed professionals for best results and long-term reliability.''',
            'reading_time': 8,
            'is_featured': False,
            'meta_description': 'Comprehensive guide to plumbing systems, pipe materials, installation standards, and maintenance.',
            'meta_keywords': 'plumbing, water supply, drainage, installation, maintenance'
        },
        {
            'category': 'plumbing-pipeline-installation',
            'title': 'Pipeline Installation: Best Practices Guide',
            'slug': 'pipeline-installation-best-practices-guide',
            'excerpt': 'Professional guide to pipeline installation for water distribution systems with quality standards.',
            'featured_image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
            'content': '''# Pipeline Installation: Best Practices Guide

## Introduction

Proper pipeline installation is crucial for efficient water distribution in residential, commercial, and industrial settings.

## Pipeline Types

### Water Supply Pipelines
- Main distribution lines
- Service connections
- Fire suppression lines
- Irrigation pipelines

### Drainage Pipelines
- Sewer lines
- Storm water drainage
- Industrial waste lines
- Grey water recycling

## Pipe Materials Selection

### PVC Pipes
- Cost-effective
- Easy to install
- Chemical resistant
- Various pressure ratings

### HDPE Pipes
- Flexible and durable
- Leak-proof joints
- Corrosion resistant
- Long lifespan

### Steel Pipes
- High pressure capacity
- Durable
- Suitable for large diameters
- Requires corrosion protection

### Copper Pipes
- Excellent for hot water
- Natural antimicrobial
- Long-lasting
- Higher cost

## Installation Process

### Site Preparation
- Route planning and survey
- Excavation and trenching
- Bedding preparation
- Safety measures

### Pipe Installation
- Pipe laying and alignment
- Joint connection methods
- Pressure testing
- Backfilling

### Quality Control
- Pressure testing
- Leak detection
- Flow testing
- Inspection and certification

## Joint Methods

### Solvent Welding (PVC)
- Clean and prime surfaces
- Apply solvent cement
- Join and hold
- Cure time requirements

### Heat Fusion (HDPE)
- Heat pipe ends
- Join under pressure
- Cool and inspect
- Strong monolithic joint

### Mechanical Joints
- Flanged connections
- Compression fittings
- Threaded connections
- Quick couplings

## Testing and Commissioning

### Hydrostatic Testing
- Fill with water
- Pressurize to test pressure
- Hold for specified time
- Inspect for leaks

### Flow Testing
- Measure flow rates
- Check pressure drops
- Verify system performance
- Document results

## Maintenance

### Regular Inspections
- Visual inspection
- Leak detection
- Pressure monitoring
- Flow measurement

### Common Issues
- Pipe corrosion
- Joint failures
- Blockages
- Ground movement damage

## Safety Considerations

### Excavation Safety
- Proper shoring
- Utility location
- Worker protection
- Emergency procedures

### Pressure Safety
- Proper pressure ratings
- Relief valves
- Pressure gauges
- Safety protocols

## Conclusion

Proper pipeline installation requires careful planning, quality materials, and skilled execution. Following industry standards ensures reliable and safe water distribution systems.''',
            'reading_time': 7,
            'is_featured': False,
            'meta_description': 'Guide to pipeline installation for water distribution systems.',
            'meta_keywords': 'pipeline installation, water distribution, pipes, HDPE, PVC'
        },
        {
            'category': 'water-taps-accessories',
            'title': 'Water Taps and Accessories Guide',
            'slug': 'water-taps-accessories-guide',
            'excerpt': 'Complete guide to water taps, valves, and accessories for your plumbing system.',
            'featured_image': 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&h=600&fit=crop',
            'content': '''# Water Taps and Accessories Guide

## Introduction

Choosing the right water taps and accessories is essential for functionality, durability, and aesthetics in any plumbing system.

## Types of Water Taps

### Basin Taps
- Pillar taps
- Mixer taps
- Monobloc mixers
- Wall-mounted taps

### Kitchen Taps
- Single lever mixers
- Dual handle mixers
- Pull-out spray taps
- Filtered water taps

### Bath Taps
- Bath fillers
- Bath/shower mixers
- Freestanding taps
- Wall-mounted bath taps

### Shower Controls
- Thermostatic mixers
- Manual mixers
- Digital controls
- Multi-function valves

## Tap Materials

### Brass
- Durable and long-lasting
- Corrosion resistant
- Can be plated
- Traditional choice

### Stainless Steel
- Modern appearance
- Highly durable
- Corrosion resistant
- Easy to clean

### Chrome-Plated
- Popular finish
- Reflective surface
- Easy to clean
- Affordable

### Ceramic
- Elegant appearance
- Durable finish
- Easy to clean
- Higher cost

## Essential Accessories

### Valves
- Stop valves
- Check valves
- Pressure reducing valves
- Thermostatic valves

### Hoses and Connectors
- Flexible hoses
- Angle valves
- Straight connectors
- Adapters

### Drainage Accessories
- Waste traps
- Bottle traps
- Push-fit waste
- Overflow fittings

## Installation Considerations

### Water Pressure
- Minimum pressure requirements
- Maximum pressure limits
- Pressure balancing
- Flow rate considerations

### Compatibility
- Pipe size matching
- Thread standards
- Mounting requirements
- Spacing requirements

### Accessibility
- Easy operation
- Maintenance access
- Child safety features
- Accessibility compliance

## Maintenance

### Regular Cleaning
- Remove limescale buildup
- Clean aerators
- Check for leaks
- Lubricate moving parts

### Common Issues
- Dripping taps
- Low flow
- Stiff handles
- Leaking connections

## Troubleshooting

### Dripping Taps
- Replace washers
- Check ceramic discs
- Tighten connections
- Replace cartridges

### Low Flow
- Clean aerators
- Check supply valves
- Remove blockages
- Check pressure

## Selection Tips

### Functionality
- Intended use
- Frequency of use
- User requirements
- Special features needed

### Aesthetics
- Match bathroom/kitchen style
- Finish consistency
- Size proportion
- Design preference

### Budget
- Initial cost
- Long-term durability
- Maintenance costs
- Energy efficiency

## Conclusion

Choosing the right water taps and accessories involves balancing functionality, aesthetics, durability, and budget. Quality products properly installed will provide years of reliable service.''',
            'reading_time': 6,
            'is_featured': False,
            'meta_description': 'Guide to water taps, valves, and accessories for plumbing systems.',
            'meta_keywords': 'water taps, valves, plumbing accessories, bathroom fixtures'
        },
        {
            'category': 'water-engineering-consultancy',
            'title': 'Water Engineering Consultancy Services',
            'slug': 'water-engineering-consultancy-services',
            'excerpt': 'Professional water engineering consultancy for project planning, design, and implementation.',
            'featured_image': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
            'content': '''# Water Engineering Consultancy Services

## Introduction

Professional water engineering consultancy provides expert guidance for water infrastructure projects from conception to completion.

## Consultancy Services

### Feasibility Studies
- Site assessment
- Resource evaluation
- Technical feasibility
- Economic analysis

### System Design
- Water system design
- Infrastructure planning
- Equipment selection
- Layout optimization

### Project Management
- Project planning
- Budget management
- Timeline coordination
- Quality control

### Regulatory Compliance
- Permit acquisition
- Environmental assessment
- Code compliance
- Standards adherence

## Specialized Services

### Hydrogeological Assessment
- Groundwater exploration
- Aquifer mapping
- Water quality analysis
- Yield testing

### Hydraulic Design
- Pump selection
- Pipe sizing
- Pressure analysis
- Flow optimization

### Treatment Design
- Treatment process selection
- System sizing
- Chemical dosing
- Disinfection design

### Irrigation Design
- Crop water requirements
- System layout
- Pump sizing
- Automation design

## Project Phases

### Pre-Design Phase
- Needs assessment
- Site investigation
- Data collection
- Preliminary design

### Design Phase
- Detailed design
- Drawings and specifications
- Cost estimation
- Permit applications

### Implementation Phase
- Construction supervision
- Quality assurance
- Progress monitoring
- Problem resolution

### Post-Implementation
- Commissioning
- Training
- Documentation
- Maintenance planning

## Expertise Areas

### Water Supply
- Borehole development
- Surface water systems
- Distribution networks
- Storage facilities

### Wastewater
- Collection systems
- Treatment plants
- Discharge systems
- Reuse systems

### Stormwater
- Drainage design
- Flood management
- Erosion control
- Water harvesting

### Industrial Water
- Process water systems
- Cooling water
- Wastewater treatment
- Water recycling

## Benefits of Professional Consultancy

### Technical Expertise
- Specialized knowledge
- Industry experience
- Best practices
- Innovation

### Risk Management
- Problem identification
- Risk mitigation
- Compliance assurance
- Quality control

### Cost Efficiency
- Optimized design
- Value engineering
- Lifecycle costing
- Avoidance of rework

### Regulatory Compliance
- Permit facilitation
- Standards adherence
- Documentation
- Inspections support

## Selection Criteria

### Qualifications
- Professional registration
- Technical expertise
- Experience level
- Track record

### Capabilities
- Service range
- Technical resources
- Team expertise
- Equipment availability

### References
- Past projects
- Client testimonials
- Industry reputation
- Case studies

### Approach
- Methodology
- Communication
- Project management
- Quality assurance

## Conclusion

Professional water engineering consultancy ensures successful project outcomes through expert guidance, technical excellence, and comprehensive project management. Choose consultants with proven expertise and a track record of successful implementations.''',
            'reading_time': 8,
            'is_featured': True,
            'meta_description': 'Guide to water engineering consultancy services for water infrastructure projects.',
            'meta_keywords': 'water engineering, consultancy, project management, design, feasibility'
        }
    ]
    
    articles_created = []
    
    for article_data in sample_articles:
        category = BlogCategory.objects.filter(slug=article_data['category']).first()
        if not category:
            print(f"Category not found: {article_data['category']}")
            continue
        
        article, created = BlogPost.objects.get_or_create(
            slug=article_data['slug'],
            defaults={
                'title': article_data['title'],
                'excerpt': article_data['excerpt'],
                'content': article_data['content'],
                'category': category,
                'author': user,
                'status': 'PUBLISHED',
                'is_featured': article_data['is_featured'],
                'reading_time': article_data['reading_time'],
                'meta_description': article_data['meta_description'],
                'meta_keywords': article_data['meta_keywords'],
                'featured_image': article_data.get('featured_image', ''),
            }
        )
        
        # Update existing articles with featured image
        if not created and 'featured_image' in article_data:
            article.featured_image = article_data['featured_image']
            article.save()
            print(f"Updated article with image: {article.title}")
        
        if created:
            articles_created.append(article)
            print(f"Created article: {article.title}")
        else:
            print(f"Article already exists: {article.title}")
    
    return articles_created

def create_common_tags():
    """Create common blog tags."""
    tags_data = [
        'water',
        'engineering',
        'Uganda',
        'sustainability',
        'agriculture',
        'irrigation',
        'boreholes',
        'solar',
        'treatment',
        'plumbing',
        'maintenance',
        'installation',
        'community',
        'health',
        'efficiency'
    ]
    
    tags_created = []
    
    for tag_name in tags_data:
        slug = tag_name.lower().replace(' ', '-')
        tag, created = BlogTag.objects.get_or_create(
            slug=slug,
            defaults={'name': tag_name}
        )
        
        if created:
            tags_created.append(tag)
            print(f"Created tag: {tag.name}")
    
    return tags_created

def main():
    print("Starting blog population...")
    print("=" * 50)
    
    print("\nCreating categories from services...")
    categories = create_categories_from_services()
    print(f"Created {len(categories)} categories")
    
    print("\nCreating common tags...")
    tags = create_common_tags()
    print(f"Created {len(tags)} tags")
    
    print("\nCreating sample articles...")
    articles = create_sample_articles()
    print(f"Created {len(articles)} articles")
    
    print("\n" + "=" * 50)
    print("Blog population completed successfully!")
    print(f"Total categories: {BlogCategory.objects.count()}")
    print(f"Total tags: {BlogTag.objects.count()}")
    print(f"Total articles: {BlogPost.objects.count()}")

if __name__ == '__main__':
    main()
