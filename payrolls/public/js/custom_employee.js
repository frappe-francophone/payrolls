frappe.ui.form.on('Employee', {
    onload(frm) {
        // Masquer initialement
        frm.toggle_display('final_confirmation_date', false);
        frm.toggle_display('contract_end_date', false);
        
        frm.trigger('toggle_parcours_fields');
        frm.trigger('toggle_category_fields');
    },

    custom_parcours_employee(frm) {
        frm.trigger('toggle_parcours_fields');
    },
    
    ctc(frm) {
        frm.trigger('get_employee_category');
    },

    custom_employee_category_details(frm) {
        frm.trigger('get_employee_category_amount');
    },

    toggle_parcours_fields(frm) {
        const parcours = frm.doc.custom_parcours_employee;

        // Réinitialiser
        frm.set_df_property('final_confirmation_date', 'hidden', 1);
        frm.set_df_property('final_confirmation_date', 'reqd', 0);
        frm.set_df_property('contract_end_date', 'hidden', 1);
        frm.set_df_property('contract_end_date', 'reqd', 0);
        frm.set_df_property('notice_number_of_days', 'reqd', 0);

        // Appliquer les règles
        if (parcours === 'Trial period') {
            frm.set_df_property('final_confirmation_date', 'hidden', 0);
            frm.set_df_property('final_confirmation_date', 'reqd', 1);
            frm.set_df_property('notice_number_of_days', 'reqd', 1);
        } 
        else if (parcours === 'Continuing contract') {
            frm.set_df_property('contract_end_date', 'hidden', 0);
            frm.set_df_property('contract_end_date', 'reqd', 1);
            frm.set_df_property('notice_number_of_days', 'reqd', 1);
        }
    },

    get_employee_category(frm) {
        if (frm.get_field('ctc').df.reqd) {
            frappe.call({
                method: "payrolls.gestion_de_paie.doctype.employees.whitelist_employee.get_value_employment_categories",
                args: { value: frm.doc.ctc },
                callback(r) {
                    if (r.message) {
                        let data = r.message;
                        if (data.exists) {
                            frm.set_df_property('custom_nombre_de_jours_paie', 'reqd', 1);
                            frm.set_value('custom_employee_category_details', data.code);
                        } else {
                            frm.set_value('custom_employee_category_details', '');
                        }
                    } else {
                        frappe.msgprint("Erreur : La fonction Python n'a pas renvoyé de données.");
                    }
                }
            });
        }
    },

    get_employee_category_amount(frm) {
        if (frm.get_field('custom_employee_category_details').df.reqd) {
            frappe.call({
                method: "payrolls.gestion_de_paie.doctype.employees.whitelist_employee.get_value_employment_amount",
                args: { value: frm.doc.custom_employee_category_details },
                callback(r) {
                    if (r.message) {
                        let data = r.message;
                        frm.set_value('ctc', data.exists ? data.basic_salary : '');
                    } else {
                        frappe.msgprint("Erreur : La fonction Python n'a pas renvoyé de données.");
                    }
                }
            });
        }
    },

    toggle_category_fields(frm) {
        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.employees.whitelist_employee.get_categorization_setting",
            callback(r) {
                if (r.message && r.message.exists) {
                    frm.set_df_property('custom_employee_category_details', 'reqd', 0);
                    frm.set_df_property('ctc', 'reqd', 1);
                    frm.set_df_property('custom_nombre_de_jours_paie', 'reqd', 1);
                } else {
                    frm.set_df_property('custom_employee_category_details', 'reqd', 1);
                    frm.set_df_property('ctc', 'reqd', 0);
                    frm.set_df_property('custom_nombre_de_jours_paie', 'reqd', 0);
                }
            }
        });
    },

    validate(frm) {
        frappe.msgprint("🚀 Début de la validation du salaire");

        // Récupération des valeurs
        let categorie = frm.doc.custom_employee_category_details;
        let salaire = frm.doc.ctc;
        let date_ajuste = format_date_mysql(frm.doc.date_of_joining);
        let date_pay = toggle_send_date(date_ajuste, 1);

        frappe.msgprint(`📌 Catégorie: ${categorie} | Salaire: ${salaire} | Date ajustée: ${date_ajuste} | Date pay: ${date_pay}`);
        console.log("Données récupérées:", { categorie, salaire, date_ajuste, date_pay });

        // Si ctc et salaire_old sont identiques → rien à faire
        if (frm.doc.ctc == frm.doc.salaire_old) {
            frappe.msgprint("ℹ️ Salaire inchangé → aucune action.");
            return;
        }

        frappe.msgprint("💡 Salaire modifié → traitement...");

        // Cherche la dernière ligne de la child table
        let last_row = null;
        if (frm.doc.custom_salaire_employee && frm.doc.custom_salaire_employee.length > 0) {
            last_row = frm.doc.custom_salaire_employee[frm.doc.custom_salaire_employee.length - 1];
            frappe.msgprint(`📄 Dernière ligne trouvée: Salaire=${last_row.salaire} | Date début=${last_row.date_debut}`);
        } else {
            frappe.msgprint("📄 Aucune ligne existante → première entrée.");
        }

        // Met à jour la date de fin si ligne existante
        if (last_row) {
            date_ajuste = format_date_mysql(frappe.datetime.get_today());
            date_pay = toggle_send_date(date_ajuste, 2);

            last_row.date_fin = frappe.datetime.add_days(date_pay, -1);
            frappe.msgprint(`✏️ Date fin mise à jour: ${last_row.date_fin}`);
        }

        // Ajoute la nouvelle ligne
        frm.add_child('custom_salaire_employee', {
            'date_ajuste': date_ajuste, 
            'categorie': categorie, 
            'salaire': salaire,
            'date_debut': date_pay
        }); 
        frm.refresh_field('custom_salaire_employee'); 
        frm.refresh();
        frm.doc.salaire_old = frm.doc.ctc;
        frappe.msgprint("✅ Nouvelle ligne ajoutée dans salaire_employee");
    }
});

// Fonction pour calculer le 1er jour du mois ou retourner la date formatée
function toggle_send_date(value_date, val) {
    let d = new Date(value_date);
    if (val == 2) {
        return format_date_mysql(d);
    } else {
        let year = d.getFullYear();
        let month = ('0' + (d.getMonth() + 1)).slice(-2);
        return `${year}-${month}-01`;
    }
}

// Formatage date MySQL
function format_date_mysql(value_date) {
    if (!value_date) return null;
    let d = new Date(value_date);
    let year = d.getFullYear();
    let month = ('0' + (d.getMonth() + 1)).slice(-2);
    let day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}
