import frappe
from frappe.model.document import Document

class EmployeeCategoryDetails(Document):
    pass

@frappe.whitelist()
def get_categorization_setting():
    """Vérifie la valeur du paramètre 'custom_categorize_based'."""
    try:
        categorize_based_value = frappe.db.get_single_value("HR Settings", "custom_categorize_based")
        
        # Renvoie True si la valeur est différente de "Categorize based on category choice"
        # Sinon, renvoie False
        is_categorized = categorize_based_value != "Categorize based on category choice"
        
        return {"exists": is_categorized}
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Erreur dans get_categorization_setting")
        frappe.throw(f"Erreur de configuration : {e}")
        return {"exists": False}

def check_initial():
    try:
        # Vérifie d'abord le paramètre principal
        calculate_amount_is_one = frappe.db.get_single_value("HR Settings", "custom_calculate_amount")
        is_categorized = calculate_amount_is_one != 0
        # Si le paramètre n'est pas activé, pas besoin de faire de requête
        return {"exists": is_categorized}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Erreur dans check_initial_record_exists")
        frappe.throw(f"Erreur de configuration : {e}")
        return {"exists": False}


def check_EchelonSeniority():
    try:
        # Vérifie d'abord le paramètre principal
        calculate_amount_is_one = frappe.db.get_single_value("HR Settings", "custom_active_echelon_an_position_seniority")
        is_categorized = calculate_amount_is_one != 0
        # Si le paramètre n'est pas activé, pas besoin de faire de requête
        return {"find": is_categorized}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Erreur dans check_initial_record_exists")
        frappe.throw(f"Erreur de configuration : {e}")
        return {"find": False}

@frappe.whitelist()
def record_exists():

    try:

        table = check_EchelonSeniority()
        find = False
        if table.get("find"):
            find = True
        else :
            find = False
        
        
        data = check_initial()

        if data.get("exists"):

            results = frappe.db.sql(
                """
                SELECT name,initial
                FROM `tabEmployee Category Details`
                WHERE initial = 1
                LIMIT 1
                """,
                as_dict=True
            )

            if results and results[0].get("initial") == 1 :

                initial_record_code = results[0].get("name")

                return {
                    "initial_record_code": initial_record_code,
                    "exists": True,
                    "find": find
                }
            
            else :

                return {
                    "initial_record_code": None,
                    "exists": True,
                    "find": find
                }
        else :

            return {
                "initial_record_code": None,
                "exists": False,
                "find": find
            }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Erreur dans check_initial_record_exists")
        frappe.throw(f"Erreur de configuration : {e}")
        return {
            "initial_record_code": None,
            "exists": False,
            "find": find
        }