<?php declare(strict_types = 1);

// odsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/app/Http/Controllers/Api/AuthController.php-PHPStan\BetterReflection\Reflection\ReflectionClass-App\Http\Controllers\Api\AuthController
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-6.65.0.9-8.2.30-ad25b7f1b05e9c7456e00683409a2ded048a321d39dabbd2703d4207e73c0629',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'App\\Http\\Controllers\\Api\\AuthController',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/app/Http/Controllers/Api/AuthController.php',
      ),
    ),
    'namespace' => 'App\\Http\\Controllers\\Api',
    'name' => 'App\\Http\\Controllers\\Api\\AuthController',
    'shortName' => 'AuthController',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => NULL,
    'attributes' => 
    array (
    ),
    'startLine' => 11,
    'endLine' => 90,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => 'App\\Http\\Controllers\\Controller',
    'implementsClassNames' => 
    array (
      0 => 'Illuminate\\Routing\\Controllers\\HasMiddleware',
    ),
    'traitClassNames' => 
    array (
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
    ),
    'immediateMethods' => 
    array (
      'middleware' => 
      array (
        'name' => 'middleware',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => 
        array (
          'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
          'data' => 
          array (
            'name' => 'array',
            'isIdentifier' => true,
          ),
        ),
        'attributes' => 
        array (
        ),
        'docComment' => NULL,
        'startLine' => 15,
        'endLine' => 20,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 17,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'aliasName' => NULL,
      ),
      'login' => 
      array (
        'name' => 'login',
        'parameters' => 
        array (
          'request' => 
          array (
            'name' => 'request',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'App\\Http\\Requests\\Auth\\LoginRequest',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 23,
            'endLine' => 23,
            'startColumn' => 27,
            'endColumn' => 47,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => NULL,
        'startLine' => 23,
        'endLine' => 31,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'aliasName' => NULL,
      ),
      'me' => 
      array (
        'name' => 'me',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the authenticated User
 *
 * @return \\Illuminate\\Http\\JsonResponse
 */',
        'startLine' => 38,
        'endLine' => 41,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'aliasName' => NULL,
      ),
      'logout' => 
      array (
        'name' => 'logout',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Log the user out (Invalidate the token)
 *
 * @return \\Illuminate\\Http\\JsonResponse
 */',
        'startLine' => 48,
        'endLine' => 53,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'aliasName' => NULL,
      ),
      'refresh' => 
      array (
        'name' => 'refresh',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Refresh a token.
 *
 * @return \\Illuminate\\Http\\JsonResponse
 */',
        'startLine' => 60,
        'endLine' => 63,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'aliasName' => NULL,
      ),
      'respondWithToken' => 
      array (
        'name' => 'respondWithToken',
        'parameters' => 
        array (
          'token' => 
          array (
            'name' => 'token',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 72,
            'endLine' => 72,
            'startColumn' => 41,
            'endColumn' => 46,
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
 * Get the token array structure.
 *
 * @param  string $token
 *
 * @return \\Illuminate\\Http\\JsonResponse
 */',
        'startLine' => 72,
        'endLine' => 79,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'aliasName' => NULL,
      ),
      'guard' => 
      array (
        'name' => 'guard',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the guard to be used during authentication.
 *
 * @return \\Illuminate\\Contracts\\Auth\\Guard
 */',
        'startLine' => 86,
        'endLine' => 89,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'App\\Http\\Controllers\\Api',
        'declaringClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'implementingClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
        'currentClassName' => 'App\\Http\\Controllers\\Api\\AuthController',
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