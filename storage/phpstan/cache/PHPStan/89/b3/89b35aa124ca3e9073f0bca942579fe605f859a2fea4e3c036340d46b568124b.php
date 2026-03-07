<?php declare(strict_types = 1);

// osfsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../tymon/jwt-auth/src/Factory.php-PHPStan\BetterReflection\Reflection\ReflectionClass-Tymon\JWTAuth\Factory
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-e17bf0f59ebfc6ba77d37b9627ee5d3761945d34ad1f18cb7b03a4727c2a69f5-8.2.30-6.65.0.9',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'Tymon\\JWTAuth\\Factory',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../tymon/jwt-auth/src/Factory.php',
      ),
    ),
    'namespace' => 'Tymon\\JWTAuth',
    'name' => 'Tymon\\JWTAuth\\Factory',
    'shortName' => 'Factory',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => NULL,
    'attributes' => 
    array (
    ),
    'startLine' => 21,
    'endLine' => 252,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => NULL,
    'implementsClassNames' => 
    array (
    ),
    'traitClassNames' => 
    array (
      0 => 'Tymon\\JWTAuth\\Support\\CustomClaims',
      1 => 'Tymon\\JWTAuth\\Support\\RefreshFlow',
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
      'claimFactory' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'name' => 'claimFactory',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The claim factory.
 *
 * @var \\Tymon\\JWTAuth\\Claims\\Factory
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 30,
        'endLine' => 30,
        'startColumn' => 5,
        'endColumn' => 28,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'validator' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'name' => 'validator',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The validator.
 *
 * @var \\Tymon\\JWTAuth\\Validators\\PayloadValidator
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 37,
        'endLine' => 37,
        'startColumn' => 5,
        'endColumn' => 25,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'defaultClaims' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'name' => 'defaultClaims',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[\'iss\', \'iat\', \'exp\', \'nbf\', \'jti\']',
          'attributes' => 
          array (
            'startLine' => 44,
            'endLine' => 50,
            'startTokenPos' => 79,
            'startFilePos' => 892,
            'endTokenPos' => 96,
            'endFilePos' => 973,
          ),
        ),
        'docComment' => '/**
 * The default claims.
 *
 * @var array
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 44,
        'endLine' => 50,
        'startColumn' => 5,
        'endColumn' => 6,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'claims' => 
      array (
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'name' => 'claims',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The claims collection.
 *
 * @var \\Tymon\\JWTAuth\\Claims\\Collection
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 57,
        'endLine' => 57,
        'startColumn' => 5,
        'endColumn' => 22,
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
          'claimFactory' => 
          array (
            'name' => 'claimFactory',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Tymon\\JWTAuth\\Claims\\Factory',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 66,
            'endLine' => 66,
            'startColumn' => 33,
            'endColumn' => 58,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'validator' => 
          array (
            'name' => 'validator',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Tymon\\JWTAuth\\Validators\\PayloadValidator',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 66,
            'endLine' => 66,
            'startColumn' => 61,
            'endColumn' => 87,
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
 * Constructor.
 *
 * @param  \\Tymon\\JWTAuth\\Claims\\Factory  $claimFactory
 * @param  \\Tymon\\JWTAuth\\Validators\\PayloadValidator  $validator
 * @return void
 */',
        'startLine' => 66,
        'endLine' => 71,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'make' => 
      array (
        'name' => 'make',
        'parameters' => 
        array (
          'resetClaims' => 
          array (
            'name' => 'resetClaims',
            'default' => 
            array (
              'code' => 'false',
              'attributes' => 
              array (
                'startLine' => 79,
                'endLine' => 79,
                'startTokenPos' => 169,
                'startFilePos' => 1689,
                'endTokenPos' => 169,
                'endFilePos' => 1693,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 79,
            'endLine' => 79,
            'startColumn' => 26,
            'endColumn' => 45,
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
 * Create the Payload instance.
 *
 * @param  bool  $resetClaims
 * @return \\Tymon\\JWTAuth\\Payload
 */',
        'startLine' => 79,
        'endLine' => 86,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'emptyClaims' => 
      array (
        'name' => 'emptyClaims',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Empty the claims collection.
 *
 * @return $this
 */',
        'startLine' => 93,
        'endLine' => 98,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'addClaims' => 
      array (
        'name' => 'addClaims',
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
            'startLine' => 106,
            'endLine' => 106,
            'startColumn' => 34,
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
 * Add an array of claims to the Payload.
 *
 * @param  array  $claims
 * @return $this
 */',
        'startLine' => 106,
        'endLine' => 113,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'addClaim' => 
      array (
        'name' => 'addClaim',
        'parameters' => 
        array (
          'name' => 
          array (
            'name' => 'name',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 122,
            'endLine' => 122,
            'startColumn' => 33,
            'endColumn' => 37,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'value' => 
          array (
            'name' => 'value',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 122,
            'endLine' => 122,
            'startColumn' => 40,
            'endColumn' => 45,
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
 * Add a claim to the Payload.
 *
 * @param  string  $name
 * @param  mixed  $value
 * @return $this
 */',
        'startLine' => 122,
        'endLine' => 127,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'buildClaims' => 
      array (
        'name' => 'buildClaims',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Build the default claims.
 *
 * @return $this
 */',
        'startLine' => 134,
        'endLine' => 148,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'resolveClaims' => 
      array (
        'name' => 'resolveClaims',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Build out the Claim DTO\'s.
 *
 * @return \\Tymon\\JWTAuth\\Claims\\Collection
 */',
        'startLine' => 155,
        'endLine' => 160,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'buildClaimsCollection' => 
      array (
        'name' => 'buildClaimsCollection',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Build and get the Claims Collection.
 *
 * @return \\Tymon\\JWTAuth\\Claims\\Collection
 */',
        'startLine' => 167,
        'endLine' => 170,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'withClaims' => 
      array (
        'name' => 'withClaims',
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
                'name' => 'Tymon\\JWTAuth\\Claims\\Collection',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 178,
            'endLine' => 178,
            'startColumn' => 32,
            'endColumn' => 49,
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
 * Get a Payload instance with a claims collection.
 *
 * @param  \\Tymon\\JWTAuth\\Claims\\Collection  $claims
 * @return \\Tymon\\JWTAuth\\Payload
 */',
        'startLine' => 178,
        'endLine' => 181,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'setDefaultClaims' => 
      array (
        'name' => 'setDefaultClaims',
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
            'startLine' => 189,
            'endLine' => 189,
            'startColumn' => 38,
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
 * Set the default claims to be added to the Payload.
 *
 * @param  array  $claims
 * @return $this
 */',
        'startLine' => 189,
        'endLine' => 194,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
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
            'startLine' => 202,
            'endLine' => 202,
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
 * Helper to set the ttl.
 *
 * @param  int  $ttl
 * @return $this
 */',
        'startLine' => 202,
        'endLine' => 207,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'getTTL' => 
      array (
        'name' => 'getTTL',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Helper to get the ttl.
 *
 * @return int
 */',
        'startLine' => 214,
        'endLine' => 217,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'getDefaultClaims' => 
      array (
        'name' => 'getDefaultClaims',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the default claims.
 *
 * @return array
 */',
        'startLine' => 224,
        'endLine' => 227,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
        'aliasName' => NULL,
      ),
      'validator' => 
      array (
        'name' => 'validator',
        'parameters' => 
        array (
        ),
        'returnsReference' => false,
        'returnType' => NULL,
        'attributes' => 
        array (
        ),
        'docComment' => '/**
 * Get the PayloadValidator instance.
 *
 * @return \\Tymon\\JWTAuth\\Validators\\PayloadValidator
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
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
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
            'startLine' => 246,
            'endLine' => 246,
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
            'startLine' => 246,
            'endLine' => 246,
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
 * Magically add a claim.
 *
 * @param  string  $method
 * @param  array  $parameters
 * @return $this
 */',
        'startLine' => 246,
        'endLine' => 251,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Tymon\\JWTAuth',
        'declaringClassName' => 'Tymon\\JWTAuth\\Factory',
        'implementingClassName' => 'Tymon\\JWTAuth\\Factory',
        'currentClassName' => 'Tymon\\JWTAuth\\Factory',
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