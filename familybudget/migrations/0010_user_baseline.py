# Generated by Django 4.1 on 2022-09-13 18:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('familybudget', '0009_remove_transaction_schedule_schedule_transaction'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='baseline',
            field=models.FloatField(default=0),
        ),
    ]
