import os
import json
import pandas as pd
import numpy as np

excel_path = r"C:\laragon\www\eky_sehat\public\(PROVINSI) Hasil Analisis Kondisi Ergonomi Pegawai Badan Pusat Statistik Provinsi Sulawesi Tenggara.xlsx"
output_path = r"C:\laragon\www\eky_sehat\public\ergonomic_data.json"

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
# Raw Excel values might contain variations, let's normalize them
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
    
    # 1. Monitor
    if str(row.get("Apakah posisi monitor membuat posisi kerja dengan leher memutar?\n*pilih ya apabila seperti pada gambar")).strip().lower() == "ya":
        issues.append({
            "title": "Posisi Monitor Miring",
            "desc": "Layar tidak sejajar dengan arah duduk, memaksa leher sering berputar.",
            "impact": "Ketegangan otot leher (leher kaku/nyeri)",
            "icon": "Monitor",
            "type": "Monitor"
        })
    if str(row.get("Apakah posisi monitor terlalu jauh dengan posisi kerja?")).strip().lower() == "ya":
        issues.append({
            "title": "Monitor Terlalu Jauh",
            "desc": "Jarak layar melebihi jangkauan lengan, memaksa tubuh condong ke depan.",
            "impact": "Kelelahan mata dan posisi bungkuk",
            "icon": "Monitor",
            "type": "Monitor"
        })
    if "rendah" in str(row.get("5. Posisi Monitor")).strip().lower() or "bawah" in str(row.get("5. Posisi Monitor")).strip().lower():
        issues.append({
            "title": "Monitor Terlalu Rendah",
            "desc": "Ketinggian layar berada di bawah level mata, memaksa leher menunduk.",
            "impact": "Nyeri leher atas dan bahu atas",
            "icon": "Monitor",
            "type": "Monitor"
        })

    # 2. Chair & Desk
    if str(row.get("Apakah kursi kerja Anda dapat diatur/disesuaikan tingginya")).strip().lower() == "tidak":
        issues.append({
            "title": "Ketinggian Kursi Statis",
            "desc": "Kursi tidak dapat diatur tingginya, sulit menyelaraskan dengan tinggi meja.",
            "impact": "Kaki menggantung atau bahu terangkat",
            "icon": "Armchair",
            "type": "Kursi"
        })
    if str(row.get("Apakah permukaan sandaran tangan keras/rusak (pilih ya apabila permukaan sandaran tangan seperti pada gambar)")).strip().lower() == "ya":
        issues.append({
            "title": "Sandaran Tangan Keras/Rusak",
            "desc": "Sandaran tangan keras menimbulkan tekanan lokal berlebih pada siku.",
            "impact": "Nyeri siku dan pergelangan tangan",
            "icon": "Armchair",
            "type": "Kursi"
        })
    if str(row.get("Apakah permukaan meja kerja terlalu tinggi (mengangkat bahu)?\n*pilih ya apabila permukaan meja kerja terlalu tinggi seperti pada gambar")).strip().lower() == "ya":
        issues.append({
            "title": "Meja Kerja Terlalu Tinggi",
            "desc": "Meja memaksa siku terangkat dan bahu dalam posisi tegang (shrugging).",
            "impact": "Pegal pada pundak dan belikat",
            "icon": "Zap",
            "type": "Meja"
        })
    if str(row.get("Apakah penyangga punggung dapat diatur/disesuaikan?")).strip().lower() == "tidak":
        issues.append({
            "title": "Penyangga Punggung Statis",
            "desc": "Sandaran punggung tidak fleksibel, tidak menopang lumbar (pinggang bawah) dengan baik.",
            "impact": "Nyeri pinggang bawah dan punggung",
            "icon": "Armchair",
            "type": "Kursi"
        })
        
    # 3. Mouse & Keyboard
    if str(row.get("Apakah posisi saat menggenggam mouse menekuk?\n*pilih ya apabila seperti pada gambar")).strip().lower() == "ya":
        issues.append({
            "title": "Pergelangan Mouse Menekuk",
            "desc": "Sudut pergelangan tangan terlalu menekuk saat menggenggam mouse.",
            "impact": "Risiko Carpal Tunnel Syndrome (kesemutan tangan)",
            "icon": "Zap",
            "type": "Mouse"
        })
    if str(row.get("Apakah posisi tangan saat bekerja membentuk deviasi atau serong (miring)\n*pilih ya apabila seperti pada gambar")).strip().lower() == "ya":
        issues.append({
            "title": "Posisi Mengetik Miring",
            "desc": "Tangan membentuk sudut miring/serong saat menggunakan keyboard.",
            "impact": "Ketegangan pada pergelangan tangan",
            "icon": "Zap",
            "type": "Keyboard"
        })
    if str(row.get("Apakah Anda bekerja menggunakan sandaran mouse?")).strip().lower() == "tidak":
        issues.append({
            "title": "Tidak Ada Bantalan Mouse",
            "desc": "Pergelangan tangan bergesekan langsung dengan meja tanpa alas empuk.",
            "impact": "Pegal dan kapalan pada pergelangan tangan",
            "icon": "Zap",
            "type": "Mouse"
        })

    # 4. Phone
    if str(row.get("Apakah penggunaan telepon saat bekerja ditopangkan pada leher dan bahu?\n*pilih ya apabila seperti pada gambar")).strip().lower() == "ya":
        issues.append({
            "title": "Menjepit Telepon di Bahu",
            "desc": "Kebiasaan menjepit gagang telepon menggunakan bahu dan leher saat mengetik.",
            "impact": "Sakit leher unilateral & bahu kaku",
            "icon": "Phone",
            "type": "Telepon"
        })

    # Fallback if no issues detected (fill with general ones)
    if len(issues) == 0:
        issues.append({
            "title": "Durasi Duduk Terlalu Lama",
            "desc": "Bekerja secara terus menerus tanpa jeda peregangan yang cukup.",
            "impact": "Sirkulasi darah kurang lancar",
            "icon": "ShieldCheck",
            "type": "Umum"
        })
        
    return issues[:4] # limit to top 4 issues

