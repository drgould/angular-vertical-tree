const babel = require( 'gulp-babel' );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const concat = require( 'gulp-concat' );
const cache = require( 'gulp-cache' );
const karma = require( 'karma' ).server;
const jshint = require( 'gulp-jshint' );
const jshintStylish = require( 'jshint-stylish' );
const livereload = require( 'gulp-livereload' );
const uglify = require( 'gulp-uglify' );
const rename = require( 'gulp-rename' );
const templateCache = require( 'gulp-angular-templatecache' );
const ngAnnotate = require( 'gulp-ng-annotate' );
const runSequence = require( 'run-sequence' );
const fs = require( 'fs' );
const shell = require( 'shelljs' );
const config = require( './build.config.js' );

function handleError(err) {
    gutil.log(err);
    gutil.beep();
    notify().write(err);
    this.emit('end');
}

/* Hinting */

function makeHashKey( file ) {
    return [ file.contents.toString( 'utf8' ),
        '2.4.4',
        fs.readFileSync( '.jshintrc' ) ].join( '' );
}

gulp.task( 'hint', function () {
    const toHint = config.srcFiles
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
        .pipe( babel( {
            presets : [ 'env' ],
            plugins : [ 'transform-object-assign' ]
        } ) )
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
    return gulp.src( [ config.distDir + config.jsFilename ] )
        .pipe( plumber( { errorHandler: handleError } ) )
        .pipe( uglify( { mangle: true, compress: { drop_console: true } } ) )
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
