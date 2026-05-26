import customtkinter as ctk
from tkinter import filedialog, messagebox, ttk
from etl_engine import ETLEngine
import template_manager
import json

# Configuration CustomTkinter
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class ETLApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Mini-ETL SIRH - Premium Edition")
        self.geometry("1200x750")
        
        self.engine = ETLEngine()
        
        # Grid config: Left(1 weight) / Right(2 weight)
        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=2)
        self.grid_rowconfigure(0, weight=1)

        self.setup_left_panel()
        self.setup_right_panel()

    def setup_left_panel(self):
        # Cadre global gauche
        self.left_frame = ctk.CTkFrame(self, corner_radius=15, fg_color=("gray85", "gray17"))
        self.left_frame.grid(row=0, column=0, padx=15, pady=15, sticky="nsew")
        self.left_frame.grid_rowconfigure(4, weight=1)

        # Titre
        lbl_title = ctk.CTkLabel(self.left_frame, text="1. Fichier Source", font=ctk.CTkFont(size=22, weight="bold"))
        lbl_title.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")

        # Import settings (CSV)
        import_settings = ctk.CTkFrame(self.left_frame, fg_color="transparent")
        import_settings.grid(row=1, column=0, padx=20, pady=(0, 10), sticky="ew")
        
        ctk.CTkLabel(import_settings, text="Sép. CSV:").pack(side="left", padx=5)
        self.cb_in_sep = ctk.CTkOptionMenu(import_settings, values=["Auto", ";", ",", "\\t"], width=70)
        self.cb_in_sep.pack(side="left", padx=5)

        ctk.CTkLabel(import_settings, text="Enc:").pack(side="left", padx=5)
        self.cb_in_enc = ctk.CTkOptionMenu(import_settings, values=["utf-8", "latin1", "cp1252"], width=90)
        self.cb_in_enc.pack(side="left", padx=5)

        # Bouton Parcourir
        self.btn_load = ctk.CTkButton(self.left_frame, text="Choisir un fichier...", command=self.load_file, 
                                      font=ctk.CTkFont(size=14), height=40)
        self.btn_load.grid(row=2, column=0, padx=20, pady=10, sticky="ew")

        # Label fichier
        self.lbl_file = ctk.CTkLabel(self.left_frame, text="Aucun fichier sélectionné", text_color="gray")
        self.lbl_file.grid(row=3, column=0, padx=20, pady=5, sticky="ew")

        # Liste des colonnes
        lbl_cols = ctk.CTkLabel(self.left_frame, text="Structure détectée (Colonnes):", font=ctk.CTkFont(size=14, weight="bold"))
        lbl_cols.grid(row=4, column=0, padx=20, pady=(20, 5), sticky="nw")

        self.txt_cols = ctk.CTkTextbox(self.left_frame, state="disabled", font=ctk.CTkFont(size=13))
        self.txt_cols.grid(row=5, column=0, padx=20, pady=(0, 20), sticky="nsew")

    def setup_right_panel(self):
        # Cadre global droit
        self.right_frame = ctk.CTkFrame(self, corner_radius=15, fg_color=("gray85", "gray17"))
        self.right_frame.grid(row=0, column=1, padx=(0, 15), pady=15, sticky="nsew")
        self.right_frame.grid_rowconfigure(2, weight=1)

        # Titre
        lbl_title = ctk.CTkLabel(self.right_frame, text="2. Cible & Transformations", font=ctk.CTkFont(size=22, weight="bold"))
        lbl_title.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="w")

        # Section Gabarits
        g_frame = ctk.CTkFrame(self.right_frame, fg_color="transparent")
        g_frame.grid(row=1, column=0, padx=20, pady=5, sticky="ew")
        
        ctk.CTkLabel(g_frame, text="Gabarits :").pack(side="left", padx=(0, 10))
        btn_load_tpl = ctk.CTkButton(g_frame, text="Charger", command=self.load_template, width=100)
        btn_load_tpl.pack(side="left", padx=5)
        btn_save_tpl = ctk.CTkButton(g_frame, text="Sauvegarder", command=self.save_template, width=100)
        btn_save_tpl.pack(side="left", padx=5)

        # Cadre Mapping & Edition
        mapping_frame = ctk.CTkFrame(self.right_frame, fg_color=("gray90", "gray20"))
        mapping_frame.grid(row=2, column=0, padx=20, pady=10, sticky="nsew")
        mapping_frame.grid_rowconfigure(1, weight=1)
        mapping_frame.grid_columnconfigure(0, weight=1)

        # Formulaire
        form_frame = ctk.CTkFrame(mapping_frame, fg_color="transparent")
        form_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        ctk.CTkLabel(form_frame, text="Cible :").grid(row=0, column=0, padx=5, pady=5, sticky="e")
        self.ent_target = ctk.CTkEntry(form_frame, width=130, placeholder_text="Nouvelle colonne")
        self.ent_target.grid(row=0, column=1, padx=5, pady=5, sticky="w")

        ctk.CTkLabel(form_frame, text="Source :").grid(row=0, column=2, padx=5, pady=5, sticky="e")
        self.cb_source = ctk.CTkOptionMenu(form_frame, values=[""], width=130)
        self.cb_source.grid(row=0, column=3, padx=5, pady=5, sticky="w")

        ctk.CTkLabel(form_frame, text="Transfo. :").grid(row=0, column=4, padx=5, pady=5, sticky="e")
        self.transforms = ["none", "fixed_value", "uppercase", "lowercase", "truncate", "concat"]
        self.cb_transform = ctk.CTkOptionMenu(form_frame, values=self.transforms, width=130, command=self.on_transform_change)
        self.cb_transform.grid(row=0, column=5, padx=5, pady=5, sticky="w")

        # Zone de paramètres dynamiques
        self.params_frame = ctk.CTkFrame(form_frame, fg_color="transparent", height=40)
        self.params_frame.grid(row=1, column=0, columnspan=6, padx=5, pady=5, sticky="ew")
        self.param_widgets = {}

        btn_add = ctk.CTkButton(form_frame, text="➕ Ajouter la règle", command=self.add_mapping)
        btn_add.grid(row=2, column=0, columnspan=6, pady=10)

        # Tableau
        style = ttk.Style()
        style.theme_use("default")
        style.configure("Treeview", background="#2b2b2b", foreground="white", fieldbackground="#2b2b2b", rowheight=25)
        style.map("Treeview", background=[("selected", "#1f538d")])
        style.configure("Treeview.Heading", background="#1f538d", foreground="white", font=('Helvetica', 10, 'bold'))

        tree_frame = ctk.CTkFrame(mapping_frame)
        tree_frame.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")

        cols = ("Cible", "Source", "Transformation", "Params")
        self.tree = ttk.Treeview(tree_frame, columns=cols, show="headings")
        self.tree.heading("Cible", text="Cible")
        self.tree.heading("Source", text="Source")
        self.tree.heading("Transformation", text="Type")
        self.tree.heading("Params", text="Options")
        
        self.tree.column("Cible", width=120)
        self.tree.column("Source", width=120)
        self.tree.column("Transformation", width=100)
        self.tree.column("Params", width=200)
        self.tree.pack(fill="both", expand=True, padx=2, pady=2)

        btn_del = ctk.CTkButton(mapping_frame, text="🗑 Ligne sélectionnée", command=self.del_mapping, fg_color="crimson", hover_color="#8b0000")
        btn_del.grid(row=2, column=0, padx=10, pady=10, sticky="e")

        # Paramètres d'export CSV
        export_settings = ctk.CTkFrame(self.right_frame, fg_color="transparent")
        export_settings.grid(row=3, column=0, padx=20, pady=5, sticky="ew")

        ctk.CTkLabel(export_settings, text="Options d'export (si CSV) - Séparateur:").pack(side="left", padx=5)
        self.cb_out_sep = ctk.CTkOptionMenu(export_settings, values=[";", ",", "\\t"], width=70)
        self.cb_out_sep.pack(side="left", padx=5)

        ctk.CTkLabel(export_settings, text="Encodage:").pack(side="left", padx=5)
        self.cb_out_enc = ctk.CTkOptionMenu(export_settings, values=["utf-8-sig", "utf-8", "latin1"], width=100)
        self.cb_out_enc.pack(side="left", padx=5)

        # Bouton d'export
        btn_export = ctk.CTkButton(self.right_frame, text="🚀 EXPORTER LE FICHIER DE SORTIE", 
                                   font=ctk.CTkFont(size=16, weight="bold"), height=50, command=self.export_file, fg_color="#28a745", hover_color="#218838")
        btn_export.grid(row=4, column=0, padx=20, pady=20, sticky="ew")

        # Initialisation de l'affichage
        self.on_transform_change("none")

    def on_transform_change(self, choice):
        # Nettoyage
        for widget in self.params_frame.winfo_children():
            widget.destroy()
        self.param_widgets.clear()

        # Construction dynamique
        if choice == "fixed_value":
            ctk.CTkLabel(self.params_frame, text="Valeur fixe :").pack(side="left", padx=5)
            e = ctk.CTkEntry(self.params_frame, width=200)
            e.pack(side="left", padx=5)
            self.param_widgets["value"] = e

        elif choice == "truncate":
            ctk.CTkLabel(self.params_frame, text="Garder depuis la :").pack(side="left", padx=5)
            d = ctk.CTkOptionMenu(self.params_frame, values=["left", "right"], width=100)
            d.pack(side="left", padx=5)
            self.param_widgets["direction"] = d

            ctk.CTkLabel(self.params_frame, text="Longueur :").pack(side="left", padx=(15, 5))
            l = ctk.CTkEntry(self.params_frame, width=80)
            l.insert(0, "10")
            l.pack(side="left", padx=5)
            self.param_widgets["length"] = l

        elif choice == "concat":
            ctk.CTkLabel(self.params_frame, text="Avec la colonne :").pack(side="left", padx=5)
            cols = [""] + self.engine.columns
            o = ctk.CTkOptionMenu(self.params_frame, values=cols, width=150)
            o.pack(side="left", padx=5)
            self.param_widgets["other_col"] = o

            ctk.CTkLabel(self.params_frame, text="Séparateur :").pack(side="left", padx=(15, 5))
            s = ctk.CTkEntry(self.params_frame, width=80)
            s.insert(0, " ") # espace par defaut
            s.pack(side="left", padx=5)
            self.param_widgets["sep"] = s

    def load_file(self):
        filepath = filedialog.askopenfilename(filetypes=[("Fichiers Données", "*.csv *.xlsx *.xls")])
        if filepath:
            sep = self.cb_in_sep.get()
            if sep == "\\t": sep = "\t"
            enc = self.cb_in_enc.get()
            
            try:
                cols = self.engine.load_file(filepath, sep=sep, encoding=enc)
                self.lbl_file.configure(text=filepath.split("/")[-1])
                self.cb_source.configure(values=cols)
                if cols:
                    self.cb_source.set(cols[0])
                
                self.txt_cols.configure(state="normal")
                self.txt_cols.delete("0.0", "end")
                self.txt_cols.insert("0.0", "\n".join([f"• {c}" for c in cols]))
                self.txt_cols.configure(state="disabled")

                if self.cb_transform.get() == "concat":
                    self.on_transform_change("concat")

            except Exception as e:
                messagebox.showerror("Erreur", f"Erreur de chargement : {e}")

    def add_mapping(self):
        target = self.ent_target.get().strip()
        source = self.cb_source.get().strip()
        transf = self.cb_transform.get().strip()
        
        if not target:
            messagebox.showwarning("Attention", "Précisez le nom de la colonne Cible.")
            return

        params = {}
        if transf == "fixed_value":
            params["value"] = self.param_widgets["value"].get()
            source = "-" # Visuellement plus clair
        elif transf == "truncate":
            params["direction"] = self.param_widgets["direction"].get()
            params["length"] = self.param_widgets["length"].get()
        elif transf == "concat":
            params["other_col"] = self.param_widgets["other_col"].get()
            params["sep"] = self.param_widgets["sep"].get()

        params_str = json.dumps(params, ensure_ascii=False)
        self.tree.insert("", "end", values=(target, source, transf, params_str))
        self.ent_target.delete(0, "end")

    def del_mapping(self):
        selected = self.tree.selection()
        if selected:
            for item in selected:
                self.tree.delete(item)

    def get_current_mapping(self):
        mapping = []
        for item in self.tree.get_children():
            values = self.tree.item(item, "values")
            try:
                params = json.loads(values[3]) if values[3] and values[3] != "{}" else {}
            except:
                params = {}
            mapping.append({
                "target_col": values[0],
                "source_col": values[1] if values[1] != "-" else "",
                "transform": values[2],
                "params": params
            })
        return mapping

    def load_template(self):
        filepath = filedialog.askopenfilename(defaultextension=".json", filetypes=[("JSON", "*.json")])
        if filepath:
            config = template_manager.load_template(filepath)
            for item in self.tree.get_children():
                self.tree.delete(item)
            for conf in config:
                params_str = json.dumps(conf.get("params", {}), ensure_ascii=False)
                src = conf.get("source_col", "")
                if conf.get("transform") == "fixed_value" and src == "":
                    src = "-"
                self.tree.insert("", "end", values=(conf.get("target_col", ""), src, conf.get("transform", "none"), params_str))

    def save_template(self):
        mapping = self.get_current_mapping()
        if not mapping:
            messagebox.showwarning("Attention", "Le mapping est vide.")
            return
        filepath = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON", "*.json")])
        if filepath:
            template_manager.save_template(filepath, mapping)

    def export_file(self):
        if self.engine.df is None:
            messagebox.showwarning("Attention", "Veuillez charger un fichier à l'étape 1.")
            return
        mapping = self.get_current_mapping()
        if not mapping:
            messagebox.showwarning("Attention", "Votre configuration est vide.")
            return
        
        filepath = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV", "*.csv"), ("Excel", "*.xlsx")])
        if filepath:
            sep = self.cb_out_sep.get()
            if sep == "\\t": sep = "\t"
            enc = self.cb_out_enc.get()
            
            try:
                out_df = self.engine.apply_mapping(mapping)
                self.engine.export_data(out_df, filepath, sep=sep, encoding=enc)
                messagebox.showinfo("Succès", "Le fichier a bien été converti et sauvegardé !")
            except Exception as e:
                messagebox.showerror("Erreur", f"Erreur pendant l'exportation : {e}")

if __name__ == "__main__":
    app = ETLApp()
    app.mainloop()
