frappe.ui.form.on("Employee Category Details", {
    // Cet événement se déclenche lors du chargement du formulaire
    onload(frm) {
        // Déclenche les fonctions pour gérer la visibilité des champs
        frm.trigger('toggle_fields');
        frm.trigger('toggle_initial_field');
    },

    // Cette fonction gère la visibilité des champs 'min' et 'max'
    toggle_fields(frm) {
        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.employee_category_details.employee_category_details.get_categorization_setting",
            callback: function(r) {
                if (r.message && r.message.exists) {
                    // Si le paramètre "custom_categorize_based" est différent de "Categorize based on category choice",
                    // les champs 'min' et 'max' sont requis.
                    frm.set_value('min', "");
                    frm.set_value('max', "");
                    frm.set_df_property('min', 'reqd', 1);
                    frm.set_df_property('max', 'reqd', 1);
                } else {
                    // Sinon, ils ne sont pas requis.
                    frm.set_df_property('min', 'reqd', 0);
                    frm.set_df_property('max', 'reqd', 0);
                }
            }
        });
    },

   
    toggle_initial_field(frm) {
   
        frm.set_df_property('initial', 'hidden', 1);

        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.employee_category_details.employee_category_details.record_exists",
            callback: function(r) {
                if (r.message) {
                    const { initial_record_code,exists,find } = r.message;
                    
                    if (exists) {
                        frm.set_df_property('initial', 'hidden', 0);
                        if (initial_record_code) {
                            frm.set_df_property('initial', 'hidden', 1);
                            if (frm.doc.code === initial_record_code) {
                                frm.set_df_property('initial', 'hidden', 0);
                            }
                        } else {
                            frm.set_df_property('initial', 'hidden', 0);
                        }
                    } else {
                        frm.set_df_property('initial', 'hidden', 1);
                    }
                    
                    if (find) {
                        frm.set_df_property('echelon', 'hidden', 0);
                        frm.set_df_property('position_seniority', 'hidden', 0);
                        frm.set_df_property('echelon', 'reqd', 0);
                        frm.set_df_property('position_seniority', 'reqd', 0);
                    } else {
                        frm.set_df_property('echelon', 'hidden', 1);
                        frm.set_df_property('position_seniority', 'hidden', 1);
                        frm.set_df_property('echelon', 'reqd', 1);
                        frm.set_df_property('position_seniority', 'reqd', 1);
                    }
                }
            }
        });
    }
});