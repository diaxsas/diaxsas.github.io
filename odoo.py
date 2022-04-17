import xmlrpc.client
import sys
if sys.version_info >= (2, 7, 9):
    import ssl
    ssl._create_default_https_context = ssl._create_unverified_context


url = "https://diax1.odoo.com"
db = "diax1"
username = "admin@diax.com.co"
password = "e09281224472462162754316177c25e58acf5913"

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
common.version()
uid = common.authenticate(db, username, password, {})


models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

employees = models.execute_kw(db, uid, password, 'hr.employee', 'search_read', [], {'fields': ['resource_id']})

equipos = models.execute_kw(db, uid, password, 'maintenance.team', 'search_read', [], {'fields': ['name']})

equipamento = models.execute_kw(db, uid, password, 'maintenance.equipment', 'search_read', [], {'fields': ['name', 'category_id']})


requests = models.execute_kw(db, uid, password, 'maintenance.request', 'search_read', [], {'fields': ['name', 'create_uid', 'employee_id', 'description', 'equipment_id', 'maintenance_team_id', 'priority', 'schedule_date', 'maintenance_type']})





id = models.execute_kw(db, uid, password, 'maintenance.request', 'create', [
    {
        'name': 'Test API',
        'description': '<p>Testing the API.</p>',
        'priority': '2',
        'schedule_date': '2022-04-15 18:00:00',
        'maintenance_type': 'corrective',
        'employee_id': 414,
        'equipment_id': 913,
        'maintenance_team_id': 3,
    }
])

print(id)
