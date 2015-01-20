var buildDir = 'build/',
    distDir = 'dist/',
    srcDir = 'src/',
    jsFilename = 'angularVerticalTree.js',
    jsFilenameMin = 'angularVerticalTree.min.js',
    templateFilename = 'angularVerticalTree.tpl.html',
    templateJsFilename = 'angularVerticalTree.tpl.js';

module.exports = {
    srcFiles : [
        srcDir + jsFilename
    ],
    templateFiles : [
        srcDir + templateFilename
    ],
    depFiles : [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-sanitize/angular-sanitize.js'
    ],
    testFiles : [
        'test/angularVerticalTree.spec.js'
    ],
    demoFiles : [
        'demo/index.html',
        'demo/js/script.js',
        'demo/css/style.css'
    ],
    buildFiles : [
        buildDir + jsFilename,
        buildDir + templateJsFilename
    ],
    distDir : distDir,
    buildDir : buildDir,
    jsFilename : jsFilename,
    jsFilenameMin : jsFilenameMin,
    templateJsFilename : templateJsFilename
};