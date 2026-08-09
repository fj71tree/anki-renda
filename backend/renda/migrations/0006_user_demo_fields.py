from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('renda', '0005_remove_user_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='demo_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_demo',
            field=models.BooleanField(default=False),
        ),
    ]
