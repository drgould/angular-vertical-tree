( function() {

const angular = window.angular || require( 'angular' );

const vTree = angular.module( 'drg.angularVerticalTree', [] )

.directive( 'verticalTree', function(
    $compile,
    $templateCache,
    $timeout
) {
    return {
        restrict : 'EA',
        scope : {
            items : '<treeItems',
            treeOpts : '<',
            open : '&onOpen',
            select : '&onSelect',
        },
        controller : 'vTreeCtrl',
        /**
         * To allow us to use an isolate scope and also allow user defined internal components (vertical-tree-breadcrumb and vertical-tree-leaf)
         * we need to manually replace the contents of the root element with the template after we've saved the
         * contents of each user defined component. As such, we cannot use the templateUrl property of the directive
         * lest the original contents of the root element be removed before we have a chance to access them.
         * DO NOT UNCOMMENT THE NEXT LINE
         */
        // templateUrl : 'drg/angularVerticalTree.tpl.html',
        compile( elem ) {

            // save the contents of each user definable component for use later
            let breadcrumb = elem.find( 'vertical-tree-breadcrumb' );
            let leaf = elem.find( 'vertical-tree-leaf' );

            breadcrumb = breadcrumb && breadcrumb.length > 0 ? breadcrumb.html() : '';
            leaf = leaf && leaf.length > 0 ? leaf.html() : '';

            // remove contents of the container for now,
            // we'll add in the template HTML later once the scope is set up
            elem.empty();

            return {
                pre( scope, elem ) {
                    scope.templates = {
                        breadcrumb : 'drg/vTreeBreadcrumb' + scope.$id + '.tpl.html',
                        leaf : 'drg/vTreeLeaf' + scope.$id + '.tpl.html'
                    };

                    // save the html to be used for the breadcrumbs and leaves as templates
                    $templateCache.put( scope.templates.breadcrumb, breadcrumb );
                    $templateCache.put( scope.templates.leaf, leaf );

                    // compile the template using the isolate scope and insert it into the root element
                    elem.html( $compile( $templateCache.get( 'drg/angularVerticalTree.tpl.html' ) )( scope ) );
                },
                post( scope, elem ) {
                    scope.updateBranchHeight = function() {
                        $timeout( function() {
                            const container = elem.children().eq( 0 );
                            const breadcrumbs = container.find( '.v-tree-breadcrumb' );
                            const breadcrumbsOuterHeight = breadcrumbs.reduce( ( height, breadcrumb ) => height + $( breadcrumb ).outerHeight(), 0 );

                            container.find( '.v-tree-branch' ).css( 'height', 'calc(100% - ' + breadcrumbsOuterHeight + 'px)' );
                        } );
                    };
                    scope.updateBranchHeight();
                }
            }
        }
    };
} )
.controller( 'vTreeCtrl', function( $scope ) {

    function deepExtend( obj, newObj ) {
        angular.forEach( newObj, function( item, key ) {
            if( angular.isObject( item ) ) {
                if( obj[ key ] ) {
                    obj[ key ] = deepExtend( angular.isObject( obj[ key ] ) ? obj[ key ] : {}, item );
                } else {
                    obj[ key ] = angular.copy( item );
                }
            } else {
                obj[ key ] = item;
            }
        } );
        return obj;
    }

    const opts = $scope.opts = deepExtend( {
        root : 'Root',
        idProp : undefined,
        label : 'label',
        children : 'children',
        classes : {
            container : 'panel panel-default',
            breadcrumb : 'panel-heading',
            branch : 'list-group',
            leaf : 'list-group-item'
        },
        emptyMessage : '',
        isLeaf() {
            return true;
        },
        isFolder( item ) {
            return item[ this.children ] && item[ this.children ].length > 0;
        }
    }, $scope.treeOpts );

    let root = {};

    if( angular.isObject( $scope.opts.root ) ) {
        root = angular.copy( $scope.opts.root );
    } else {
        root[ $scope.opts.label ] = $scope.opts.root;
    }

    Object.assign( $scope, {
        breadcrumbs : [],
        leaves : [],

        leafClickHandler( item ) {
            if( $scope.opts.isFolder( item ) ) {
                onOpen( item );
            } else if( $scope.opts.isLeaf( item ) ) {
                onSelect( item );
            }
        },

        breadcrumbClickHandler( item, index ) {
            $scope.breadcrumbs.splice( index, $scope.breadcrumbs.length - index );
            onOpen( item );
        },
    } );

    resetBreadcrumbs();

    $scope.$watch( 'items', function() {
        root[ opts.children ] = $scope.items;
        setPath( getCurrentPath() );
    } );

    $scope.$watchCollection( 'breadcrumbs[ breadcrumbs.length - 1 ][ opts.children ]', () => {
        $scope.leaves = getLeaves();
    } );

    $scope.$on( 'vTree.setPath', ( ev, path ) => setPath( path ) );

    function getCurrentPath() {
        if( opts.idProp ) {
            return $scope.breadcrumbs.map( breadcrumb => breadcrumb[ opts.idProp ] );
        }
        return [];
    }

    function setPath( path=[] ) {
        resetBreadcrumbs();

        if( opts.idProp ) {
            let folder = root;
            for( let i = 0; i < path.length; i++ ) {
                let found = false;
                const id = path[ i ];
                const children = folder[ opts.children ];
                for( let j = 0; j < children.length; j++ ) {
                    const child = children[ j ];
                    if( child[ opts.idProp ] === id ) {
                        $scope.breadcrumbs.push( child );
                        folder = child;
                        found = true;
                        break;
                    }
                }
                if( !found ) {
                    break;
                }
            }
        }
    }

    function resetBreadcrumbs() {
        $scope.breadcrumbs = [ root ];
    }

    function getLeaves() {
        const currentFolder = $scope.breadcrumbs[ $scope.breadcrumbs.length - 1 ];
        if( !currentFolder ) {
            return [];
        }

        const currentItems = currentFolder[ $scope.opts.children ];
        if( !currentItems ) {
            return [];
        }

        return currentItems.filter( $scope.opts.isLeaf );
    }

    function onOpen( folder ) {
        $scope.breadcrumbs.push( folder );
        $scope.leaves = getLeaves();

        $scope.updateBranchHeight();

        $scope.$emit( 'verticalTree.openFolder', folder );

        if( $scope.open ) {
            $scope.open( { folder : folder } );
        }
    }

    function onSelect( item ) {
        $scope.$emit( 'verticalTree.selectItem', item );

        if( $scope.select ) {
            $scope.select( { item : item } );
        }
    }

} );

if( module ) {
    module.exports = vTree.name;
}

} )();