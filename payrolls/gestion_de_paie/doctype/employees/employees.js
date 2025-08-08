frappe.ui.form.on('employees', {
    // Événement déclenché après le chargement du formulaire
    refresh: function(frm) {
        // Logique à exécuter au rafraîchissement
        console.log("Le formulaire de MonDocType est rafraîchi !");
    },
    
    // Événement déclenché lorsque le champ 'department' est modifié
    department: function(frm) {
        if (frm.doc.department) {
            frappe.msgprint('Le département a été changé pour : ' + frm.doc.department);
        }
    }
});