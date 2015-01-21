var gulp = require( 'gulp' ),
    gutil = require( 'gulp-util' ),
    notify = require( 'gulp-notify' ),
    plumber = require( 'gulp-plumber' ),
    concat = require( 'gulp-concat' ),
    cache = require( 'gulp-cache' ),
    karma = require( 'karma' ).server,
    jshint = require( 'gulp-jshint' ),
    jshintStylish = require( 'jshint-stylish' ),
    livereload = require( 'gulp-livereload' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    templateCache = require( 'gulp-angular-templatecache' ),
    ngAnnotate = require( 'gulp-ng-annotate' ),
    runSequence = require( 'run-sequence' ),
    fs = require( 'fs' ),
    shell = require( 'shelljs' ),
    config = require( './build.config.js' );

var handleError = function (err) {
    gutil.log(err);
    gutil.beep();
    notify().write(err);
    this.emit('end');
};

/* Hinting */

function makeHashKey( file ) {
    return [ file.contents.toString( 'utf8' ),
        '2.4.4',
        fs.readFileSync( '.jshintrc' ) ].join( '' );
}

gulp.task( 'hint', function () {
    var toHint = config.srcFiles
        .concat( config.testFiles )
        .concat( 'gulpfile.js' );
    return gulp.src( toHint )
        .pipe( plumber( { errorHandler: handleError } ) )
        .pipe( cache( jshint(), {
            key: makeHashKey,
            success: function ( jsHintedFile ) {
                return jsHintedFile.jshint.success;
            },
            value: function ( jsHintedFile ) {
                return { jshint: jsHintedFile.jshint };
            }
        } ) )
        .pipe( jshint.reporter( jshintStylish ) )
        .pipe( jshint.reporter( 'fail' ) );
} );

gulp.task( 'karma', function () {
    return karma.start( {
        configFile : config.karmaConf
    } );
} );

gulp.task( 'karma-watch', function () {
    return karma.start( {
        configFile : config.karmaConf,
        autoWatch : true,
        singleRun : false
    });
} );

gulp.task('coverage', function () {
    if(shell.exec('open reporters/coverage/html/index.html').code !== 0) {
        console.error('Could not execute jekyll build');
        shell.exit(1);
    }
});

gulp.task( 'compile-template', function() {
    return gulp.src( config.templateFiles )
        .pipe( plumber( { errorHandler: handleError } ) )
        .pipe( templateCache( { module: 'drg.angularVerticalTree', root : 'drg/' } ) )
        .pipe( rename( config.templateJsFilename ) )
        .pipe( gulp.dest( config.buildDir ) );
} );

gulp.task( 'compile-js', function() {
    return gulp.src( config.srcFiles )
        .pipe( plumber( { errorHandler: handleError } ) )
        .pipe( ngAnnotate() )
        .pipe( concat( config.jsFilename ) )
        .pipe( gulp.dest( config.buildDir ) );
} );

gulp.task( 'concat-js', function() {
    return gulp.src( config.buildFiles )
        .pipe( plumber( { errorHandler: handleError } ) )
        .pipe( concat( config.jsFilename ) )
        .pipe( gulp.dest( config.distDir ) );
} );

gulp.task( 'uglify-js', function () {
    return gulp.src( config.buildFiles )
        .pipe( plumber( { errorHandler: handleError } ) )
        .pipe( uglify( { mangle: false, compress: { drop_console: true } } ) )
        .pipe( rename( config.jsFilenameMin ) )
        .pipe( gulp.dest( config.distDir ) );
} );

gulp.task( 'compile', function() {
    runSequence( 'compile-template', 'compile-js', 'concat-js', 'uglify-js' );
} );

gulp.task( 'livereload', function () {
    gulp.watch( config.demoFiles.concat( config.buildFiles ) )
        .on( 'change', function ( changedFile ) {
            livereload.changed( changedFile.path );
        } );
} );

gulp.task( 'watch-loop', function () {
    gulp.watch( config.srcFiles.concat( config.templateFiles ), [ 'hint', 'compile' ] );
} );

gulp.task( 'default', [ 'compile', 'karma' ] );

gulp.task( 'watch', function () {
    livereload.listen();
    return runSequence( [ 'compile' ], [ 'watch-loop' ], [ 'karma-watch' ], [ 'livereload' ] )
} );