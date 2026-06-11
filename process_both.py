import os
import json
import pandas as pd
import numpy as np

prov_excel_path = r"C:\laragon\www\eky_sehat\public\(PROVINSI) Hasil Analisis Kondisi Ergonomi Pegawai Badan Pusat Statistik Provinsi Sulawesi Tenggara.xlsx"
kabko_excel_path = r"C:\laragon\www\eky_sehat\public\(KABKO) Hasil Kuesioner Analisis Kondisi Ergonomi Pegawai Badan Pusat Statistik Kabupaten Kota Se-Sulawesi Tenggara.xlsx"

prov_json_path = r"C:\laragon\www\eky_sehat\public\provinsi_data.json"
kabko_json_path = r"C:\laragon\www\eky_sehat\public\kabkota_data.json"

# List of NBM columns (28 body parts)
nbm_cols = [
    ("0. Apakah mengalami/merasakan sakit/kaku pada leher atas?", "Leher Atas", "🧣"),
    ("1. Apakah mengalami/merasakan sakit/kaku pada leher bawah?", "Leher Bawah", "🧣"),
    ("2. Apakah mengalami/merasakan sakit pada bahu kiri?", "Bahu Kiri", "👔"),
    ("3. Apakah mengalami/merasakan sakit pada bahu kanan?", "Bahu Kanan", "👔"),
    ("4. Apakah mengalami/merasakan sakit pada lengan atas kiri?", "Lengan Atas Kiri", "💪"),
    ("5. Apakah mengalami/merasakan sakit pada punggung?", "Punggung Tengah", "👤"),
    ("6. Apakah mengalami/merasakan sakit pada lengan atas kanan?", "Lengan Atas Kanan", "💪"),
    ("7. Apakah mengalami/merasakan sakit pada pinggang?", "Pinggang / Punggung Bawah", "👤"),
    ("8. Apakah mengalami/merasakan sakit pada pantat (buttock)?", "Pantat (Buttock)", "🪑"),
    ("9. Apakah mengalami/merasakan sakit pada pantat (bottom)?", "Pantat (Bottom)", "🪑"),
    ("10. Apakah mengalami/merasakan sakit pada siku kiri?", "Siku Kiri", "💪"),
    ("11. Apakah mengalami/merasakan sakit pada siku kanan?", "Siku Kanan", "💪"),
    ("12. Apakah mengalami/merasakan sakit pada lengan bawah kiri?", "Lengan Bawah Kiri", "✋"),
    ("13. Apakah mengalami/merasakan sakit pada lengan bawah kanan?", "Lengan Bawah Kanan", "✋"),
    ("14. Apakah mengalami/merasakan sakit pada pergelangan tangan kiri?", "Pergelangan Kiri", "✋"),
    ("15. Apakah mengalami/merasakan sakit pada pergelangan tangan kanan?", "Pergelangan Kanan", "✋"),
    ("16. Apakah mengalami/merasakan sakit pada tangan kiri?", "Tangan Kiri", "✋"),
    ("17. Apakah mengalami/merasakan sakit pada tangan kanan?", "Tangan Kanan", "✋"),
    ("18. Apakah mengalami/merasakan sakit pada paha kiri?", "Paha Kiri", "🦵"),
    ("19. Apakah mengalami/merasakan sakit pada paha kanan?", "Paha Kanan", "🦵"),
    ("20. Apakah mengalami/merasakan sakit pada lutut kiri?", "Lutut Kiri", "🦵"),
    ("21. Apakah mengalami/merasakan sakit pada lutut kanan?", "Lutut Kanan", "🦵"),
    ("22. Apakah mengalami/merasakan sakit pada betis kiri?", "Betis Kiri", "🦵"),
    ("23. Apakah mengalami/merasakan sakit pada betis kanan?", "Betis Kanan", "🦵"),
    ("24. Apakah mengalami/merasakan sakit pada pergelangan kaki kiri?", "Pergelangan Kaki Kiri", "🧦"),
    ("25. Apakah mengalami/merasakan sakit pada pergelangan kaki kanan?", "Pergelangan Kaki Kanan", "🧦"),
    ("26. Apakah mengalami/merasakan sakit pada kaki kiri?", "Kaki Kiri", "🧦"),
    ("27. Apakah mengalami/merasakan sakit pada kaki kanan?", "Kaki Kanan", "🧦")
]

