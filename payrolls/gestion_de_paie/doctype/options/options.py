# Copyright (c) 2025, Ir Dernis Mataebeka and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Options(Document):
    pass


@frappe.whitelist()
def get_employee_link_fields():
    link_fields = []

    # Champs standards
    standard = frappe.get_all(
        'DocField',
        filters={'parent': 'Employee', 'fieldtype': 'Link'},
        fields=['options']
    )
    link_fields.extend([df.options for df in standard if df.options])

    # Champs personnalisés
    custom = frappe.get_all(
        'Custom Field',
        filters={'dt': 'Employee', 'fieldtype': 'Link'},
        fields=['options']
    )
    link_fields.extend([cf.options for cf in custom if cf.options])

    # On retourne une liste unique
    return list(set(link_fields))
