
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

});