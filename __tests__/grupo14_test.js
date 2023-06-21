const Wordnet = require('../lib/wordnet');
const WordNetFile = require('../lib/wordnet-file');
const WNdb = require('wndb-with-exceptions');

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
      
    });
    
});

describe('Teste de lookup', () => {

  let wordnet;

  beforeAll(() => {
    wordnet = new Wordnet();
    return wordnet.open();
  });

  afterAll(() => {
    return wordnet.close();
  });

  it('Testar palavra não desconhecida', () => {
    return wordnet.lookup('jjjjjjj')
      .then((result) => {
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(0);
      });
  });

  it('Teste com relação à estrutura da resposta retornada', () => {
    return wordnet.lookup('cat#n')
      .then((result) => {
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(8);

        const firstResult = result[0];
        expect(firstResult).toHaveProperty('lemma', 'cat');
        expect(firstResult).toHaveProperty('pos', 'n');
        expect(firstResult).toHaveProperty('def');

        expect(firstResult.synonyms).toBeInstanceOf(Array);
      });
  });

  it('Teste para verificar se é case sensitive', () => {
    return wordnet.lookup('PERSON#n')
      .then((result) => {
        expect(result).toBeInstanceOf(Array);
        expect(result).not.toHaveLength(0);
      });
  });

  it('Teste para verificar se a palavra fora do contexto dela, é reconhecido', () => {
    return wordnet.lookup('shop')
      .then((result) => {
        expect(result).toBeInstanceOf(Array);
        expect(result).not.toHaveLength(0);
      });
  });

});

describe('Teste de appendLineChar', () => {
  const dataDir = WNdb.path;
  const fileName = 'noun.exc';

  it('Deve retornar a substring antes da próxima quebra de linha', () => {
    const wordnetFile = new WordNetFile(dataDir, fileName);
    return wordnetFile.open()
      .then(() => {
        const fd = wordnetFile._fd;
        const buff = Buffer.alloc(10);
        const pos = 0;
        const buffPos = 0;

        return wordnetFile.appendLineChar(fd, pos, buffPos, buff)
          .then((result) => {
            expect(result).toEqual('aardwolves aardwolf');
          });
      })
      .finally(() => wordnetFile.close());
  });

  it('Deve retornar a substring antes da próxima quebra de linha a partir da posição 40', () => {
    const wordnetFile = new WordNetFile(dataDir, fileName);

    return wordnetFile.open()
      .then(() => {
        const fd = wordnetFile._fd;
        const buff = Buffer.alloc(10);
        const pos = 40;
        const buffPos = 0;

        return wordnetFile.appendLineChar(fd, pos, buffPos, buff)
          .then((result) => {
            expect(result).toEqual('ux aboideau');
          });
      })
      .finally(() => wordnetFile.close());
  });

});

describe('Teste de findSense', () => {

  let wordnet;
  beforeAll(() => {
    wordnet = new Wordnet();
    return wordnet.open();
  });

  afterAll(() => {
    return wordnet.close();
  });

  it('Teste se falha caso seja usado um valor inválido de posição', () => {
    const invalidInput = 'lie#v#second';
    return wordnet.findSense(invalidInput)
      .catch((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Sense number should be an integer');
      });
  });

  it('Teste se falha caso seja usado um valor inteiro negativo de posição', () => {
    const invalidInput = 'lie#v#-3';
    return wordnet.findSense(invalidInput)
      .catch((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Sense number should be a positive integer');
      });
  });

  it('Teste de se retorna o elemento requerido', () => {
    const validInput = 'cat#n#1';
    return wordnet.findSense(validInput)
      .then((result) => {
        expect(result).toHaveProperty('lemma', 'cat');
        expect(result).toHaveProperty('def', 'feline mammal usually having thick soft fur and no ability to roar: domestic cats');
        expect(result).toHaveProperty('pos', 'n');
      });
  });
});

describe('Teste de loadExceptions', () => {
  let wordnet;

  beforeAll(() => {
    wordnet = new Wordnet();
    return wordnet.open();
  });

  afterAll(() => {
    return wordnet.close();
  });

  it('Testar se as excessões foram carregadas corretamente', () => {
    return wordnet.loadExceptions()
      .then((exceptions) => {
        // Verificar se as exceções foram carregadas corretamente
        expect(exceptions).toBeDefined();
        expect(typeof exceptions).toBe('object');
        expect(Object.keys(exceptions).length).toBeGreaterThan(0);
      });
  });
});