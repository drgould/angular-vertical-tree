'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function () {

    var angular = window.angular || require('angular');

    var vTree = angular.module('drg.angularVerticalTree', []).directive('verticalTree', ["$compile", "$templateCache", "$timeout", function ($compile, $templateCache, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                items: '<treeItems',
                treeOpts: '<',
                open: '&onOpen',
                select: '&onSelect'
            },
            controller: 'vTreeCtrl',
            /**
             * To allow us to use an isolate scope and also allow user defined internal components (vertical-tree-breadcrumb and vertical-tree-leaf)
             * we need to manually replace the contents of the root element with the template after we've saved the
             * contents of each user defined component. As such, we cannot use the templateUrl property of the directive
             * lest the original contents of the root element be removed before we have a chance to access them.
             * DO NOT UNCOMMENT THE NEXT LINE
             */
            // templateUrl : 'drg/angularVerticalTree.tpl.html',
            compile: function compile(elem) {

                // save the contents of each user definable component for use later
                var breadcrumb = elem.find('vertical-tree-breadcrumb');
                var leaf = elem.find('vertical-tree-leaf');

                breadcrumb = breadcrumb && breadcrumb.length > 0 ? breadcrumb.html() : '';
                leaf = leaf && leaf.length > 0 ? leaf.html() : '';

                // remove contents of the container for now,
                // we'll add in the template HTML later once the scope is set up
                elem.empty();

                return {
                    pre: function pre(scope, elem) {
                        scope.templates = {
                            breadcrumb: 'drg/vTreeBreadcrumb' + scope.$id + '.tpl.html',
                            leaf: 'drg/vTreeLeaf' + scope.$id + '.tpl.html'
                        };

                        // save the html to be used for the breadcrumbs and leaves as templates
                        $templateCache.put(scope.templates.breadcrumb, breadcrumb);
                        $templateCache.put(scope.templates.leaf, leaf);

                        // compile the template using the isolate scope and insert it into the root element
                        elem.html($compile($templateCache.get('drg/angularVerticalTree.tpl.html'))(scope));
                    },
                    post: function post(scope, elem) {
                        scope.updateBranchHeight = function () {
                            $timeout(function () {
                                var container = elem.children().eq(0);
                                var breadcrumbs = container.find('.v-tree-breadcrumb');
                                var breadcrumbsOuterHeight = breadcrumbs.reduce(function (height, breadcrumb) {
                                    return height + $(breadcrumb).outerHeight();
                                }, 0);

                                container.find('.v-tree-branch').css('height', 'calc(100% - ' + breadcrumbsOuterHeight + 'px)');
                            });
                        };
                        scope.updateBranchHeight();
                    }
                };
            }
        };
    }]).controller('vTreeCtrl', ["$scope", function ($scope) {

        function deepExtend(obj, newObj) {
            angular.forEach(newObj, function (item, key) {
                if (angular.isObject(item)) {
                    if (obj[key]) {
                        obj[key] = deepExtend(angular.isObject(obj[key]) ? obj[key] : {}, item);
                    } else {
                        obj[key] = angular.copy(item);
                    }
                } else {
                    obj[key] = item;
                }
            });
            return obj;
        }

        var opts = $scope.opts = deepExtend({
            root: 'Root',
            idProp: undefined,
            label: 'label',
            children: 'children',
            classes: {
                container: 'panel panel-default',
                breadcrumb: 'panel-heading',
                branch: 'list-group',
                leaf: 'list-group-item'
            },
            emptyMessage: '',
            isLeaf: function isLeaf() {
                return true;
            },
            isFolder: function isFolder(item) {
                return item[this.children] && item[this.children].length > 0;
            }
        }, $scope.treeOpts);

        var root = {};

        if (angular.isObject($scope.opts.root)) {
            root = angular.copy($scope.opts.root);
        } else {
            root[$scope.opts.label] = $scope.opts.root;
        }

        _extends($scope, {
            breadcrumbs: [],
            leaves: [],

            leafClickHandler: function leafClickHandler(item) {
                if ($scope.opts.isFolder(item)) {
                    onOpen(item);
                } else if ($scope.opts.isLeaf(item)) {
                    onSelect(item);
                }
            },
            breadcrumbClickHandler: function breadcrumbClickHandler(item, index) {
                $scope.breadcrumbs.splice(index, $scope.breadcrumbs.length - index);
                onOpen(item);
            }
        });

        resetBreadcrumbs();

        $scope.$watch('items', function () {
            root[opts.children] = $scope.items;
            setPath(getCurrentPath());
        });

        $scope.$watchCollection('breadcrumbs[ breadcrumbs.length - 1 ][ opts.children ]', function () {
            $scope.leaves = getLeaves();
        });

        $scope.$on('vTree.setPath', function (ev, path) {
            return setPath(path);
        });

        function getCurrentPath() {
            if (opts.idProp) {
                return $scope.breadcrumbs.map(function (breadcrumb) {
                    return breadcrumb[opts.idProp];
                });
            }
            return [];
        }

        function setPath() {
            var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            resetBreadcrumbs();

            if (opts.idProp) {
                var folder = root;
                for (var i = 0; i < path.length; i++) {
                    var found = false;
                    var id = path[i];
                    var children = folder[opts.children];
                    for (var j = 0; j < children.length; j++) {
                        var child = children[j];
                        if (child[opts.idProp] === id) {
                            $scope.breadcrumbs.push(child);
                            folder = child;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        break;
                    }
                }
            }
        }

        function resetBreadcrumbs() {
            $scope.breadcrumbs = [root];
        }

        function getLeaves() {
            var currentFolder = $scope.breadcrumbs[$scope.breadcrumbs.length - 1];
            if (!currentFolder) {
                return [];
            }

            var currentItems = currentFolder[$scope.opts.children];
            if (!currentItems) {
                return [];
            }

            return currentItems.filter($scope.opts.isLeaf);
        }

        function onOpen(folder) {
            $scope.breadcrumbs.push(folder);
            $scope.leaves = getLeaves();

            $scope.updateBranchHeight();

            $scope.$emit('verticalTree.openFolder', folder);

            if ($scope.open) {
                $scope.open({ folder: folder });
            }
        }

        function onSelect(item) {
            $scope.$emit('verticalTree.selectItem', item);

            if ($scope.select) {
                $scope.select({ item: item });
            }
        }
    }]);

    if (module) {
        module.exports = vTree.name;
    }
})();
angular.module("drg.angularVerticalTree").run(["$templateCache", function($templateCache) {$templateCache.put("drg/angularVerticalTree.tpl.html","<!-- .panel by default -->\n<div class=\"v-tree-container\" ng-class=\"opts.classes.container\">\n\n    <!-- .panel-heading by default -->\n    <a class=\"v-tree-breadcrumb\"\n       href=\"javascript:;\"\n       ng-class=\"opts.classes.breadcrumb\"\n       ng-click=\"breadcrumbClickHandler( breadcrumb, $index )\"\n       ng-include=\"templates.breadcrumb\"\n       ng-repeat=\"breadcrumb in breadcrumbs track by ( opts.idProp ? breadcrumb[ opts.idProp ] : $index )\"\n       style=\"display: block;\">\n    </a>\n\n    <!-- .list-group by default -->\n    <div class=\"v-tree-branch\" ng-class=\"opts.classes.branch\">\n        <!-- .list-group-item by default -->\n        <a class=\"v-tree-leaf\"\n           href=\"javascript:;\"\n           ng-class=\"opts.classes.leaf\"\n           ng-click=\"leafClickHandler( leaf )\"\n           ng-include=\"templates.leaf\"\n           ng-repeat=\"leaf in leaves track by ( opts.idProp ? leaf[ opts.idProp ] : $index )\">\n        </a>\n        <p class=\"v-tree-empty\" ng-if=\"!leaves || !leaves.length\" ng-bind=\"opts.emptyMessage\"></p>\n    </div>\n\n</div>\n");}]);