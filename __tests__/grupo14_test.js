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

    it('deveria falhar com string vazia', () => {
      return wordnet.querySense('')
        .then((result) => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it('deveria falhar com palavra inexistente', () => {
      return wordnet.querySense('xxxxxxx#a')
        .then((result) => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

  });


  describe('lookup(word)', () => {

    it('Testar palavra desconhecida', () => {
      return wordnet.lookup('jjjjjjj')
        .then((result) => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    
    it('Testar string vazia', () => {
      return wordnet.lookup('')
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

  describe('findSense(input)', () => {

    it('Teste se falha caso seja usado uma string vazia', () => {
      return wordnet.findSense('')
        .catch((error) => {
          expect(error).toBeInstanceOf(Error);
        });
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

    test('retorna formas válidas para uma string', async () => {
      let validforms = await wordnet.validForms('capricci#n');
      expect(validforms).toContain('capriccio#n');

      validforms = await wordnet.validForms('copy');
      expect(validforms).toEqual(['copy#n', 'copy#v'])

      wordnet.exceptions = exceptions;

      validforms = await wordnet.validForms('run#v');
      expect(validforms).toEqual(['run#v']);
    });

    
    test('deveria retornar array vazia ao passar uma string vazia', async () => {
      let validforms = await wordnet.validForms('');
      expect(validforms).toBeInstanceOf(Array);
      expect(validforms).toHaveLength(0);
    })
  });

});

describe('Teste de funções auxiliares', () => {
  let wordnet;

  beforeAll(() => {
    wordnet = new Wordnet();
    return wordnet.open();
  });

  afterAll(() => {
    return wordnet.close();
  });

  describe('appendLineChar()', () => {
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

  describe('loadExceptions()', () => {
    it('Testar se as excessões foram carregadas corretamente', () => {
      return wordnet.loadExceptions()
        .then((exceptions) => {
          expect(exceptions).toBeDefined();
          expect(typeof exceptions).toBe('object');
          expect(Object.keys(exceptions).length).toBeGreaterThan(0);
        });
    });
  });

  describe('getSynonyms() ', () => {
    // Defina os parâmetros de teste
    const synsetOffset = 3962685;
    const pos = 'n';

    it('deve retornar sinônimos para um dado synsetOffset and pos', () => {
      return wordnet.open().then(() => {
        return wordnet.getSynonyms(synsetOffset, pos)
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
      });
    });
  });

});
/*
//MOCKs ou STUBs
describe('Stub com findSense()', () => {
  let wordnet;
  let cache;

  beforeEach(() => {
    wordnet = new Wordnet();

    cache = {
      data: {},
      get: function (key) {
        return this.data[key] || null;
      },
      set: function (key, value) {
        this.data[key] = value;
      }
    };
    wordnet._cache = cache; // trocar pra analisar só no vazio msm
  });

  it('Teste para ver se a definição solicitada foi armazenada corretamente', () => {
    const input = 'lie#v#7';
    const expectedResult = { lemma: 'lie_down', pos: 'v' };
    cache.set(`findSense:${input}`, expectedResult);

    return wordnet.findSense(input).then((result) => {
      expect(result).toEqual(expectedResult);
    });
  });

});

// Implementação de lookup usando um mock
function lookupMock(input, cache, files) {
  let query;
  const [word, pos] = input.split('#');
  const lword = word.toLowerCase().replace(/\s+/g, '_');

  if (cache) {
    let hit;
    query = `lookup:${input}`;
    if (hit = cache.get(query)) {
      return Promise.resolve(hit);
    }
  }

  const selectedFiles = (!pos) ? Object.values(files) : [files[pos]];
  return Promise.resolve(selectedFiles); // Simulando o resultado esperado
}

// Exemplo de teste usando o mock
test('lookup() should return selected files', () => {
  const cache = new Map();
  const files = {
    n: 'noun_file.txt',
    v: 'verb_file.txt'
};

  const input = 'run#v';
  const expectedResult = ['verb_file.txt'];

  const result = lookupMock(input, cache, files);

  return expect(result).resolves.toEqual(expectedResult);
});

//Teste appendLineChar
function appendLineCharStub(fd, pos, buffPos, buff) {
  const { length } = buff;
  const space = length - buffPos;

  // Mock da função fd.read()
  return Promise.resolve({ bytesRead: 5, buffer: buff }) // Valor de exemplo

    .then(({ bytesRead, buffer }) => {
      for (let i = 0, end = bytesRead - 1; i <= end; i++) {
        if (buff[i] === 10) {
          return buff.slice(0, i).toString('ASCII');
        }
      }

      // Se chegarmos aqui, não encontramos uma quebra de linha, então precisamos tentar novamente.
      // E precisamos de um buffer maior.
      const newBuff = Buffer.alloc(length * 2);
      buff.copy(newBuff, 0, 0, length);
      return appendLineCharStub(fd, pos + length, length, newBuff);
    });
}

// Exemplo de uso do stub
const fd = {}; // Objeto fd simulado
const pos = 0;
const buffPos = 0;
const buff = Buffer.from('Hello\nWorld');

appendLineCharStub(fd, pos, buffPos, buff)
  .then(result => {
    console.log(result); // Saída: "Hello"
  })
  .catch(error => {
    console.error(error);
  });
*/

//Atividade 2
describe("Wordnet API atv 2", () => {
  describe("validForms", () => {
    let wordnet;

    beforeAll(() => {
      wordnet = new Wordnet();
      return wordnet.open();
    });

    afterAll(() => {
      return wordnet.close();
    });

    it('Mostrar que o teste realmente retorna uma Promise', () => {
      const result = wordnet.validForms('word#pos#sense');

      expect(result instanceof Promise).toBe(true);
    });

    it('Mostrar que a resposta à variável inserida vai ser uma excessão', () => {
      wordnet.exceptions = new Promise(() => { });

      const result = wordnet.validForms('word#pos#sense');

      expect(result).toStrictEqual(wordnet.exceptions);
    });

  });
});

// Atividade 3
describe("Testar integração das funções", () => {
  
  describe("validForms", () => {
    let wordnet;

    beforeAll(() => {
      wordnet = new Wordnet();
      return wordnet.open();
    });

    afterAll(() => {
      return wordnet.close();
    });

    it("Simula o retorno da função ValidForms", async () => {
      
      
      const mockedExceptions = ['cats, cat'];
      wordnet.loadExceptions = jest.fn(() => mockedExceptions); // Simula o retorno da função loadExceptions
      wordnet.validFormsWithExceptions = jest.fn(() => true); // Simula o retorno da função validFormsWithExceptions

      const result = await wordnet.validForms('cat#n')

      expect(wordnet.loadExceptions).toHaveBeenCalled();
      expect(wordnet.validFormsWithExceptions).toHaveBeenCalledWith('cat#n', mockedExceptions);
      expect(result).toBe(true);

    })

 

describe('findSense', () => {

     // Mock para simular o cache
  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

// Mock para simular o objeto de arquivos e a função "lookupFromFiles"
  const filesMock = {
    n: 'file_n.txt',
    v: 'file_v.txt',
  };
  const lookupFromFilesMock = jest.fn();

  it('deve retornar o sentido e utilizar o cache', async () => {
    wordnet._cache = cacheMock;
    wordnet._files = filesMock;
    wordnet.lookupFromFiles = lookupFromFilesMock;

    const input = 'word#n#1';
    const expectedResult = 'Definição do sentido';
    cacheMock.get.mockReturnValueOnce(expectedResult);

    const result = await wordnet.findSense(input);

    expect(result).toEqual(expectedResult);
    expect(cacheMock.get).toHaveBeenCalledWith(`findSense:${input}`);
    expect(lookupFromFilesMock).not.toHaveBeenCalled();
    expect(cacheMock.set).not.toHaveBeenCalled();
  });

  it('deve retornar o sentido sem o cache', async () => {
    wordnet._cache = cacheMock;
    wordnet._files = filesMock;
    wordnet.lookupFromFiles = lookupFromFilesMock;

    const input = 'word#n#1';
    const lookupResponse = ['Definição 1', 'Definição 2'];
    lookupFromFilesMock.mockResolvedValue(lookupResponse);
    cacheMock.get.mockReturnValueOnce(null);

    const expectedResult = 'Definição 1';

    const result = await wordnet.findSense(input);

    expect(result).toEqual(expectedResult);
    expect(lookupFromFilesMock).toHaveBeenCalledWith(['file_n.txt'], 'word');
    expect(cacheMock.set).toHaveBeenCalledWith(`findSense:${input}`, expectedResult);
  });


      })

    })
})