def main():
    print(f"Reading Excel: {excel_path}")
    df = pd.read_excel(excel_path, sheet_name="Form Response Pegawai")
    
    employees = []
    
    # 1. Aggregate counters
    total_nbm_scores = []
    total_rosa_scores = []
    
    # Track statistics
    nbm_categories = {}
    rosa_risk_categories = {}
    dept_scores = {}
    
    # Track body part pain statistics
    body_part_pain_counts = {name: {"total_pained": 0, "agak_sakit": 0, "sakit": 0, "sangat_sakit": 0} for _, name, _ in nbm_cols}
    
    # Track risk factors from answers
    risk_factor_cols = {
        "Apakah kursi kerja Anda dapat diatur/disesuaikan tingginya": "Ketinggian Kursi Tidak Dapat Diatur",
        "Apakah penyangga punggung dapat diatur/disesuaikan?": "Penyangga Punggung Tidak Dapat Diatur",
        "Apakah permukaan meja kerja terlalu tinggi (mengangkat bahu)?\n*pilih ya apabila seperti pada gambar": "Meja Terlalu Tinggi (Bahu Terangkat)",
        "Apakah posisi monitor membuat posisi kerja dengan leher memutar?\n*pilih ya apabila seperti pada gambar": "Monitor Mengakibatkan Leher Memutar",
        "Apakah posisi saat menggenggam mouse menekuk?\n*pilih ya apabila seperti pada gambar": "Menggenggam Mouse Menekuk",
        "Apakah penggunaan telepon saat bekerja ditopangkan pada leher dan bahu?\n*pilih ya apabila seperti pada gambar": "Menjepit Telepon di Bahu",
        "Apakah Anda bekerja menggunakan sandaran mouse?": "Tidak Menggunakan Sandaran Mouse"
    }
    # Some columns might have slight name variations in prompt/excel, let's match them dynamically
    actual_columns = df.columns
    mapped_risk_factors = {}
    for col_key, short_name in risk_factor_cols.items():
        # Find matches
        matched_col = None
        for col in actual_columns:
            if col_key[:30] in col:
                matched_col = col
                break
        if matched_col:
            mapped_risk_factors[matched_col] = short_name
            
    risk_factor_counts = {name: 0 for name in mapped_risk_factors.values()}
    
    for idx, row in df.iterrows():
        name = str(row.get("Nama Lengkap", f"Pegawai {idx+1}")).strip()
        if pd.isna(row.get("Nama Lengkap")) or name == "":
            continue
            
        gender = str(row.get("Jenis Kelamin", "Tidak Disebutkan")).strip()
        age = str(row.get("Usia", "-")).strip()
        work_years = str(row.get("Lama Bekerja (tahun)", "-")).strip()
        work_hours = str(row.get("Durasi Kerja (jam per hari)", "-")).strip()
        dept = str(row.get("Bagian", "Lainnya")).strip()
        
        nbm_score = int(row.get("Total Skor NBM", 28))
        nbm_cat = str(row.get("Kategori Keluhan", "Keluhan Rendah")).strip()
        
        # Keep clean values
        if nbm_cat == "nan" or nbm_cat == "":
            nbm_cat = "Keluhan Ringan"
            
        rosa_score = row.get("Total Skor Akhir ROSA", 0)
        if pd.isna(rosa_score):
            rosa_score = 0
        else:
            rosa_score = int(rosa_score)
            
        rosa_cat = str(row.get("Kategori Risiko", "Risiko Sedang")).strip()
        if rosa_cat == "nan" or rosa_cat == "":
            rosa_cat = "Risiko Tinggi" if rosa_score >= 5 else "Risiko Sedang"
            
        total_nbm_scores.append(nbm_score)
        total_rosa_scores.append(rosa_score)
        
        # Category totals
        nbm_categories[nbm_cat] = nbm_categories.get(nbm_cat, 0) + 1
        rosa_risk_categories[rosa_cat] = rosa_risk_categories.get(rosa_cat, 0) + 1
        
        # Dept averages accumulator
        if dept not in dept_scores:
            dept_scores[dept] = {"nbm": [], "rosa": [], "count": 0}
        dept_scores[dept]["nbm"].append(nbm_score)
        dept_scores[dept]["rosa"].append(rosa_score)
        dept_scores[dept]["count"] += 1
        
        # Pain details extraction
        pain_list = []
        for orig_col, short_name, icon in nbm_cols:
            val = row.get(orig_col, "Tidak sakit")
            score, label = get_pain_score_and_label(val)
            pain_list.append({
                "area": short_name,
                "level": label,
                "score": score,
                "icon": icon
            })
            
            # Aggregate stats
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
            # If the question is about "adjustable" and answer is "Tidak", it's a risk.
            # If question is about "does it pain/is it high" and answer is "Ya", it's a risk.
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
                
        # Main issues identification
        issues = identify_issues(row)
        
        employees.append({
            "nama": name,
            "gender": gender,
            "usia": age,
            "lama_bekerja": work_years,
            "durasi_kerja": work_hours,
            "bagian": dept,
            "nbm_score": nbm_score,
            "nbm_category": nbm_cat,
            "rosa_score": rosa_score,
            "rosa_category": rosa_cat,
            "titik_sakit": pain_list,
            "masalah_utama": issues
        })
        
    num_employees = len(employees)
    
    # Calculate averages
    avg_nbm = round(np.mean(total_nbm_scores), 1) if total_nbm_scores else 0
    avg_rosa = round(np.mean(total_rosa_scores), 1) if total_rosa_scores else 0
    
    # Compute department stats
    dept_stats = []
    for dept, data_d in dept_scores.items():
        dept_stats.append({
            "bagian": dept,
            "count": data_d["count"],
            "avg_nbm": round(np.mean(data_d["nbm"]), 1),
            "avg_rosa": round(np.mean(data_d["rosa"]), 1)
        })
    dept_stats = sorted(dept_stats, key=lambda x: x["avg_rosa"], reverse=True)
    
    # Compute pain area statistics
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
    
    # Compute risk factor stats
    risk_stats = []
    for risk, count in risk_factor_counts.items():
        percentage = round((count / num_employees) * 100, 1)
        risk_stats.append({
            "factor": risk,
            "percentage": percentage,
            "count": count
        })
    risk_stats = sorted(risk_stats, key=lambda x: x["percentage"], reverse=True)
    
    # Compile final structure
    output_data = {
        "employees": employees,
        "statistics": {
            "total_employees": num_employees,
            "avg_nbm": avg_nbm,
            "avg_rosa": avg_rosa,
            "nbm_categories": nbm_categories,
            "rosa_categories": rosa_risk_categories,
            "department_stats": dept_stats,
            "body_pain_stats": body_pain_stats,
            "risk_factor_stats": risk_stats
        }
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"Extraction successful! Extracted {num_employees} employees.")
    print(f"Data saved to: {output_path}")

if __name__ == "__main__":
    main()
