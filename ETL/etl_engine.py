import pandas as pd

class ETLEngine:
    def __init__(self):
        self.df = None
        self.columns = []

    def load_file(self, filepath, sep=',', encoding='utf-8'):
        if filepath.endswith('.csv'):
            if sep == 'Auto':
                self.df = pd.read_csv(filepath, sep=None, engine='python', encoding=encoding)
            else:
                self.df = pd.read_csv(filepath, sep=sep, encoding=encoding)
        elif filepath.endswith(('.xls', '.xlsx')):
            self.df = pd.read_excel(filepath)
        else:
            raise ValueError("Format de fichier non supporté")
        self.columns = self.df.columns.tolist()
        return self.columns

    def apply_mapping(self, mapping_config):
        out_df = pd.DataFrame()
        
        for conf in mapping_config:
            t_col = conf.get("target_col")
            s_col = conf.get("source_col")
            transform = conf.get("transform", "none")
            params = conf.get("params", {})

            if transform == "fixed_value":
                val = params.get("value", "")
                if self.df is not None and not self.df.empty:
                    out_df[t_col] = val
                else:
                    out_df[t_col] = [val]
                continue

            if s_col and self.df is not None and s_col in self.df.columns:
                series = self.df[s_col].copy()
                
                if transform == "uppercase":
                    series = series.astype(str).str.upper()
                elif transform == "lowercase":
                    series = series.astype(str).str.lower()
                elif transform == "truncate":
                    length = int(params.get("length", 10))
                    direction = params.get("direction", "left")
                    if direction == "left":
                        series = series.astype(str).str[:length]
                    else: # right
                        series = series.astype(str).str[-length:]
                elif transform == "concat":
                    other_col = params.get("other_col")
                    sep_str = params.get("sep", "")
                    if other_col and other_col in self.df.columns:
                        series = series.astype(str) + sep_str + self.df[other_col].astype(str)
                out_df[t_col] = series
            else:
                out_df[t_col] = None 
        
        return out_df

    def export_data(self, out_df, filepath, sep=None, encoding=None):
        if filepath.endswith('.csv'):
            # default fallbacks
            sep = sep if sep else ';'
            encoding = encoding if encoding else 'utf-8-sig'
            out_df.to_csv(filepath, index=False, sep=sep, encoding=encoding)
        elif filepath.endswith(('.xls', '.xlsx')):
            out_df.to_excel(filepath, index=False)
        else:
            raise ValueError("Format de fichier de sortie non supporté (seul .csv et .xlsx)")
