from django.db import migrations, models
import catalog.models


def preserve_inventory_and_create_codes(apps, schema_editor):
    Order = apps.get_model('catalog', 'Order')
    database = schema_editor.connection.alias
    # Los pedidos anteriores ya descontaron stock al crearse. No descontarlo otra vez.
    Order.objects.using(database).exclude(status='cancelled').update(inventory_committed=True)
    for order in Order.objects.using(database).all().iterator():
        order.tracking_token = catalog.models.new_tracking_token()
        order.save(using=database, update_fields=['tracking_token'])


class Migration(migrations.Migration):
    dependencies = [('catalog', '0006_catalog_details_store_settings')]
    operations = [
        migrations.AddField(model_name='order', name='inventory_committed', field=models.BooleanField(default=False, editable=False)),
        migrations.AddField(model_name='order', name='tracking_token', field=models.CharField(max_length=64, null=True, editable=False)),
        migrations.AddField(model_name='testimonial', name='approved', field=models.BooleanField(default=False, verbose_name='Aprobada para publicación')),
        migrations.RunPython(preserve_inventory_and_create_codes, migrations.RunPython.noop),
        migrations.AlterField(model_name='order', name='tracking_token', field=models.CharField(default=catalog.models.new_tracking_token, editable=False, max_length=64, unique=True)),
    ]
