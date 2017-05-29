'use strict';

(function() {

    window.setupModuleLoader = function(w) {

        var ensure = function(obj, name, factory) {
            return obj[name] || (obj[name] = factory());
        };

        var angular = ensure(w, 'angular', Object);
        var modules = {};

        // console.log(modules);

        // for (var p in modules) {
        //     console.log(modules);
        // }


        var createModule = function(name, requires) {
            var invokeQueue = [];
            var moduleInstance = {
                name: name,
                requires: requires,
                constant: function(key, value) {
                    invokeQueue.push(['constant', [key, value]]);
                },
                _invokeQueue: invokeQueue
            };
            modules[name] = moduleInstance;
            return moduleInstance;
        };

        var getModule = function(name) {
            if (modules.hasOwnProperty(name)) {
                return modules[name];
            }
            throw 'Module ' + name + ' does not exist.';
        };

        ensure(angular, 'module', function() {
            return function(name, requires) {
                if (requires) {
                    return createModule(name, requires);
                }
                else {
                    return getModule(name);
                }
            };
        });
    }

})();