describe('setupModuleLoader', function() {

    beforeEach(function() {
        delete window.angular;
    });

    it('expose angular on the window', function() {
        setupModuleLoader(window);
        expect(window.angular).toBeDefined();
    });

    it ('create angular just once', function() {
        setupModuleLoader(window);
        var ng = window.angular;
        setupModuleLoader(window);
        expect(window.angular).toBe(ng);
    });

    it('expose the module interface', function() {
        setupModuleLoader(window);
        expect(window.angular.module).toBeDefined();
    });

    it('expose the module interface just once', function() {
        setupModuleLoader(window);
        var mod = window.angular.module;
        setupModuleLoader(window);
        expect(window.angular.module).toBe(mod);
    });

});


describe('modules', function() {

    beforeEach(function() {
        delete window.angular;
        setupModuleLoader(window);
    });

    it('allows to register a module', function() {
        var myModule = window.angular.module('myModule', []);
        expect(myModule).toBeDefined();
        expect(myModule.name).toEqual('myModule');
    });

    it('attaches the requires array to the module', function() {
        var myModule = window.angular.module('myModule', ['myOtherModule']);
        expect(myModule.requires).toEqual(['myOtherModule']);
    });

    it('allows to get the registered module', function() {
        var myModule = window.angular.module('myModule', []);
        expect(window.angular.module('myModule')).toBe(myModule);
    });

    it('throws to get a unregistered module', function() {
        expect(function() {
            window.angular.module('myModule');
        }).toThrow();
    })

});









