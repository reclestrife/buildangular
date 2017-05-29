'use strict';

(function() {
    
    window.createInjector = function(modulesToLoad) {

        var cache = {};
        var $provide = {
            'constant': function(key, value) {
                cache[key] = value;
            }
        };

        var createInternalInjector = function(module) {
            _.forEach(module._invokeQueue, function(invokeArgs) {
                var method = invokeArgs[0];
                var args = invokeArgs[1];
                $provide[method].apply($provide, args);
            });
        };

        _.forEach(modulesToLoad, function(moduleName) {
            var module = window.angular.module(moduleName);
            if (module.requires && module.requires.length > 0) {
                _.forEach(module.requires, function(requiredName) {
                    var requiredModule = window.angular.module(requiredName);
                    createInternalInjector(requiredModule);
                });
            }
            createInternalInjector(module);
        });

        return {
            has: function(key) {
                return cache.hasOwnProperty(key);
            },
            get: function(key) {
                return cache[key];
            }
        };
    };

})();