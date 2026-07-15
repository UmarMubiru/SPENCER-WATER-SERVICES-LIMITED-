from django.db import models
import uuid


class StockMovement(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	reference = models.CharField(max_length=100, unique=True)
	note = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.reference
