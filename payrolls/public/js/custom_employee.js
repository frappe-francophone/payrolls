frappe.ui.form.on('Employee', {
    onload(frm) {
     
        frm.toggle_display('final_confirmation_date', false);
        frm.toggle_display('contract_end_date', false);
        frm.trigger('toggle_fields');
    },

    // Quand le champ 'custom_parcours_employee' change
    custom_parcours_employee(frm) {
        frm.trigger('toggle_fields');
    },
    // Fonction pour gérer l'affichage/masquage
    toggle_fields(frm) {
        const parcours = frm.doc.custom_parcours_employee;

        // Étape 1 : Réinitialiser tous les champs à l'état caché et non obligatoire par défaut
        frm.set_df_property('final_confirmation_date', 'hidden', 1);
        frm.set_df_property('final_confirmation_date', 'reqd', 0);
        frm.set_df_property('contract_end_date', 'hidden', 1);
        frm.set_df_property('contract_end_date', 'reqd', 0);
        frm.set_df_property('notice_number_of_days', 'reqd', 0);

        // Étape 2 : Appliquer les règles en fonction de la valeur de 'parcours'
        if (parcours === 'Trial period') {
            frm.set_df_property('final_confirmation_date', 'hidden', 0);
            frm.set_df_property('final_confirmation_date', 'reqd', 1);
            frm.set_df_property('notice_number_of_days', 'reqd', 1);
        } else if (parcours === 'Continuing contract') {
            frm.set_df_property('contract_end_date', 'hidden', 0);
            frm.set_df_property('contract_end_date', 'reqd', 1);
            frm.set_df_property('notice_number_of_days', 'reqd', 1);
        }
    }
});