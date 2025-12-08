export function getBiologicaStatus() {
  return {
    conexao: 'OK',
    analisesPendentes: 0,
    ultimaAnalise: new Date().toISOString()
  }
}
