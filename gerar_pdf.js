const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function criarPDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 400]);
  const { height } = page.getSize();

  // Título
  page.drawText('Movimentações Financeiras', {
    x: 50,
    y: height - 50,
    size: 18,
    color: rgb(0, 0, 0),
  });

  // Cabeçalho
  const headers = ['Descrição', 'Tipo', 'Valor', 'Categoria', 'Data'];
  const rows = [
    ['Venda de gado', 'receita', '5000', 'Venda', '2026-06-01'],
    ['Compra de ração', 'despesa', '1200', 'Alimentação', '2026-06-05'],
    ['Serviço veterinário', 'despesa', '300', 'Sanidade', '2026-06-10'],
  ];

  let y = height - 100;
  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], {
      x: 50 + i * 100,
      y,
      size: 12,
      color: rgb(0, 0, 0),
    });
  }
  y -= 20;

  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      page.drawText(row[i], {
        x: 50 + i * 100,
        y,
        size: 10,
        color: rgb(0, 0, 0),
      });
    }
    y -= 18;
  }

  const pdfBytes = await doc.save();
  fs.writeFileSync('teste_financeiro.pdf', pdfBytes);
  console.log('✅ PDF gerado: teste_financeiro.pdf');
}

criarPDF().catch(console.error);