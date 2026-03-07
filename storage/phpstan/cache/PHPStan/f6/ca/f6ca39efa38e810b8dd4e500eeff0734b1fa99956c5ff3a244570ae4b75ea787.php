<?php declare(strict_types = 1);

// odsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/app/Exceptions/Handler.php-PHPStan\BetterReflection\Reflection\ReflectionClass-App\Exceptions\Handler
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-6.65.0.9-8.2.30-5a3eac394ca1d3c4410fe15ebbb62c09b1936b30640592c11670af83079c456b',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'App\\Exceptions\\Handler',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/app/Exceptions/Handler.php',
      ),
    ),
    'namespace' => 'App\\Exceptions',
    'name' => 'App\\Exceptions\\Handler',
    'shortName' => 'Handler',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => NULL,
    'attributes' => 
    array (
    ),
    'startLine' => 13,
    'endLine' => 129,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => 'Illuminate\\Foundation\\Exceptions\\Handler',
    'implementsClassNames' => 
    array (
    ),
    'traitClassNames' => 
    array (
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
      'dontReport' => 
      array (
        'declaringClassName' => 'App\\Exceptions\\Handler',
        'implementingClassName' => 'App\\Exceptions\\Handler',
        'name' => 'dontReport',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[]',
          'attributes' => 
          array (
            'startLine' => 20,
            'endLine' => 22,
            'startTokenPos' => 68,
            'startFilePos' => 599,
            'endTokenPos' => 72,
            'endFilePos' => 616,
          ),
        ),
        'docComment' => '/**
 * A list of the exception types that are not reported.
 *
 * @var array<int, class-string<Throwable>>
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 20,
        'endLine' => 22,
        'startColumn' => 5,
        'endColumn' => 6,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'dontFlash' => 
      array (
        'declaringClassName' => 'App\\Exceptions\\Handler',
        'implementingClassName' => 'App\\Exceptions\\Handler',
        'name' => 'dontFlash',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[\'current_password\', \'password\', \'password_confirmation\']',
          'attributes' => 
          array (
            'startLine' => 29,
            'endLine' => 33,
            'startTokenPos' => 83,
            'startFilePos' => 779,
            'endTokenPos' => 94,
            'endFilePos' => 866,
          ),
        ),
        'docComment' => '/**
 * A list of the inputs that are never flashed for validation exceptions.
 *
 * @var array<int, string>
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 29,
        'endLine' => 33,
        'startColumn' => 5,
        'endColumn' => 6,
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
      'register' => 
      array (
        'name' => 'register',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => 
        array (
          'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
          'data' => 
          array (
            'name' => 'void',
            'isIdentifier' => true,
          ),
        ),
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Register the exception handling callbacks for the application.
 */',
        'startLine' => 38,
        'endLine' => 45,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Exceptions',
        'declaringClassName' => 'App\\Exceptions\\Handler',
        'implementingClassName' => 'App\\Exceptions\\Handler',
        'currentClassName' => 'App\\Exceptions\\Handler',
        'aliasName' => NULL,
      ),
      'render' => 
      array (
        'name' => 'render',
        'parameters' => 
        array (
          'request' => 
          array (
            'name' => 'request',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 53,
            'endLine' => 53,
            'startColumn' => 28,
            'endColumn' => 35,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'exception' => 
          array (
            'name' => 'exception',
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
            'startLine' => 53,
            'endLine' => 53,
            'startColumn' => 38,
            'endColumn' => 57,
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
 * Render an exception into an HTTP response.
 *
 * @param  \\Illuminate\\Http\\Request  $request
 * @return \\Illuminate\\Http\\Response
 */',
        'startLine' => 53,
        'endLine' => 60,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Exceptions',
        'declaringClassName' => 'App\\Exceptions\\Handler',
        'implementingClassName' => 'App\\Exceptions\\Handler',
        'currentClassName' => 'App\\Exceptions\\Handler',
        'aliasName' => NULL,
      ),
      'handleApiException' => 
      array (
        'name' => 'handleApiException',
        'parameters' => 
        array (
          'exception' => 
          array (
            'name' => 'exception',
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
            'startLine' => 67,
            'endLine' => 67,
            'startColumn' => 41,
            'endColumn' => 60,
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
 * Handle API exceptions.
 *
 * @return \\Illuminate\\Http\\Response
 */',
        'startLine' => 67,
        'endLine' => 128,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 4,
        'namespace' => 'App\\Exceptions',
        'declaringClassName' => 'App\\Exceptions\\Handler',
        'implementingClassName' => 'App\\Exceptions\\Handler',
        'currentClassName' => 'App\\Exceptions\\Handler',
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