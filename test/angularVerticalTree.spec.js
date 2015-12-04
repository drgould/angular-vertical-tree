describe( 'Vertical Tree Directive:', function () {



} );

describe( 'Vertical Tree Controller:', function () {

    var $rootScope,
        $scope,
        $timeout,
        $controller,
        items,
        selectSpy,
        selectCallbackSpy,
        openSpy,
        openCallbackSpy,
        updateBranchHeightSpy;

    function generateTree( level, items ) {
        var leaves = [];
        if( level > 0 ) {
            for( var i = 0; i < items; i++ ) {
                var children = [];
                if( i < items / 2 ) {
                    children = generateTree( level - 1, items );
                }
                leaves.push( {
                    label : level + '-' + i,
                    children : children
                } );
            }
        }
        return leaves;
    }

    beforeEach( module( 'drg.angularVerticalTree' ) );
    beforeEach( inject( function ( _$rootScope_, _$controller_, _$timeout_ ) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $controller = _$controller_;
        $timeout = _$timeout_;
    } ) );

    beforeEach( function () {
        items = generateTree( 5, 6 );

        $scope.vTreeTemplates = {
            breadcrumbs : '',
            leaf : ''
        };
        $scope.vTreeExpr = {
            items : angular.toJson( items ),
            opts : angular.toJson( {
                root : {
                    label : 'New Root'
                },
                classes : {
                    container : 'cont'
                }
            } ),
            open : 'onOpen',
            select : 'onSelect'
        };

        selectSpy = jasmine.createSpy( 'select' );
        selectCallbackSpy = jasmine.createSpy( 'select callback' );
        openSpy = jasmine.createSpy( 'open' );
        openCallbackSpy = jasmine.createSpy( 'open callback' );
        updateBranchHeightSpy = jasmine.createSpy( 'updateBranchHeight' );

        $controller( 'vTreeCtrl', { $scope : $scope } );
        $scope.$digest();

        $rootScope.$on( 'verticalTree.openFolder', openSpy );
        $rootScope.$on( 'verticalTree.selectItem', selectSpy );

        $rootScope.onOpen = openCallbackSpy;
        $rootScope.onSelect = selectCallbackSpy;

        $scope.vTreeCtrl.updateBranchHeight = updateBranchHeightSpy;
    } );

    it( 'should set the container class', function () {
        expect( $scope.vTreeCtrl.opts.classes.container ).toEqual( 'cont' );
    } );

    it( 'should have the items', function () {
        expect( $scope.vTreeCtrl.items ).toEqual( items );
    } );

    describe( '', function () {

        beforeEach( function () {
            $timeout.flush();
        } );

        it( 'should set the current items to the generated list of items', function () {
            expect( $scope.vTreeCtrl.currentItems ).toEqual( items );
        } );

        it( 'should set the root correctly', function () {
            expect( $scope.vTreeCtrl.breadcrumbs.length ).toEqual( 1 );
            expect( $scope.vTreeCtrl.breadcrumbs[ 0 ].label ).toEqual( 'New Root' );
            expect( $scope.vTreeCtrl.breadcrumbs[ 0 ].children ).toEqual( items );
        } );

    } );

    describe( 'when a folder is opened', function () {

        beforeEach( function () {
            $scope.vTreeCtrl.leafClickHandler( items[2] );
            $scope.$digest();
        } );

        it( 'should add the item to the breadcrumbs', function () {
            expect( $scope.vTreeCtrl.breadcrumbs.length ).toEqual( 1 );
            expect( $scope.vTreeCtrl.breadcrumbs[ 0 ] ).toEqual( items[ 2 ] );
        } );

        it( 'should set the current items to the children of the opened folder', function () {
            expect( $scope.vTreeCtrl.currentItems ).toEqual( items[ 2 ].children );
        } );

        it( 'should call updateBranchHeight', function () {
            expect( updateBranchHeightSpy ).toHaveBeenCalled();
        } );

        it( 'should fire the open event', function () {
            expect( openSpy ).toHaveBeenCalledWith( jasmine.any( Object ), items[ 2 ] );
        } );

        it( 'should call the open callback', function () {
            expect( openCallbackSpy ).toHaveBeenCalledWith( items[ 2 ] );
        } );

    } );

    describe( 'when an item is clicked', function () {

        beforeEach( function () {
            $scope.vTreeCtrl.leafClickHandler( items[ 5 ] );
            $scope.$digest();
        } );

        it( 'should fire the select event', function () {
            expect( selectSpy ).toHaveBeenCalledWith( jasmine.any( Object ), items[ 5 ] );
        } );

        it( 'should call the select callback', function () {
            expect( selectCallbackSpy ).toHaveBeenCalledWith( items[ 5 ] );
        } );

    } );

    describe( 'when traversing down the tree', function () {

        var breadcrumbs = [];

        beforeEach( function () {
            $timeout.flush();

            for( var i = 0; i < 4; i++ ) {
                breadcrumbs.push( $scope.vTreeCtrl.currentItems[ 2 ] );
                $scope.vTreeCtrl.leafClickHandler( $scope.vTreeCtrl.currentItems[ 2 ] );
                $scope.$digest();
            }
        } );

        it( 'should save all the breadcrumbs', function () {
            expect( $scope.vTreeCtrl.breadcrumbs.length ).toEqual( 5 );
            expect( $scope.vTreeCtrl.breadcrumbs[ 1 ] ).toEqual( breadcrumbs[ 0 ] );
            expect( $scope.vTreeCtrl.breadcrumbs[ 2 ] ).toEqual( breadcrumbs[ 1 ] );
            expect( $scope.vTreeCtrl.breadcrumbs[ 3 ] ).toEqual( breadcrumbs[ 2 ] );
            expect( $scope.vTreeCtrl.breadcrumbs[ 4 ] ).toEqual( breadcrumbs[ 3 ] );
        } );

        it( 'should set the correct items', function () {
            expect( $scope.vTreeCtrl.currentItems ).toEqual( breadcrumbs[ 3 ].children );
        } );

        describe( 'then skipping back up', function () {

            beforeEach( function () {
                $scope.vTreeCtrl.breadcrumbClickHandler( breadcrumbs[ 1 ] );
                $scope.$digest();
            } );

            it( 'should have the correct breadcrumbs', function () {
                expect( $scope.vTreeCtrl.breadcrumbs.length ).toEqual( 3 );
                expect( $scope.vTreeCtrl.breadcrumbs[ 1 ] ).toEqual( breadcrumbs[ 0 ] );
                expect( $scope.vTreeCtrl.breadcrumbs[ 2 ] ).toEqual( breadcrumbs[ 1 ] );
            } );

            it( 'should set the correct items', function () {
                expect( $scope.vTreeCtrl.currentItems ).toEqual( breadcrumbs[ 1 ].children );
            } );

            it( 'should fire onOpen', function () {
                expect( updateBranchHeightSpy ).toHaveBeenCalled();
                expect( openSpy ).toHaveBeenCalledWith( jasmine.any( Object ), items[ 2 ] );
                expect( openCallbackSpy ).toHaveBeenCalledWith( items[ 2 ] );
            } );

        } );

    } );

} );