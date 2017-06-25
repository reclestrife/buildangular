'use strict';

(function() {
    
    window.createInjector = function(modulesToLoad) {

        var providerCache = {};
        var providerInjector = providerCache.$injector = createInternalInjector(providerCache, function() {
            throw 'Unknown provider';
        });

        var instanceCache = {};
        var instanceInjector = instanceCache.$injector = createInternalInjector(instanceCache, function(key) {
            var provider = providerInjector.get(key + 'Provider');
            return instanceInjector.invoke(provider.$get, provider);
        });

        providerCache.$provide = {
            'constant': function(key, value) {
                instanceCache[key] = value;
                providerCache[key] = value;
            },
            'provider': function(key, provider) {
                if (_.isFunction(provider)) {
                    provider = providerInjector.instantiate(provider);
                }
                providerCache[key + 'Provider'] = provider;
            }
        };

        function createInternalInjector(cache, factoryFn) {

            function getService(key) {
                if (cache.hasOwnProperty(key)) {
                    return cache[key];
                }
                else {
                    return (cache[key] = factoryFn(key));
                }
            }

            function has(key) {
                return cache.hasOwnProperty(key) || 
                    providerCache.hasOwnProperty(key + 'Provider');
            }

            // function get(key) {
            //     if (instanceCache.hasOwnProperty(key)) {
            //         return instanceCache[key];
            //     }
            //     else if (providerCache.hasOwnProperty(key)) {
            //         return providerCache[key];
            //     }
            //     else if (providerCache.hasOwnProperty(key + 'Provider')) {
            //         var provider = providerCache[key + 'Provider'];
            //         var instance = instanceCache[key] = invoke(provider.$get, provider);
            //         return instance;
            //     }
            // }

            function invoke(fn, self) {
                var args = _.map(fn.$inject, function(key) {
                    return getService(key);
                });
                return fn.apply(self, args);
            }

            function instantiate(Type) {
                var instant = Object.create(Type.prototype);
                invoke(Type, instant);
                return instant;
            }

            return {
                has: has,
                get: getService,
                invoke: invoke,
                instantiate: instantiate
            };
        }

        function runInvokeQueue(queue) {
            _.forEach(queue, function(invokeArgs) {
                var service = providerInjector.get(invokeArgs[0]);
                var method = invokeArgs[1];
                var args = invokeArgs[2];
                service[method].apply(service, args);
            });
        }

        _.forEach(modulesToLoad, function loadModule(moduleName) {
            var module = window.angular.module(moduleName);
            _.forEach(module.requires, loadModule);
            runInvokeQueue(module._invokeQueue);
            runInvokeQueue(module._configBlocks);
        });

        return instanceInjector;

        
    };

})();