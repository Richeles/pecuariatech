from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from io import BytesIO
from dto.dashboard_dto import DashboardDTO

def gerar_pdf(dto: dict) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Titulo
    c.setFont("Helvetica-Bold", 16)
    c.drawString(2*cm, height - 2*cm, "RELATORIO EXECUTIVO - PECUARIATECH")
    c.setFont("Helvetica", 10)
    c.drawString(2*cm, height - 2.7*cm, f"Fazenda: {dto.get('user_id', 'N/A')}")
    c.drawString(2*cm, height - 3.2*cm, f"Data: {dto.get('timestamp', 'N/A')}")
    c.drawString(2*cm, height - 3.7*cm, f"Score pi: {dto.get('score_pi', 0)}")
    c.drawString(2*cm, height - 4.2*cm, f"Capital Score: {dto.get('capital_score', 0)}")
    c.drawString(2*cm, height - 4.7*cm, f"Risco Estrutural: {dto.get('risco_estrutural', 'N/A')}")

    # Tabela de indicadores
    data = [
        ['Indicador', 'Valor'],
        ['ROI (%)', dto.get('roi', 0)],
        ['Margem (%)', dto.get('margem', 0)],
        ['EBITDA (R$)', dto.get('ebitda', 0)],
        ['GMD (kg/dia)', dto.get('gmd', 0)],
        ['Lotacao (UA/ha)', dto.get('lotacao', 0)],
    ]
    table = Table(data, colWidths=[6*cm, 4*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
    ]))
    table.wrapOn(c, width, height)
    table.drawOn(c, 2*cm, height - 10*cm)

    c.save()
    buffer.seek(0)
    return buffer.getvalue()