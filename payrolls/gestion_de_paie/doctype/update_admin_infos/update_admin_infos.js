// Copyright (c) 2025, Ir Dernis Mataebeka and contributors
// For license information, please see license.txt

frappe.ui.form.on("Update Admin Infos", {
    refresh(frm) {

        },

    frm.doc.company && frm.doc.employee &&  frm.doc.element : function(frm) {
        // Effacer le tableau 'details'
        frm.clear_table('details');
        frm.refresh_field('details'); // Rafraîchir l'affichage
    
        // Récupérer les valeurs des champs 'fiscal_year' et 'employee'
        let company = frm.doc.company;
        let employee = frm.doc.employee;
        let element = frm.doc.element;
    
        // Vérifier si l'employé est défini
        if (!employee || !element || !company) {
            frappe.msgprint(__('Veuillez sélectionner un employé.'));
            return; // Arrêter l'exécution si aucun employé n'est sélectionné
        }
    
        // Appel pour récupérer les informations des employés
        frappe.call({
            method: "payrolls.gestion_de_paie.doctype.update_admin_infos.update_admin_infos.get_employee_stories",
            args: {
                company = company,
                employee = employee,
                element = element,
            },
            callback: function(response) {
                console.log('Response:', response); // Vérifiez la réponse
                const data = response.message;
        
                // Vérifier si des données ont été récupérées
                if (data && data.length > 0) {
                    // Ajouter les données d'assiduité au tableau
                    data.forEach(function(item) {
                        // Supposons que les indices suivants correspondent aux valeurs que vous souhaitez extraire
                        const matricule = item[0]; // Par exemple, le matricule pourrait être à l'index 0
                        const ratio = item[8]; // Par exemple, le ratio pourrait être à l'index 9
                        const conge = item[9]; // Par exemple, le congé pourrait être à l'index 10
                        const ticket = item[15]; // Par exemple, le ratio pourrait être à l'index 9
                        const gratification = item[14]; // Par exemple, le congé pourrait être à l'index 10
                        const bonus = item[16]; // Par exemple, le ratio pourrait être à l'index 9
                        //frappe.msgprint(__('Mise à jour réussie.', item));
                        frm.add_child('details', {
                            'employee': matricule,
                            'ratio': ratio,
                            'conge': conge,
                            'bonus': bonus,
                            'ticket': ticket,
                            'gratification': gratification
                        });
                    });
                    frm.refresh_field('details'); // Rafraîchir l'affichage après ajout des données
                } else {
                    frappe.msgprint(__('Aucune donnée trouvée pour cet employé.'));
                }
            },
            error: function(err) {
                console.error('Erreur lors de la récupération des codes:', err);
                frappe.msgprint(__('Erreur: ', [err]));
            }
        });
    }

});
