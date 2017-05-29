
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

});


