# Generated by Django 4.1 on 2022-08-29 19:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('familybudget', '0005_scheduletype_type_alter_scheduletype_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='schedule',
            name='date',
            field=models.DateField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='dayofmonth',
            field=models.IntegerField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='dayofyear',
            field=models.IntegerField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='daysweek',
            field=models.ManyToManyField(default=None, null=True, related_name='schedules', to='familybudget.dayweek'),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='end',
            field=models.DateField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='rangef',
            field=models.DateField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='ranget',
            field=models.DateField(default=None, null=True),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='start',
            field=models.DateField(default=None, null=True),
        ),
    ]
