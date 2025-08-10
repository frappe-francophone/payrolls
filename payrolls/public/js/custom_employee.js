frappe.ui.keys.add_shortcut({
    description:"Show Error Logs",
    shortcut: "shift+ctrl+d",
    action:() => {
        frappe.set_route("List","Employee")
    }

})