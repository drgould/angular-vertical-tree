angular.module( 'app', [ 'drg.angularVerticalTree' ] )
    .controller( 'MainCtrl', function( $scope ) {

        var numBranches = 15;
        var newItemCtr = 0;

        function generateBranch( level, branch, label, folder ) {

            var newLabel = label + '-' + branch;

            folder = folder && level > 1;

            return {
                id : 'id-' + newLabel,
                label : ( folder ? 'folder' : 'file' ) + newLabel,
                children : folder ? generateTree( level - 1, newLabel ) : []
            };
        }

        function generateTree( levels, label ) {
            var branches = [];
            if( levels > 0 ) {
                var folders = Math.random() * numBranches / 2;
                for ( var i = 0; i < numBranches; i++ ) {
                    branches.push( generateBranch( levels, i, label, i < folders ) );
                }
            }
            return branches;
        }

        $scope.vTreeOpts = {
            idProp : 'id',
            isLeaf : function( item ) {
                return item.label.substr( -2 ) != '-5';
            }
        };

        $scope.items = [];
        $scope.item = {};
        $scope.folder = {};

        $scope.copyItems = function() {
            $scope.items = angular.copy( $scope.items );
        };

        $scope.generateNewTree = function() {
            $scope.items = generateTree( 6, '' );
        };

        $scope.removeItemFromCurrentFolder = function() {
            var items = $scope.folder.children || $scope.items;
            var numItems = items.length;
            var randomIndex = Math.round( Math.random() * ( numItems - 1 ) );
            items.splice( randomIndex, 1 );
        };

        $scope.addItemToCurrentFolder = function() {
            var items = $scope.folder.children || $scope.items;
            items.push( generateBranch( 'new', 'branch' + newItemCtr++, 'added', false ) );
        };

        $scope.changeLabelsOfItems = function() {
            var items = $scope.folder.children || $scope.items;
            items.forEach( function( item ) {
                item.label += '+';
            } );
        };

        $scope.generateNewTree();

        $scope.$on( 'verticalTree.selectItem', function( $ev, item ) {
            $scope.item = item;
        } );

        $scope.$on( 'verticalTree.openFolder', function( $ev, folder ) {
            $scope.folder = folder;
        } );

    } );
