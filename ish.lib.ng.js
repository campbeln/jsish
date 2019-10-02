/** ################################################################################################
 * Angular mixin for ishJS
 * @mixin ish.lib.ng
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function (core, angular) {
    'use strict';


    /** ################################################################################################
     * @namespace core.lib.ng
     * @desc Angular-based functionality.
    ################################################################################################# */
    core.lib.ng = {
        /** ################################################################################################
         * @function lazyLoad
         * @desc Loads a new Angular `require` into our app.
         * @param {string} sRequire - String specifying the Angular `require` to load into our app.
        ################################################################################################# */
        lazyLoad: function (sRequire) {
            core.lib.ng.app.requires.push(sRequire);
        }, //# core.lib.ng.lazyLoad


        /** ################################################################################################
         * @function register
         * @desc Registers an Angular-based dependency injected require object via `ish.lib.ng`.
         * @param {string} sRequireName - String specifying the name of the Angular `require` object.
         * @param {varient} vRequire - Varient representing the Angular `require` object.
         * @returns {boolean} - Boolean value indicating if the required interface was successfully registered.
        ################################################################################################# */
        register: function (oRequires) {
            var bReturnVal = core.type.obj.is(oRequires, { nonEmpty: true });

            //# If oRequires holds values to register, .extend them into core.lib.ng now
            if (bReturnVal) {
                core.extend(core.lib.ng, oRequires);
            }

            return bReturnVal;
        }, //# core.lib.ng.register


        /** ################################################################################################
         * @function resolve
         * @desc Resolves a key within an Angular-based scope object, traversing upward through parent scopes until it is found.
         * @param {object} $scope - Object representing the starting Angular scope.
         * @param {string} sKey - String representing the required key in the Angular scope.
         * @returns {varient} - Varient representing the resolved key's value.
        ################################################################################################# */
        resolve: function ($scope, sKey) {
            var vReturnVal /* = undefined*/;

            do {
                vReturnVal = core.resolve($scope, sKey);
                $scope = core.resolve($scope, "$parent");
            } while (!vReturnVal && $scope);

            return vReturnVal;
        }, //# core.lib.ng.register


        /** ################################################################################################
         * @function scope
         * @desc Retrieves the Angular scope associated with the referenced DOM object.
         * @param {varient} vDom - Varient representing the DOM object.
         * @returns {object} - Object representing the DOM object's Angular scope.
        ################################################################################################# */
        scope: function (vDom) {
            var _dom = core.type.dom.mk(vDom, null),
                $returnVal /* = undefined*/
            ;

            //# If we could resolve the _dom object, pull its .scope from the angular.element
            if (_dom) {
                $returnVal = angular.element(_dom).scope();
            }

            return $returnVal;
        }, //# core.lib.ng.scope


        /** ################################################################################################
         * @function compile
         * @desc Compiles the referenced DOM object using referenced the Angular scope.
         * @param {varient} vDom - Varient representing the DOM object.
         * @param {varient} [vScope] - Optional varient representing the DOM object under the required Angular scope.
         * @returns {object} - DOM object managed by Angular.
        ################################################################################################# */
        compile: function (vDom, vScope) {
            var _dom = core.type.dom.mk(vDom, null),
                $scope = core.lib.ng.scope(vScope || vDom),
                $returnVal /* = undefined*/
            ;

            //# If we could resolve the _dom object and $scope, .$compile it and set our $returnVal to the modified _dom
            if (_dom && $scope) {
                core.lib.ng.$compile(_dom)($scope);
                $returnVal = _dom;
            }

            return $returnVal;
        }, //# core.lib.ng.compile


        /** ################################################################################################
         * @function init
         * @desc Initilizes a new Angular app based on the passed options.
         * @param {object} [oOptions] - Object specifying the options used to configure the new Angular app.
        ################################################################################################# */
        init: function (oOptions) {
            //# Collect our ngApp then .config and .run it
            var oSettings = core.extend({
                    requires: [],
                    appName: core.config.ish().target + "-app",
                    ctrlName: "ctrlMain",
                    //ctrlCallback: function ($scope) {},
                    //onload: function (ngApp, angular, core_lib_ng) {}
                }, oOptions),
                ngApp = angular.module(oSettings.appName, core.type.arr.mk(oSettings.requires))
            ;

            ngApp
                //# Enable post-bootstrapped component loading
                //#     NOTE: Based on code from https://www.bennadel.com/blog/2553-loading-angularjs-components-after-your-application-has-been-bootstrapped.htm
                .config(['$controllerProvider', '$provide', '$compileProvider', '$filterProvider', function ($controllerProvider, $provide, $compileProvider, $filterProvider) {
                    //# Copy the old reference into the._* equivlents
                    ngApp._controller = ngApp.controller;
                    ngApp._service = ngApp.service;
                    ngApp._factory = ngApp.factory;
                    ngApp._value = ngApp.value;
                    ngApp._directive = ngApp.directive;
                    //ngApp._filter = ngApp.filter;

                    //# Since the "shorthand" methods for component definitions are no longer valid, we can just override them to use the providers for post-bootstrap loading.
                    ngApp.controller = $controllerProvider.register;
                    ngApp.service = $provide.service;
                    ngApp.factory = $provide.factory;
                    ngApp.value = $provide.value;
                    ngApp.directive = $compileProvider.directive;
                    ngApp.filter = $filterProvider.register; //# untested
                }]) //# .config

                //# Expose and register internal Angular functionality
                .run(['$filter', '$http', '$timeout', '$compile', function ($filter, $http, $timeout, $compile) {
                    //# Expose the internal Angular functionality via core.lib.ng
                    core.extend(core.lib.ng, {
                        app: ngApp,
                        $filter: $filter,
                        $http: $http,
                        $timeout: $timeout,
                        $compile: $compile
                    });

                     //$root.$z? $rootScope?

                    //# .register $timeout with .sync then .call our fnCallback
                    core.lib.sync.register($timeout);
                    core.type.fn.call(oSettings.onload, ngApp, [ngApp, angular, core.lib.ng]);
                }]) //# .run
            ;

            //# If the caller passed in a .ctrlName, add a .controller to our ngApp
            if (oSettings.ctrlName) {
                ngApp.controller(oSettings.ctrlName, ['$scope', function ($scope) {
                    //# Register core in the $scope under our .target name then call .ctrlCallback
                    $scope[core.config.ish().target] = core;
                    core.type.fn.call(oSettings.ctrlCallback, ngApp, arguments);
                }]); //# ngApp.controller(oSettings.ctrlName
            }

            return ngApp;
        } //# core.lib.ng.init
    }; //# core.lib.ng

}(document.getElementsByTagName("HTML")[0].ish, window.angular);
