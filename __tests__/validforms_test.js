const WordNet = require('../lib/wordnet');

describe('validForms', () => {
    const exceptions = {
      n: {
        cat: ['cats', 'kitty'],
        dog: ['dogs'],
      },
      v: {
        run: ['ran', 'running'],
        eat: ['ate', 'eating'],
      },
    };
    
    beforeAll(() => {
      const wordnet = new WordNet();
      return wordnet.open();
    });

    afterAll(() => {
      return wordnet.close();
    });

    test('retorna formas válidas para uma string', () => {
       async _ => {
        const validforms = await wordnet.validForms('capricci#n');
        expect(validforms).toContain('capriccio');

        validforms = await wordnet.validForms('copy#v');
        expect(validforms).toEqual(['copy', 'copied'])

        wordnet.exceptions = exceptions;

        validforms = await wordnet.validForms('run#v');
        expect(validforms).toEqual(['run', 'ran', 'running'])
      }
    })
    });

  