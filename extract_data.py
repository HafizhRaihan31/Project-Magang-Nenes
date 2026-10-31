import openpyxl
import json
from datetime import datetime

wb = openpyxl.load_workbook('data rework perusahaan.xlsx', data_only=True)
ws = wb['Cheek Sheet']

records = []
current_date = None
current_no = None
current_product = ""
current_qty_order = 0

for r in range(3, ws.max_row + 1):
    vals = [ws.cell(r, c).value for c in range(1, 10)]
    if not any(vals):
        continue
        
    no = ws.cell(r, 1).value
    date_val = ws.cell(r, 2).value
    product = ws.cell(r, 3).value
    qty_order = ws.cell(r, 4).value
    qty_reject = ws.cell(r, 5).value
    defect = ws.cell(r, 6).value
    process = ws.cell(r, 7).value
    action = ws.cell(r, 8).value
    
    if no is not None:
        current_no = str(no).strip().rstrip('.')
    if date_val is not None:
        if isinstance(date_val, datetime):
            current_date = date_val.strftime('%Y-%m-%d')
        else:
            current_date = str(date_val).strip()
            
    if product is not None and str(product).strip() != '':
        current_product = str(product).strip()
    
    if qty_order is not None and str(qty_order).strip() != '':
        try:
            current_qty_order = int(float(qty_order))
        except:
            current_qty_order = 0
            
    prod_str = current_product
    
    # Try to extract class and size
    asme_class = '150'
    nps = '1/2'
    if '#' in prod_str:
        # e.g. SWG (3' # 300), SWG (8" # 150)
        parts = prod_str.split('#')
        if len(parts) > 1:
            class_candidate = parts[1].replace(')', '').strip().split()[0]
            if class_candidate.isdigit():
                asme_class = class_candidate
            else:
                asme_class = '150'
        size_part = parts[0].replace('SWG', '').replace('(', '').replace(')', '').strip().replace("'", '"')
        nps = size_part
    elif 'PN' in prod_str:
        asme_class = 'PN'
        nps = prod_str
    elif prod_str:
        nps = prod_str
        asme_class = 'Other'

    records.append({
        'id': f'REC-{len(records)+1:03d}',
        'no': current_no or '1',
        'date': current_date or '2026-08-24',
        'product': prod_str,
        'nps': nps,
        'asmeClass': asme_class,
        'qtyOrder': current_qty_order,
        'qtyReject': int(qty_reject) if isinstance(qty_reject, (int, float)) and qty_reject is not None else 1,
        'defect': str(defect or '-').strip(),
        'process': str(process or '-').strip(),
        'action': str(action or '-').strip(),
        'notes': ''
    })

print(f'Extracted {len(records)} normalized records.')
with open('extracted_rework.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)
print('Saved clean normalized data to extracted_rework.json')
