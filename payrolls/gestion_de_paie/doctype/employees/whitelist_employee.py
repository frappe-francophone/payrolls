import frappe

@frappe.whitelist()
def get_value_employment_categories(value):
    # La méthode get_single_value renvoie directement la valeur du champ,
    # donc pas besoin d'utiliser `as_dict = True`.
    verifie_choix = frappe.db.get_single_value("HR Settings", "custom_categorize_based")
    value = 130.0
    if verifie_choix:
        # La condition doit être "is not" pour vérifier l'inégalité
        if verifie_choix != "Categorize based on category choice":
            # get_value retourne un tuple si vous passez une liste de champs.
            # Il est plus simple d'utiliser get_all pour obtenir un dictionnaire.
            verifie_employment_categories = frappe.db.get_all(
                "Employee Category Details",
                filters={"basic_salary": value},
                fields=["code", "description", "accommodation", "transportation", "echelon", "position_seniority"],
                limit=1,
                as_dict=True
            )

            if verifie_employment_categories:
                # get_all retourne une liste de dictionnaires, on prend le premier élément
                data = verifie_employment_categories[0]
                return {
                    "exists": True,
                    "code": data.get("code", ""),
                    "description": data.get("description", ""),
                    "accommodation": data.get("accommodation", ""),
                    "transportation": data.get("transportation", ""),
                    "echelon": data.get("echelon", ""),
                    "position_seniority": data.get("position_seniority", "")
                }
            else:
                return {
                    "exists": False,
                    # Retourne des valeurs vides pour que le code JavaScript puisse réinitialiser les champs
                    "code": "",
                    "description": "",
                    "accommodation": "",
                    "transportation": "",
                    "echelon": "",
                    "position_seniority": ""
                }
        else:
            # Gérer le cas où le paramètre est "Categorize based on category choice"
            return {
                "exists": False,
                "error": "La catégorisation est basée sur le choix, pas sur le salaire de base."
            }
    else:
        # Envoyer un message d'erreur clair si le paramètre n'est pas défini
        frappe.msgprint("Vous devez paramétrer votre choix de salaire dans HR Settings.")
        return {"exists": False}