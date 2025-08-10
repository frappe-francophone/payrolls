frappe.ui.form.on('HR Settings', {
    refresh(frm) {
        toggle_fields(frm);
    },
    custom_track_employee_administrative_ranks(frm) {
        toggle_fields(frm);
    },
    custom_add_option(frm) {
        if (frm.doc.custom_options) {
            // Vérifier si la valeur existe déjà dans la table
            const exists = (frm.doc.custom_options_table || []).some(row => row.options === frm.doc.custom_options);

            if (exists) {
                frappe.msgprint(__('Cette option est déjà présente dans la table.'));
                return;
            }

            // Ajouter la nouvelle ligne
            frm.add_child('custom_options_table', {
                'options': frm.doc.custom_options,
            });

            frm.refresh_field('custom_options_table');

            // Réinitialiser le champ custom_options
            frm.set_value('custom_options', '');
        } else {
            frappe.msgprint(__('Veuillez sélectionner une option avant d\'ajouter.'));
        }
    }
});


function toggle_fields(frm) {
    const visible = frm.doc.custom_track_employee_administrative_ranks == 1;

    frm.toggle_display('custom_options', visible);
    frm.toggle_display('custom_add_option', visible);
    frm.toggle_display('custom_options_table', visible);

    if (visible) {
        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.options.options.get_employee_link_fields",
            callback: function (r) {
                if (r.message) {
                    console.log("Champs Link dans Employee :", r.message);
                    const allowed_doc_types = r.message;

                    frm.fields_dict['custom_options'].get_query = function() {
                        return {
                            filters: [
                                ['name', 'in', allowed_doc_types]
                            ]
                        };
                    };
                }
            }
        });
    }
}
