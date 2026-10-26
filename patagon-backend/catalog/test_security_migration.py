from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class SecurityMigrationTests(TransactionTestCase):
    def test_existing_inventory_is_preserved_and_tracking_codes_are_unique(self):
        executor = MigrationExecutor(connection)
        previous = [('catalog', '0006_catalog_details_store_settings')]
        current = [('catalog', '0007_security_controls')]
        executor.migrate(previous)
        old_apps = executor.loader.project_state(previous).apps
        Product = old_apps.get_model('catalog', 'Product')
        Order = old_apps.get_model('catalog', 'Order')
        product = Product.objects.create(title='Anterior', price=1000, stock=7)
        values = dict(customer_name='Fixture', customer_email='fixture@example.com', customer_phone='1',
                      address='Fixture', city='Fixture', postal_code='1', total=3000,
                      items_data=[{'id': product.pk, 'quantity': 3}])
        active = Order.objects.create(**values)
        cancelled = Order.objects.create(**values, status='cancelled')
        try:
            executor = MigrationExecutor(connection)
            executor.migrate(current)
            apps = executor.loader.project_state(current).apps
            UpdatedOrder = apps.get_model('catalog', 'Order')
            updated = UpdatedOrder.objects.get(pk=active.pk)
            self.assertTrue(updated.inventory_committed)
            self.assertFalse(UpdatedOrder.objects.get(pk=cancelled.pk).inventory_committed)
            codes = list(UpdatedOrder.objects.values_list('tracking_token', flat=True))
            self.assertEqual(len(set(codes)), 2)
            self.assertTrue(all(len(code) >= 40 for code in codes))
            self.assertEqual(apps.get_model('catalog', 'Product').objects.get(pk=product.pk).stock, 7)
        finally:
            MigrationExecutor(connection).migrate(current)
