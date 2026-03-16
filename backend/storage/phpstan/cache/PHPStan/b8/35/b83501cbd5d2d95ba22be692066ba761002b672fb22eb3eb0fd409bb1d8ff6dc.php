<?php declare(strict_types = 1);

// osfsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../laravel/framework/src/Illuminate/Foundation/Exceptions/ReportableHandler.php-PHPStan\BetterReflection\Reflection\ReflectionClass-Illuminate\Foundation\Exceptions\ReportableHandler
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-c1d7bba78db63e0a6b30d1aa208b2d450c64f980d0c22ccb14d989f2227e0eba-8.2.30-6.65.0.9',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../laravel/framework/src/Illuminate/Foundation/Exceptions/ReportableHandler.php',
      ),
    ),
    'namespace' => 'Illuminate\\Foundation\\Exceptions',
    'name' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
    'shortName' => 'ReportableHandler',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => NULL,
    'attributes' => 
    array (
    ),
    'startLine' => 8,
    'endLine' => 81,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => NULL,
    'implementsClassNames' => 
    array (
    ),
    'traitClassNames' => 
    array (
      0 => 'Illuminate\\Support\\Traits\\ReflectsClosures',
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
      'callback' => 
      array (
        'declaringClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'implementingClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'name' => 'callback',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The underlying callback.
 *
 * @var callable
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 17,
        'endLine' => 17,
        'startColumn' => 5,
        'endColumn' => 24,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'shouldStop' => 
      array (
        'declaringClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'implementingClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'name' => 'shouldStop',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => 'false',
          'attributes' => 
          array (
            'startLine' => 24,
            'endLine' => 24,
            'startTokenPos' => 43,
            'startFilePos' => 410,
            'endTokenPos' => 43,
            'endFilePos' => 414,
          ),
        ),
        'docComment' => '/**
 * Indicates if reporting should stop after invoking this handler.
 *
 * @var bool
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 24,
        'endLine' => 24,
        'startColumn' => 5,
        'endColumn' => 34,
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
          'callback' => 
          array (
            'name' => 'callback',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'callable',
                'isIdentifier' => true,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 31,
            'endLine' => 31,
            'startColumn' => 33,
            'endColumn' => 50,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Create a new reportable handler instance.
 *
 * @param  callable  $callback
 */',
        'startLine' => 31,
        'endLine' => 34,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Foundation\\Exceptions',
        'declaringClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'implementingClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'currentClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'aliasName' => NULL,
      ),
      '__invoke' => 
      array (
        'name' => '__invoke',
        'parameters' => 
        array (
          'e' => 
          array (
            'name' => 'e',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Throwable',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 42,
            'endLine' => 42,
            'startColumn' => 30,
            'endColumn' => 41,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Invoke the handler.
 *
 * @param  \\Throwable  $e
 * @return bool
 */',
        'startLine' => 42,
        'endLine' => 51,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Foundation\\Exceptions',
        'declaringClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'implementingClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'currentClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'aliasName' => NULL,
      ),
      'handles' => 
      array (
        'name' => 'handles',
        'parameters' => 
        array (
          'e' => 
          array (
            'name' => 'e',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Throwable',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 59,
            'endLine' => 59,
            'startColumn' => 29,
            'endColumn' => 40,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Determine if the callback handles the given exception.
 *
 * @param  \\Throwable  $e
 * @return bool
 */',
        'startLine' => 59,
        'endLine' => 68,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Foundation\\Exceptions',
        'declaringClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'implementingClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'currentClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'aliasName' => NULL,
      ),
      'stop' => 
      array (
        'name' => 'stop',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Indicate that report handling should stop after invoking this callback.
 *
 * @return $this
 */',
        'startLine' => 75,
        'endLine' => 80,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Foundation\\Exceptions',
        'declaringClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'implementingClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
        'currentClassName' => 'Illuminate\\Foundation\\Exceptions\\ReportableHandler',
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