// Importe as bibliotecas necessárias
const WordNet = require('../lib/wordnet');
const wordnet = new WordNet();

// Teste para a função getSynonyms
test('getSynonyms deve retornar sinônimos para um dado synsetOffset and pos', () => {
  // Defina os parâmetros de teste
  const synsetOffset = 3962685;
  const pos = 'n';

  // Chamc a função getSynonyms e verifica se o resultado é uma promise
  return wordnet.open().then( _ => {
    wordnet.getSynonyms(synsetOffset, pos)
      .then((result) => {
        // Verifica se o resultado é um array
        expect(Array.isArray(result)).toBe(true);
        
        // Verifica se cada elemento do array é um objeto com as propriedades esperadas
        result.forEach((synset) => {
          expect(typeof synset).toBe('object');
          expect(synset).toHaveProperty('synsetOffset');
          expect(synset).toHaveProperty('pos');
          
        });
      });
  })
});
