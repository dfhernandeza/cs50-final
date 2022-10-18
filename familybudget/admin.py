from django.contrib import admin
from .models import Transaction, TransactionCategory, TransactionType
# Register your models here.

class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "description", "amount", "category", "user")



admin.site.register(Transaction, TransactionAdmin)
admin.site.register(TransactionCategory)
admin.site.register(TransactionType)