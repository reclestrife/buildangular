
describe('injector', function() {

    beforeEach(function() {
        delete window.angular;
        setupModuleLoader(window);
    });

    it('can be created', function() {
        var injector = createInjector([]);
        expect(injector).toBeDefined();
    });

    it('can inject a constant to a module', function() {
        var module = window.angular.module('myModule', []);
        module.constant('aConstant', 42);
        var injector = createInjector(['myModule']);
        expect(injector.has('aConstant')).toBe(true);
    });

    it('can inject a constant to a module', function() {
        var module = window.angular.module('myModule', []);
        var injector = createInjector(['myModule']);
        expect(injector.has('aConstant')).toBe(false);
    });

    it('can return a registered constant value', function() {
        var module = window.angular.module('myModule', []);
        module.constant('aConstant', 43);
        var injector = createInjector(['myModule']);
        expect(injector.get('aConstant')).toBe(43);
    });

    it('can return a registered constant on a required module', function() {
        var module1 = window.angular.module('myModule1', []);
        var module2 = window.angular.module('myModule2', ['myModule1']);
        module1.constant('constant1', 1);
        module2.constant('constant2', 2);
        var injector = createInjector(['myModule2']);
        expect(injector.get('constant2')).toBe(2);
        expect(injector.get('constant1')).toBe(1);
    });

    it('can invoke an annotated function with dependency injection', function() {
        var module = window.angular.module('myModule', []);
        module.constant('a', 20);
        module.constant('b', 21);
        var injector = createInjector(['myModule']);
        var fn = function(a, b) {
            return a + b;
        };
        fn.$inject = ['a', 'b'];
        expect(injector.invoke(fn)).toBe(41);
    });

    it('can invoke an annotated function with given context', function() {
        var module = window.angular.module('myModule', []);
        module.constant('a', 20);
        module.constant('b', 21);
        var injector = createInjector(['myModule']);

        var obj = { c: 10 };
        var fn = function(a, b) {
            return a + b + this.c;
        };
        fn.$inject = ['a', 'b'];
        expect(injector.invoke(fn, obj)).toBe(51);
    });

    it('can instantiate an object with dependency injection', function() {
        var module = window.angular.module('myModule', []);
        module.constant('a', 1);
        module.constant('b', 3);

        var injector = createInjector(['myModule']);
        function Type(a, b) {
            this.value = a + b;
        }
        Type.$inject = ['a', 'b'];

        var instant = injector.instantiate(Type);
        expect(instant.value).toBe(4);
    });


    it('allows to register provider with $get', function() {
        var module = window.angular.module('myModule', []);
        module.provider('a', {
            $get: function() {
                return 42;
            }
        });

        var injector = createInjector(['myModule']);
        expect(injector.has('a')).toBe(true);
        expect(injector.get('a')).toBe(42);
    });

    it('injects the $get method of a provider', function() {
        var module = window.angular.module('myModule', []);
        var get = function(a) { return a + 1; };
        get.$inject = ['a'];

        module.constant('a', 21);
        module.provider('b', {
            $get: get
        });

        var injector = createInjector(['myModule']);
        expect(injector.has('b')).toBe(true);
        expect(injector.get('b')).toBe(22);
    });

    it('provides the $get method injection lazily', function() {
        var module = window.angular.module('myModule', []);

        var getb = function(a) {
            return a + 1;
        };
        getb.$inject = ['a'];
        module.provider('b', {
            $get: getb
        });

        var geta = function() {
            return 21;
        };
        module.provider('a', {
            $get: geta
        });

        var injector = createInjector(['myModule']);
        expect(injector.has('b')).toBe(true);
        expect(injector.get('b')).toBe(22);
    });

    it('instantiate instance only once', function() {
        var module = window.angular.module('myModule', []);
        module.provider('a', {
            $get: function() {
                return {};
            }
        });
        var injector = createInjector(['myModule']);
        expect(injector.get('a')).toBe(injector.get('a'));
    });

    it('instantiate a provider if given a constructor style function', function() {
        var module = window.angular.module('myModule', []);
        module.constant('a', 21);
        var BProvider = function(a) {
            this.$get = function() {
                return a + 1;
            };
        };
        BProvider.$inject = ['a'];
        module.provider('b', BProvider);

        var injector = createInjector(['myModule']);
        expect(injector.has('b')).toBe(true);
        expect(injector.get('b')).toBe(22);
    });

    it('injects to another provider to a provider constructor', function() {
        var module = window.angular.module('myModule', []);
        var AProvider = function() {
            var value = 1;
            this.setValue = function(v) { value = v; };
            this.$get = function() {
                return value;
            }
        };
        module.provider('a', AProvider);
        var BProvider = function(aProvider) {
            aProvider.setValue(2);
            this.$get = function() {};
        };
        BProvider.$inject = ['aProvider'];
        module.provider('b', BProvider);

        var injector = createInjector(['myModule']);
        expect(injector.get('a')).toBe(2);
    });

    it('does not inject an instance to a provider constructor function', function() {
        var module = window.angular.module('myModule', []);
        module.provider('a', function AProvider() {
            this.$get = function() { return 1; };
        });
        var BProvider = function(a) {
            this.$get = function() {
                return a + 1;
            };
        };
        BProvider.$inject = ['a'];
        module.provider('b', BProvider);

        // var injector = createInjector(['myModule']);
        // expect(injector.get('b')).toBe(2)

        expect(function() {
            createInjector(['myModule']);
        }).toThrow();
    });

    it('does not inject providers to $get method', function() {
        var module = window.angular.module('myModule', []);
        module.provider('a', function AProvider() {
            this.$get = function() { return 1; };
        });
        module.provider('b', function BProvider() {
            var get = function(aProvider) {
                return aProvider.$get() + 2;
            };
            get.$inject = ['aProvider'];
            this.$get = get;
        });
        var injector = createInjector(['myModule']);
        // expect(injector.get('b')).toBe(3);
        expect(function() {
            injector.get('b');
        }).toThrow();
    });

    it('injects the $injector to $get', function() {
        var module = window.angular.module('myModule', []);
        module.constant('a', 32);
        module.provider('b', function BProvider() {
            var get = function($injector) {
                return $injector.get('a');
            };
            get.$inject = ['$injector'];
            this.$get = get;
        });
        var injector = createInjector(['myModule']);
        expect(injector.get('b')).toBe(32);

    });

    it('injects the $provide to providers', function() {
        var module = window.angular.module('myModule', []);
        var AProvider = function($provide) {
            $provide.constant('b', 32);
            var get = function(b) {
                return b + 1;
            };
            get.$inject = ['b'];
            this.$get = get;
        };
        AProvider.$inject = ['$provide'];
        module.provider('a', AProvider);

        var injector = createInjector(['myModule']);
        expect(injector.get('a')).toBe(33);

    });


    it('runs the config block', function() {
        var module = window.angular.module('myModule', []);
        var hasRun = false;
        var conf = function($provide) {
            hasRun = true;
            $provide.constant('a', 23);
        };
        conf.$inject = ['$provide'];
        module.config(conf);

        var injector = createInjector(['myModule']);
        expect(hasRun).toBe(true);
        expect(injector.get('a')).toBe(23);
    });

    it('runs the run block', function() {
        var module = window.angular.module('myModule', []);
        module.constant('a', 23);
        var hasRun = false;
        var aValue = 1;

        var run = function(a) {
            hasRun = true;
            aValue = a;
        };
        run.$inject = ['a'];
        module.run(run);

        var injector = createInjector(['myModule']);
        expect(hasRun).toBe(true);
        expect(aValue).toBe(23);
    });

});


