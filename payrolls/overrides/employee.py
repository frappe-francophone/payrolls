from erpnext.setup.doctype.employee.employee import Employee
import frappe
from frappe.utils import nowdate

class CustomEmployee(Employee):
    def validate(self):
        self.check_and_add_admin_info()
    
    def check_and_add_admin_info(self):
        hr_settings = frappe.get_single("HR Settings")

        if not hr_settings.custom_track_employee_administrative_ranks:
            return

        options_rows = hr_settings.custom_options_table or []
        if not options_rows:
            return

        # Récupérer d'un coup les éléments déjà présents pour cet employé / société
        existing_elements = {
            r.get("elements")
            for r in frappe.get_all(
                "Administratives infos",
                filters={"employee": self.name, "company": self.company},
                fields=["elements"]
            )
        }

        new_entries = []
        for row in options_rows:
            # Récupérer le fieldname du champ Link correspondant à row.options
            element_option = self.get_employee_link_fieldname(row.options)

            if not element_option:
                continue  # Si on ne trouve pas le champ correspondant, on passe

            if element_option in existing_elements:
                continue
            
            exists = frappe.db.exists(
                    "Administratives infos",
                    {
                        "employee": self.name,
                        "company": self.company,
                        "elements": row.options
                    }
                )

            if not exists:
                # === Récupération sûre de la valeur ===
                element_value = self.get(element_option)
                if element_value is None and self.name:
                    element_value = frappe.db.get_value("Employee", self.name, element_option)

                new_entries.append({
                    "doctype": "Administratives infos",
                    "employee": self.name,
                    "company": self.company,
                    "elements": row.options,
                    "value": element_value,
                    "start_date": nowdate()
                })

        # Insérer les nouvelles lignes
        created = 0
        for entry in new_entries:
            try:
                frappe.get_doc(entry).insert(ignore_permissions=True)
                created += 1
            except Exception:
                frappe.log_error(frappe.get_traceback(), f"Erreur création Administratives infos pour {entry['elements']}")

        #if created:
            #frappe.msgprint(f"{created} nouvelle(s) ligne(s) ajoutée(s) dans 'Administratives infos'.")

    def get_employee_link_fieldname(self, target_doctype):
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
