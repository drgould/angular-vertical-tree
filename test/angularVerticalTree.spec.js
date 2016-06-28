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

        $scope.items = items;
        $scope.treeOpts = {
            root : {
                label : 'New Root'
            },
            classes : {
                container : 'cont'
            }
        };

        selectSpy = jasmine.createSpy( 'select' );
        selectCallbackSpy = jasmine.createSpy( 'select callback' );
        openSpy = jasmine.createSpy( 'open' );
        openCallbackSpy = jasmine.createSpy( 'open callback' );
        updateBranchHeightSpy = jasmine.createSpy( 'updateBranchHeight' );

        $controller( 'vTreeCtrl', { $scope : $scope } );

        $rootScope.$on( 'verticalTree.openFolder', openSpy );
        $rootScope.$on( 'verticalTree.selectItem', selectSpy );

        $scope.open = openCallbackSpy;
        $scope.select = selectCallbackSpy;

        $scope.updateBranchHeight = updateBranchHeightSpy;
    } );

    it( 'should set the container class', function () {
        expect( $scope.opts.classes.container ).toEqual( 'cont' );
    } );

    it( 'should have the items', function () {
        expect( $scope.items ).toEqual( items );
    } );

    describe( '', function () {

        it( 'should set the current items to the generated list of items', function () {
            expect( $scope.leaves ).toEqual( items );
        } );

        it( 'should set the root correctly', function () {
            expect( $scope.breadcrumbs.length ).toEqual( 1 );
            expect( $scope.breadcrumbs[ 0 ].label ).toEqual( 'New Root' );
            expect( $scope.breadcrumbs[ 0 ].children ).toEqual( items );
        } );

    } );

    describe( 'when a folder is opened', function () {

        beforeEach( function () {
            $scope.leafClickHandler( items[2] );
        } );

        it( 'should add the item to the breadcrumbs', function () {
            expect( $scope.breadcrumbs.length ).toEqual( 2 );
            expect( $scope.breadcrumbs[ 1 ] ).toEqual( items[ 2 ] );
        } );

        it( 'should set the current items to the children of the opened folder', function () {
            expect( $scope.leaves ).toEqual( items[ 2 ].children );
        } );

        it( 'should call updateBranchHeight', function () {
            expect( updateBranchHeightSpy ).toHaveBeenCalled();
        } );

        it( 'should fire the open event', function () {
            expect( openSpy ).toHaveBeenCalledWith( jasmine.any( Object ), items[ 2 ] );
        } );

        it( 'should call the open callback', function () {
            expect( openCallbackSpy ).toHaveBeenCalledWith( { folder : items[ 2 ] } );
        } );

    } );

    describe( 'when an item is clicked', function () {

        beforeEach( function () {
            $scope.leafClickHandler( items[ 5 ] );
        } );

        it( 'should fire the select event', function () {
            expect( selectSpy ).toHaveBeenCalledWith( jasmine.any( Object ), items[ 5 ] );
        } );

        it( 'should call the select callback', function () {
            expect( selectCallbackSpy ).toHaveBeenCalledWith( { item : items[ 5 ] } );
        } );

    } );

    describe( 'when traversing down the tree', function () {

        var breadcrumbs = [];

        beforeEach( function () {
            for( var i = 0; i < 4; i++ ) {
                breadcrumbs.push( $scope.leaves[ 2 ] );
                $scope.leafClickHandler( $scope.leaves[ 2 ] );
                $scope.$digest();
            }
        } );

        it( 'should save all the breadcrumbs', function () {
            expect( $scope.breadcrumbs.length ).toEqual( 5 );
            expect( $scope.breadcrumbs[ 1 ] ).toEqual( breadcrumbs[ 0 ] );
            expect( $scope.breadcrumbs[ 2 ] ).toEqual( breadcrumbs[ 1 ] );
            expect( $scope.breadcrumbs[ 3 ] ).toEqual( breadcrumbs[ 2 ] );
            expect( $scope.breadcrumbs[ 4 ] ).toEqual( breadcrumbs[ 3 ] );
        } );

        it( 'should set the correct items', function () {
            expect( $scope.leaves ).toEqual( breadcrumbs[ 3 ].children );
        } );

        describe( 'then skipping back up', function () {

            beforeEach( function () {
                $scope.breadcrumbClickHandler( breadcrumbs[ 1 ] );
                $scope.$digest();
            } );

            it( 'should have the correct breadcrumbs', function () {
                expect( $scope.breadcrumbs.length ).toEqual( 3 );
                expect( $scope.breadcrumbs[ 1 ] ).toEqual( breadcrumbs[ 0 ] );
                expect( $scope.breadcrumbs[ 2 ] ).toEqual( breadcrumbs[ 1 ] );
            } );

            it( 'should set the correct items', function () {
                expect( $scope.leaves ).toEqual( breadcrumbs[ 1 ].children );
            } );

            it( 'should fire onOpen', function () {
                expect( updateBranchHeightSpy ).toHaveBeenCalled();
                expect( openSpy ).toHaveBeenCalledWith( jasmine.any( Object ), items[ 2 ] );
                expect( openCallbackSpy ).toHaveBeenCalledWith( { folder : items[ 2 ] } );
            } );

        } );

    } );

} );