# NBM Pain mapping
def get_pain_score_and_label(val):
    if pd.isna(val):
        return 0, "Normal"
    val_str = str(val).strip().lower()
    if "sangat" in val_str:
        return 3, "Sakit Sekali"
    elif "sakit" in val_str and "tidak" not in val_str and "agak" not in val_str:
        return 2, "Sakit"
    elif "agak" in val_str:
        return 1, "Agak Sakit"
    else:
        return 0, "Normal"

def identify_issues(row):
    issues = []
    
    # Check screen rotate
    monitor_twist = None
    for k in row.keys():
        if "monitor" in k.lower() and "putar" in k.lower():
            monitor_twist = row[k]
            break
    if monitor_twist and str(monitor_twist).strip().lower() == "ya":
        issues.append({
            "title": "Posisi Monitor Miring",
            "desc": "Layar tidak sejajar dengan arah duduk, memaksa leher sering berputar.",
            "impact": "Ketegangan otot leher (leher kaku/nyeri)",
            "icon": "Monitor",
            "type": "Monitor"
        })
        
    # Check screen distance
    monitor_dist = None
    for k in row.keys():
        if "monitor" in k.lower() and "jauh" in k.lower():
            monitor_dist = row[k]
            break
    if monitor_dist and str(monitor_dist).strip().lower() == "ya":
        issues.append({
            "title": "Monitor Terlalu Jauh",
            "desc": "Jarak layar melebihi jangkauan lengan, memaksa tubuh condong ke depan.",
            "impact": "Kelelahan mata dan posisi bungkuk",
            "icon": "Monitor",
            "type": "Monitor"
        })
        
    # Check monitor low
    monitor_height = row.get("5. Posisi Monitor")
    if monitor_height and ("rendah" in str(monitor_height).strip().lower() or "bawah" in str(monitor_height).strip().lower()):
        issues.append({
            "title": "Monitor Terlalu Rendah",
            "desc": "Ketinggian layar berada di bawah level mata, memaksa leher menunduk.",
            "impact": "Nyeri leher atas dan bahu atas",
            "icon": "Monitor",
            "type": "Monitor"
        })

    # Check chair height adjustable
    chair_adj = None
    for k in row.keys():
        if "kursi" in k.lower() and "diatur" in k.lower() and "tinggi" in k.lower():
            chair_adj = row[k]
            break
    if chair_adj and str(chair_adj).strip().lower() == "tidak":
        issues.append({
            "title": "Ketinggian Kursi Statis",
            "desc": "Kursi tidak dapat diatur tingginya, sulit menyelaraskan dengan tinggi meja.",
            "impact": "Kaki menggantung atau bahu terangkat",
            "icon": "Armchair",
            "type": "Kursi"
        })
        
    # Check elbow rest hardness
    elbow_hard = None
    for k in row.keys():
        if "sandaran tangan" in k.lower() and "keras" in k.lower():
            elbow_hard = row[k]
            break
    if elbow_hard and str(elbow_hard).strip().lower() == "ya":
        issues.append({
            "title": "Sandaran Tangan Keras/Rusak",
            "desc": "Sandaran tangan keras menimbulkan tekanan lokal berlebih pada siku.",
            "impact": "Nyeri siku dan pergelangan tangan",
            "icon": "Armchair",
            "type": "Kursi"
        })
        
    # Check table height
    table_high = None
    for k in row.keys():
        if "meja" in k.lower() and "tinggi" in k.lower() and "bahu" in k.lower():
            table_high = row[k]
            break
    if table_high and str(table_high).strip().lower() == "ya":
        issues.append({
            "title": "Meja Kerja Terlalu Tinggi",
            "desc": "Meja memaksa siku terangkat dan bahu dalam posisi tegang (shrugging).",
            "impact": "Pegal pada pundak dan belikat",
            "icon": "Zap",
            "type": "Meja"
        })
        
    # Check backrest adjustable
    back_adj = None
    for k in row.keys():
        if "penyangga punggung" in k.lower() and "diatur" in k.lower():
            back_adj = row[k]
            break
    if back_adj and str(back_adj).strip().lower() == "tidak":
        issues.append({
            "title": "Penyangga Punggung Statis",
            "desc": "Sandaran punggung tidak fleksibel, tidak menopang lumbar (pinggang bawah) dengan baik.",
            "impact": "Nyeri pinggang bawah dan punggung",
            "icon": "Armchair",
            "type": "Kursi"
        })
        
    # Check mouse hand bending
    mouse_bend = None
    for k in row.keys():
        if "mouse" in k.lower() and "menekuk" in k.lower():
            mouse_bend = row[k]
            break
    if mouse_bend and str(mouse_bend).strip().lower() == "ya":
        issues.append({
            "title": "Pergelangan Mouse Menekuk",
            "desc": "Sudut pergelangan tangan terlalu menekuk saat menggenggam mouse.",
            "impact": "Risiko Carpal Tunnel Syndrome (kesemutan tangan)",
            "icon": "Zap",
            "type": "Mouse"
        })
        
    # Check keyboard typing deviation
    kb_dev = None
    for k in row.keys():
        if "keyboard" in k.lower() and "miring" in k.lower() or "deviasi" in k.lower() or "serong" in k.lower():
            kb_dev = row[k]
            break
    if kb_dev and str(kb_dev).strip().lower() == "ya":
        issues.append({
            "title": "Posisi Mengetik Miring",
            "desc": "Tangan membentuk sudut miring/serong saat menggunakan keyboard.",
            "impact": "Ketegangan pada pergelangan tangan",
            "icon": "Zap",
            "type": "Keyboard"
        })
        
    # Check mouse pad wrist support
    mouse_support = None
    for k in row.keys():
        if "sandaran mouse" in k.lower() or "bantalan mouse" in k.lower():
            mouse_support = row[k]
            break
    if mouse_support and str(mouse_support).strip().lower() == "tidak":
        issues.append({
            "title": "Tidak Ada Bantalan Mouse",
            "desc": "Pergelangan tangan bergesekan langsung dengan meja tanpa alas empuk.",
            "impact": "Pegal dan kapalan pada pergelangan tangan",
            "icon": "Zap",
            "type": "Mouse"
        })

    # Check telephone neck clamping
    phone_clamp = None
    for k in row.keys():
        if "telepon" in k.lower() and "ditopangkan" in k.lower():
            phone_clamp = row[k]
            break
    if phone_clamp and str(phone_clamp).strip().lower() == "ya":
        issues.append({
            "title": "Menjepit Telepon di Bahu",
            "desc": "Kebiasaan menjepit gagang telepon menggunakan bahu dan leher saat mengetik.",
            "impact": "Sakit leher unilateral & bahu kaku",
            "icon": "Phone",
            "type": "Telepon"
        })

    if len(issues) == 0:
        issues.append({
            "title": "Durasi Duduk Terlalu Lama",
            "desc": "Bekerja secara terus menerus tanpa jeda peregangan yang cukup.",
            "impact": "Sirkulasi darah kurang lancar",
            "icon": "ShieldCheck",
            "type": "Umum"
        })
        
    return issues[:4]

