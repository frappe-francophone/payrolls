import frappe

@frappe.whitelist()
def get_value_employment_categories(value):
    """
    Calculates the employee's average salary and finds the corresponding
    employee category based on configured salary ranges.
    """
    try:
        # Convert the received value to a number
        value = float(value)
    except (TypeError, ValueError):
        frappe.msgprint("The value sent is not a valid number.")
        return {"exists": False}

    # Retrieve settings from HR Settings
    hr_settings = frappe.get_doc("HR Settings")
    
    if not hr_settings:
        frappe.msgprint("You must configure your salary choice in HR Settings.")
        return {"exists": False}

    is_categorized = hr_settings.custom_categorize_based
    
    try:
        nombre_de_jours_paie = float(hr_settings.custom_nombre_de_jours_paie)
    except (TypeError, ValueError):
        frappe.msgprint("The number of payment days is not defined or is invalid.")
        return {"exists": False}

    if nombre_de_jours_paie <= 0:
        frappe.msgprint("The number of payment days must be greater than 0.")
        return {"exists": False}

    if is_categorized != "Categorize based on category choice":
        salaireMoyen = value / nombre_de_jours_paie

        results = frappe.db.sql(
            """
            SELECT
                code,
                basic_salary,
                description,
                accommodation,
                transportation,
                echelon,
                position_seniority,
                min,
                max
            FROM
                `tabEmployee Category Details`
            WHERE
                min <= %(find)s AND %(find)s <= max

            UNION ALL

            SELECT
                code,
                basic_salary,
                description,
                accommodation,
                transportation,
                echelon,
                position_seniority,
                min,
                max
            FROM
                `tabEmployee Category Details`
            WHERE
                NOT EXISTS (
                    SELECT 1
                    FROM `tabEmployee Category Details`
                    WHERE min <= %(find)s AND %(find)s <= max
                )
            ORDER BY
                max DESC
            LIMIT 1;
            """,
            {"find": salaireMoyen},
            as_dict=True
        )

        if results:
            data = results[0]
            # Return a dictionary with the data
            return {
                "exists": True,
                **data,  # Unpack all key-value pairs from the dictionary
                "salaireMoyen": salaireMoyen
            }
        else:
            return {"exists": False, "salaireMoyen": salaireMoyen}

    else:
        # This case is handled in the JS code by not making the call,
        # but it's good to have it here for robustness.
        return {
            "exists": False,
            "error": "Categorization is based on choice, not on salary."
        }

@frappe.whitelist()
def get_value_employment_amount(value):
    """
    Calculates the employee's average salary and finds the corresponding
    employee category based on configured salary ranges.
    """
    # Retrieve settings from HR Settings
    hr_settings = frappe.get_doc("HR Settings")
    
    if not hr_settings:
        #frappe.msgprint("You must configure your salary choice in HR Settings.")
        return {"exists": False}

    is_categorized = hr_settings.custom_categorize_based

    if is_categorized == "Categorize based on category choice":

        results = frappe.db.sql(
            """
            SELECT
                code,
                basic_salary,
                description,
                accommodation,
                transportation,
                echelon,
                position_seniority,
                min,
                max
            FROM
                `tabEmployee Category Details`
            WHERE
                code = %(find)s
            """,
            {"find": value},
            as_dict=True
        )

        if results:
            data = results[0]
            # Return a dictionary with the data
            return {
                "exists": True,
                **data,  # Unpack all key-value pairs from the dictionary
            }
        else:
            return {"exists": False}

    else:
        # This case is handled in the JS code by not making the call,
        # but it's good to have it here for robustness.
        return {
            "exists": False,
            "error": "Categorization is based on choice, not on salary."
        }


@frappe.whitelist()
def get_categorization_setting():
    """Checks the value of the 'custom_categorize_based' setting."""
    try:
        categorize_based_value = frappe.get_single_value("HR Settings", "custom_categorize_based")
        
        # Return True if the value is different from "Categorize based on category choice"
        # Otherwise, return False
        is_categorized = categorize_based_value != "Categorize based on category choice"
        
        return {"exists": is_categorized}
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error in get_categorization_setting")
        frappe.throw(f"Configuration error: {e}")
        return {"exists": False}