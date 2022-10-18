from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.


class User(AbstractUser):
    """Model to store user data"""
    pass
    baseline = models.FloatField(default=0)

class TransactionType(models.Model):
    """Model to store transaction type data (allows to differentiate between income and expense)"""
    description = models.CharField(max_length=100)

    def __str__(self) :
        return f"{self.description}"

class TransactionCategory(models.Model):
    """Model to store categories of transactions (food, transportation, etc.)"""
    description = models.CharField(max_length=100)
    type = models.ForeignKey(TransactionType, on_delete=models.CASCADE, related_name="categories", default=None)
    def __str__(self) :
        return f"{self.description}"

class DayWeek(models.Model):
    """Model to store days of the week (monday, tuesday, etc.)"""
    day = models.CharField(max_length=20)
    def __str__(self) :
        return f"{self.day}"

class DayYear(models.Model):
    """Model to store day of year schedule data"""
    day = models.IntegerField(default=None)
    month = models.IntegerField(default=None)


class ScheduleType(models.Model):
    """Model to store schedule types (weekly, monthly, etc)"""
    type = models.CharField(max_length=10, default=None)
    description = models.CharField(max_length=100, default=None)
    def __str__(self) :
        return f"{self.description}"

class Transaction(models.Model):
    """Model to store transactions data"""
    description = models.CharField(max_length=100)
    amount = models.FloatField()
    category = models.ForeignKey(TransactionCategory, on_delete=models.CASCADE, related_name="transactions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    active = models.BooleanField(default=True)

    def __str__(self) :
        return f"{self.description}"

class Schedule(models.Model):
    """Model to store schedule data (date or dates when transactions would or will occur)"""
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="schedule", default=None)
    type = models.ForeignKey(ScheduleType, on_delete=models.CASCADE, related_name="schedules")
    date = models.DateField(default=None, null=True)
    dayofmonth = models.IntegerField(default=None, null=True)
    daysweek = models.ManyToManyField(DayWeek, default=None, related_name="schedules", null=True)
    dayofyear = models.ForeignKey(DayYear, on_delete=models.CASCADE, related_name="schedule", default=None, null=True)
    rangef = models.DateField(default=None, null=True)
    ranget = models.DateField(default=None, null=True)
    start = models.DateField(default=None, null=True)
    end = models.DateField(default=None, null=True)

    def __str__(self) :
        return f"{self.type.description}"





