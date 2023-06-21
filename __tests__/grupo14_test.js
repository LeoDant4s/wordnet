const Wordnet = require('../lib/wordnet');

describe('Wordnet API', () => {
    let wordnet;

    beforeAll(() => {
      wordnet = new Wordnet();
      return wordnet.open();
    });
  
    afterAll(() => {
      return wordnet.close();
    });

    describe('open()', () => {
      it('deveria abrir os arquivos de dados com sucesso', () => {
        return wordnet.open()
          .then((result) => {
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(4);
            result.forEach((fileHandlers) => {
              expect(fileHandlers).toBeInstanceOf(Array);
              expect(fileHandlers).toHaveLength(2);
            });
          });
      });
    });

    describe('close()', () => {
      it('deveria fechar os arquivos de dados com sucesso', () => {
        const wordnet = new Wordnet();
        return wordnet.open().then(() => {
          return wordnet.close().then((result) => {
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(4);
            result.forEach((fileHandlers) => {
              expect(fileHandlers).toBeInstanceOf(Array);
              expect(fileHandlers).toHaveLength(2);
              expect(fileHandlers[0]).toBeUndefined();
              expect(fileHandlers[1]).toBeUndefined();
            });
          })
        });
      });

      it('deveria fechar os arquivos de dados com sucesso', () => {
        const wordnet = new Wordnet();
        return wordnet.open().then(() => {
          return wordnet.close().then((result) => {
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(4);
            result.forEach((fileHandlers) => {
              expect(fileHandlers).toBeInstanceOf(Array);
              expect(fileHandlers).toHaveLength(2);
            });
          })
        });
      });
    });

    describe('get(offset, pos)', () => {

        it('deveria obter sucesso ao buscar um offset existente', () => {
          return wordnet.get(4597066, 'n')
            .then((result) => {
                expect(result).toHaveProperty('synsetOffset', 4597066);
                expect(result).toHaveProperty('pos', 'n');
                expect(result).toHaveProperty('wCnt', 1);
                expect(result).toHaveProperty('lemma', 'wood');
                expect(result).toHaveProperty('synonyms');
                expect(result.synonyms).toBeInstanceOf(Array);
                expect(result.synonyms).toHaveLength(1);
                expect(result).toHaveProperty('lexId', '2');
                expect(result).toHaveProperty('ptrs');
                expect(result.ptrs).toBeInstanceOf(Array);
                expect(result.ptrs).toHaveLength(5);
                expect(result).toHaveProperty(
                  'gloss', 
                  'a golf club with a long shaft used to hit long shots; originally made with a wooden head; "metal woods are now standard"  '
                );
                expect(result).toHaveProperty(
                  'def', 
                  'a golf club with a long shaft used to hit long shots'
                );
            });
        });
    
        it("deveria falhar ao usar um offset inválido", () => {
          const result = wordnet.get(3827108, 'n');
          return expect(result).rejects.toThrow(/Invalid synsetOffset/);
        });

        it('deveria falhar ao usar um offset que não seja um inteiro', () => {
          const result = wordnet.get('3827108', 'n');
          return expect(result).rejects.toThrow("Synset offset must be an integer");
        });

        it('deveria falhar ao usar um pos inválido', () => {
          const result = wordnet.get(3827108, false);
          return expect(result).rejects.toThrow("Missing part of speech");
        });
        
    });

    describe('querySense(input)', () => {
      it('deveria obter sucesso', () => {
        return wordnet.querySense('machine')
          .then((result) => {
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(8);  
          });
      });

      it('deveria obter sucesso especificando o tipo da palavra', () => {
        return wordnet.querySense('beautiful#a')
          .then((result) => {
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(2);    
            expect(result).toEqual(['beautiful#a#1', 'beautiful#a#2']);
          });
      });

      it('deveria obter sucesso especificando o tipo da palavra', () => {
        return wordnet.querySense('beautiful#x')
          .then((result) => {
            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(2);    
            expect(result).toEqual(['beautiful#a#1', 'beautiful#a#2']);
          });
      });
    });
    
});