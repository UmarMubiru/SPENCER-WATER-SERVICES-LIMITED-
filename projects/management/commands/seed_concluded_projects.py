import os
import shutil
import uuid
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from projects.models import Project
from projects.models_extras import ProjectActivity, ActivityImage


class Command(BaseCommand):
    help = 'Seed concluded projects from the projects and locations folder'

    def handle(self, *args, **kwargs):
        base_path = r'D:\SPENCER WATER SERVICES LIMITED\projets and locations'
        media_path = os.path.join(settings.MEDIA_ROOT, 'project_images')
        
        # Project data with approximate coordinates
        projects_data = [
            {
                'name': 'Installation of spray disinfectant in a poultry farm',
                'location': 'Kajjansi',
                'latitude': 0.2447,
                'longitude': 32.5436,
                'service_line': 'water_treatment',
                'description': 'Installation of spray disinfectant system for a poultry farm in Kajjansi. The project included setup of disinfection equipment and water treatment systems to ensure clean water supply for poultry operations.',
                'folder': 'Installation of spray disinfectant in a poultry farm  location kajjansi',
                'images': ['image 53.png', 'image 54.png', 'image 55.png', 'image 56.png']
            },
            {
                'name': 'Installation of chlorine doser in Masafu',
                'location': 'Masafu, Busia District',
                'latitude': 0.4567,
                'longitude': 34.0833,
                'service_line': 'water_treatment',
                'description': 'Installation of chlorine dosing system in Masafu, Busia District. The project involved setting up automated chlorine dosing equipment for water treatment and purification.',
                'folder': 'installation of chlorine doser in masafu busia district',
                'images': ['spencer_image_22.png']
            },
            {
                'name': 'Installation of delivery line and pump for irrigation',
                'location': 'Namadope and Buwambuzi, Luuka District',
                'latitude': 0.5167,
                'longitude': 33.7333,
                'service_line': 'pumping_systems',
                'description': 'Installation of water delivery lines and pump systems for irrigation in Namadope and Buwambuzi, Luuka District. The project included pump installation, pipeline laying, and irrigation system setup.',
                'folder': 'installation of delivery line and pump for irrigation in namadope and buwambuzi  in luuka district',
                'images': ['spencer_image_42.png', 'spencer_image_43.png', 'spencer_image_44.png', 'spencer_image_45.png', 
                          'spencer_image_49.png', 'spencer_image_50.png', 'spencer_image_51.png', 'spencer_image_52.png']
            },
            {
                'name': 'Installation of water tanks and trenching in pipe laying',
                'location': 'Heritage Farm, Kirema, Nakaseke District',
                'latitude': 1.4167,
                'longitude': 32.0833,
                'service_line': 'storage_distribution',
                'description': 'Installation of water storage tanks and trenching for pipe laying at Heritage Farm in Kirema, Nakaseke District. The project involved water tank installation, trenching, and pipeline infrastructure.',
                'folder': 'installation of water tanks,and trenching in pipe laying in heritage farm,at kirema nakaseke district',
                'images': ['image 57.png', 'image 58.png', 'spencer_image_01.png', 'spencer_image_02.png', 'spencer_image_20.png']
            },
            {
                'name': 'Irrigation project in Namadope',
                'location': 'Namadope, Luuka District',
                'latitude': 0.5167,
                'longitude': 33.7333,
                'service_line': 'irrigation',
                'description': 'Comprehensive irrigation project in Namadope, Luuka District. The project included installation of irrigation systems, water pumps, and distribution networks for agricultural irrigation.',
                'folder': 'irrigation project in namadope luuka district',
                'images': ['image 59.png', 'spencer_image_10.png', 'spencer_image_12.png', 'spencer_image_16.png', 'spencer_image_17.png']
            }
        ]

        for project_data in projects_data:
            self.stdout.write(f'Processing project: {project_data["name"]}')
            
            # Check if project already exists
            existing_project = Project.objects.filter(name=project_data['name']).first()
            if existing_project:
                self.stdout.write(f'  Project already exists, skipping...')
                continue
            
            # Create project
            project = Project.objects.create(
                name=project_data['name'],
                project_reference=f'PRJ-{uuid.uuid4().hex[:8].upper()}',
                service_line=project_data['service_line'],
                scope_description=project_data['description'],
                public_description=project_data['description'],
                site_location=project_data['location'],
                latitude=project_data['latitude'],
                longitude=project_data['longitude'],
                status='completed',
                completion_percentage=100,
                is_published=True,
                is_portfolio_candidate=True,
                actual_start_date='2023-01-01',
                actual_completion_date='2023-12-31',
                contract_value=50000000
            )
            
            # Create project folder in media
            project_folder_name = project.name.replace(' ', '_').lower()
            project_media_path = os.path.join(media_path, project_folder_name)
            os.makedirs(project_media_path, exist_ok=True)
            
            # Create activity
            activity = ProjectActivity.objects.create(
                project=project,
                activity_name='Project Implementation',
                start_date='2023-01-01',
                end_date='2023-12-31',
                progress=100,
                status='completed',
                notes='Project completed successfully'
            )
            
            # Copy images
            source_folder = os.path.join(base_path, project_data['folder'], 'images')
            if os.path.exists(source_folder):
                for image_name in project_data['images']:
                    source_path = os.path.join(source_folder, image_name)
                    if os.path.exists(source_path):
                        # Copy to media folder
                        dest_path = os.path.join(project_media_path, image_name)
                        shutil.copy2(source_path, dest_path)
                        
                        # Create activity image record
                        with open(dest_path, 'rb') as f:
                            ActivityImage.objects.create(
                                activity=activity,
                                image=File(f, name=image_name),
                                caption=f'{project.name} - Project Image'
                            )
                        
                        self.stdout.write(f'  Added image: {image_name}')
                
                # Set first image as cover image
                first_image = project_data['images'][0]
                cover_path = os.path.join(project_media_path, f'cover_{first_image}')
                shutil.copy2(os.path.join(project_media_path, first_image), cover_path)
                
                with open(cover_path, 'rb') as f:
                    project.cover_image.save(f'cover_{first_image}', File(f), save=True)
            
            self.stdout.write(f'  Created project: {project.name}')
            self.stdout.write(f'  Location: {project.site_location}')
            self.stdout.write(f'  Coordinates: {project.latitude}, {project.longitude}')
            self.stdout.write(f'  Images: {len(project_data["images"])}')
            self.stdout.write('---')
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded concluded projects'))
