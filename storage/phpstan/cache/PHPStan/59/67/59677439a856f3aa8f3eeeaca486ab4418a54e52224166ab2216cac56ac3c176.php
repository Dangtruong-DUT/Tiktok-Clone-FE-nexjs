<?php declare(strict_types = 1);

// osfsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../tymon/jwt-auth/src/JWTGuard.php-PHPStan\BetterReflection\Reflection\ReflectionClass-Tymon\JWTAuth\JWTGuard
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-e4621e5b04db1aeafdaf9cbd957972265d28cb2533ebfb54348fdc0c1de4d006-8.2.30-6.65.0.9',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'Tymon\\JWTAuth\\JWTGuard',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../tymon/jwt-auth/src/JWTGuard.php',
      ),
    ),
    'namespace' => 'Tymon\\JWTAuth',
    'name' => 'Tymon\\JWTAuth\\JWTGuard',
    'shortName' => 'JWTGuard',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => NULL,
    'attributes' => 
    array (
    ),
    'startLine' => 24,
    'endLine' => 439,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => NULL,
    'implementsClassNames' => 
    array (
      0 => 'Illuminate\\Contracts\\Auth\\Guard',
    ),
    'traitClassNames' => 
    array (
      0 => 'Illuminate\\Auth\\GuardHelpers',
      1 => 'Illuminate\\Support\\Traits\\Macroable',
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
      'lastAttempted' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'name' => 'lastAttempted',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The user we last attempted to retrieve.
 *
 * @var \\Illuminate\\Contracts\\Auth\\Authenticatable
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 35,
        'endLine' => 35,
        'startColumn' => 5,
        'endColumn' => 29,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'jwt' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'name' => 'jwt',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The JWT instance.
 *
 * @var \\Tymon\\JWTAuth\\JWT
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 42,
        'endLine' => 42,
        'startColumn' => 5,
        'endColumn' => 19,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'request' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'name' => 'request',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The request instance.
 *
 * @var \\Illuminate\\Http\\Request
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 49,
        'endLine' => 49,
        'startColumn' => 5,
        'endColumn' => 23,
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
          'jwt' => 
          array (
            'name' => 'jwt',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Tymon\\JWTAuth\\JWT',
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
            'startColumn' => 33,
            'endColumn' => 40,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'provider' => 
          array (
            'name' => 'provider',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Illuminate\\Contracts\\Auth\\UserProvider',
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
            'startColumn' => 43,
            'endColumn' => 64,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'request' => 
          array (
            'name' => 'request',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Illuminate\\Http\\Request',
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
            'startColumn' => 67,
            'endColumn' => 82,
            'parameterIndex' => 2,
            'isOptional' => false,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Instantiate the class.
 *
 * @param  \\Tymon\\JWTAuth\\JWT  $jwt
 * @param  \\Illuminate\\Contracts\\Auth\\UserProvider  $provider
 * @param  \\Illuminate\\Http\\Request  $request
 * @return void
 */',
        'startLine' => 59,
        'endLine' => 64,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'user' => 
      array (
        'name' => 'user',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the currently authenticated user.
 *
 * @return \\Illuminate\\Contracts\\Auth\\Authenticatable|null
 */',
        'startLine' => 71,
        'endLine' => 83,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'userOrFail' => 
      array (
        'name' => 'userOrFail',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the currently authenticated user or throws an exception.
 *
 * @return \\Illuminate\\Contracts\\Auth\\Authenticatable
 *
 * @throws \\Tymon\\JWTAuth\\Exceptions\\UserNotDefinedException
 */',
        'startLine' => 92,
        'endLine' => 99,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'validate' => 
      array (
        'name' => 'validate',
        'parameters' => 
        array (
          'credentials' => 
          array (
            'name' => 'credentials',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 107,
                'endLine' => 107,
                'startTokenPos' => 324,
                'startFilePos' => 2557,
                'endTokenPos' => 325,
                'endFilePos' => 2558,
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
            'startLine' => 107,
            'endLine' => 107,
            'startColumn' => 30,
            'endColumn' => 52,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Validate a user\'s credentials.
 *
 * @param  array  $credentials
 * @return bool
 */',
        'startLine' => 107,
        'endLine' => 110,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'attempt' => 
      array (
        'name' => 'attempt',
        'parameters' => 
        array (
          'credentials' => 
          array (
            'name' => 'credentials',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 119,
                'endLine' => 119,
                'startTokenPos' => 361,
                'startFilePos' => 2885,
                'endTokenPos' => 362,
                'endFilePos' => 2886,
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
            'startLine' => 119,
            'endLine' => 119,
            'startColumn' => 29,
            'endColumn' => 51,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
          'login' => 
          array (
            'name' => 'login',
            'default' => 
            array (
              'code' => 'true',
              'attributes' => 
              array (
                'startLine' => 119,
                'endLine' => 119,
                'startTokenPos' => 369,
                'startFilePos' => 2898,
                'endTokenPos' => 369,
                'endFilePos' => 2901,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 119,
            'endLine' => 119,
            'startColumn' => 54,
            'endColumn' => 66,
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
 * Attempt to authenticate the user using the given credentials and return the token.
 *
 * @param  array  $credentials
 * @param  bool  $login
 * @return bool|string
 */',
        'startLine' => 119,
        'endLine' => 128,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'login' => 
      array (
        'name' => 'login',
        'parameters' => 
        array (
          'user' => 
          array (
            'name' => 'user',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Tymon\\JWTAuth\\Contracts\\JWTSubject',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 136,
            'endLine' => 136,
            'startColumn' => 27,
            'endColumn' => 42,
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
 * Create a token for a user.
 *
 * @param  \\Tymon\\JWTAuth\\Contracts\\JWTSubject  $user
 * @return string
 */',
        'startLine' => 136,
        'endLine' => 142,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'logout' => 
      array (
        'name' => 'logout',
        'parameters' => 
        array (
          'forceForever' => 
          array (
            'name' => 'forceForever',
            'default' => 
            array (
              'code' => 'false',
              'attributes' => 
              array (
                'startLine' => 150,
                'endLine' => 150,
                'startTokenPos' => 498,
                'startFilePos' => 3650,
                'endTokenPos' => 498,
                'endFilePos' => 3654,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 150,
            'endLine' => 150,
            'startColumn' => 28,
            'endColumn' => 48,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Logout the user, thus invalidating the token.
 *
 * @param  bool  $forceForever
 * @return void
 */',
        'startLine' => 150,
        'endLine' => 156,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'refresh' => 
      array (
        'name' => 'refresh',
        'parameters' => 
        array (
          'forceForever' => 
          array (
            'name' => 'forceForever',
            'default' => 
            array (
              'code' => 'false',
              'attributes' => 
              array (
                'startLine' => 165,
                'endLine' => 165,
                'startTokenPos' => 547,
                'startFilePos' => 3975,
                'endTokenPos' => 547,
                'endFilePos' => 3979,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 165,
            'endLine' => 165,
            'startColumn' => 29,
            'endColumn' => 49,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
          'resetClaims' => 
          array (
            'name' => 'resetClaims',
            'default' => 
            array (
              'code' => 'false',
              'attributes' => 
              array (
                'startLine' => 165,
                'endLine' => 165,
                'startTokenPos' => 554,
                'startFilePos' => 3997,
                'endTokenPos' => 554,
                'endFilePos' => 4001,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 165,
            'endLine' => 165,
            'startColumn' => 52,
            'endColumn' => 71,
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
 * Refresh the token.
 *
 * @param  bool  $forceForever
 * @param  bool  $resetClaims
 * @return string
 */',
        'startLine' => 165,
        'endLine' => 168,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'invalidate' => 
      array (
        'name' => 'invalidate',
        'parameters' => 
        array (
          'forceForever' => 
          array (
            'name' => 'forceForever',
            'default' => 
            array (
              'code' => 'false',
              'attributes' => 
              array (
                'startLine' => 176,
                'endLine' => 176,
                'startTokenPos' => 590,
                'startFilePos' => 4261,
                'endTokenPos' => 590,
                'endFilePos' => 4265,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 176,
            'endLine' => 176,
            'startColumn' => 32,
            'endColumn' => 52,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Invalidate the token.
 *
 * @param  bool  $forceForever
 * @return \\Tymon\\JWTAuth\\JWT
 */',
        'startLine' => 176,
        'endLine' => 179,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'tokenById' => 
      array (
        'name' => 'tokenById',
        'parameters' => 
        array (
          'id' => 
          array (
            'name' => 'id',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 187,
            'endLine' => 187,
            'startColumn' => 31,
            'endColumn' => 33,
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
 * Create a new token by User id.
 *
 * @param  mixed  $id
 * @return string|null
 */',
        'startLine' => 187,
        'endLine' => 192,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'once' => 
      array (
        'name' => 'once',
        'parameters' => 
        array (
          'credentials' => 
          array (
            'name' => 'credentials',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 200,
                'endLine' => 200,
                'startTokenPos' => 673,
                'startFilePos' => 4812,
                'endTokenPos' => 674,
                'endFilePos' => 4813,
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
            'startLine' => 200,
            'endLine' => 200,
            'startColumn' => 26,
            'endColumn' => 48,
            'parameterIndex' => 0,
            'isOptional' => true,
          ),
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Log a user into the application using their credentials.
 *
 * @param  array  $credentials
 * @return bool
 */',
        'startLine' => 200,
        'endLine' => 209,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'onceUsingId' => 
      array (
        'name' => 'onceUsingId',
        'parameters' => 
        array (
          'id' => 
          array (
            'name' => 'id',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 217,
            'endLine' => 217,
            'startColumn' => 33,
            'endColumn' => 35,
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
 * Log the given User into the application.
 *
 * @param  mixed  $id
 * @return bool
 */',
        'startLine' => 217,
        'endLine' => 226,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'byId' => 
      array (
        'name' => 'byId',
        'parameters' => 
        array (
          'id' => 
          array (
            'name' => 'id',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 234,
            'endLine' => 234,
            'startColumn' => 26,
            'endColumn' => 28,
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
 * Alias for onceUsingId.
 *
 * @param  mixed  $id
 * @return bool
 */',
        'startLine' => 234,
        'endLine' => 237,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'claims' => 
      array (
        'name' => 'claims',
        'parameters' => 
        array (
          'claims' => 
          array (
            'name' => 'claims',
            'default' => NULL,
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
            'startLine' => 245,
            'endLine' => 245,
            'startColumn' => 28,
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
 * Add any custom claims.
 *
 * @param  array  $claims
 * @return $this
 */',
        'startLine' => 245,
        'endLine' => 250,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'getPayload' => 
      array (
        'name' => 'getPayload',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the raw Payload instance.
 *
 * @return \\Tymon\\JWTAuth\\Payload
 */',
        'startLine' => 257,
        'endLine' => 260,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'payload' => 
      array (
        'name' => 'payload',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Alias for getPayload().
 *
 * @return \\Tymon\\JWTAuth\\Payload
 */',
        'startLine' => 267,
        'endLine' => 270,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'setToken' => 
      array (
        'name' => 'setToken',
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
            'startLine' => 278,
            'endLine' => 278,
            'startColumn' => 30,
            'endColumn' => 35,
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
 * Set the token.
 *
 * @param  \\Tymon\\JWTAuth\\Token|string  $token
 * @return $this
 */',
        'startLine' => 278,
        'endLine' => 283,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'setTTL' => 
      array (
        'name' => 'setTTL',
        'parameters' => 
        array (
          'ttl' => 
          array (
            'name' => 'ttl',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 291,
            'endLine' => 291,
            'startColumn' => 28,
            'endColumn' => 31,
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
 * Set the token ttl.
 *
 * @param  int  $ttl
 * @return $this
 */',
        'startLine' => 291,
        'endLine' => 296,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'getProvider' => 
      array (
        'name' => 'getProvider',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the user provider used by the guard.
 *
 * @return \\Illuminate\\Contracts\\Auth\\UserProvider
 */',
        'startLine' => 303,
        'endLine' => 306,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'setProvider' => 
      array (
        'name' => 'setProvider',
        'parameters' => 
        array (
          'provider' => 
          array (
            'name' => 'provider',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Illuminate\\Contracts\\Auth\\UserProvider',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 314,
            'endLine' => 314,
            'startColumn' => 33,
            'endColumn' => 54,
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
 * Set the user provider used by the guard.
 *
 * @param  \\Illuminate\\Contracts\\Auth\\UserProvider  $provider
 * @return $this
 */',
        'startLine' => 314,
        'endLine' => 319,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'getUser' => 
      array (
        'name' => 'getUser',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Return the currently cached user.
 *
 * @return \\Illuminate\\Contracts\\Auth\\Authenticatable|null
 */',
        'startLine' => 326,
        'endLine' => 329,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'getRequest' => 
      array (
        'name' => 'getRequest',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the current request instance.
 *
 * @return \\Illuminate\\Http\\Request
 */',
        'startLine' => 336,
        'endLine' => 339,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'setRequest' => 
      array (
        'name' => 'setRequest',
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
                'name' => 'Illuminate\\Http\\Request',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 347,
            'endLine' => 347,
            'startColumn' => 32,
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
        'docComment' => '/**
 * Set the current request instance.
 *
 * @param  \\Illuminate\\Http\\Request  $request
 * @return $this
 */',
        'startLine' => 347,
        'endLine' => 352,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'factory' => 
      array (
        'name' => 'factory',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the token\'s auth factory.
 *
 * @return \\Tymon\\JWTAuth\\Factory
 */',
        'startLine' => 359,
        'endLine' => 362,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'getLastAttempted' => 
      array (
        'name' => 'getLastAttempted',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the last user we attempted to authenticate.
 *
 * @return \\Illuminate\\Contracts\\Auth\\Authenticatable
 */',
        'startLine' => 369,
        'endLine' => 372,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'hasValidCredentials' => 
      array (
        'name' => 'hasValidCredentials',
        'parameters' => 
        array (
          'user' => 
          array (
            'name' => 'user',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 381,
            'endLine' => 381,
            'startColumn' => 44,
            'endColumn' => 48,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'credentials' => 
          array (
            'name' => 'credentials',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 381,
            'endLine' => 381,
            'startColumn' => 51,
            'endColumn' => 62,
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
 * Determine if the user matches the credentials.
 *
 * @param  mixed  $user
 * @param  array  $credentials
 * @return bool
 */',
        'startLine' => 381,
        'endLine' => 384,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'validateSubject' => 
      array (
        'name' => 'validateSubject',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Ensure the JWTSubject matches what is in the token.
 *
 * @return bool
 */',
        'startLine' => 391,
        'endLine' => 400,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      'requireToken' => 
      array (
        'name' => 'requireToken',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Ensure that a token is available in the request.
 *
 * @return \\Tymon\\JWTAuth\\JWT
 *
 * @throws \\Tymon\\JWTAuth\\Exceptions\\JWTException
 */',
        'startLine' => 409,
        'endLine' => 416,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
      '__call' => 
      array (
        'name' => '__call',
        'parameters' => 
        array (
          'method' => 
          array (
            'name' => 'method',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 427,
            'endLine' => 427,
            'startColumn' => 28,
            'endColumn' => 34,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'parameters' => 
          array (
            'name' => 'parameters',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 427,
            'endLine' => 427,
            'startColumn' => 37,
            'endColumn' => 47,
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
 * Magically call the JWT instance.
 *
 * @param  string  $method
 * @param  array  $parameters
 * @return mixed
 *
 * @throws \\BadMethodCallException
 */',
        'startLine' => 427,
        'endLine' => 438,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'implementingClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'currentClassName' => 'Tymon\\JWTAuth\\JWTGuard',
        'aliasName' => NULL,
      ),
    ),
    'traitsData' => 
    array (
      'aliases' => 
      array (
        'Illuminate\\Auth\\GuardHelpers' => 
        array (
          0 => 
          array (
            'alias' => 'macroCall',
            'method' => '__call',
            'hash' => 'illuminate\\auth\\guardhelpers::__call',
          ),
        ),
        'Illuminate\\Support\\Traits\\Macroable' => 
        array (
          0 => 
          array (
            'alias' => 'macroCall',
            'method' => '__call',
            'hash' => 'illuminate\\support\\traits\\macroable::__call',
          ),
        ),
      ),
      'modifiers' => 
      array (
      ),
      'precedences' => 
      array (
      ),
      'hashes' => 
      array (
        'illuminate\\auth\\guardhelpers::__call' => 'Illuminate\\Auth\\GuardHelpers::__call',
        'illuminate\\support\\traits\\macroable::__call' => 'Illuminate\\Support\\Traits\\Macroable::__call',
      ),
    ),
  ),
));