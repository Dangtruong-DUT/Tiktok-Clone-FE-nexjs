<?php declare(strict_types = 1);

// osfsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../laravel/framework/src/Illuminate/Translation/PotentiallyTranslatedString.php-PHPStan\BetterReflection\Reflection\ReflectionClass-Illuminate\Translation\PotentiallyTranslatedString
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-e69c42c72391b54a3082149d2c9be25c404bdbde7d33b6c492d625a22977c00c-8.2.30-6.65.0.9',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../laravel/framework/src/Illuminate/Translation/PotentiallyTranslatedString.php',
      ),
    ),
    'namespace' => 'Illuminate\\Translation',
    'name' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
    'shortName' => 'PotentiallyTranslatedString',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => NULL,
    'attributes' => 
    array (
    ),
    'startLine' => 7,
    'endLine' => 101,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => NULL,
    'implementsClassNames' => 
    array (
      0 => 'Stringable',
    ),
    'traitClassNames' => 
    array (
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
      'string' => 
      array (
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'name' => 'string',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The string that may be translated.
 *
 * @var string
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 14,
        'endLine' => 14,
        'startColumn' => 5,
        'endColumn' => 22,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'translation' => 
      array (
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'name' => 'translation',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The translated string.
 *
 * @var string|null
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 21,
        'endLine' => 21,
        'startColumn' => 5,
        'endColumn' => 27,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'translator' => 
      array (
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'name' => 'translator',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The validator that may perform the translation.
 *
 * @var \\Illuminate\\Contracts\\Translation\\Translator
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 28,
        'endLine' => 28,
        'startColumn' => 5,
        'endColumn' => 26,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
    ),
    'immediateMethods' => 
    array (
      '__construct' => 
      array (
        'name' => '__construct',
        'parameters' => 
        array (
          'string' => 
          array (
            'name' => 'string',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 36,
            'endLine' => 36,
            'startColumn' => 33,
            'endColumn' => 39,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'translator' => 
          array (
            'name' => 'translator',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 36,
            'endLine' => 36,
            'startColumn' => 42,
            'endColumn' => 52,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Create a new potentially translated string.
 *
 * @param  string  $string
 * @param  \\Illuminate\\Contracts\\Translation\\Translator  $translator
 */',
        'startLine' => 36,
        'endLine' => 41,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Translation',
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'currentClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'aliasName' => NULL,
      ),
      'translate' => 
      array (
        'name' => 'translate',
        'parameters' => 
        array (
          'replace' => 
          array (
            'name' => 'replace',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 50,
                'endLine' => 50,
                'startTokenPos' => 91,
                'startFilePos' => 995,
                'endTokenPos' => 92,
                'endFilePos' => 996,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 50,
            'endLine' => 50,
            'startColumn' => 31,
            'endColumn' => 43,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
          'locale' => 
          array (
            'name' => 'locale',
            'default' => 
            array (
              'code' => 'null',
              'attributes' => 
              array (
                'startLine' => 50,
                'endLine' => 50,
                'startTokenPos' => 99,
                'startFilePos' => 1009,
                'endTokenPos' => 99,
                'endFilePos' => 1012,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 50,
            'endLine' => 50,
            'startColumn' => 46,
            'endColumn' => 59,
            'parameterIndex' => 1,
            'isOptional' => true,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Translate the string.
 *
 * @param  array  $replace
 * @param  string|null  $locale
 * @return $this
 */',
        'startLine' => 50,
        'endLine' => 55,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Translation',
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'currentClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'aliasName' => NULL,
      ),
      'translateChoice' => 
      array (
        'name' => 'translateChoice',
        'parameters' => 
        array (
          'number' => 
          array (
            'name' => 'number',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 65,
            'endLine' => 65,
            'startColumn' => 37,
            'endColumn' => 43,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'replace' => 
          array (
            'name' => 'replace',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 65,
                'endLine' => 65,
                'startTokenPos' => 152,
                'startFilePos' => 1409,
                'endTokenPos' => 153,
                'endFilePos' => 1410,
              ),
            ),
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'array',
                'isIdentifier' => true,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 65,
            'endLine' => 65,
            'startColumn' => 46,
            'endColumn' => 64,
            'parameterIndex' => 1,
            'isOptional' => true,
          ),
          'locale' => 
          array (
            'name' => 'locale',
            'default' => 
            array (
              'code' => 'null',
              'attributes' => 
              array (
                'startLine' => 65,
                'endLine' => 65,
                'startTokenPos' => 160,
                'startFilePos' => 1423,
                'endTokenPos' => 160,
                'endFilePos' => 1426,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 65,
            'endLine' => 65,
            'startColumn' => 67,
            'endColumn' => 80,
            'parameterIndex' => 2,
            'isOptional' => true,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Translates the string based on a count.
 *
 * @param  \\Countable|int|float|array  $number
 * @param  array  $replace
 * @param  string|null  $locale
 * @return $this
 */',
        'startLine' => 65,
        'endLine' => 70,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Translation',
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'currentClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'aliasName' => NULL,
      ),
      'original' => 
      array (
        'name' => 'original',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the original string.
 *
 * @return string
 */',
        'startLine' => 77,
        'endLine' => 80,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Translation',
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'currentClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'aliasName' => NULL,
      ),
      '__toString' => 
      array (
        'name' => '__toString',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the potentially translated string.
 *
 * @return string
 */',
        'startLine' => 87,
        'endLine' => 90,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Translation',
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'currentClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'aliasName' => NULL,
      ),
      'toString' => 
      array (
        'name' => 'toString',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the potentially translated string.
 *
 * @return string
 */',
        'startLine' => 97,
        'endLine' => 100,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Translation',
        'declaringClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'implementingClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'currentClassName' => 'Illuminate\\Translation\\PotentiallyTranslatedString',
        'aliasName' => NULL,
      ),
    ),
    'traitsData' => 
    array (
      'aliases' => 
      array (
      ),
      'modifiers' => 
      array (
      ),
      'precedences' => 
      array (
      ),
      'hashes' => 
      array (
      ),
    ),
  ),
));