import frappe
from frappe.model.document import Document

class ChangeAdministrativesinfos(Document):
    pass

@frappe.whitelist()
def check_and_add_admin_info():
    """Retourne la liste des doctypes autorisés dans HR Settings."""
    hr_settings = frappe.get_single("HR Settings")

    if not hr_settings.custom_track_employee_administrative_ranks:
        return []

    options_rows = hr_settings.custom_options_table or []
    return [row.options for row in options_rows if row.options]

@frappe.whitelist()
def select_all_employees_administratives_infos(employee, company, elements):
    """Récupère toutes les infos administratives pour un employé donné."""
    return frappe.get_all(
        'Administratives infos',
        filters={
            'company': company,
            'employee': employee,
            'elements': elements
        },
        fields=[
            'employee', 'company', 'elements', 'value',
            'start_date', 'end_date', 'name'
        ],
        order_by="creation asc"
    )


@frappe.whitelist()
def save_admin_info_and_update_employee(values, employee, company):
    """Enregistre toutes les infos administratives et met à jour Employee en une seule transaction."""
    import json
    values = json.loads(values)

    for row in values:
        # Mise à jour end_date si existante
        if row.get("id_admin_infos"):
            frappe.db.set_value(
                "Administratives infos",
                row["id_admin_infos"],
                "end_date",
                row.get("end_date")
            )
        else:
            # Insertion nouvelle ligne
            doc = frappe.get_doc({
                "doctype": "Administratives infos",
                "employee": employee,
                "company": company,
                "elements": row["elements"],
                "value": row["value"],
                "start_date": row.get("start_date"),
                "end_date": row.get("end_date")
            })
            doc.insert()

        # Mise à jour dans Employee
        element_option = get_employee_link_fieldname(row["elements"])
        if element_option:
            frappe.db.set_value("Employee", employee, element_option, row["value"])

    frappe.db.commit()
    return "Mise à jour effectuée avec succès"

def get_employee_link_fieldname(target_doctype):
    """
    Récupère le fieldname du champ Link dans Employee
    dont le 'options' correspond au target_doctype.
    """
    # Champs standards
    standard_field = frappe.get_all(
        'DocField',
        filters={'parent': 'Employee', 'fieldtype': 'Link', 'options': target_doctype},
        fields=['fieldname']
    )
    if standard_field:
        return standard_field[0].fieldname

    # Champs personnalisés
    custom_field = frappe.get_all(
        'Custom Field',
        filters={'dt': 'Employee', 'fieldtype': 'Link', 'options': target_doctype},
        fields=['fieldname']
    )
    if custom_field:
        return custom_field[0].fieldname

    return None
