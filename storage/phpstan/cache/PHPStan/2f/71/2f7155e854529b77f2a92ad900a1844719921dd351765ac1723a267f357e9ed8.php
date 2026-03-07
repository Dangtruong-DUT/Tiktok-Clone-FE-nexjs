<?php declare(strict_types = 1);

// osfsl-/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../laravel/framework/src/Illuminate/Routing/RouteRegistrar.php-PHPStan\BetterReflection\Reflection\ReflectionClass-Illuminate\Routing\RouteRegistrar
return \PHPStan\Cache\CacheItem::__set_state(array(
   'variableKey' => 'v2-0fcb2b8d3f22cfebbde8316717832ada050bdd92686196f9da7d2eedffa3b7e7-8.2.30-6.65.0.9',
   'data' => 
  array (
    'locatedSource' => 
    array (
      'class' => 'PHPStan\\BetterReflection\\SourceLocator\\Located\\LocatedSource',
      'data' => 
      array (
        'name' => 'Illuminate\\Routing\\RouteRegistrar',
        'filename' => '/Users/nguyendangtruong/Documents/DUT/Orther/project/chat_app/backend/vendor/composer/../laravel/framework/src/Illuminate/Routing/RouteRegistrar.php',
      ),
    ),
    'namespace' => 'Illuminate\\Routing',
    'name' => 'Illuminate\\Routing\\RouteRegistrar',
    'shortName' => 'RouteRegistrar',
    'isInterface' => false,
    'isTrait' => false,
    'isEnum' => false,
    'isBackedEnum' => false,
    'modifiers' => 0,
    'docComment' => '/**
 * @method \\Illuminate\\Routing\\Route any(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\Route delete(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\Route get(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\Route options(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\Route patch(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\Route post(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\Route put(string $uri, \\Closure|array|string|null $action = null)
 * @method \\Illuminate\\Routing\\RouteRegistrar as(string $value)
 * @method \\Illuminate\\Routing\\RouteRegistrar can(\\UnitEnum|string  $ability, array|string $models = [])
 * @method \\Illuminate\\Routing\\RouteRegistrar controller(string $controller)
 * @method \\Illuminate\\Routing\\RouteRegistrar domain(\\BackedEnum|string $value)
 * @method \\Illuminate\\Routing\\RouteRegistrar middleware(array|string|null $middleware)
 * @method \\Illuminate\\Routing\\RouteRegistrar missing(\\Closure $missing)
 * @method \\Illuminate\\Routing\\RouteRegistrar name(\\BackedEnum|string $value)
 * @method \\Illuminate\\Routing\\RouteRegistrar namespace(string|null $value)
 * @method \\Illuminate\\Routing\\RouteRegistrar prefix(string $prefix)
 * @method \\Illuminate\\Routing\\RouteRegistrar scopeBindings()
 * @method \\Illuminate\\Routing\\RouteRegistrar where(array $where)
 * @method \\Illuminate\\Routing\\RouteRegistrar withoutMiddleware(array|string $middleware)
 * @method \\Illuminate\\Routing\\RouteRegistrar withoutScopedBindings()
 */',
    'attributes' => 
    array (
    ),
    'startLine' => 35,
    'endLine' => 313,
    'startColumn' => 1,
    'endColumn' => 1,
    'parentClassName' => NULL,
    'implementsClassNames' => 
    array (
    ),
    'traitClassNames' => 
    array (
      0 => 'Illuminate\\Routing\\CreatesRegularExpressionRouteConstraints',
      1 => 'Illuminate\\Support\\Traits\\Macroable',
    ),
    'immediateConstants' => 
    array (
    ),
    'immediateProperties' => 
    array (
      'router' => 
      array (
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'name' => 'router',
        'modifiers' => 2,
        'type' => NULL,
        'default' => NULL,
        'docComment' => '/**
 * The router instance.
 *
 * @var \\Illuminate\\Routing\\Router
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 47,
        'endLine' => 47,
        'startColumn' => 5,
        'endColumn' => 22,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'attributes' => 
      array (
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'name' => 'attributes',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[]',
          'attributes' => 
          array (
            'startLine' => 54,
            'endLine' => 54,
            'startTokenPos' => 85,
            'startFilePos' => 2284,
            'endTokenPos' => 86,
            'endFilePos' => 2285,
          ),
        ),
        'docComment' => '/**
 * The attributes to pass on to the router.
 *
 * @var array
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 54,
        'endLine' => 54,
        'startColumn' => 5,
        'endColumn' => 31,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'passthru' => 
      array (
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'name' => 'passthru',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[\'get\', \'post\', \'put\', \'patch\', \'delete\', \'options\', \'any\']',
          'attributes' => 
          array (
            'startLine' => 61,
            'endLine' => 63,
            'startTokenPos' => 97,
            'startFilePos' => 2421,
            'endTokenPos' => 120,
            'endFilePos' => 2494,
          ),
        ),
        'docComment' => '/**
 * The methods to dynamically pass through to the router.
 *
 * @var string[]
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 61,
        'endLine' => 63,
        'startColumn' => 5,
        'endColumn' => 6,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'allowedAttributes' => 
      array (
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'name' => 'allowedAttributes',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[\'as\', \'can\', \'controller\', \'domain\', \'middleware\', \'missing\', \'name\', \'namespace\', \'prefix\', \'scopeBindings\', \'where\', \'withoutMiddleware\', \'withoutScopedBindings\']',
          'attributes' => 
          array (
            'startLine' => 70,
            'endLine' => 84,
            'startTokenPos' => 131,
            'startFilePos' => 2635,
            'endTokenPos' => 172,
            'endFilePos' => 2910,
          ),
        ),
        'docComment' => '/**
 * The attributes that can be set through this class.
 *
 * @var string[]
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 70,
        'endLine' => 84,
        'startColumn' => 5,
        'endColumn' => 6,
        'isPromoted' => false,
        'declaredAtCompileTime' => true,
        'immediateVirtual' => false,
        'immediateHooks' => 
        array (
        ),
      ),
      'aliases' => 
      array (
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'name' => 'aliases',
        'modifiers' => 2,
        'type' => NULL,
        'default' => 
        array (
          'code' => '[\'name\' => \'as\', \'scopeBindings\' => \'scope_bindings\', \'withoutScopedBindings\' => \'scope_bindings\', \'withoutMiddleware\' => \'excluded_middleware\']',
          'attributes' => 
          array (
            'startLine' => 91,
            'endLine' => 96,
            'startTokenPos' => 183,
            'startFilePos' => 3020,
            'endTokenPos' => 213,
            'endFilePos' => 3202,
          ),
        ),
        'docComment' => '/**
 * The attributes that are aliased.
 *
 * @var array
 */',
        'attributes' => 
        array (
        ),
        'startLine' => 91,
        'endLine' => 96,
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
      '__construct' => 
      array (
        'name' => '__construct',
        'parameters' => 
        array (
          'router' => 
          array (
            'name' => 'router',
            'default' => NULL,
            'type' => 
            array (
              'class' => 'PHPStan\\BetterReflection\\Reflection\\ReflectionNamedType',
              'data' => 
              array (
                'name' => 'Illuminate\\Routing\\Router',
                'isIdentifier' => false,
              ),
            ),
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 103,
            'endLine' => 103,
            'startColumn' => 33,
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
 * Create a new route registrar instance.
 *
 * @param  \\Illuminate\\Routing\\Router  $router
 */',
        'startLine' => 103,
        'endLine' => 106,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'attribute' => 
      array (
        'name' => 'attribute',
        'parameters' => 
        array (
          'key' => 
          array (
            'name' => 'key',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 117,
            'endLine' => 117,
            'startColumn' => 31,
            'endColumn' => 34,
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
            'startLine' => 117,
            'endLine' => 117,
            'startColumn' => 37,
            'endColumn' => 42,
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
 * Set the value for a given attribute.
 *
 * @param  string  $key
 * @param  mixed  $value
 * @return $this
 *
 * @throws \\InvalidArgumentException
 */',
        'startLine' => 117,
        'endLine' => 150,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'resource' => 
      array (
        'name' => 'resource',
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
            'startLine' => 160,
            'endLine' => 160,
            'startColumn' => 30,
            'endColumn' => 34,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'controller' => 
          array (
            'name' => 'controller',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 160,
            'endLine' => 160,
            'startColumn' => 37,
            'endColumn' => 47,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'options' => 
          array (
            'name' => 'options',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 160,
                'endLine' => 160,
                'startTokenPos' => 526,
                'startFilePos' => 4947,
                'endTokenPos' => 527,
                'endFilePos' => 4948,
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
            'startLine' => 160,
            'endLine' => 160,
            'startColumn' => 50,
            'endColumn' => 68,
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
 * Route a resource to a controller.
 *
 * @param  string  $name
 * @param  string  $controller
 * @param  array  $options
 * @return \\Illuminate\\Routing\\PendingResourceRegistration
 */',
        'startLine' => 160,
        'endLine' => 163,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'apiResource' => 
      array (
        'name' => 'apiResource',
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
            'startLine' => 173,
            'endLine' => 173,
            'startColumn' => 33,
            'endColumn' => 37,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'controller' => 
          array (
            'name' => 'controller',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 173,
            'endLine' => 173,
            'startColumn' => 40,
            'endColumn' => 50,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'options' => 
          array (
            'name' => 'options',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 173,
                'endLine' => 173,
                'startTokenPos' => 578,
                'startFilePos' => 5350,
                'endTokenPos' => 579,
                'endFilePos' => 5351,
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
            'startLine' => 173,
            'endLine' => 173,
            'startColumn' => 53,
            'endColumn' => 71,
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
 * Route an API resource to a controller.
 *
 * @param  string  $name
 * @param  string  $controller
 * @param  array  $options
 * @return \\Illuminate\\Routing\\PendingResourceRegistration
 */',
        'startLine' => 173,
        'endLine' => 176,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'singleton' => 
      array (
        'name' => 'singleton',
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
            'startLine' => 186,
            'endLine' => 186,
            'startColumn' => 31,
            'endColumn' => 35,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'controller' => 
          array (
            'name' => 'controller',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 186,
            'endLine' => 186,
            'startColumn' => 38,
            'endColumn' => 48,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'options' => 
          array (
            'name' => 'options',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 186,
                'endLine' => 186,
                'startTokenPos' => 630,
                'startFilePos' => 5768,
                'endTokenPos' => 631,
                'endFilePos' => 5769,
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
            'startLine' => 186,
            'endLine' => 186,
            'startColumn' => 51,
            'endColumn' => 69,
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
 * Route a singleton resource to a controller.
 *
 * @param  string  $name
 * @param  string  $controller
 * @param  array  $options
 * @return \\Illuminate\\Routing\\PendingSingletonResourceRegistration
 */',
        'startLine' => 186,
        'endLine' => 189,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'apiSingleton' => 
      array (
        'name' => 'apiSingleton',
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
            'startLine' => 199,
            'endLine' => 199,
            'startColumn' => 34,
            'endColumn' => 38,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'controller' => 
          array (
            'name' => 'controller',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 199,
            'endLine' => 199,
            'startColumn' => 41,
            'endColumn' => 51,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'options' => 
          array (
            'name' => 'options',
            'default' => 
            array (
              'code' => '[]',
              'attributes' => 
              array (
                'startLine' => 199,
                'endLine' => 199,
                'startTokenPos' => 682,
                'startFilePos' => 6192,
                'endTokenPos' => 683,
                'endFilePos' => 6193,
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
            'startLine' => 199,
            'endLine' => 199,
            'startColumn' => 54,
            'endColumn' => 72,
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
 * Route an API singleton resource to a controller.
 *
 * @param  string  $name
 * @param  string  $controller
 * @param  array  $options
 * @return \\Illuminate\\Routing\\PendingSingletonResourceRegistration
 */',
        'startLine' => 199,
        'endLine' => 202,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'group' => 
      array (
        'name' => 'group',
        'parameters' => 
        array (
          'callback' => 
          array (
            'name' => 'callback',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 210,
            'endLine' => 210,
            'startColumn' => 27,
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
 * Create a route group with shared attributes.
 *
 * @param  \\Closure|array|string  $callback
 * @return $this
 */',
        'startLine' => 210,
        'endLine' => 215,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'match' => 
      array (
        'name' => 'match',
        'parameters' => 
        array (
          'methods' => 
          array (
            'name' => 'methods',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 225,
            'endLine' => 225,
            'startColumn' => 27,
            'endColumn' => 34,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'uri' => 
          array (
            'name' => 'uri',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 225,
            'endLine' => 225,
            'startColumn' => 37,
            'endColumn' => 40,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'action' => 
          array (
            'name' => 'action',
            'default' => 
            array (
              'code' => 'null',
              'attributes' => 
              array (
                'startLine' => 225,
                'endLine' => 225,
                'startTokenPos' => 767,
                'startFilePos' => 6863,
                'endTokenPos' => 767,
                'endFilePos' => 6866,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 225,
            'endLine' => 225,
            'startColumn' => 43,
            'endColumn' => 56,
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
 * Register a new route with the given verbs.
 *
 * @param  array|string  $methods
 * @param  string  $uri
 * @param  \\Closure|array|string|null  $action
 * @return \\Illuminate\\Routing\\Route
 */',
        'startLine' => 225,
        'endLine' => 228,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'registerRoute' => 
      array (
        'name' => 'registerRoute',
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
            'startLine' => 238,
            'endLine' => 238,
            'startColumn' => 38,
            'endColumn' => 44,
            'parameterIndex' => 0,
            'isOptional' => false,
          ),
          'uri' => 
          array (
            'name' => 'uri',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 238,
            'endLine' => 238,
            'startColumn' => 47,
            'endColumn' => 50,
            'parameterIndex' => 1,
            'isOptional' => false,
          ),
          'action' => 
          array (
            'name' => 'action',
            'default' => 
            array (
              'code' => 'null',
              'attributes' => 
              array (
                'startLine' => 238,
                'endLine' => 238,
                'startTokenPos' => 815,
                'startFilePos' => 7247,
                'endTokenPos' => 815,
                'endFilePos' => 7250,
              ),
            ),
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 238,
            'endLine' => 238,
            'startColumn' => 53,
            'endColumn' => 66,
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
 * Register a new route with the router.
 *
 * @param  string  $method
 * @param  string  $uri
 * @param  \\Closure|array|string|null  $action
 * @return \\Illuminate\\Routing\\Route
 */',
        'startLine' => 238,
        'endLine' => 245,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
      'compileAction' => 
      array (
        'name' => 'compileAction',
        'parameters' => 
        array (
          'action' => 
          array (
            'name' => 'action',
            'default' => NULL,
            'type' => NULL,
            'isVariadic' => false,
            'byRef' => false,
            'isPromoted' => false,
            'attributes' => 
            array (
            ),
            'startLine' => 253,
            'endLine' => 253,
            'startColumn' => 38,
            'endColumn' => 44,
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
 * Compile the action into an array including the attributes.
 *
 * @param  \\Closure|array|string|null  $action
 * @return array
 */',
        'startLine' => 253,
        'endLine' => 276,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 2,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
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
            'startLine' => 287,
            'endLine' => 287,
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
            'startLine' => 287,
            'endLine' => 287,
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
 * Dynamically handle calls into the route registrar.
 *
 * @param  string  $method
 * @param  array  $parameters
 * @return \\Illuminate\\Routing\\Route|$this
 *
 * @throws \\BadMethodCallException
 */',
        'startLine' => 287,
        'endLine' => 312,
        'startColumn' => 5,
        'endColumn' => 5,
        'couldThrow' => false,
        'isClosure' => false,
        'isGenerator' => false,
        'isVariadic' => false,
        'modifiers' => 1,
        'namespace' => 'Illuminate\\Routing',
        'declaringClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'implementingClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'currentClassName' => 'Illuminate\\Routing\\RouteRegistrar',
        'aliasName' => NULL,
      ),
    ),
    'traitsData' => 
    array (
      'aliases' => 
      array (
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
        'illuminate\\support\\traits\\macroable::__call' => 'Illuminate\\Support\\Traits\\Macroable::__call',
      ),
    ),
  ),
));