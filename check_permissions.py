from django.contrib.auth.models import User
from roles.models import Permission

user = User.objects.get(username='mubiru.umar')
profile = user.profile

print('User:', user.username)
print('Role:', profile.role.name if profile.role else 'No role')
print('Permissions from role:')
if profile.role:
    for perm in profile.role.permissions.all():
        print('  -', perm.code)
else:
    print('  No role assigned')

print('\nAll available permissions:')
for perm in Permission.objects.all():
    print('  -', perm.code)
