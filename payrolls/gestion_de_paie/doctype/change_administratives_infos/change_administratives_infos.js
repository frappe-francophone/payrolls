frappe.ui.form.on('Change Administratives infos', {
    refresh(frm) {
        // Charger les champs Link autorisés
        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.change_administratives_infos.change_administratives_infos.check_and_add_admin_info",
            callback: function (r) {
                if (r.message) {
                    const allowed_doc_types = r.message;
                    frm.fields_dict['infos'].get_query = () => ({
                        filters: [['name', 'in', allowed_doc_types]]
                    });
                }
            }
        });

        // Mettre la date du jour
        frm.set_value('current_date', frappe.datetime.get_today());
    },

    infos(frm) {
        frm.clear_table('values');
        frm.refresh_field('values');

        if (frm.doc.employee && frm.doc.company && frm.doc.infos) {
            frappe.call({
                method: "payrolls.gestion_de_paie.doctype.change_administratives_infos.change_administratives_infos.select_all_employees_administratives_infos",
                args: {
                    company: frm.doc.company,
                    employee: frm.doc.employee,
                    elements: frm.doc.infos
                },
                callback: function (r) {
                    if (Array.isArray(r.message)) {
                        r.message.forEach(row => {
                            frm.add_child('values', {
                                employee: row.employee,
                                company: row.company,
                                elements: row.elements,
                                value: row.value,
                                start_date: row.start_date,
                                end_date: row.end_date || null,
                                id_admin_infos: row.name
                            });
                        });
                        frm.refresh_field('values');
                    }
                }
            });
        }
    },

    add_new_value(frm) {
        if (!frm.doc.employee) return frappe.msgprint(__('Veuillez saisir un employé'));
        if (!frm.doc.infos) return frappe.msgprint(__('Veuillez saisir un élément dans Infos'));
        if (!frm.doc.new_value) return frappe.msgprint(__('Veuillez saisir une valeur'));

        let last_row = frm.doc.values.slice(-1)[0];
        if (last_row && last_row.elements === frm.doc.infos && !last_row.end_date) {
            last_row.end_date = frappe.datetime.get_today();
        }

        frm.add_child('values', {
            employee: frm.doc.employee,
            company: frm.doc.company,
            elements: frm.doc.infos,
            value: frm.doc.new_value,
            start_date: frappe.datetime.get_today()
        });
        frm.refresh_field('values');
        frm.set_value('new_value', '');
    },


    before_save(frm) {
        if (!frm.doc.values || frm.doc.values.length === 0) return;
    
        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.change_administratives_infos.change_administratives_infos.save_admin_info_and_update_employee",
            args: {
                values: JSON.stringify(frm.doc.values),
                employee: frm.doc.employee,
                company: frm.doc.company
            },
            callback: function(r) {
                frappe.msgprint(r.message);
                frm.clear_table('values');
                frm.refresh_field('values');
                frm.set_value('infos', '');
            }
        });
    }

});
