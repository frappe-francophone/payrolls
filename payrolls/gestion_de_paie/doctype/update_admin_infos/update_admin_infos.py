# Copyright (c) 2025, Ir Dernis Mataebeka and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe

# from erpnext.setup.doctype.employee.employee import d


class UpdateAdminInfos(Document):
	pass

@frappe.whitelist()
def get_employee_stories(employee, element) :
	
	return frappe.db.sql(
		"""
		SELECT * 
		FROM `tabStories Employee Admin`
		WHERE employee = %s AND element = %s
		""", (employee, element), as_dict=1
	)