def process_file(excel_path, output_json_path, is_kabko=False):
    print(f"Reading file: {excel_path}")
    sheet_name = "Form Responses" if is_kabko else "Form Response Pegawai"
    df = pd.read_excel(excel_path, sheet_name=sheet_name)
    
    employees = []
    total_nbm_scores = []
    total_rosa_scores = []
    
    nbm_categories = {}
    rosa_risk_categories = {}
    dept_scores = {}
    satker_scores = {}  # Specifically for KABKO
    
    body_part_pain_counts = {name: {"total_pained": 0, "agak_sakit": 0, "sakit": 0, "sangat_sakit": 0} for _, name, _ in nbm_cols}
    
    # Map risk factor columns
    # We find matching columns dynamically
    actual_columns = df.columns
    mapped_risk_factors = {}
    risk_factor_cols = {
        "Apakah kursi kerja Anda dapat diatur/disesuaikan tingginya": "Ketinggian Kursi Tidak Dapat Diatur",
        "Apakah penyangga punggung dapat diatur/disesuaikan?": "Penyangga Punggung Tidak Dapat Diatur",
        "Apakah permukaan meja kerja terlalu tinggi (mengangkat bahu)?": "Meja Terlalu Tinggi (Bahu Terangkat)",
        "Apakah posisi monitor membuat posisi kerja dengan leher memutar?": "Monitor Mengakibatkan Leher Memutar",
        "Apakah posisi saat menggenggam mouse menekuk?": "Menggenggam Mouse Menekuk",
        "Apakah penggunaan telepon saat bekerja ditopangkan pada leher dan bahu?": "Menjepit Telepon di Bahu",
        "Apakah Anda bekerja menggunakan sandaran mouse?": "Tidak Menggunakan Sandaran Mouse"
    }
    
    for col_key, short_name in risk_factor_cols.items():
        matched_col = None
        for col in actual_columns:
            if col_key[:25] in col:
                matched_col = col
                break
        if matched_col:
            mapped_risk_factors[matched_col] = short_name
            
    risk_factor_counts = {name: 0 for name in mapped_risk_factors.values()}
    
    # Find NBM columns in actual sheet
    nbm_column_map = []
    for excel_col, short_name, icon in nbm_cols:
        matched_col = None
        for col in actual_columns:
            # Match by prefix (e.g. "0. Apakah mengalami" or "1. Apakah mengalami")
            if excel_col[:20] in col:
                matched_col = col
                break
        if matched_col:
            nbm_column_map.append((matched_col, short_name, icon))
        else:
            # Fallback
            nbm_column_map.append((excel_col, short_name, icon))

    # Find ROSA score column name (Total Skor ROSA or Total Skor Akhir ROSA)
    rosa_score_col = "Total Skor ROSA" if is_kabko else "Total Skor Akhir ROSA"
    if rosa_score_col not in actual_columns:
        # Fallback search
        for col in actual_columns:
            if "total skor" in col.lower() and "rosa" in col.lower():
                rosa_score_col = col
                break

    for idx, row in df.iterrows():
        name = str(row.get("Nama Lengkap", f"Pegawai {idx+1}")).strip()
        if pd.isna(row.get("Nama Lengkap")) or name == "":
            continue
            
        gender = str(row.get("Jenis Kelamin", "Tidak Disebutkan")).strip()
        age = str(row.get("Usia", "-")).strip()
        work_years = str(row.get("Lama Bekerja (tahun)", "-")).strip()
        work_hours = str(row.get("Durasi Kerja (jam per hari)", "-")).strip()
        dept = str(row.get("Bagian", "Lainnya")).strip()
        
        # Satker info (for KABKO only)
        satker = "BPS Provinsi Sultra"
        if is_kabko:
            satker = str(row.get("Wilayah Satuan Kerja", "BPS Kabupaten/Kota")).strip()
            # Normalize Satker names
            satker = satker.replace("Badan Pusat Statistik", "BPS")
        
        nbm_score = int(row.get("Total Skor NBM", 28))
        nbm_cat = str(row.get("Kategori Keluhan", "Keluhan Ringan")).strip()
        if nbm_cat == "nan" or nbm_cat == "":
            nbm_cat = "Keluhan Ringan"
            
        rosa_score = row.get(rosa_score_col, 0)
        if pd.isna(rosa_score):
            rosa_score = 0
        else:
            rosa_score = int(rosa_score)
            
        rosa_cat = str(row.get("Kategori Risiko", "Risiko Sedang")).strip()
        if rosa_cat == "nan" or rosa_cat == "":
            rosa_cat = "Risiko Tinggi" if rosa_score >= 5 else "Risiko Sedang"
            
        total_nbm_scores.append(nbm_score)
        total_rosa_scores.append(rosa_score)
        
        nbm_categories[nbm_cat] = nbm_categories.get(nbm_cat, 0) + 1
        rosa_risk_categories[rosa_cat] = rosa_risk_categories.get(rosa_cat, 0) + 1
        
        # Dept stats accumulator
        if dept not in dept_scores:
            dept_scores[dept] = {"nbm": [], "rosa": [], "count": 0}
        dept_scores[dept]["nbm"].append(nbm_score)
        dept_scores[dept]["rosa"].append(rosa_score)
        dept_scores[dept]["count"] += 1
        
        # Satker stats accumulator
        if is_kabko:
            if satker not in satker_scores:
                satker_scores[satker] = {"nbm": [], "rosa": [], "count": 0}
            satker_scores[satker]["nbm"].append(nbm_score)
            satker_scores[satker]["rosa"].append(rosa_score)
            satker_scores[satker]["count"] += 1
            
        # Pain details extraction
        pain_list = []
        for orig_col, short_name, icon in nbm_column_map:
            val = row.get(orig_col, "Tidak sakit")
            score, label = get_pain_score_and_label(val)
            pain_list.append({
                "area": short_name,
                "level": label,
                "score": score,
                "icon": icon
            })
            
            if score > 0:
                body_part_pain_counts[short_name]["total_pained"] += 1
                if score == 1:
                    body_part_pain_counts[short_name]["agak_sakit"] += 1
                elif score == 2:
                    body_part_pain_counts[short_name]["sakit"] += 1
                elif score == 3:
                    body_part_pain_counts[short_name]["sangat_sakit"] += 1
                    
        # Risk factors accumulator
        for col_name, short_name in mapped_risk_factors.items():
            val = str(row.get(col_name, "")).strip().lower()
            is_risk = False
            if "dapat diatur" in col_name or "bisa diatur" in col_name or "dapat disesuaikan" in col_name:
                if val == "tidak":
                    is_risk = True
            elif "menggunakan sandaran mouse" in col_name:
                if val == "tidak":
                    is_risk = True
            else:
                if val == "ya":
                    is_risk = True
                    
            if is_risk:
                risk_factor_counts[short_name] += 1
                
        issues = identify_issues(row)
        
        employees.append({
            "nama": name,
            "gender": gender,
            "usia": age,
            "lama_bekerja": work_years,
            "durasi_kerja": work_hours,
            "bagian": dept,
            "satker": satker,
            "nbm_score": nbm_score,
            "nbm_category": nbm_cat,
            "rosa_score": rosa_score,
            "rosa_category": rosa_cat,
            "titik_sakit": pain_list,
            "masalah_utama": issues
        })
        
    num_employees = len(employees)
    avg_nbm = round(np.mean(total_nbm_scores), 1) if total_nbm_scores else 0
    avg_rosa = round(np.mean(total_rosa_scores), 1) if total_rosa_scores else 0
    
    # Calculate dept stats
    dept_stats = []
    for dept, data_d in dept_scores.items():
        dept_stats.append({
            "bagian": dept,
            "count": data_d["count"],
            "avg_nbm": round(np.mean(data_d["nbm"]), 1),
            "avg_rosa": round(np.mean(data_d["rosa"]), 1)
        })
    dept_stats = sorted(dept_stats, key=lambda x: x["avg_rosa"], reverse=True)
    
    # Calculate satker stats (KABKO only)
    satker_stats = []
    if is_kabko:
        for satker, data_s in satker_scores.items():
            satker_stats.append({
                "satker": satker,
                "count": data_s["count"],
                "avg_nbm": round(np.mean(data_s["nbm"]), 1),
                "avg_rosa": round(np.mean(data_s["rosa"]), 1)
            })
        satker_stats = sorted(satker_stats, key=lambda x: x["avg_rosa"], reverse=True)
        
    # Calculate body pain stats
    body_pain_stats = []
    for area, counts in body_part_pain_counts.items():
        percentage = round((counts["total_pained"] / num_employees) * 100, 1)
        body_pain_stats.append({
            "area": area,
            "percentage": percentage,
            "total_pained": counts["total_pained"],
            "agak_sakit": counts["agak_sakit"],
            "sakit": counts["sakit"],
            "sangat_sakit": counts["sangat_sakit"]
        })
    body_pain_stats = sorted(body_pain_stats, key=lambda x: x["percentage"], reverse=True)
    
    # Calculate risk factor stats
    risk_stats = []
    for risk, count in risk_factor_counts.items():
        percentage = round((count / num_employees) * 100, 1)
        risk_stats.append({
            "factor": risk,
            "percentage": percentage,
            "count": count
        })
    risk_stats = sorted(risk_stats, key=lambda x: x["percentage"], reverse=True)
    
    # Assemble data
    output_data = {
        "employees": employees,
        "statistics": {
            "total_employees": num_employees,
            "avg_nbm": avg_nbm,
            "avg_rosa": avg_rosa,
            "nbm_categories": nbm_categories,
            "rosa_categories": rosa_risk_categories,
            "department_stats": dept_stats,
            "satker_stats": satker_stats if is_kabko else [],
            "body_pain_stats": body_pain_stats,
            "risk_factor_stats": risk_stats
        }
    }
    
    # Ensure folder exists
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"File processed: {excel_path} -> {output_json_path} ({num_employees} employees)")

def main():
    # Process Sultra Province data
    process_file(prov_excel_path, prov_json_path, is_kabko=False)
    
    # Process Kabkota Sultra data
    process_file(kabko_excel_path, kabko_json_path, is_kabko=True)
    
    print("All datasets processed successfully!")

if __name__ == "__main__":
    main()
