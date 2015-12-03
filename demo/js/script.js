angular.module( 'app', [ 'drg.angularVerticalTree' ] )
    .controller( 'MainCtrl', function( $scope ) {

        var numBranches = 15;

        function generateBranch( level, branch, label, folder ) {

            var newLabel = label + '-' + branch;

            folder = folder && level > 1;

            return {
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
            isLeaf : function( item ) {
                return item.label.substr( -2 ) != '-5';
            }
        };

        $scope.items = generateTree( 6, '' );
        $scope.item = {};
        $scope.folder = {};

        $scope.$on( 'verticalTree.selectItem', function( $ev, item ) {
            $scope.item = item;
        } );

        $scope.$on( 'verticalTree.openFolder', function( $ev, folder ) {
            $scope.folder = folder;
        } );

    } );
