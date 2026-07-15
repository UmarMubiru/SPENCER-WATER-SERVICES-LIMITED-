import importlib

u = importlib.import_module('core.urls')
patterns = []
for p in u.urlpatterns:
    try:
        patterns.append(str(p.pattern))
    except Exception:
        patterns.append(repr(p))

print('\n'.join(patterns))
