from erpnext.setup.doctype.employee.employee import Employee
import frappe

class CustomEmployee(Employee):
    def before_save(self):
        frappe.msgprint("CustomEmployee override - before_save is working!")
